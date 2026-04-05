<?php
require_once __DIR__ . '/db.php';

// SEGURIDAD: Solo administradores
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
    $stmt = $conn->prepare("DELETE FROM coupons WHERE id = :id");
    $stmt->execute([':id' => $data->id]);

    echo json_encode(["success" => true]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => "No se pudo eliminar el cupón", "details" => $e->getMessage()]);
}
?>