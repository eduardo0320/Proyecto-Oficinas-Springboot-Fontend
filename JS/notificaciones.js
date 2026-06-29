function mostrarToast(mensaje, tipo = 'success') {
    const toast = document.getElementById('toast');
    const toastMensaje = document.getElementById('toast-mensaje');

    // Colores según tipo
    toast.className = `toast align-items-center border-0 text-white bg-${tipo}`;
    toastMensaje.textContent = mensaje;

    new bootstrap.Toast(toast, { delay: 3000 }).show();
}