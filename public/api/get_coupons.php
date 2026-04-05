<?php
require_once __DIR__ . '/db.php';

// SEGURIDAD: Solo administradores
validate_admin_session();

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    exit;
}

try {
    // Traemos solo las columnas necesarias y renombramos las discrepantes para React
    $stmt = $conn->prepare("SELECT id, code, type, value, min_purchase, usage_limit, used_count, expires_at as expiry_date, is_active as active, created_at FROM coupons ORDER BY created_at DESC");
    $stmt->execute();
    $coupons = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Casteo de tipos para que React reciba números y no strings
    foreach ($coupons as &$c) {
        $c['value'] = (float)$c['value'];
        $c['min_purchase'] = (float)$c['min_purchase'];
        $c['active'] = (int)$c['active'];
    }

    echo json_encode($coupons);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}