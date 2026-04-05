# 🛒 Colshop - E-commerce Seguro (React + PHP)

**🚀 Live Demo:** [https://tu-dominio.com](https://tu-dominio.com) _(Reemplaza con tu enlace real)_

Plataforma de comercio electrónico moderna y segura para la venta de productos digitales (Robux, Cuentas, etc.), construida con una arquitectura híbrida de Frontend en React y Backend en PHP nativo.

Este proyecto fue desarrollado para resolver problemas reales de concurrencia, seguridad e integración de pagos en entornos de comercio electrónico de bienes digitales.

## ✨ Características Destacadas (Features)

- **Integración de Pagos con Mercado Pago:** Implementación de Webhooks seguros para procesar pagos de forma asíncrona, validando firmas criptográficas para evitar fraudes.
- **Prevención de Race Conditions:** Uso de transacciones SQL (`FOR UPDATE`) en el backend PHP para asegurar un control de inventario exacto, incluso cuando múltiples usuarios compran simultáneamente.
- **Seguridad Robusta:**
  - Prevención de inyecciones SQL usando consultas preparadas (PDO).
  - Validación profunda de archivos subidos verificando el tipo MIME real (no solo la extensión).
  - Autenticación mediante sesiones seguras (`HttpOnly`, `SameSite=Strict`).
- **Optimización Frontend (React):** Manejo eficiente del estado global con Context API y Hooks (`useMemo`, `useCallback`) para evitar re-renderizados innecesarios en catálogos extensos.
- **Internacionalización (i18n):** Soporte multi-idioma y conversión dinámica de monedas (COP, USD, BRL, etc.).

## 💻 Tech Stack

**Frontend:**

- React 18 (Vite)
- Tailwind CSS & Framer Motion (Animaciones)
- Context API (State Management)

**Backend & Database:**

- PHP 8.x (API RESTful nativa, sin frameworks pesados)
- MySQL / MariaDB
- PDO (PHP Data Objects)

**Integraciones:**

- Mercado Pago Checkout Pro & Webhooks

---

## 🏗️ Arquitectura del Sistema

El proyecto utiliza una arquitectura desacoplada pero servida desde el mismo origen en producción para evitar problemas de CORS y simplificar el despliegue.

- **Frontend (Cliente):** SPA (Single Page Application) construida con React, Vite y Tailwind CSS. Maneja la UI, el estado del carrito y la comunicación con la API.
- **Backend (Servidor):** API RESTful en PHP puro. Maneja la lógica de negocio, autenticación segura por sesiones, conexión a base de datos y validación de pagos.
- **Base de Datos:** MySQL/MariaDB.
- **Seguridad:**
  - Autenticación de administradores vía Sesiones PHP (`HttpOnly`, `Secure`, `SameSite=Strict`).
  - Protección contra CSRF y XSS.
  - Validación de integridad de precios en el servidor (Anti-Tampering).
  - Credenciales de base de datos aisladas fuera del directorio público.

### Flujo de Datos

1.  **Usuario** interactúa con la interfaz React.
2.  **React** envía peticiones `fetch` a `/api/*.php` (con `credentials: 'include'` para enviar cookies).
3.  **PHP** valida la sesión y procesa la solicitud.
4.  **PHP** consulta/actualiza **MySQL** usando credenciales seguras desde `../config.php`.
5.  **PHP** devuelve JSON al Frontend.

---

## 🚀 Guía de Despliegue en Hostinger

Sigue estos pasos estrictos para garantizar la seguridad del entorno de producción.

### 1. Preparación del Entorno (Servidor)

1.  Accede al **Administrador de Archivos** de Hostinger.
2.  Navega un nivel **arriba** de `public_html` (la raíz de tu usuario).
3.  Crea un archivo llamado `config.php`.
4.  Pega el siguiente contenido con tus credenciales reales de base de datos:

    ```php
    <?php
    // Archivo: /home/u123456789/config.php (FUERA de public_html)
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'u123456789_colshop'); // Tu nombre de BD real
    define('DB_USER', 'u123456789_admin');   // Tu usuario real
    define('DB_PASS', 'Tu_Contraseña_Segura_Aqui');
    define('ADMIN_SECRET', 'clave_secreta_para_uso_interno'); // Opcional si usas solo sesiones
    ?>
    ```

5.  **Permisos:** Asegúrate de que este archivo tenga permisos `600` o `640`.

### 2. Construcción del Frontend (Local)

En tu máquina local, ejecuta:

```bash
# Instalar dependencias
npm install

# Generar versión de producción
npm run build
```

Esto creará una carpeta `dist/` con todo tu código optimizado (HTML, JS, CSS y la carpeta `api/` con los scripts PHP).

### 3. Subida de Archivos

1.  Ve a la carpeta `public_html` en Hostinger.
2.  Borra cualquier contenido previo (index.php por defecto, etc.).
3.  Sube **todo el contenido** de tu carpeta local `dist/` al interior de `public_html`.
    - Deberías ver `index.html`, `assets/` y `api/` dentro de `public_html`.
4.  **Verificación de Seguridad:**
    - Entra a la carpeta `api/` en el servidor.
    - Verifica que exista el archivo `.htaccess` (si no, súbelo manualmente desde `public/api/.htaccess`).
    - Este archivo es vital para proteger tus scripts.

---

## 🛠️ Comandos de Desarrollo

| Comando           | Descripción                                                    |
| :---------------- | :------------------------------------------------------------- |
| `npm run dev`     | Inicia el servidor de desarrollo con Hot Reload (Puerto 3000). |
| `npm run build`   | Compila el proyecto para producción en la carpeta `dist`.      |
| `npm run preview` | Previsualiza localmente el build generado.                     |

**Nota:** Para que el backend funcione en local (`npm run dev`), necesitas tener un servidor PHP (XAMPP/Laragon) corriendo en el puerto 80 o configurar el proxy en `vite.config.js`.

---

## 🗄️ Estructura de Base de Datos

Ejecuta este script SQL en phpMyAdmin para crear las tablas necesarias:

_(Ver sección de SQL en la documentación completa o usar el script proporcionado anteriormente)_

## 🔒 Checklist de Seguridad Final

- [ ] `config.php` está fuera de `public_html`.
- [ ] `.htaccess` está presente en la carpeta `api/`.
- [ ] `install_db.php` (si existía) ha sido eliminado.
- [ ] La conexión a la BD funciona (prueba el login).
- [ ] Los permisos de carpetas son `755` y archivos `644`.

---

&copy; 2025 Colshop. Todos los derechos reservados.
