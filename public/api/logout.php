<?php
require_once __DIR__ . '/db.php';

// Iniciar sesión si no está iniciada para poder destruirla
session_start_secure();

// Destruir todas las variables de sesión
$_SESSION = array();

// Borrar la cookie de sesión
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Destruir la sesión
session_destroy();

echo json_encode([
    "success" => true,
    "message" => "Sesión cerrada correctamente"
]);
?>