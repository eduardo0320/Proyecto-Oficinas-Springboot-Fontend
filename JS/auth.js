async function login(event) {
    event.preventDefault(); // Evita que el formulario recargue la página

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://127.0.0.1:8080/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error("Error de autenticación: " + response.statusText);
        }

        const data = await response.text();
        localStorage.setItem("token", data);

        console.log("Token recibido:", data);
        let rol = await obtenerRol();
        if(rol==="REGISTRADOR") {
            window.location.href = "registro_ingresos.html";
        } else {
            window.location.href = "../HTML/index.html";
        }
    } catch (error) {
        console.error("Error de autenticación:", error);
        alert("Credenciales incorrectas, intente nuevamente");
    }
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

// Función para verificar autenticación
function verificarAutenticacion() {
    const auth = localStorage.getItem("token")
    if (!auth) {
        window.location.href = "login.html"; // Redirigir si no está autenticado
    }
}

async function obtenerRol(){
    const token = localStorage.getItem('token');

    try {
        const respuesta = await fetch(`http://127.0.0.1:8080/api/auth/rol`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        const rol = await respuesta.text();
        console.log("rol recibido:", rol);
        return rol;

    } catch (error) {
        console.error('No se pudo obtener el rol:', error);
        alert('No se pudo obtener el rol.');
    }

}

