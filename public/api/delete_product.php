<?php
require_once __DIR__ . '/db.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido."]);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id)) {
    http_response_code(400);
    echo json_encode(["error" => "ID no proporcionado."]);
    exit;
}

try {
    // SOFT DELETE: En lugar de eliminar, ocultamos el producto
    $stmt = $conn->prepare("UPDATE products SET is_active = 0 WHERE id = :id");
    $stmt->execute([':id' => $data->id]);
    echo json_encode(["success" => true, "message" => "Producto eliminado lógicamente"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al eliminar el producto."]);
}
?>