<?php
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$ticketId = isset($data['ticketId']) ? htmlspecialchars(strip_tags($data['ticketId'])) : null;
$userId = isset($data['userId']) ? htmlspecialchars(strip_tags($data['userId'])) : null;

if (!$ticketId || !$userId) {
    http_response_code(400);
    echo json_encode(["error" => "Faltan parámetros"]);
    exit;
}

// Verificar estrictamente que el usuario es admin
$stmt = $conn->prepare("SELECT role FROM users WHERE id = :userId");
$stmt->bindParam(":userId", $userId);
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && strtolower($user['role']) === 'admin') {
    try {
        $conn->beginTransaction();
        
        // Obtener el orderId antes de borrar el ticket para actualizar el estado del pedido
        $stmtOrder = $conn->prepare("SELECT orderId FROM tickets WHERE id = :ticketId");
        $stmtOrder->bindParam(":ticketId", $ticketId);
        $stmtOrder->execute();
        $ticketInfo = $stmtOrder->fetch(PDO::FETCH_ASSOC);
        
        // Eliminar mensajes asociados al ticket primero (integridad referencial)
        $delMsg = $conn->prepare("DELETE FROM ticket_messages WHERE ticketId = :ticketId");
        $delMsg->bindParam(":ticketId", $ticketId);
        $delMsg->execute();
        
        // Eliminar el ticket padre
        $delTicket = $conn->prepare("DELETE FROM tickets WHERE id = :ticketId");
        $delTicket->bindParam(":ticketId", $ticketId);
        $delTicket->execute();
        
        // Cancelar el pedido asociado si el ticket se elimina por completo
        if ($ticketInfo && isset($ticketInfo['orderId'])) {
            $stmtUpdateOrder = $conn->prepare("UPDATE orders SET status = 'cancelled' WHERE id = :orderId");
            $stmtUpdateOrder->bindParam(":orderId", $ticketInfo['orderId']);
            $stmtUpdateOrder->execute();
        }
        
        $conn->commit();
        echo json_encode(["success" => true, "message" => "Ticket eliminado permanentemente"]);
    } catch (Exception $e) {
        $conn->rollBack();
        http_response_code(500);
        echo json_encode(["error" => "Error al eliminar el ticket"]);
    }
} else {
    http_response_code(403);
    echo json_encode(["error" => "No tienes permisos para realizar esta acción"]);
}
?>