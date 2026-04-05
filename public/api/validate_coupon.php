<?php
require_once __DIR__ . '/db.php';
header("Content-Type: application/json");
header("Cache-Control: no-cache, must-revalidate");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"));
$code = strtoupper(trim(htmlspecialchars(strip_tags($data->code ?? ''))));
$subtotal = filter_var($data->subtotal ?? 0, FILTER_VALIDATE_FLOAT);

// SEGURIDAD: Obtener el userId de la sesión, no del cliente para evitar IDOR
session_start_secure();
$userId = $_SESSION['user_id'] ?? null;

if (empty($code)) {
    echo json_encode(["success" => false, "message" => "Código requerido"]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT id, code, type, value, min_purchase, usage_limit, used_count FROM coupons WHERE code = :code AND active = 1 AND (expiry_date IS NULL OR expiry_date > NOW()) LIMIT 1");
    $stmt->execute([':code' => $code]);
    $coupon = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$coupon) {
        echo json_encode(["success" => false, "message" => "Cupón inválido o expirado"]);
        exit;
    }

    if ($coupon['usage_limit'] !== null && $coupon['used_count'] >= $coupon['usage_limit']) {
        echo json_encode(["success" => false, "message" => "Este cupón ha agotado su límite de usos"]);
        exit;
    }

    if ($subtotal < $coupon['min_purchase']) {
        echo json_encode(["success" => false, "message" => "Compra mínima para este cupón: " . number_format($coupon['min_purchase'], 0)]);
        exit;
    }

    if ($userId) {
        $stmtCheck = $conn->prepare("SELECT COUNT(*) FROM orders WHERE userId = :uid AND coupon_code = :code AND status != 'cancelled'");
        $stmtCheck->execute([':uid' => $userId, ':code' => $code]);
        if ($stmtCheck->fetchColumn() > 0) {
            echo json_encode(["success" => false, "message" => "Ya has utilizado este cupón anteriormente"]);
            exit;
        }
    }

    $discount = ($coupon['type'] === 'percentage') 
        ? round($subtotal * ($coupon['value'] / 100), 2) 
        : min((float)$coupon['value'], $subtotal);

    echo json_encode([
        "success" => true,
        "coupon" => [
            "code" => $coupon['code'],
            "type" => $coupon['type'],
            "value" => (float)$coupon['value'],
            "discountAmount" => (float)$discount
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error interno del servidor"]);
}