// Función para obtener las personas con más ingresos
async function obtenerTop3PersonasConMasEntradas() {
    try {
        const respuesta = await fetch('http://127.0.0.1:8080/api/registros/registros/top3-entradas', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        const personas = await respuesta.json(); // [{ nombre: "Ana", totalEntradas: 10 }, ...]
        return personas;

    } catch (error) {
        console.error("Error al obtener las personas con más ingresos:", error);
        alert("No se pudieron obtener los datos.");
    }
}

async function obtenerPersonasEnOficina() {
    try {
        const respuesta = await fetch('http://127.0.0.1:8080/api/personas/registros/en-oficina', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        return await respuesta.json(); // Lista de objetos Persona


    } catch (error) {
        console.error("Error al obtener personas en oficina:", error);
        alert("No se pudieron obtener las personas en oficina.");
    }
}

async function obtenerOcupacionMaximaOficinas() {
    try {
        const respuesta = await fetch('http://127.0.0.1:8080/api/registros/registros/ocupacion-maxima', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        return await respuesta.json();

    } catch (error) {
        console.error("Error al obtener ocupación máxima:", error);
        return [];
    }
}





// Función para cargar los gráficos con las estadísticas
async function cargarGraficoMasIngresos() {
    // Obtiene las personas con más ingresos desde el backend
    const personasMasIngresos = await obtenerTop3PersonasConMasEntradas();

    if (!personasMasIngresos || personasMasIngresos.length === 0) {
        console.log("No hay datos para el gráfico de personas.");
        return;
    }

    const personasNombres = personasMasIngresos.map(p => p.nombre);
    const personasIngresos = personasMasIngresos.map(p => p.totalEntradas);

    // Configura el gráfico de barras para las personas con más ingresos
    const ctx = document.getElementById('grafico-personas-ingresos').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: personasNombres,
            datasets: [{
                label: 'Ingresos por Persona',
                data: personasIngresos,
                backgroundColor: 'rgba(99, 132, 255, 0.5)',
                borderColor: 'rgba(99, 132, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

}
async function cargarGraficoPersonasEnOficina(){
    // Ahora obtiene las personas que están actualmente en oficina
    const data = await obtenerPersonasEnOficina();
    const personasEnOficina = data?.content ?? [];
    console.log("Personas en oficina recibidas:", personasEnOficina);
    const listaPersonasEnOficina = document.getElementById('personas-en-oficina');
    listaPersonasEnOficina.innerHTML = ""; // Limpiar lista

    if (!personasEnOficina || personasEnOficina.length === 0) {
        listaPersonasEnOficina.innerHTML = "<li>No hay personas en oficina.</li>";
        return;
    }

    personasEnOficina.forEach(persona => {
        let li = document.createElement('li');
        li.textContent = persona.nombre;
        listaPersonasEnOficina.appendChild(li);
    });
}

async function cargarGraficoIngresosMaximos(){
    // --- Gráfico de ocupación máxima de oficinas ---
    const datosMaximos = await obtenerOcupacionMaximaOficinas();

    console.log("Maximas ocupaciones:", datosMaximos);
    if (datosMaximos.length > 0) {
        const nombres = datosMaximos.map(d => d.nombre);
        const maximos = datosMaximos.map(d => d.maximoIngresoSimultaneo || 0); // Por si hay null

        const ctx = document.getElementById('grafico-ocupacion-maxima').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: nombres,
                datasets: [{
                    label: 'Máximo ingreso simultáneo por oficina',
                    data: maximos,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
}




// Se llama a la función cargarGraficos cuando la página se ha cargado completamente
document.addEventListener("DOMContentLoaded", cargarGraficoPersonasEnOficina);
document.addEventListener("DOMContentLoaded",  cargarGraficoIngresosMaximos);
document.addEventListener("DOMContentLoaded",cargarGraficoMasIngresos);
