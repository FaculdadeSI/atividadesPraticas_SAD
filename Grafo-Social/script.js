document.addEventListener("DOMContentLoaded", () => {
    
    // Obtém os elementos de input e canvas
    const dataFile = document.getElementById("file-input");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    
    // Evento acionado ao escolher um arquivo
    dataFile.addEventListener("change", () => {

        if (dataFile.files.length > 0) {
            const file = dataFile.files[0];
            const reader = new FileReader();

            // Ler as linhas do arquivo quando o arquivo for carregado
            reader.onload = (event) => {
                const text = event.target.result;
                const lines = text.split(";").filter(line => line.trim() !== ""); // Separar os pares de nomes pelo ';'

                // Processar cada par para criar conexões
                const connections = lines.map(pair => {
                    const [node1, node2] = pair.split("-").map(name => name.trim());
                    return { node1, node2 };
                });

                // Converter as conexões em um JSON formatado
                const json = JSON.stringify(connections, null, 2);
                console.log(json);
                alert("JSON gerado! Confira no console do navegador.");

                // Calcular o grau de cada nó
                const degrees = getNodesDegree(connections);
                console.log("Grau dos nós:", JSON.stringify(degrees, null, 2));

                // Definindo configurações para desenhar os nós no canvas
                const nodeRadius = 20 // Raio das bolinhas 
                const nodeColor = "#e3ffdb" // Cor verde por enquanto
                const nameColor = "black" 
                drawNodes(ctx, degrees, nodeRadius, nodeColor, nameColor);

                // Desenhar as conexões entre os nós
                drawLinks(ctx, degrees, connections);
            };

            // Lê o conteúdo do arquivo como texto
            reader.readAsText(file);
        }
    });
});

// Calcular o grau de cada nó/nome
function getNodesDegree(connections) {
    const degreeCount = {};

    // Incrementa o grau do primeiro e segundo nó/nome
    connections.forEach(({ node1, node2 }) => {
        degreeCount[node1] = (degreeCount[node1] || 0) + 1; 
        degreeCount[node2] = (degreeCount[node2] || 0) + 1;   
    });

    return degreeCount; 
}

// Desenhar os nós no canvas em um círculo
function drawNodes(ctx, degrees, nodeRadius, nodeColor, nameColor) {
    const width = canvas.width;
    const height = canvas.height;

    const nodes = Object.keys(degrees); // Obtém os nomes dos nós
    const nodeCount = nodes.length;

    const centerX = width / 2;
    const centerY = height / 2;
    const graphRadius = Math.min(width, height) / 2 - 50; // Raio do círculo do grafo

    // Calcula a posição de cada nó de forma circular
    nodes.forEach((node, index) => {
        const angle = (2 * Math.PI / nodeCount) * index; // Ângulo para a posição
        const x = centerX + graphRadius * Math.cos(angle);
        const y = centerY + graphRadius * Math.sin(angle);

        // Armazena as coordenadas no objeto degrees
        degrees[node] = { x, y, degree: degrees[node] };

        // Desenha a bolinha
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI, false);
        ctx.fillStyle = nodeColor;
        ctx.fill();
        ctx.strokeStyle = "#343a40";
        ctx.stroke();

        // Desenha o nome no meio da bolinha
        ctx.fillStyle = nameColor;
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node, x, y);
    });
}

// Desenhar as conexões entre os nós
function drawLinks(ctx, degrees, connections) {
    connections.forEach(({ node1, node2 }) => {
        const startNode = degrees[node1];
        const endNode = degrees[node2];

        if (startNode && endNode) { // Verifica se as coordenadas estão definidas
            ctx.beginPath();
            const angle = Math.atan2(endNode.y - startNode.y, endNode.x - startNode.x);
            const startX = startNode.x + 20 * Math.cos(angle);
            const startY = startNode.y + 20 * Math.sin(angle);
            const endX = endNode.x - 20 * Math.cos(angle);
            const endY = endNode.y - 20 * Math.sin(angle);
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = "black";
            ctx.stroke();
        }
    });
}
