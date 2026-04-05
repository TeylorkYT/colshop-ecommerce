<?php
require_once __DIR__ . '/db.php';

// SEGURIDAD: Solo administradores pueden subir archivos
validate_admin_session();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido."]);
    exit;
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(["error" => "No se subió ninguna imagen o hubo un error."]);
    exit;
}

$file = $_FILES['image'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Validar tipo MIME real para evitar inyecciones de archivos disfrazados
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mime, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(["error" => "Solo se permiten imágenes (JPG, PNG, WEBP, GIF)."]);
    exit;
}

// Validar tamaño (Máximo 5MB)
if ($file['size'] > 5 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(["error" => "La imagen es demasiado grande. Máximo 5MB."]);
    exit;
}

// Crear la carpeta uploads si no existe (Un nivel arriba de api/, en la raíz pública)
$uploadDir = __DIR__ . '/../uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generar nombre seguro y único
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
if (empty($ext)) {
    $mimeMap = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
    $ext = $mimeMap[$mime] ?? 'jpg';
}
$filename = uniqid('img_') . '_' . time() . '.' . strtolower($ext);
$targetPath = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    // Devolver la URL relativa que React usará para mostrarla y guardarla en la BD
    echo json_encode(["success" => true, "url" => "/uploads/" . $filename]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error al guardar el archivo en el servidor."]);
}
?>