<?php
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$ticketId = isset($data['ticketId']) ? htmlspecialchars(strip_tags($data['ticketId'])) : null;
$status = isset($data['status']) ? htmlspecialchars(strip_tags($data['status'])) : null;
$userId = isset($data['userId']) ? htmlspecialchars(strip_tags($data['userId'])) : null;

if (!$ticketId || !$status || !$userId) {
    http_response_code(400);
    echo json_encode(["error" => "Faltan parámetros"]);
    exit;
}

// Verificar si el usuario que solicita el cambio es admin
$stmt = $conn->prepare("SELECT role FROM users WHERE id = :userId");
$stmt->bindParam(":userId", $userId);
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && strtolower($user['role']) === 'admin') {
    $updateQuery = "UPDATE tickets SET status = :status WHERE id = :ticketId";
    $updateStmt = $conn->prepare($updateQuery);
    $updateStmt->bindParam(":status", $status);
    $updateStmt->bindParam(":ticketId", $ticketId);
    
    if ($updateStmt->execute()) {
        // Sincronizar el estado del pedido (orders) con el del ticket
        $stmtOrder = $conn->prepare("SELECT orderId FROM tickets WHERE id = :ticketId");
        $stmtOrder->bindParam(":ticketId", $ticketId);
        $stmtOrder->execute();
        $ticketInfo = $stmtOrder->fetch(PDO::FETCH_ASSOC);
        
        if ($ticketInfo && isset($ticketInfo['orderId'])) {
            $orderId = $ticketInfo['orderId'];
            $newOrderStatus = ($status === 'closed') ? 'completed' : 'processing';
            $stmtUpdateOrder = $conn->prepare("UPDATE orders SET status = :orderStatus WHERE id = :orderId");
            $stmtUpdateOrder->bindParam(":orderStatus", $newOrderStatus);
            $stmtUpdateOrder->bindParam(":orderId", $orderId);
            $stmtUpdateOrder->execute();
        }
        
        echo json_encode(["success" => true, "message" => "Estado actualizado a " . $status]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error al actualizar el ticket"]);
    }
} else {
    http_response_code(403);
    echo json_encode(["error" => "No tienes permisos para realizar esta acción"]);
}
?>