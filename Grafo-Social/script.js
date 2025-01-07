document.addEventListener("DOMContentLoaded", () => {
    
    const dataFile = document.getElementById("file-input");
    
    // Evento aciuonado ao escolher um arquivo
    dataFile.addEventListener("change", () => {

        if (dataFile.files.length > 0) {
            const file = dataFile.files[0];
            const reader = new FileReader();

            // Ler as linhas do arquivo quando o arquivo for carregado
            reader.onload = (event) => {
                const text = event.target.result;
                const lines = text.split(";").filter(line => line.trim() !== ""); // Separar os pares pelo ';'

                // Processa cada par para criar conexões
                const connections = lines.map(line => {
                    const [start, end] = line.split("-").map(name => name.trim());
                    return { start, end };
                });

                // Converte as conexões em um JSON formatado
                const json = JSON.stringify(connections, null, 2);
                console.log(json);
                alert("JSON gerado! Confira no console do navegador.");
            };

            // Lê o conteúdo do arquivo como texto
            reader.readAsText(file);
        }
    });
});
