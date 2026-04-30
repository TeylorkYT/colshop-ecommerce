<?php
// SEGURIDAD: Desactivar visualización de errores en producción para evitar fuga de información
ini_set('display_errors', 0);
ini_set('log_errors', 1); // Habilitar log de errores en archivo del servidor

// Configuración de Base de Datos y Constantes Globales

// 1. Credenciales de Base de Datos
// Importamos las credenciales desde un archivo separado que no se sube al repositorio
// SEGURIDAD: Buscar config.php fuera del directorio público.
// En Hostinger, la estructura segura es tener config.php un nivel arriba de public_html.
$configFile = __DIR__ . '/../../private_config/config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(["error" => "Error crítico: Archivo de configuración no encontrado."]);
    exit;
}
require_once $configFile;

// 2. Constantes de Estado de Orden
define('ORDER_STATUS_PENDING', 'pending');
define('ORDER_STATUS_COMPLETED', 'completed');
define('ORDER_STATUS_CANCELLED', 'cancelled');

// 3. Configuración de Seguridad y Headers
// SEGURIDAD: Manejo dinámico de CORS para permitir desarrollo local seguro
$allowed_origins = ['https://colshop.net', 'https://www.colshop.net'];
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
header("X-Frame-Options: DENY");
header("X-Content-Type-Options: nosniff");

// Manejo de Pre-flight (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 6. Conexión PDO
try {
    $conn = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
} catch(PDOException $e) {
    // DEBUG: Mostrar error detallado
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión a base de datos: " . $e->getMessage()]);
    exit;
}

// 8. Función de Inicio de Sesión Seguro (Centralizada)
function session_start_secure() {
    if (session_status() === PHP_SESSION_NONE) {
        // FIX: Detectar entorno para evitar bloqueo de cookies (Error 401)
        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
        $isLocal = (strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false);

        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'domain' => '',
            'secure' => true, // Hostinger usa HTTPS, requerido para SameSite=None
            'httponly' => true,
            'samesite' => $isLocal ? 'None' : 'Lax' // 'None' para desarrollo local, 'Lax' para producción
        ]);
        session_start();
    }
}

// 9. Función de Autenticación Administrativa (SESIONES)
function validate_admin_session() {
    session_start_secure();

    // Verificar si el usuario es administrador
    // Asumimos que login.php establece $_SESSION['is_admin'] = true
    if (empty($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
        http_response_code(401);
        echo json_encode(["error" => "Acceso no autorizado."]);
        exit;
    }
}

// 7. Función de Log Seguro
function secure_log($message) {
    // FIX SEGURIDAD: Usar extensión .php con cabecera de muerte para evitar lectura directa vía navegador
    // si falla la configuración del servidor web.
    $logFile = __DIR__ . '/transaction_logs.php'; 
    $date = date('Y-m-d H:i:s');
    if (!file_exists($logFile)) { file_put_contents($logFile, "<?php die('Access Denied'); ?>\n"); }
    $cleanMessage = str_replace(array("\r", "\n"), ' ', $message);
    file_put_contents($logFile, "[$date] $cleanMessage\n", FILE_APPEND);
}

// 10. Funciones de Rate Limiting (Protección contra Fuerza Bruta)
function check_rate_limit($conn, $action, $max_attempts = 5, $minutes = 15) {
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
    
    // Crear tabla si no existe
    $conn->exec("CREATE TABLE IF NOT EXISTS login_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ip_address VARCHAR(45) NOT NULL,
        action VARCHAR(20) NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX (ip_address, action, timestamp)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Limpieza ocasional (1% de probabilidad para no afectar rendimiento)
    if (rand(1, 100) === 1) {
        $conn->exec("DELETE FROM login_attempts WHERE timestamp < NOW() - INTERVAL 1 HOUR");
    }

    $stmt_limit = $conn->prepare("SELECT COUNT(*) FROM login_attempts WHERE ip_address = :ip AND action = :action AND timestamp > NOW() - INTERVAL " . (int)$minutes . " MINUTE");
    $stmt_limit->execute([':ip' => $ip_address, ':action' => $action]);
    $attempts = $stmt_limit->fetchColumn();

    if ($attempts >= $max_attempts) {
        http_response_code(429);
        echo json_encode(["error" => "Demasiados intentos. Por favor, intenta de nuevo en $minutes minutos."]);
        exit;
    }
}

function record_failed_attempt($conn, $action) {
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
    try {
        $stmt_fail = $conn->prepare("INSERT INTO login_attempts (ip_address, action) VALUES (:ip, :action)");
        $stmt_fail->execute([':ip' => $ip_address, ':action' => $action]);
    } catch (PDOException $e) {
        // Ignorar si la tabla aún no fue creada
    }
}
?>