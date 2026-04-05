<?php
require_once __DIR__ . '/db.php';

$data = json_decode(file_get_contents("php://input"));

if(isset($data->ticketId) && isset($data->userId) && isset($data->message)) {
    // Validar que el mensaje no esté vacío
    if (trim($data->message) === '') {
        http_response_code(400);
        echo json_encode(["error" => "El mensaje no puede estar vacío"]);
        exit;
    }

    $query = "INSERT INTO ticket_messages (ticketId, userId, message, type, created_at) VALUES (:ticketId, :userId, :message, :type, NOW())";
    $stmt = $conn->prepare($query);
    
    $type = isset($data->type) ? $data->type : 'text';
    
    $stmt->bindParam(":ticketId", $data->ticketId);
    $stmt->bindParam(":userId", $data->userId);
    
    // SEGURIDAD: Sanitizar mensaje para evitar XSS almacenado básico
    $cleanMessage = htmlspecialchars(strip_tags($data->message));
    $stmt->bindParam(":message", $cleanMessage);
    $stmt->bindParam(":type", $type);
    
    if($stmt->execute()) {
        echo json_encode(["message" => "Mensaje enviado"]);
    } else {
        http_response_code(500);
        secure_log("Error enviando mensaje ticket {$data->ticketId}: " . implode(" ", $stmt->errorInfo()));
        echo json_encode(["error" => "Error al enviar mensaje"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Datos incompletos"]);
}
?>