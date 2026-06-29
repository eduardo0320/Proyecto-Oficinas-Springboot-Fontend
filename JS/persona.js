function formatearOficina(oficina) {
    if (oficina && typeof oficina === "object") {
        return oficina.nombre ?? oficina.id ?? "";
    }

    return oficina ?? "";
}

async function cargarPersonas(pagina) {
    let rol = await obtenerRol();

    try {
        const respuesta = await fetch(`http://127.0.0.1:8080/api/personas?page=${pagina}&size=10`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        const data = await respuesta.json();
        const personas = data.content ?? [];
        const totalPaginas = data.totalPages ?? 0;

        let tbody = document.getElementById("personas-list");
        tbody.innerHTML = "";

        if (personas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="12" class="text-center text-muted">No hay personas que mostrar</td></tr>`;
        } else {
            personas.forEach((persona) => {
                let fila = `<tr>
                    <td>${persona.idAuto}</td>
                    <td>${persona.idUsuario}</td>
                    <td>${persona.nombre}</td>
                    <td>${persona.email}</td>
                    <td>${persona.direccion}</td>
                    <td>${persona.fechaNacimiento}</td>
                    <td>${persona.telefono}</td>
                    <td>${persona.cargo}</td>
                    <td>${persona.estado}</td>
                    <td>${formatearOficina(persona.oficina)}</td>
                    <td>`;

                if (rol === "ADMIN") {
                    fila += `
                        <button onclick="editarPersona(${persona.idAuto})" class="btn btn-warning">
                            <i class="bi bi-pencil"></i> Editar
                        </button>
                        <button onclick="eliminarPersona(${persona.idAuto})" class="btn btn-danger">
                            <i class="bi bi-trash"></i> Eliminar
                        </button>`;
                }

                fila += `</td></tr>`;
                tbody.innerHTML += fila;
            });
        }


        const botones = document.getElementById("botones-pagina");
        botones.innerHTML = "";
        for (let i = 0; i < totalPaginas; i++) {
            botones.innerHTML += `
                <button class="btn text-white ${i === pagina ? 'opacity-75' : ''}" 
                        style="background-color: #C8A2C8;" 
                        onclick="cargarPersonas(${i})">${i + 1}</button>`;
        }


    } catch (error) {
        console.error('Error al cargar personas:', error);
        mostrarToast(`No se pudieron mostrar las personas: ${error.message}`, 'danger');
    }
}


// Función eliminar persona
async function eliminarPersona(index) {

    const persona = await obtenerPersona(index);

    if (!persona) {
        alert("No se pudo cargar la persona a eliminar.");
        return;
    }

    if (confirm(`¿Estás seguro de eliminar a ${persona.nombre}?`)) {


        try {
            const respuesta = await fetch(`http://127.0.0.1:8080/api/personas/delete/${index}`, {
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!respuesta.ok) {
                const errorData = await respuesta.json();

                throw new Error(errorData.error || `HTTP ${respuesta.status}`);
            }

            mostrarToast('Persona eliminada exitosamente');


        } catch (error) {
            console.error('Error al eliminar persona:', error);
            mostrarToast(`${error.message}`, 'danger');
        }
        cargarPersonas(0);
    }
}

async function obtenerPersona(index){

    try {
        const respuesta = await fetch(`http://127.0.0.1:8080/api/personas/search/${index}`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }

        });

        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        // AQUÍ debes convertir la respuesta a JSON
        let persona = await respuesta.json();

        // Y AQUÍ retornas la persona
        return persona;


    } catch (error) {
        console.error('Error al cargar personas:', error);
        mostrarToast(`No se pudo recuperar los datos: ${error.message}`, 'danger');
        return null;
    }
}

