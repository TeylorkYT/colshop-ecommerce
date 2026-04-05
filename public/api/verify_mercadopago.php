<?php
require_once 'db.php';
require_once 'mercadopago_config.php';

// Headers para respuesta JSON
header("Content-Type: application/json");

// FIX: Añadir comprobación de cURL para depuración
if (!function_exists('curl_init')) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error crítico del servidor: La extensión cURL de PHP no está instalada o habilitada.']);
    exit;
}

// 1. Obtener ID del pago desde la URL (ej: ?id=123456789)
$payment_id = $_GET['id'] ?? null;

if (!$payment_id) {
    echo json_encode(['success' => false, 'message' => 'No se proporcionó ID de pago']);
    exit;
}

// 2. Obtener Access Token (Debe estar en tu config.php por seguridad)
// Si no está definido, usa un fallback (¡Cámbialo por tu token de producción!)
$accessToken = defined('MERCADOPAGO_ACCESS_TOKEN') ? MERCADOPAGO_ACCESS_TOKEN : 'TU_ACCESS_TOKEN_DE_PRODUCCION_AQUI';

if ($accessToken === 'TU_ACCESS_TOKEN_DE_PRODUCCION_AQUI' || empty($accessToken)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error interno: Token de pago no configurado.']);
    exit;
}

// 3. Consultar API de Mercado Pago para verificar el estado real
$curl = curl_init();
curl_setopt_array($curl, array(
  CURLOPT_URL => 'https://api.mercadopago.com/v1/payments/' . $payment_id,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'GET',
  CURLOPT_HTTPHEADER => array(
    'Authorization: Bearer ' . $accessToken,
    'Content-Type: application/json'
  ),
  // FIX: Usar User-Agent de navegador real para evitar bloqueo por WAF de Mercado Pago (PolicyAgent)
  CURLOPT_USERAGENT => "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
));

$response = curl_exec($curl);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

if ($httpCode !== 200) {
    echo json_encode(['success' => false, 'message' => 'Error al conectar con Mercado Pago']);
    exit;
}

$paymentData = json_decode($response, true);

// FIX: Prevenir Fatal Error en PHP 8+ si json_decode devuelve null (ej: WAF de MP bloquea la petición)
if (!is_array($paymentData)) {
    echo json_encode(['success' => false, 'message' => 'Respuesta inválida del proveedor de pagos']);
    exit;
}

// 4. Validar y Mapear Estado
$status = $paymentData['status'] ?? 'unknown';
$orderId = $paymentData['external_reference'] ?? null; // Este es el ID de tu orden en BD
$transaction_amount = (float)($paymentData['transaction_amount'] ?? 0);

// Mapeo de estados de MP a tu sistema
$dbStatus = 'pending';
if ($status === 'approved') {
    // FIX: Usar 'processing' para indicar que ya pagó pero falta la entrega del Staff (Ticket Abierto)
    $dbStatus = 'processing';
} elseif ($status === 'rejected' || $status === 'cancelled') {
    $dbStatus = 'cancelled';
}

