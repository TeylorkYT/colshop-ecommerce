<?php
// MEJORA: Headers correctos y dependencia estricta
header('Content-Type: application/json');
require_once 'db.php';

session_start_secure();

$orderId = isset($_GET['orderId']) ? htmlspecialchars(strip_tags($_GET['orderId'])) : '';
$userId = $_SESSION['user_id'] ?? null;
$isAdmin = $_SESSION['is_admin'] ?? false;


if($orderId && $userId) {

    // Buscar el ticket
    $query = "SELECT t.*, u.email, o.items, o.total FROM tickets t JOIN users u ON t.userId = u.id JOIN orders o ON t.orderId = o.id WHERE t.orderId = :orderId";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":orderId", $orderId);
    $stmt->execute();
    $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

    if($ticket) {
        // Verificar si el usuario tiene permiso (es el dueño o es administrador)
        if($ticket['userId'] == $userId || $isAdmin) {
            // 2. Obtener mensajes
            $msgQuery = "SELECT tm.*, u.email as userEmail, u.role as userRole FROM ticket_messages tm JOIN users u ON tm.userId = u.id WHERE tm.ticketId = :ticketId ORDER BY tm.created_at ASC";
            $msgStmt = $conn->prepare($msgQuery);
            $msgStmt->bindParam(":ticketId", $ticket['id']);
            $msgStmt->execute();
            $messages = $msgStmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["ticket" => $ticket, "messages" => $messages]);
        } else {
            http_response_code(403);
            echo json_encode(["error" => "No tienes permiso para ver este ticket"]);
        }
    } else {
        echo json_encode(["error" => "Ticket no encontrado"]);
    }
} else {
    // MEJORA: Feedback claro si faltan parámetros
    echo json_encode(["error" => "Faltan parámetros orderId o userId"]);
}
?>