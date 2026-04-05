<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json');

// SEGURIDAD: Restricción de Método HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["error" => "Método no permitido. Se requiere POST."]);
    exit;
}

// SEGURIDAD: Verificar permisos de administrador
validate_admin_access();

$data = json_decode(file_get_contents("php://input"));

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(["error" => "JSON inválido o mal formado."]);
    exit;
}

if (!isset($data->orderId) || !isset($data->status) || empty($data->orderId) || empty($data->status)) {
    http_response_code(400);
    echo json_encode(["error" => "Datos incompletos. Se requiere orderId y status."]);
    exit;
}

try {
    // Validación: El estado debe ser uno de los permitidos
    $allowed_statuses = [ORDER_STATUS_COMPLETED, ORDER_STATUS_PENDING, ORDER_STATUS_CANCELLED];
    $status = htmlspecialchars(strip_tags($data->status));

    if (!in_array($status, $allowed_statuses)) {
        http_response_code(400);
        echo json_encode(["error" => "Estado no válido."]);
        exit;
    }

    $query = "UPDATE orders SET status = :status WHERE id = :id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":status", $status);
    $stmt->bindParam(":id", htmlspecialchars(strip_tags($data->orderId)));

    if ($stmt->execute()) {
        echo json_encode(["message" => "Estado del pedido actualizado exitosamente"]);
    } else {
        throw new Exception("La ejecución de la consulta para actualizar estado de orden falló.");
    }
} catch (Exception $e) {
    http_response_code(500);
    secure_log("Error en update_order_status.php: " . $e->getMessage());
    echo json_encode(["error" => "Error interno del servidor al actualizar el pedido."]);
}
?>