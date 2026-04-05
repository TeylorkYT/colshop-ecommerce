<?php
// MEJORA SEGURIDAD: Desactivar errores visibles
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once __DIR__ . '/db.php';

// 1. Restricción estricta de HTTP y cabeceras
header("Content-Type: application/json; charset=UTF-8");
header("Cache-Control: no-cache, no-store, must-revalidate");

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido. Se requiere GET."]);
    exit;
}

// 2. Sanitización profesional de entrada
$userId = filter_input(INPUT_GET, 'userId', FILTER_SANITIZE_FULL_SPECIAL_CHARS);

if ($userId) {
    
    // [!] ARQUITECTURA DE SEGURIDAD (IDOR VULNERABILITY PREVENTION)
    // En un entorno Enterprise, aquí debes validar que la sesión PHP coincida con el $userId solicitado.
    session_start_secure();
    if (!isset($_SESSION['user_id']) || $_SESSION['user_id'] != $userId) {
        http_response_code(403);
        echo json_encode(["error" => "Acceso denegado."]);
        exit;
    }

    try {
        // 3. Proyección de Columnas (Optimización de I/O)
        // Traemos solo lo que React usa. Evitamos cargar payment_id y datos basura a la memoria.
        $query = "
            SELECT 
                id, 
                userid as userId, 
                coupon_code,
                discount_amount,
                items, 
                total, 
                status, 
                shippingInfo, 
                created_at 
            FROM orders 
            WHERE userid = :userId AND status != 'pending' 
            ORDER BY created_at DESC 
            LIMIT 50
        ";
        
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":userId", $userId, PDO::PARAM_STR);
        $stmt->execute();
        
        $orders = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            
            // 4. Casteo estricto y parseo seguro de JSONs
            $items = json_decode($row['items'], true);
            $row['items'] = (json_last_error() === JSON_ERROR_NONE && is_array($items)) ? $items : [];
            
            $shippingInfo = json_decode($row['shippingInfo'], true);
            $row['shippingInfo'] = (json_last_error() === JSON_ERROR_NONE && is_array($shippingInfo)) ? $shippingInfo : [];
            
            // Pre-cálculo rápido
            $itemCount = 0;
            foreach ($row['items'] as $item) {
                $itemCount += isset($item['quantity']) ? (int)$item['quantity'] : 0;
            }
            $row['itemCount'] = $itemCount;
            
            // Limpieza y casteo de Flotante para evitar fallos matemáticos en React
            $cleanTotal = preg_replace('/[^0-9.]/', '', $row['total']);
            $row['total'] = is_numeric($cleanTotal) ? (float)$cleanTotal : 0.00;
            
            $orders[] = $row;
        }
        
        // 5. Compresión JSON y salida
        // JSON_UNESCAPED_UNICODE y JSON_UNESCAPED_SLASHES reducen el tamaño del texto transmitido
        $jsonOutput = json_encode($orders, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        
        if ($jsonOutput === false) {
            secure_log("JSON Encode Error in get_orders: " . json_last_error_msg());
            http_response_code(500);
            echo json_encode(["error" => "Error procesando datos"]);
        } else {
            http_response_code(200);
            echo $jsonOutput;
        }
    } catch(PDOException $e) {
        http_response_code(500);
        // SEGURIDAD: No mostrar detalles del error de BD al usuario
        secure_log("Database Error in get_orders: " . $e->getMessage());
        echo json_encode(["error" => "Error interno del servidor"]);
    }
} else {
    echo json_encode([]);
}
?>