function editarPersona(index) {
    localStorage.setItem("editIndex", index);
    window.location.href = "form.html";
}
// Función para guardar una persona (ya sea nueva o editada)
async function guardarPersona(event) {
    event.preventDefault();

    let form = event.target;

    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    let idUsuario = document.getElementById("idUsuario").value;
    let nombre = document.getElementById("nombre").value;
    let email = document.getElementById("email").value;
    let direccion = document.getElementById("direccion").value;
    let fechaNacimiento = document.getElementById("fechaNacimiento").value;
    let telefono = document.getElementById("telefono").value;
    let cargo = document.getElementById("cargo").value;
    let estado = document.getElementById("estado").value;
    let enOficina = document.getElementById("enOficina").value;

    let oficinaId = parseInt(document.getElementById("oficina").value);


    let persona = { idUsuario, nombre, email, direccion, fechaNacimiento, telefono, cargo, estado, oficina: { id: oficinaId }, enOficina };


    let index = localStorage.getItem("editIndex");
    if (index !== null) { // si edita

        try {
            const respuesta = await fetch(`http://127.0.0.1:8080/api/personas/update/${index}`, {
                method: 'PUT',
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }, body: JSON.stringify(persona)

            });

            if (!respuesta.ok) {
                const errorData = await respuesta.json();
                mostrarToast(errorData);
                throw new Error(errorData.error || `HTTP ${respuesta.status}`);
            }



            localStorage.removeItem("editIndex");
            window.location.href = "index.html";


        } catch (error) {
            console.error('Error al editar persona:', error);
            mostrarToast(`${error.message}`, 'danger');



        }



    } else { // si agrega

        try {
            const respuesta = await fetch(`http://127.0.0.1:8080/api/personas/create`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }, body: JSON.stringify(persona)

            });

            if (!respuesta.ok) {
                const errorData = await respuesta.json();
                mostrarToast(errorData);
                throw new Error(errorData.error || `HTTP ${respuesta.status}`);
            }

            mostrarToast('Persona agregada exitosamente');

            localStorage.removeItem("editIndex");
            window.location.href = "index.html";


        } catch (error) {
            console.error('Error al cargar personas:', error);
            mostrarToast(`${error.message}`, 'danger');
        }
    }


}




// Cargar oficinas al cargar la página




// Función para exportar los datos de personas a PDF
async function exportarPDF() {
    let personas;
    try {
        const respuesta = await fetch(`http://127.0.0.1:8080/api/personas`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }

        });

        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        const data = await respuesta.json();
        personas = data.content ?? [];


    } catch (error) {
        console.error('Error al cargar personas:', error);
        mostrarToast(`No se pudo recuperar los datos: ${error.message}`, 'danger');
        return null;
    }

    if (personas.length === 0) {
        mostrarToast(`No hay personas que exportar`, 'danger');
        return;
    }

    // Crear un documento PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Lista de Personas", 20, 10);

    let y = 20;
    personas.forEach((persona, index) => {
        doc.text(`${index + 1}. ${persona.nombre} - ${persona.email} - ${persona.telefono} - ${persona.direccion} - ${persona.fechaNacimiento} - ${persona.cargo} 
        - ${persona.estado} - ${persona.oficina}`, 10, y);
        y += 20;
    });

    // Descargar el archivo PDF
    doc.save("personas.pdf");
}

// Función para exportar los datos de personas a Excel
async function exportarExcel() {
    let personas;
    try {
        const respuesta = await fetch(`http://127.0.0.1:8080/api/personas`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        const data = await respuesta.json();
        personas = data.content ?? [];


    } catch (error) {
        console.error('Error al cargar personas:', error);
        mostrarToast(`No se pudo recuperar los datos: ${error.message}`, 'danger');
        return null;
    }

    if (personas.length === 0) {
        mostrarToast(`No hay personas que exportar`, 'danger');
        return;
    }

    // Preparar los datos para el archivo Excel
    let data = personas.map(persona => ({
        ID: persona.idAuto,
        Cedula: persona.idUsuario,
        Nombre: persona.nombre,
        Email: persona.email,
        Dirección: persona.direccion,
        "Fecha de Nacimiento": persona.fechaNacimiento,
        Teléfono: persona.telefono,
        Cargo: persona.cargo,
        Estado: persona.estado,
        Oficina: formatearOficina(persona.oficina)
    }));

    // Crear el archivo Excel
    let ws = XLSX.utils.json_to_sheet(data);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Personas");

    // Descargar el archivo Excel
    XLSX.writeFile(wb, "personas.xlsx");
}

let paginaBusqueda = 0;
let totalPaginasBusqueda = 0;
let busquedaActiva = false;

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text ?? "";
    return div.innerHTML;
}

