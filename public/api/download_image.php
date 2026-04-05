<?php
require_once __DIR__ . '/db.php';

// SEGURIDAD: Solo administradores pueden ejecutar esto
validate_admin_session();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido."]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$url = $data['url'] ?? '';

if (!filter_var($url, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    echo json_encode(["error" => "URL inválida."]);
    exit;
}

// SEGURIDAD SSRF: Evitar que el servidor intente descargar archivos de redes internas locales
$parsedUrl = parse_url($url);
$host = $parsedUrl['host'] ?? '';
$ip = gethostbyname($host);
if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
    http_response_code(400);
    echo json_encode(["error" => "URL no permitida por políticas de seguridad."]);
    exit;
}

// Descargar imagen usando cURL
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_MAXREDIRS, 3);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'); // Evita bloqueos
$imageData = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || !$imageData) {
    http_response_code(400);
    echo json_encode(["error" => "No se pudo descargar la imagen de la URL externa."]);
    exit;
}

// SEGURIDAD: Validar tipo MIME real inspeccionando los Magic Bytes del archivo
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_buffer($finfo, $imageData);
finfo_close($finfo);

$allowedTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
if (!array_key_exists($mime, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(["error" => "El archivo descargado no es una imagen válida."]);
    exit;
}

// Crear carpeta y guardar la imagen de forma segura
$uploadDir = __DIR__ . '/../uploads/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

$filename = uniqid('img_dl_') . '_' . time() . '.' . $allowedTypes[$mime];
$targetPath = $uploadDir . $filename;

if (file_put_contents($targetPath, $imageData)) {
    echo json_encode(["success" => true, "url" => "/uploads/" . $filename]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error al escribir la imagen en el servidor."]);
}
?>