// 5. Actualizar Base de Datos
if ($orderId) {
    try {
        // INICIO DE TRANSACCIÓN: Sincronización profesional (Zero-Delay UX)
        $conn->beginTransaction();
        
        // Bloqueo pesimista (FOR UPDATE) para evitar concurrencia con el webhook
        $stmtCheck = $conn->prepare("SELECT total, status, items, userId, shippingInfo FROM orders WHERE id = ? FOR UPDATE");
        $stmtCheck->execute([$orderId]);
        $orderRow = $stmtCheck->fetch(PDO::FETCH_ASSOC);
        
        if ($orderRow) {
            // Prevención de Fraude y Protección de Estado
            if ($orderRow['status'] === 'completed') {
                $dbStatus = 'completed'; 
            } elseif ($dbStatus === 'processing' && $transaction_amount < (float)$orderRow['total']) {
                $dbStatus = 'cancelled'; 
                error_log("[FRAUD] FRAUDE DETECTADO EN FRONTEND: Monto pagado ($transaction_amount) es menor al esperado (" . $orderRow['total'] . ") para la orden $orderId.");
            }
            
            if ($orderRow['status'] === 'processing' && $dbStatus === 'pending') {
                $dbStatus = 'processing';
            }

            // Verificamos si ya existe el ticket para no duplicarlo (Idempotencia)
            $stmtCheckTicket = $conn->prepare("SELECT id FROM tickets WHERE orderId = ?");
            $stmtCheckTicket->execute([$orderId]);
            $hasTicket = $stmtCheckTicket->rowCount() > 0;

            // Actualizar estado general de la orden
            $stmt = $conn->prepare("UPDATE orders SET status = ?, payment_id = ?, payment_method = 'Mercado Pago', updated_at = NOW() WHERE id = ?");
            $stmt->execute([$dbStatus, $payment_id, $orderId]);

            // FULFILLMENT INMEDIATO: Si está aprobado y el Webhook no ha llegado, procesamos aquí
            if ($dbStatus === 'processing' && !$hasTicket) {
                $ticketStmt = $conn->prepare("INSERT INTO tickets (orderId, userId, status) VALUES (?, ?, 'open')");
                if ($ticketStmt->execute([$orderId, $orderRow['userId']])) {
                    
                    // Descontar Stock Inmediatamente
                    $items = json_decode($orderRow['items'], true);
                    $itemsHtml = '';
                    if (is_array($items)) {
                        $updateStock = "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?";
                        $stmtStock = $conn->prepare($updateStock);
                        foreach ($items as $item) {
                            $itemName = isset($item['name']) ? htmlspecialchars($item['name'], ENT_QUOTES, 'UTF-8') : 'Producto';
                            $itemQty = isset($item['quantity']) ? max(1, (int)$item['quantity']) : 1;
                            $prodId = isset($item['id']) ? $item['id'] : (isset($item['productId']) ? $item['productId'] : null);
                            if ($prodId) {
                                $stmtStock->execute([$itemQty, $prodId, $itemQty]);
                                
                                // AUDITORÍA: Registrar en log si detectamos sobreventa desde el frontend
                                if ($stmtStock->rowCount() === 0) {
                                    error_log("[WARNING] SOBREVENTA DETECTADA Orden #{$orderId}. Producto ID: {$prodId}. No se pudo descontar {$itemQty} de stock.");
                                }
                            }
                            $itemsHtml .= "<tr><td style='padding:10px;border-bottom:1px solid #eee;'>$itemName</td><td style='padding:10px;border-bottom:1px solid #eee;text-align:center;'>$itemQty</td></tr>";
                        }
                    }
                    
                    // Preparar Correo de Recibo para enviarlo DESPUÉS de hacer commit
                    $shippingInfo = json_decode($orderRow['shippingInfo'], true);
                    $userEmail = isset($shippingInfo['email']) ? $shippingInfo['email'] : '';
                    $to = filter_var($userEmail, FILTER_SANITIZE_EMAIL);
                    $clean_invoice = htmlspecialchars(str_replace(array("\r", "\n"), '', $orderId), ENT_QUOTES, 'UTF-8');
                    
                    if ($to) {
                        $subject = "¡Pago Aprobado! - Pedido #" . $clean_invoice;
                        $message = '<html><body style="font-family: Arial, sans-serif; color: #333;"><div style="max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;"><div style="background-color: #7c3aed; color: white; padding: 20px; text-align: center;"><h2>¡Gracias por tu compra!</h2></div><div style="padding: 20px;"><p>Tu pago ha sido confirmado. Resumen de tu pedido <strong>#' . $clean_invoice . '</strong>:</p><table style="width: 100%; border-collapse: collapse; margin: 20px 0;"><thead><tr style="background-color:#f3f4f6;"><th style="padding:10px;text-align:left;">Producto</th><th style="padding:10px;">Cant.</th></tr></thead><tbody>' . $itemsHtml . '</tbody></table><div style="text-align: center; margin-top: 30px;"><a href="https://colshop.net/orders" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Ver Mis Productos</a></div></div></div></body></html>';
                        $headers = "From: no-reply@colshop.net\r\nReply-To: soporte@colshop.net\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8";
                        
                        $emailData = [
                            'to' => $to,
                            'subject' => $subject,
                            'message' => $message,
                            'headers' => $headers
                        ];
                    }
                } else {
                    // SEGURIDAD: Forzar rollback si falla la inserción para no dejar el pedido en estado corrupto
                    throw new Exception("[CRITICAL] Falló la creación del ticket en frontend para la orden: $orderId");
                }
            }
        } else {
            // SEGURIDAD: Evitar devolver éxito si el ID de la orden no existe en BD
            throw new Exception("Orden no encontrada en base de datos: " . $orderId);
        }
        
        $conn->commit();

        // POST-TRANSACTION: Enviar correo fuera del bloqueo para evitar Deadlocks en MySQL
        if (isset($emailData)) {
            if (!@mail($emailData['to'], $emailData['subject'], $emailData['message'], $emailData['headers'], "-f no-reply@colshop.net")) {
                error_log("[ERROR] Falló el envío de correo sincrónico de recibo a: " . $emailData['to']);
            }
        }

        echo json_encode([
            'success' => true,
            'status' => $dbStatus,
            'order_id' => $orderId,
            'message' => 'Pago verificado correctamente'
        ]);
    } catch (Throwable $e) {
        if ($conn->inTransaction()) {
            $conn->rollBack();
        }
        error_log("[DB Error verify_mercadopago] " . $e->getMessage());
        http_response_code(500);
        // MEJORA: Devolver el error exacto al frontend para facilitar la depuración
        echo json_encode(['success' => false, 'message' => 'DB Error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Referencia de orden no encontrada en el pago']);
}
?>