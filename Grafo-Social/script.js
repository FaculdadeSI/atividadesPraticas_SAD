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

                // Separar os nós em dois dicionários
                const { averageDegree, aboveAverageNodes, belowAverageNodes } = separateNodesByDegree(degrees);
                console.log("Média dos graus:", averageDegree);
                console.log("Nós acima da média:", JSON.stringify(aboveAverageNodes, null, 2));
                console.log("Nós abaixo ou iguais à média:", JSON.stringify(belowAverageNodes, null, 2));

                // Definindo configurações para desenhar os nós no canvas
                const defaultRadius = 20 // Raio das bolinhas 
                const nameColor = "black" 
                const nodeColors = generateNodeColors(Object.keys(degrees)); // Gerar cores únicas para cada nó

                // Posicionar e desenhar os nós
                calculateNodePositions(degrees, canvas)
                drawNodes(ctx, degrees, defaultRadius, nodeColors, nameColor);

                // Desenhar as conexões entre os nós
                drawLinks(ctx, degrees, connections, defaultRadius);

                // Desenhar o gráfico com os graus de cada nó na tela
                drawBarChart(degrees, nodeColors);
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

// Separar os nós em dois dicionários com base na média de graus de todos os nós
function separateNodesByDegree(degrees) {
    const totalDegrees = Object.values(degrees).reduce((sum, degree) => sum + degree, 0);
    const averageDegree = totalDegrees / Object.keys(degrees).length;

    const aboveAverageNodes = {}; 
    const belowAverageNodes = {}; 

    for (const [node, degree] of Object.entries(degrees)) {
        if (degree > averageDegree) {
            aboveAverageNodes[node] = degree;
        } else {
            belowAverageNodes[node] = degree;
        }
    }

    return { averageDegree, aboveAverageNodes, belowAverageNodes }; // Retorna os dois dicionários
}

// Gerar cores únicas para cada nó/nome
function generateNodeColors(nodes) {
    const colors = {};
    nodes.forEach(node => {
        colors[node] = `#${Math.floor(Math.random() * 16777215).toString(16)}`; // Cores aleatórias
        let color;
        do {
            color = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
        } while (color.toLowerCase() === "#000000"); // Evitar cor preta, pois não é possível criar uma coluna com essa cor no gráfico
        colors[node] = color;
    });
    return colors;
}

// Calcular a posição dos nós para que eles formem um círculo
function calculateNodePositions(degrees, canvas) {
    const width = canvas.width;
    const height = canvas.height;

    const nodes = Object.keys(degrees); // Obtém os nomes dos nós
    const nodeCount = nodes.length;

    const centerX = width / 2;
    const centerY = height / 2;
    const graphRadius = Math.min(width, height) / 2 - 50; // Raio do círculo do grafo

    // Calcula a posição de cada nó
    nodes.forEach((node, index) => {
        const angle = (2 * Math.PI / nodeCount) * index; // Ângulo para a posição
        const x = centerX + graphRadius * Math.cos(angle);
        const y = centerY + graphRadius * Math.sin(angle);
        degrees[node] = { x, y, degree: degrees[node] }; // Atualiza o objeto degrees com as coordenadas
    });
}

// Desenhar os nós no canvas
function drawNodes(ctx, degrees, nodeRadius, nodeColor, nameColor) {
    Object.keys(degrees).forEach((node) => {
        const { x, y, degree } = degrees[node];
        const newNodeRadius = nodeRadius + degree; // Tamanho da bolinha será maior conforme o grau do nó

        // Desenha a bolinha
        ctx.beginPath();
        ctx.arc(x, y, newNodeRadius, 0, 2 * Math.PI, false);
        ctx.fillStyle = nodeColor[node];
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
function drawLinks(ctx, degrees, connections, defaultRadius) {
    connections.forEach(({ node1, node2 }) => {
        const startNode = degrees[node1];
        const endNode = degrees[node2];

        // Verifica se as coordenadas estão definidas
        if (startNode && endNode) { 
            ctx.beginPath();
            const angle = Math.atan2(endNode.y - startNode.y, endNode.x - startNode.x);

            const startRadius = defaultRadius + startNode.degree; // Tamanho do nó inicial
            const endRadius = defaultRadius + endNode.degree; // Tamanho do nó final

            const startX = startNode.x + startRadius * Math.cos(angle);
            const startY = startNode.y + startRadius * Math.sin(angle);
            const endX = endNode.x - endRadius * Math.cos(angle);
            const endY = endNode.y - endRadius * Math.sin(angle);
            
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = "black";
            ctx.stroke();
        }
    });
}

// Desenhar o gráfico de barras, cada coluna tem uma cor 
function drawBarChart(degrees, nodeColors) {
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(() => {
        const data = new google.visualization.DataTable();
        data.addColumn('string', 'Nó');
        data.addColumn('number', 'Grau');
        data.addColumn({ type: 'string', role: 'style' }); // Coluna para cores

        Object.entries(degrees).forEach(([node, { degree }]) => {
            data.addRow([node, degree, `color: ${nodeColors[node]}`]); // Adiciona cor personalizada
        });

        const options = {
            title: 'Graus dos Nós',
            width: 400,
            height: 300,
            hAxis: {
                title: 'Nós',
            },
            vAxis: {
                title: 'Grau',
            },
        };

        const chart = new google.visualization.ColumnChart(document.getElementById('chart'));
        chart.draw(data, options);
    });
}
