<?php
require_once __DIR__ . '/db.php';

// SEGURIDAD: Solo administradores
validate_admin_session();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

// CALIDAD: Verificar que el JSON sea válido
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(["error" => "JSON malformado"]);
    exit;
}

if (!isset($data['id'])) {
    http_response_code(400);
    echo json_encode(["error" => "ID de producto requerido"]);
    exit;
}

$id = $data['id'];
unset($data['id']); // Quitamos el ID para no intentar actualizarlo

if (empty($data)) {
    echo json_encode(["success" => true, "message" => "Nada que actualizar"]);
    exit;
}

try {
    // Construcción dinámica de la consulta SQL (solo actualiza lo que envíes)
    $fields = [];
    $params = [':id' => $id];
    
    // Lista blanca de campos permitidos para evitar inyección SQL en nombres de columna
    $allowedFields = ['name', 'description', 'price', 'stock', 'category', 'image', 'type', 'disclaimer', 'deliveryMethod'];

    foreach ($data as $key => $value) {
        if (in_array($key, $allowedFields)) {
            // SEGURIDAD: Ignorar valores que no sean simples (arrays u objetos) para evitar error 500 en PDO
            if (!is_scalar($value) && !is_null($value)) {
                continue;
            }
            $fields[] = "$key = :$key";
            $params[":$key"] = $value;
        }
    }
    
    if (empty($fields)) {
        echo json_encode(["success" => true, "message" => "Nada que actualizar"]);
        exit;
    }
    
    $sql = "UPDATE products SET " . implode(', ', $fields) . " WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);

    echo json_encode(["success" => true, "message" => "Producto actualizado"]);
} catch (PDOException $e) {
    http_response_code(500);
    secure_log("Error updating product: " . $e->getMessage());
    echo json_encode(["error" => "Error al actualizar producto"]);
}
?>