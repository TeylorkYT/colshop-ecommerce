<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/mercadopago_config.php';

// Get the notification
$body = file_get_contents('php://input');
$notification = json_decode($body, true);

// Prevención de Fatal Error en Webhook por payloads malformados de Mercado Pago
if (!$notification || !isset($notification['data']['id'])) {
    http_response_code(400);
    exit;
}

// Get the signature from the headers
$signature = isset($_SERVER['HTTP_X_SIGNATURE']) ? $_SERVER['HTTP_X_SIGNATURE'] : '';

if (!$signature) {
    secure_log("Mercado Pago webhook signature not found.");
    http_response_code(400);
    exit;
}

// The 'ts' and 'key' values are separated by ',v1='
list($ts, $hash) = explode(',v1=', $signature);
$ts = substr($ts, 3); // remove 'ts='

// Create the signed payload
$signed_payload = "id:{$notification['data']['id']};request-id:{$ts};";

// Generate the expected signature
$secret = MERCADOPAGO_WEBHOOK_SECRET;
$expected_signature = hash_hmac('sha256', $signed_payload, $secret);

// Validate the signature
if (!hash_equals($expected_signature, $hash)) {
    secure_log("Invalid Mercado Pago webhook signature.");
    http_response_code(400);
    exit;
}


if (isset($notification['type']) && $notification['type'] == 'payment') {
    $payment_id = $notification['data']['id'];

    // Get payment information from Mercado Pago
    $ch = curl_init("https://api.mercadopago.com/v1/payments/{$payment_id}");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . MERCADOPAGO_ACCESS_TOKEN,
    ]);
    $payment_response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $payment_data = json_decode($payment_response, true);
    curl_close($ch);

    // SEGURIDAD: Si no nos podemos comunicar con Mercado Pago, forzamos un 503 para que MP reintente más tarde.
    if (!$payment_data || $httpCode !== 200) {
        secure_log("[CRITICAL] Falló la conexión con API de MP para verificar el pago: $payment_id");
        http_response_code(503);
        exit;
    }

    if ($payment_data) {
        $orderId = $payment_data['external_reference'];
        $orderStatus = $payment_data['status'];
        $transaction_amount = (float)$payment_data['transaction_amount'];

        $newStatus = 'pending';
        $isCompleted = false;

        switch ($orderStatus) {
            case 'approved':
                $newStatus = 'processing'; // UNIFICADO: Coincide con el frontend
                $isCompleted = true;
                break;
            case 'rejected':
            case 'cancelled':
                $newStatus = 'cancelled';
                break;
            case 'in_process':
            case 'pending':
                $newStatus = 'pending';
                break;
        }

        try {
            // INICIO TRANSACCIÓN DB
            $conn->beginTransaction();

            // 1. Validar existencia de la orden y bloquear fila (FOR UPDATE)
            $checkOrder = "SELECT total, status, items, userId, shippingInfo FROM orders WHERE id = :orderId FOR UPDATE";
            $stmtCheck = $conn->prepare($checkOrder);
            $stmtCheck->bindParam(":orderId", $orderId);
            $stmtCheck->execute();
            $orderRow = $stmtCheck->fetch(PDO::FETCH_ASSOC);

            if (!$orderRow) {
                // FIX RETRY HELL: Retornar 200 para abortar reintentos de Mercado Pago sobre órdenes borradas/inexistentes
                $conn->rollBack();
                secure_log("[WARNING] Webhook recibido de orden inexistente en BD ($orderId). Descartado.");
                http_response_code(200);
                exit;
            }

            // Idempotencia 1: Si ya fue entregada por el staff, no retroceder el estado.
            if ($orderRow['status'] === 'completed') {
                $conn->commit();
                http_response_code(200);
                exit;
            }
            
            // Idempotencia 2: Verificamos si ya existe el ticket para no duplicarlo por notificaciones concurrentes.
            $checkTicketIdemp = "SELECT id FROM tickets WHERE orderId = :orderId";
            $stmtCheckTicket = $conn->prepare($checkTicketIdemp);
            $stmtCheckTicket->bindParam(":orderId", $orderId);
            $stmtCheckTicket->execute();
            $hasTicket = $stmtCheckTicket->rowCount() > 0;

            if ($isCompleted && $hasTicket) {
                $conn->commit();
                http_response_code(200);
                exit;
            }

            // Amount validation
            if ($isCompleted) {
                $orderTotal = (float)$orderRow['total'];
                if ($transaction_amount < $orderTotal) {
                    $newStatus = 'cancelled';
                    $isCompleted = false;
                    secure_log("[FRAUD] FRAUDE DETECTADO: Monto pagado ($transaction_amount) es menor al esperado ($orderTotal).");
                }
            }

            // Evitar que notificaciones atrasadas ('pending') retrocedan un pedido que ya está 'processing'
            if ($orderRow['status'] === 'processing' && $newStatus === 'pending') {
                $newStatus = 'processing';
            }

            // 2. Actualizar el estado de la Orden en la BD (FIX: Ahora guarda el payment_id en transacciones de fondo)
            $updateOrder = "UPDATE orders SET status = :status, payment_id = :paymentId, payment_method = 'Mercado Pago', updated_at = NOW() WHERE id = :orderId";
            $stmt = $conn->prepare($updateOrder);
            $stmt->bindParam(":status", $newStatus);
            $stmt->bindParam(":paymentId", $payment_id);
            $stmt->bindParam(":orderId", $orderId);
            $stmt->execute();

            // 3. Si está completada, crear el ticket y actualizar stock
            if ($isCompleted) {
                if (!$hasTicket) {
                    $ticketQuery = "INSERT INTO tickets (orderId, userId, status) VALUES (:orderId, :userId, 'open')";
                    $ticketStmt = $conn->prepare($ticketQuery);
                    $ticketStmt->bindParam(":orderId", $orderId);
                    $ticketStmt->bindParam(":userId", $orderRow['userId']);
                    
                    if ($ticketStmt->execute()) {
                        // --- ACTUALIZACIÓN DE STOCK ---
                        $items = json_decode($orderRow['items'], true);
                        $itemsHtml = '';
                        if (is_array($items)) {
                            $updateStock = "UPDATE products SET stock = stock - :qty WHERE id = :id AND stock >= :qty";
                            $stmtStock = $conn->prepare($updateStock);
                            foreach ($items as $item) {
                                $itemName = isset($item['name']) ? htmlspecialchars($item['name'], ENT_QUOTES, 'UTF-8') : 'Producto';
                                $itemQty = isset($item['quantity']) ? (int)$item['quantity'] : 1;
                                $itemQty = max(1, $itemQty);
                                $prodId = isset($item['id']) ? $item['id'] : (isset($item['productId']) ? $item['productId'] : null);
                                
                                if ($prodId) {
                                    $stmtStock->bindParam(":qty", $itemQty);
                                    $stmtStock->bindParam(":id", $prodId);
                                    $stmtStock->execute();
                                    
                                    if ($stmtStock->rowCount() === 0) {
                                        // WARNING: Sobreventa. No hacemos rollback para no perder el pago, dejamos que el staff lo gestione.
                                        secure_log("[WARNING] SOBREVENTA DETECTADA Orden #$orderId. Producto ID: $prodId. No se pudo descontar $itemQty de stock.");
                                    }
                                }
                                $itemsHtml .= "<tr><td style='padding:10px;border-bottom:1px solid #eee;'>$itemName</td><td style='padding:10px;border-bottom:1px solid #eee;text-align:center;'>$itemQty</td></tr>";
                            }
                        }
                    } else {
                        throw new Exception("[CRITICAL] Falló la creación del ticket para la orden aprobada: $orderId");
                    }
                }

                // Send email
                $shippingInfo = json_decode($orderRow['shippingInfo'], true);
                $userEmail = isset($shippingInfo['email']) ? $shippingInfo['email'] : '';
                $to = filter_var($userEmail, FILTER_SANITIZE_EMAIL);
                $clean_invoice = str_replace(array("\r", "\n"), '', $orderId);
                $subject = "¡Pago Aprobado! - Pedido #" . $clean_invoice;
                
                // Plantilla HTML
                $message = '
                <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
                    .container { max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden; }
                    .header { background-color: #7c3aed; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; }
                    .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .btn { display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
                    .footer { background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #666; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1 style="margin:0;">¡Gracias por tu compra!</h1>
                    </div>
                    <div class="content">
                      <p>Hola,</p>
                      <!-- FIX SEGURIDAD: Sanitizar ID para contexto HTML -->
                      <p>Tu pago ha sido confirmado exitosamente. Aquí está el resumen de tu pedido <strong>#' . htmlspecialchars($clean_invoice, ENT_QUOTES, 'UTF-8') . '</strong>:</p>
                      
                      <table class="table">
                        <thead><tr style="background-color:#f3f4f6;"><th style="padding:10px;text-align:left;">Producto</th><th style="padding:10px;">Cant.</th></tr></thead>
                        <tbody>' . $itemsHtml . '</tbody>
                      </table>

                      <!-- LEGAL FIX: Disclaimer explícito de productos digitales -->
                      <div style="background-color: #fff3cd; color: #856404; padding: 10px; border-radius: 5px; font-size: 12px; margin-top: 20px; border: 1px solid #ffeeba;">
                        <strong>Aviso Legal:</strong> Al tratarse de productos digitales y servicios de ejecución inmediata, usted reconoce que pierde el derecho de desistimiento una vez que el servicio ha comenzado o el código ha sido entregado.
                      </div>

                      <div style="text-align: center; margin-top: 30px;">
                        <a href="https://colshop.net/orders" class="btn">Ver Mis Productos</a>
                      </div>
                    </div>
                    <div class="footer">
                      <p>Si tienes alguna pregunta, responde a este correo.<br>&copy; ' . date("Y") . ' Colshop</p>
                      <p style="font-size: 11px; color: #888; margin-top: 10px;">
                        Este recibo es un comprobante legal de tu compra.<br>
                        <a href="https://colshop.net/terms" style="color: #7c3aed; text-decoration: none;">Términos y Condiciones</a> | 
                        <a href="https://colshop.net/refunds" style="color: #7c3aed; text-decoration: none;">Política de Reembolso y Garantía</a>
                      </p>
                    </div>
                  </div>
                </body>
                </html>';

                $headers = "From: no-reply@colshop.net" . "\r\n" .
                           "Reply-To: soporte@colshop.net" . "\r\n" .
                           "MIME-Version: 1.0" . "\r\n" .
                           "Content-Type: text/html; charset=UTF-8";
                
                if ($to) {
                    $emailData = [
                        'to' => $to, 'subject' => $subject, 'message' => $message, 'headers' => $headers
                    ];
                }
            }

            $conn->commit();
            
            // POST-TRANSACTION: Enviar correo de forma asíncrona fuera del bloqueo (FOR UPDATE)
            if (isset($emailData)) {
                if (!@mail($emailData['to'], $emailData['subject'], $emailData['message'], $emailData['headers'], "-f no-reply@colshop.net")) {
                    secure_log("[ERROR] Falló el envío de correo a: " . $emailData['to']);
                }
            }

        } catch (Exception $e) {
            if ($conn->inTransaction()) {
                $conn->rollBack();
            }
            secure_log("[DB Error] " . $e->getMessage());
            http_response_code(500);
            exit;
        }
    }
}

http_response_code(200);
?>