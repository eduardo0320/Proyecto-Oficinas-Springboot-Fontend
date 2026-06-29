async function cargarOficinas(pagina = 0) {
    const rol = await obtenerRol();

    try {
        const respuesta = await fetch(
            `http://127.0.0.1:8080/api/oficinas?page=${pagina}&size=5`,
            {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            throw new Error(errorData.error || `HTTP ${respuesta.status}`);
        }

        const data = await respuesta.json();

        const oficinas = Array.isArray(data.content) ? data.content : (Array.isArray(data) ? data : []);
        const totalPaginas = data.totalPages ?? 0;

        const tbody = document.getElementById("oficinas-list");
        tbody.innerHTML = "";

        if (oficinas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        No hay oficinas que mostrar
                    </td>
                </tr>`;
            return;
        }

        let html = "";

        oficinas.forEach(oficina => {
            html += `
                <tr>
                    <td>${oficina.id}</td>
                    <td>${oficina.nombre}</td>
                    <td>${oficina.direccion}</td>
                    <td>${oficina.cantidad_maxima}</td>
                    <td>${oficina.ingresos_activos}</td>
                    <td>`;

            if (rol === "ADMIN") {
                html += `
                    <button onclick="editarOficina(${oficina.id})" class="btn btn-warning">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button onclick="eliminarOficina(${oficina.id})" class="btn btn-danger">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>`;
            }

            html += `</td></tr>`;
        });

        tbody.innerHTML = html;

        // botones de pagina
        const contenedor = document.getElementById("botones-pagina-oficinas");
        contenedor.innerHTML = "";
        for (let i = 0; i < totalPaginas; i++) {
            contenedor.innerHTML += `
                <button class="btn text-white ${i === pagina ? 'opacity-75' : ''}" 
                        style="background-color: #C8A2C8;" 
                        onclick="cargarOficinas(${i})">${i + 1}</button>`;
        }

    } catch (error) {
        console.error("Error cargando oficinas:", error);
        mostrarToast(`${error.message}`, 'danger');

    }
}

// Función para eliminar una oficina
async function eliminarOficina(index) {
    let oficina = await obtenerOficina(index);
    if (confirm(`¿Estás seguro de eliminar a ${oficina.nombre}?`)) {


        try {
            const respuesta = await fetch(`http://127.0.0.1:8080/api/oficinas/delete/${index}`, {
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

            mostrarToast('Oficina eliminada exitosamente');


        } catch (error) {
            console.error('Error al eliminar oficina seleccionada:', error);
            mostrarToast(`${error.message}`, 'danger');
        }
        cargarOficinas(0);
    }
}

async function obtenerOficina(index){

    try {
        const respuesta = await fetch(`http://127.0.0.1:8080/api/oficinas/get/${index}`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }

        });

        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            throw new Error(errorData.error || `HTTP ${respuesta.status}`);
        }


        let oficina = await respuesta.json();


        return oficina;


    } catch (error) {
        console.error('No se encontró la oficina ingresada:', error);
        mostrarToast(`${error.message}`, 'danger');
    }
}

// Función para editar los detalles de una oficina
function editarOficina(index) {
    localStorage.setItem("editIndex", index);
    window.location.href = "form_oficina.html";
}

async function guardarOficina(event) {
    event.preventDefault();

    let form = event.target;

    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }


    let nombre = document.getElementById("nombre").value;
    let direccion = document.getElementById("direccion").value;
    let cantidad_maxima = document.getElementById("cantidad_maxima").value;
    let ingresos_activos = document.getElementById("ingresos_activos").value;
    let oficina = { nombre, direccion, cantidad_maxima, ingresos_activos };



    let index = localStorage.getItem("editIndex");
    if (index !== null) { // si se edita

        try {
            const respuesta = await fetch(`http://127.0.0.1:8080/api/oficinas/update/${index}`, {
                method: 'PUT',
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }, body: JSON.stringify(oficina)

            });

            if (!respuesta.ok) {
                const errorData = await respuesta.json();
                throw new Error(errorData.error || `HTTP ${respuesta.status}`);
            }

            mostrarToast('Oficina editada exitosamente');

        } catch (error) {
            console.error('Error al editar oficina:', error);
            mostrarToast(`${error.message}`, 'danger');
        }

    } else { // si se agrega

        try {
            const respuesta = await fetch(`http://127.0.0.1:8080/api/oficinas/create`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }, body: JSON.stringify(oficina)

            });

            if (!respuesta.ok) {
                const errorData = await respuesta.json();
                throw new Error(errorData.error || `HTTP ${respuesta.status}`);
            }

            mostrarToast('Oficina agregada exitosamente');

        } catch (error) {
            console.error('Error al cargar oficina:', error);
            mostrarToast(`${error.message}`, 'danger');
        }
    }

    window.location.href = "oficina.html";
}

let map;
let marker;
let latLng = { lat: 10.0, lng: -84.0 }; // Coordenadas generales de Costa Rica

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: latLng,
        zoom: 15,
    });

    marker = new google.maps.Marker({
        map: map,
        draggable: true,
        title: "Selecciona una direccion"
    });

    let editLatLng = localStorage.getItem("editLatLng");

    if (editLatLng) {
        // Si estamos editando, usar la ubicación guardada
        let coords = editLatLng.match(/-?\d+\.\d+/g).map(Number); // ← convierte el texto a números
        let position = { lat: coords[0], lng: coords[1] };

        map.setCenter(position); // Centra el mapa en la ubicación de la oficina
        marker.setPosition(position); // Coloca el marcador en la ubicación
        document.getElementById("direccion").value = `Lat: ${coords[0]}, Lng: ${coords[1]}`; // Muestra la ubicación en el formulario
    } else if (navigator.geolocation) {
        // Si estamos creando, usar ubicación actual del usuario
        navigator.geolocation.getCurrentPosition(
            function (position) {
                let lat = position.coords.latitude;
                let lng = position.coords.longitude;
                let currentPosition = { lat, lng };

                console.log("Ubicación detectada con alta precisión:", lat, lng);

                map.setCenter(currentPosition);
                marker.setPosition(currentPosition);
                document.getElementById("direccion").value = `Lat: ${lat}, Lng: ${lng}`;
            },
            function () {
                mostrarToast("No se pudo obtener la ubicación actual. Se usará ubicación por defecto.", 'danger');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }

    // Configura el evento de clic en el mapa para actualizar la ubicación seleccionada
    google.maps.event.addListener(map, 'click', function(event) {
        const position = event.latLng;
        marker.setPosition(position); // Mueve el marcador
        document.getElementById("direccion").value = `Lat: ${position.lat()}, Lng: ${position.lng()}`; // Muestra la nueva ubicación
    });
}

document.addEventListener("DOMContentLoaded", cargarOficinasSelect);

async function cargarOficinasSelect() {
    const select = document.getElementById("oficina");

    if (!select) return;

    try {
        const respuesta = await fetch(
            "http://127.0.0.1:8080/api/oficinas?page=0&size=100",
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            throw new Error(errorData.error || `HTTP ${respuesta.status}`);
        }

        const pagina = await respuesta.json();
        const oficinas = Array.isArray(pagina.content) ? pagina.content : [];

        select.innerHTML = '<option value="" disabled selected>Seleccione una oficina</option>';

        oficinas.forEach(oficina => {
            const option = document.createElement("option");
            option.value = oficina.id;
            option.textContent = oficina.nombre;
            select.appendChild(option);
        });

    } catch (error) {
        console.error("Error al cargar oficinas:", error);
        mostrarToast(`${error.message}`, 'danger');
    }
}



