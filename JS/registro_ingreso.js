

async function cargarRegistros(pagina) {
    const rol = await obtenerRol(); // Obtener el rol del usuario

    try {
        const respuesta = await fetch(`http://127.0.0.1:8080/api/registros?page=${pagina}&size=5`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        const data = await respuesta.json();
        const totalPaginas = data.totalPages ?? 0;
        const registros = Array.isArray(data.content)
            ? data.content
            : Array.isArray(data)
                ? data
                : [];

        let tbody = document.getElementById("registro_ingresos-list");
        tbody.innerHTML = ""; // Limpiar contenido previo

        if (registros.length === 0) {
            tbody.innerHTML = `<tr>
                <td colspan="6" class="text-center text-muted">No hay registros que mostrar</td>
            </tr>`;
            return;
        }

        registros.forEach((registro) => {
            let fila = `<tr>
                <td>${registro.id}</td>
                <td>${registro.nombrePersona ?? '---'}</td>
                <td>${registro.nombreOficina ?? '---'}</td>
                <td>${registro.tipo}</td>
                <td>${registro.fecha}</td>
                <td>${registro.hora}</td>
                
                <td>`;


            fila += `</td></tr>`;
            tbody.innerHTML += fila;

            // botones de pagina
            const botones = document.getElementById("botones-pagina-registros");
            botones.innerHTML = "";
            for (let i = 0; i < totalPaginas; i++) {
                botones.innerHTML += `
                <button class="btn text-white ${i === pagina ? 'opacity-75' : ''}" 
                        style="background-color: #C8A2C8;" 
                        onclick="cargarRegistros(${i})">${i + 1}</button>`;
            }
        });
    } catch (error) {
        console.error('No se pudieron mostrar los registros en la tabla:', error);
        alert('No se pudieron mostrar los registros en la tabla.');
    }
}



async function obtenerRegistro(index){

    try {
        const respuesta = await fetch(`http://127.0.0.1:8080/api/registros/obtener/${index}`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }

        });

        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);


        let registro = await respuesta.json();


        return registro;


    } catch (error) {
        console.error('No se encontró el registro ingresado:', error);
        alert('No se encontró el registro ingresado.');
    }
}



async function guardarRegistro(event) {
    event.preventDefault();

    let form = event.target;

    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }



    let tipo = document.getElementById("tipo").value;
    let fecha = document.getElementById("fecha").value;
    let hora = document.getElementById("hora").value;
    let nombrePersona = document.getElementById("persona").value;

    let registro = { tipo, fecha, nombrePersona, hora };

    try {
        const respuesta = await fetch(`http://127.0.0.1:8080/api/registros/registros/crear`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }, body: JSON.stringify(registro)

        });

        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            mostrarToast(errorData);
            throw new Error(errorData.error || `HTTP ${respuesta.status}`);
        }

    } catch (error) {
        console.error('Error al agregar registro:', error);
        mostrarToast(`${error.message}`, 'danger');
        return;
    }

    window.location.href = "registro_ingresos.html";
}



async function cargarPersonas() {
    let select = document.getElementById("persona");

    if (!select) return; // Verificar si el select existe
    let personas = [];
    try {
        const respuesta = await fetch('http://127.0.0.1:8080/api/personas?page=0&size=200', {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        const data = await respuesta.json();
        personas = Array.isArray(data.content) ? data.content : [];


    } catch (error) {
        console.error('Error al cargar personas:', error);
        alert('No se pudieron obtener las personas para el select.');
    }


    // Limpiar las opciones previas
    select.innerHTML = '<option value="" disabled selected>Seleccione una persona</option>';

    // Agregar al select
    personas.forEach(persona => {
        let option = document.createElement("option");
        option.value = persona.nombre;
        option.textContent = persona.nombre;
        select.appendChild(option);
    });
}



// Función para exportar los registros en formato PDF
async function exportarRegistrosPDF() {
    let registros;
    try {
        const respuesta = await fetch(`http://127.0.0.1:8080/api/registros?page=0&size=1000`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }

        });

        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        // AQUÍ debes convertir la respuesta a JSON
        const data = await respuesta.json();
        registros = Array.isArray(data.content)
            ? data.content
            : Array.isArray(data)
                ? data
                : [];


    } catch (error) {
        console.error('Error al cargar los registros:', error);
        alert('No se pudo recuperar los registros.');
        return null;
    }

    // Verifica si hay registros disponibles para exportar
    if (registros.length === 0) {
        alert("No hay registros para exportar.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Agrega un título al documento PDF
    doc.text("Lista de Registros", 20, 10);

    let y = 20;
    registros.forEach((registro, index) => {
        // Agrega cada registro al PDF
        const nombrePersona = registro.persona?.nombre ?? registro.persona ?? '';
        doc.text(`${index + 1}. ${nombrePersona} - ${registro.tipo} - ${registro.fecha} - ${registro.hora}`, 10, y);
        y += 10;
    });

    // Guarda el archivo PDF
    doc.save("registros.pdf");
}

// Función para exportar los registros en formato Excel
async function exportarRegistrosExcel() {
    let registros;
    try {
        const respuesta = await fetch(`http://127.0.0.1:8080/api/registros?page=0&size=1000`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }

        });

        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        // AQUÍ debes convertir la respuesta a JSON
        const data = await respuesta.json();
        registros = Array.isArray(data.content)
            ? data.content
            : Array.isArray(data)
                ? data
                : [];


    } catch (error) {
        console.error('Error al cargar los registros:', error);
        alert('No se pudo recuperar los registros.');
        return null;
    }

    // Verifica si hay registros disponibles para exportar
    if (registros.length === 0) {
        alert("No hay registros para exportar.");
        return;
    }

    // Mapea los registros a un formato adecuado para Excel
    let data = registros.map(registro => ({
        Nombre: registro.persona?.nombre ?? registro.persona ?? '',
        Tipo: registro.tipo,
        Fecha: registro.fecha,
        Hora: registro.hora
    }));

    // Convierte los datos a una hoja de Excel
    let ws = XLSX.utils.json_to_sheet(data);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registros");

    // Exporta el archivo Excel
    XLSX.writeFile(wb, "registros.xlsx");
}


// Se llama a la función cargarPersonas cuando la página se ha cargado completamente
document.addEventListener("DOMContentLoaded", cargarPersonas);

