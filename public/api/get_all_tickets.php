<?php
include_once 'db.php';

$userId = isset($_GET['userId']) ? htmlspecialchars(strip_tags($_GET['userId'])) : '';

if($userId) {
    $userQuery = "SELECT role FROM users WHERE id = :userId";
    $userStmt = $conn->prepare($userQuery);
    $userStmt->bindParam(":userId", $userId);
    $userStmt->execute();
    $currentUser = $userStmt->fetch(PDO::FETCH_ASSOC);
    
    if($currentUser && ($currentUser['role'] === 'admin' || $currentUser['role'] === 'ayudante')) {
        $query = "SELECT t.*, u.email, o.items FROM tickets t JOIN users u ON t.userId = u.id JOIN orders o ON t.orderId = o.id ORDER BY FIELD(t.status, 'open', 'closed'), t.created_at DESC";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($tickets);
    } else {
        http_response_code(403);
        echo json_encode(["error" => "Unauthorized"]);
    }
}
?>