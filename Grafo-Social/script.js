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
                const connections = lines.map(pair => {
                    const [node1, node2] = pair.split("-").map(name => name.trim());
                    return { node1, node2 };
                });

                // Converte as conexões em um JSON formatado
                const json = JSON.stringify(connections, null, 2);
                console.log(json);
                alert("JSON gerado! Confira no console do navegador.");

                // Calcula o grau de cada nó
                const degrees = getNodesDegree(connections);
                console.log("Grau dos nós:", JSON.stringify(degrees, null, 2));
            };

            // Lê o conteúdo do arquivo como texto
            reader.readAsText(file);
        }
    });
});

// Calcular o grau de cada nó/nome
function getNodesDegree(connections) {
    const degreeMap = {};

    // Incrementa o grau do primeiro e segundo nó/nome
    connections.forEach(({ node1, node2 }) => {
        degreeMap[node1] = (degreeMap[node1] || 0) + 1; 
        degreeMap[node2] = (degreeMap[node2] || 0) + 1;   
    });

    return degreeMap; 
}