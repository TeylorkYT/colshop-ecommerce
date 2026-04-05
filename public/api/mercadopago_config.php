<?php
// Mercado Pago Credentials
// IMPORTANT: In a real production environment, these should be stored securely
// and not in a publicly accessible file.

// Import the credentials from a separate file that is not in the public repository
$configFile = __DIR__ . '/../../private_config/mercadopago.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(["error" => "Error crítico: Archivo de configuración de Mercado Pago no encontrado."]);
    exit;
}
require_once $configFile;
?>