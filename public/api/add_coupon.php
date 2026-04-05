<?php
require_once __DIR__ . '/db.php';

// SEGURIDAD: Solo administradores pueden crear cupones
validate_admin_session();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if (!$data || empty($data->code) || empty($data->type) || !isset($data->value)) {
    http_response_code(400);
    echo json_encode(["error" => "Datos incompletos"]);
    exit;
}

try {
    // FIX: Parseo seguro de fecha para asegurar compatibilidad con MySQL
    $expiry_date = null;
    if (!empty($data->expiry_date)) {
        $dateObj = date_create($data->expiry_date);
        if ($dateObj) {
            $expiry_date = date_format($dateObj, 'Y-m-d H:i:s');
        }
    }

    // FIX: Mapeamos a las columnas reales de tu BD (expires_at, is_active)
    $query = "INSERT INTO coupons (code, type, value, min_purchase, usage_limit, used_count, expires_at, is_active, created_at) 
              VALUES (:code, :type, :value, :min_purchase, :usage_limit, 0, :expires_at, :is_active, NOW())";
    
    $stmt = $conn->prepare($query);
    
    // Sanitización y binding
    $stmt->execute([
        ':code'         => strtoupper(trim(htmlspecialchars(strip_tags($data->code)))),
        ':type'         => $data->type, // 'percentage' o 'fixed'
        ':value'        => (float)$data->value,
        ':min_purchase' => isset($data->min_purchase) ? (float)$data->min_purchase : 0.0,
        ':usage_limit'  => !empty($data->usage_limit) ? (int)$data->usage_limit : null,
        ':expires_at'   => $expiry_date,
        ':is_active'    => isset($data->active) ? (int)$data->active : 1
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Cupón creado exitosamente",
        "id" => $conn->lastInsertId()
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    if ($e->getCode() == 23000) { // Error de duplicado
        echo json_encode(["error" => "El código del cupón ya existe."]);
    } else {
        echo json_encode([
            "error" => "Error al guardar en la base de datos",
            "details" => $e->getMessage()
        ]);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error inesperado", "details" => $e->getMessage()]);
}
?>