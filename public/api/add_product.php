<?php
require_once __DIR__ . '/db.php';

// SEGURIDAD: Solo administradores pueden agregar productos
validate_admin_session();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

// CALIDAD: Verificar validez del JSON recibido
if (json_last_error() !== JSON_ERROR_NONE || !is_object($data)) {
    http_response_code(400);
    echo json_encode(["error" => "Datos JSON inválidos"]);
    exit;
}

// Validación básica
if (!isset($data->id, $data->name, $data->price, $data->category)) {
    http_response_code(400);
    echo json_encode(["error" => "Datos incompletos. Se requiere ID, nombre, precio y categoría."]);
    exit;
}

try {
    $query = "INSERT INTO products (id, name, description, price, stock, category, image, type, disclaimer, deliveryMethod) VALUES (:id, :name, :description, :price, :stock, :category, :image, :type, :disclaimer, :deliveryMethod)";
    $stmt = $conn->prepare($query);
    
    $stmt->execute([
        ':id' => $data->id,
        ':name' => $data->name,
        ':description' => $data->description ?? '',
        ':price' => $data->price,
        ':stock' => $data->stock ?? 0,
        ':category' => $data->category,
        ':image' => $data->image ?? '',
        ':type' => $data->type ?? '',
        ':disclaimer' => $data->disclaimer ?? '',
        ':deliveryMethod' => $data->deliveryMethod ?? ''
    ]);

    echo json_encode(["success" => true, "message" => "Producto agregado exitosamente"]);
} catch (PDOException $e) {
    http_response_code(500);
    secure_log("Error adding product: " . $e->getMessage());
    echo json_encode(["error" => "Error al guardar en base de datos"]);
}
?>