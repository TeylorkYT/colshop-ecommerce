<?php
include_once 'db.php';
$data = json_decode(file_get_contents("php://input"));

if(isset($data->email) && isset($data->password)) {
    // Evitar spam de registros (máx 3 por hora por IP)
    check_rate_limit($conn, 'register', 3, 60);

    // Verificar si el email ya existe
    $check = $conn->prepare("SELECT id FROM users WHERE email = :email");
    $check->bindParam(":email", $data->email);
    $check->execute();
    if($check->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(["error" => "El correo ya está registrado"]);
        exit;
    }

    $query = "INSERT INTO users (email, password, role) VALUES (:email, :password, 'user')";
    $stmt = $conn->prepare($query);
    
    // Encriptar contraseña
    $password_hash = password_hash($data->password, PASSWORD_BCRYPT);
    
    $stmt->bindParam(":email", $data->email);
    $stmt->bindParam(":password", $password_hash);
    
    if($stmt->execute()) {
        $userId = $conn->lastInsertId();
        echo json_encode([
            "message" => "Usuario registrado exitosamente",
            "user" => ["id" => $userId, "email" => $data->email, "role" => "user"]
        ]);
    } else {
        http_response_code(503);
        echo json_encode(["error" => "No se pudo registrar el usuario."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Datos incompletos."]);
}
?>