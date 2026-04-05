<?php
require_once __DIR__ . '/db.php';

// SEGURIDAD: Restricción de Método HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["error" => "Método no permitido. Se requiere POST."]);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(["error" => "JSON inválido o mal formado."]);
    exit;
}

// 1. Validación de Entrada
if (!isset($data->items)) {
    http_response_code(400);
    echo json_encode(["error" => "Faltan los items en la orden."]);
    exit;
}
if (!isset($data->shippingInfo)) {
    http_response_code(400);
    echo json_encode(["error" => "Falta la información de envío (shippingInfo)."]);
    exit;
}
if (!isset($data->taxRate)) {
    http_response_code(400);
    echo json_encode(["error" => "Falta la tasa de impuestos (taxRate)."]);
    exit;
}

// SEGURIDAD: Validar sesión real para obtener el userId
session_start_secure();
$sessionUserId = $_SESSION['user_id'] ?? null;

// FIX: Requerir que el usuario esté logueado para crear una orden.
if (!$sessionUserId) {
    http_response_code(401);
    echo json_encode(["error" => "Debe iniciar sesión para crear una orden."]);
    exit;
}

$userId = $sessionUserId;

try {
    // SEGURIDAD PROFESIONAL: Iniciar transacción para asegurar atomicidad
    $conn->beginTransaction();

    // 2. Sanitización y Tipado
    $id = htmlspecialchars(strip_tags($data->id));
    $status = 'pending'; // Estado inicial siempre es pendiente
    $paymentMethod = isset($data->paymentMethod) ? htmlspecialchars(strip_tags($data->paymentMethod)) : 'ePayco';

    // HACKER FIX: Sanitizar cada campo dentro de shippingInfo para prevenir XSS
    $sanitizedShippingInfo = [];
    if (is_object($data->shippingInfo)) {
        foreach ($data->shippingInfo as $key => $value) {
            $sanitizedShippingInfo[htmlspecialchars(strip_tags($key))] = htmlspecialchars(strip_tags($value));
        }
    }

    // VALIDACIÓN CRÍTICA: Formato de Email
    // Evitar que usuarios paguen si no podemos entregarles el producto digital.
    $emailToCheck = isset($sanitizedShippingInfo['email']) ? $sanitizedShippingInfo['email'] : '';
    if (empty($emailToCheck) || !filter_var($emailToCheck, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["error" => "La dirección de correo electrónico es inválida."]);
        exit;
    }

    // LEGAL FIX: Persistir evidencia de aceptación de términos (Audit Trail)
    // Esto es vital para ganar disputas de contracargos.
    if (isset($data->termsAccepted) && $data->termsAccepted === true) {
        $sanitizedShippingInfo['legal_consent'] = [
            'accepted' => true,
            'timestamp' => date('c'), // Formato ISO 8601
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'Unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
        ];
    }
    $shippingInfoJson = json_encode($sanitizedShippingInfo);

    $taxRate = filter_var($data->taxRate, FILTER_VALIDATE_FLOAT);
    if ($taxRate === false || $taxRate < 0 || $taxRate > 1) { // La tasa debe ser un % (0 a 1)
        http_response_code(400);
        echo json_encode(["error" => "Tasa de impuesto inválida."]);
        exit;
    }

    // HACKER FIX: Recalcular total en el backend (Source of Truth)
    $calculatedSubtotal = 0;
    $itemsArray = is_array($data->items) ? $data->items : [];
    error_log("create_order.php: itemsArray received: " . print_r($itemsArray, true));
    $cleanItems = []; // Array para guardar items limpios y seguros
    
    // Preparamos consulta de precios
    $stmtPrice = $conn->prepare("SELECT price, name, stock FROM products WHERE id = :id AND is_active = 1");
    
    foreach ($itemsArray as $index => $item) {
        if (!isset($item->id)) {
            http_response_code(400);
            echo json_encode(["error" => "El producto en la posición $index no tiene ID."]);
            exit;
        }
        $pid = isset($item->id) ? $item->id : null;
        $qty = isset($item->quantity) ? max(1, (int)$item->quantity) : 0;
        
        if ($pid && $qty > 0) {
            $stmtPrice->execute([':id' => $pid]);
            $prod = $stmtPrice->fetch(PDO::FETCH_ASSOC);
            
            // QA FIX: Validar stock antes de permitir la orden
            if ($prod && $prod['stock'] < $qty) {
                http_response_code(400);
                echo json_encode(["error" => "Stock insuficiente para el producto: " . $prod['name']]);
                exit;
            }

            if ($prod) {
                $realPrice = (float)$prod['price'];
                $calculatedSubtotal += $realPrice * $qty;
                
                // Reconstruir item solo con datos seguros de la BD
                $cleanItems[] = [
                    'id' => $pid,
                    'name' => $prod['name'], // Usar nombre real de la BD
                    'price' => $realPrice,   // Usar precio real de la BD
                    'quantity' => $qty
                ];
            }
        }
    }
    
    // SEGURIDAD: Si no hay productos válidos (ej: todos borrados o array vacío), bloquear.
    if (empty($cleanItems) || $calculatedSubtotal <= 0) {
        http_response_code(400);
        echo json_encode(["error" => "La orden no contiene productos válidos o disponibles."]);
        exit;
    }

    // --- SISTEMA PROFESIONAL DE CUPONES ---
    $discountAmount = 0;
    $appliedCouponCode = null;

    if (!empty($data->couponCode)) {
        // 1. Verificar existencia y vigencia del cupón
        $inputCoupon = strtoupper(trim(htmlspecialchars(strip_tags($data->couponCode))));
        $stmtCoupon = $conn->prepare("SELECT id, code, type, value, min_purchase, usage_limit, used_count FROM coupons WHERE code = :code AND is_active = 1 AND (expires_at IS NULL OR expires_at > NOW()) FOR UPDATE");
        $stmtCoupon->execute([':code' => $inputCoupon]);
        $coupon = $stmtCoupon->fetch(PDO::FETCH_ASSOC);

        if ($coupon) {
            $canApply = true;

            // 2. Validar compra mínima
            if ($calculatedSubtotal < $coupon['min_purchase']) {
                $canApply = false;
            }

            // 3. Validar límites de uso
            if ($coupon['usage_limit'] !== null && $coupon['used_count'] >= $coupon['usage_limit']) {
                $canApply = false;
            }

            // 4. NUEVA REGLA DE SEGURIDAD: Validar si el usuario ya usó este cupón
            // Solo contamos órdenes que no estén canceladas
            $stmtCheckUsage = $conn->prepare("SELECT COUNT(*) FROM orders WHERE userId = :uid AND coupon_code = :code AND status != 'cancelled'");
            $stmtCheckUsage->execute([':uid' => $userId, ':code' => $coupon['code']]);
            $alreadyUsed = $stmtCheckUsage->fetchColumn();

            if ($alreadyUsed > 0) {
                $canApply = false;
            }

            if ($canApply) {
                $appliedCouponCode = $coupon['code'];
                
                // 4. Calcular descuento según tipo (Porcentaje o Fijo)
                if ($coupon['type'] === 'percentage') {
                    $discountAmount = round($calculatedSubtotal * ($coupon['value'] / 100), 2);
                } else {
                    $discountAmount = min((float)$coupon['value'], $calculatedSubtotal);
                }
                
                // 5. Incrementar uso del cupón
                $updateUsage = $conn->prepare("UPDATE coupons SET used_count = used_count + 1 WHERE id = :id");
                $updateUsage->execute([':id' => $coupon['id']]);
            }
        }
    }

    // 6. Recalcular Totales Finales
    $subtotalAfterDiscount = max(0, $calculatedSubtotal - $discountAmount);
    $taxAmount = round($subtotalAfterDiscount * $taxRate, 0); // Ajustar según precisión de moneda (COP suele ser sin decimales)
    $total = $subtotalAfterDiscount + $taxAmount;
    
    $itemsJson = json_encode($cleanItems); // Guardamos solo los items verificados

    // 3. Lógica de Base de Datos
    $query = "INSERT INTO orders (id, userId, coupon_code, discount_amount, items, total, status, shippingInfo) 
              VALUES (:id, :userId, :couponCode, :discountAmount, :items, :total, :status, :shippingInfo)";
    $stmt = $conn->prepare($query);
    
    $stmt->bindParam(":id", $id);
    $stmt->bindParam(":userId", $userId);
    $stmt->bindParam(":couponCode", $appliedCouponCode);
    $stmt->bindParam(":discountAmount", $discountAmount);
    $stmt->bindParam(":items", $itemsJson);
    $stmt->bindParam(":total", $total);
    $stmt->bindParam(":status", $status);
    $stmt->bindParam(":shippingInfo", $shippingInfoJson);
    
    if($stmt->execute()) {
        // Confirmar todos los cambios (Cupón + Orden)
        $conn->commit();

        http_response_code(201); // 201 Created
        echo json_encode([
            "message" => "Orden creada exitosamente", 
            "id" => $id,
            "correctedTotal" => $total // Devolvemos el total real calculado por el servidor
        ]);
    } else {
        throw new Exception("La ejecución de la consulta para crear la orden falló.");
    }
} catch (Throwable $e) {
    // Revertir cambios si algo salió mal
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    
    http_response_code(500);
    error_log("Error en create_order.php: " . $e->getMessage());
    echo json_encode(["error" => "Error interno del servidor al crear la orden.", "details" => $e->getMessage()]);
}
?>