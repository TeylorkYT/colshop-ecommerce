<?php
include_once 'db.php';
$data = json_decode(file_get_contents("php://input"));

if(isset($data->email) && isset($data->password)) {
    check_rate_limit($conn, 'login', 5, 15);
    
    $query = "SELECT id, email, password, role FROM users WHERE email = :email";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":email", $data->email);
    $stmt->execute();
    
    if($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if(password_verify($data->password, $row['password'])) {
            // Iniciar sesión de forma segura usando la función centralizada
            session_start_secure();
            
            session_regenerate_id(true); // Prevenir fijación de sesión
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['is_admin'] = ($row['role'] === 'admin');
            
            unset($row['password']); // No enviar la contraseña de vuelta
            echo json_encode([
                "message" => "Login exitoso",
                "user" => $row
            ]);
        } else if (hash_equals($row['password'], $data->password)) {
            // Legacy password check (plain text)
            // Hash the password and update the database
            $password_hash = password_hash($data->password, PASSWORD_BCRYPT);
            $update_query = "UPDATE users SET password = :password WHERE id = :id";
            $update_stmt = $conn->prepare($update_query);
            $update_stmt->bindParam(":password", $password_hash);
            $update_stmt->bindParam(":id", $row['id']);
            $update_stmt->execute();

            // Proceed with login
            session_start_secure();
            
            session_regenerate_id(true);
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['is_admin'] = ($row['role'] === 'admin');
            
            unset($row['password']);
            echo json_encode([
                "message" => "Login exitoso y contraseña actualizada",
                "user" => $row
            ]);
        }
        else {
            record_failed_attempt($conn, 'login');
            http_response_code(401);
            echo json_encode(["error" => "Credenciales inválidas"]);
        }
    } else {
        record_failed_attempt($conn, 'login');
        http_response_code(401);
        echo json_encode(["error" => "Credenciales inválidas"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Datos incompletos."]);
}
?>