async function buscarPersona(page = 0) {
    const categoria = document.getElementById("categoriaBusqueda").value;
    const busqueda = document.getElementById("buscarPersona").value.trim();

    if (busqueda === "") {
        busquedaActiva = false;
        await cargarPersonas(0);
        return;
    }

    busquedaActiva = true;
    paginaBusqueda = page;

    try {
        const response = await fetch(
            `http://127.0.0.1:8080/api/personas/buscar?page=${page}&size=10&categoria=${encodeURIComponent(categoria)}&busqueda=${encodeURIComponent(busqueda)}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                }
            }
        );

        // Agregá esto ANTES del if (!response.ok)
        console.log("Status:", response.status);
        console.log("URL llamada:", response.url);


        if (!response.ok) throw new Error("Error al buscar");

        const data = await response.json();
        const personas = data.personas;
        totalPaginasBusqueda = data.totalPages;

        renderizarTabla(personas);
        renderizarPaginacionBusqueda(data.currentPage, data.totalPages);

    } catch (error) {
        console.error("Error en la búsqueda:", error);
        mostrarToast(`No se encontrar a la persona: ${error.message}`, 'danger');
    }
}

function renderizarTabla(personas) {
    const tbody = document.getElementById("personas-list");

    if (personas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" class="text-center">No se encontraron resultados</td></tr>`;
        return;
    }

    let html = "";
    personas.forEach((persona) => {
        html += `
            <tr>
                <td>${escapeHtml(String(persona.idAuto))}</td>
                <td>${escapeHtml(String(persona.idUsuario))}</td>
                <td>${escapeHtml(persona.nombre)}</td>
                <td>${escapeHtml(persona.email)}</td>
                <td>${escapeHtml(persona.direccion)}</td>
                <td>${escapeHtml(persona.fechaNacimiento)}</td>
                <td>${escapeHtml(persona.telefono)}</td>
                <td>${escapeHtml(persona.cargo)}</td>
                <td>${escapeHtml(persona.estado)}</td>
                <td>${escapeHtml(formatearOficina(persona.oficina))}</td>
                <td>
                    <button onclick="editarPersona(${persona.idAuto})" class="btn btn-warning btn-sm">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button onclick="eliminarPersona(${persona.idAuto})" class="btn btn-danger btn-sm">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </td>
            </tr>`;
    });

    tbody.innerHTML = html;
}

function renderizarPaginacionBusqueda(paginaActual, totalPaginas) {
    const contenedor = document.getElementById("paginacion"); // tu contenedor de paginación existente

    if (totalPaginas <= 1) {
        contenedor.innerHTML = "";
        return;
    }

    let html = `<nav><ul class="pagination justify-content-center">`;

    // Botón anterior
    html += `
        <li class="page-item ${paginaActual === 0 ? "disabled" : ""}">
            <a class="page-link" href="#" onclick="buscarPersona(${paginaActual - 1}); return false;">Anterior</a>
        </li>`;

    // Números de página
    for (let i = 0; i < totalPaginas; i++) {
        html += `
            <li class="page-item ${i === paginaActual ? "active" : ""}">
                <a class="page-link" href="#" onclick="buscarPersona(${i}); return false;">${i + 1}</a>
            </li>`;
    }

    // Botón siguiente
    html += `
        <li class="page-item ${paginaActual === totalPaginas - 1 ? "disabled" : ""}">
            <a class="page-link" href="#" onclick="buscarPersona(${paginaActual + 1}); return false;">Siguiente</a>
        </li>`;

    html += `</ul></nav>`;
    contenedor.innerHTML = html;
}

