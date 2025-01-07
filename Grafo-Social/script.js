document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("file-input");

    fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
            alert(`Arquivo selecionado: ${fileInput.files[0].name}`);
        }
    });
});
