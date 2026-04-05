<?php
require_once __DIR__ . '/db.php';

validate_admin_session();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if (!$data || !isset($data->id)) {
    http_response_code(400);
    echo json_encode(["error" => "ID de cupón requerido"]);
    exit;
}

try {
    // FIX: Parseo seguro de fecha para compatibilidad de edición
    $expiry_date = null;
    if (!empty($data->expiry_date)) {
        $dateObj = date_create($data->expiry_date);
        if ($dateObj) {
            $expiry_date = date_format($dateObj, 'Y-m-d H:i:s');
        }
    }

    $query = "UPDATE coupons SET 
                code = :code, 
                type = :type, 
                value = :value, 
                min_purchase = :min_purchase, 
                usage_limit = :usage_limit, 
                expires_at = :expires_at, 
                is_active = :is_active 
              WHERE id = :id";
              
    $stmt = $conn->prepare($query);
    $stmt->execute([
        ':id' => $data->id,
        ':code' => strtoupper(trim($data->code)),
        ':type' => $data->type,
        ':value' => $data->value,
        ':min_purchase' => $data->min_purchase,
        ':usage_limit' => $data->usage_limit ?: null,
        ':expires_at' => $expiry_date,
        ':is_active' => $data->active
    ]);

    echo json_encode(["success" => true]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al actualizar", "details" => $e->getMessage()]);
}