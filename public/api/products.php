<?php
require_once __DIR__ . '/db.php';

try {
    $query = "SELECT * FROM products WHERE is_active = 1";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    
    $products = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Convertir tipos numéricos para que React los procese bien
        $row['price'] = (float)str_replace(',', '', $row['price']);
        $row['stock'] = (int)$row['stock'];
        
        // Eliminar specs para evitar que el frontend antiguo muestre "0: {"
        if (isset($row['specs'])) {
            unset($row['specs']);
        }
        
        array_push($products, $row);
    }
    
    echo json_encode($products);
} catch(PDOException $e) {
    http_response_code(500);
    // SEGURIDAD: No mostrar detalles del error de BD al usuario
    secure_log("Database Error in products.php: " . $e->getMessage());
    echo json_encode(["error" => "Error interno del servidor"]);
}
?>