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
        const lines = text.split(";").filter((line) => line.trim() !== ""); // Separar os pares de nomes pelo ';'

        // Processar cada par para criar conexões
        const connections = lines.map((pair) => {
          const [node1, node2] = pair.split("-").map((name) => name.trim());
          return { node1, node2 };
        });
        console.log("Grafo social encontrado:", JSON.stringify(connections, null, 2));

        // Calcular o grau de cada nó
        const nodeDegrees = getNodesDegree(connections);
        console.log("Grau dos nós:", JSON.stringify(nodeDegrees, null, 2));

        // Separar os nós em dois com base na média de graus totais
        const { averageDegree, aboveAverageNodes, belowAverageNodes } = separateNodesByDegree(nodeDegrees);
        console.log("Média dos graus:", averageDegree);
        console.log("Nós acima da média:", JSON.stringify(aboveAverageNodes, null, 2));
        console.log("Nós abaixo ou iguais à média:", JSON.stringify(belowAverageNodes, null, 2));

        // Definindo configurações para desenhar os nós no canvas
        const defaultRadius = 20 // Raio das bolinhas
        const nameColor = "black"
        const nodeColors = generateNodeColors(Object.keys(nodeDegrees)); // Gerar cores únicas para cada nó

        // Calcular as pocições dos nós no canvas
        calculateAboveAverageNodesPosition(aboveAverageNodes, canvas);
        calculateBelowAverageNodesPosition(belowAverageNodes, canvas);

        // Desenhar e conectar os nós na tela
        drawNodes(ctx, aboveAverageNodes, defaultRadius, nodeColors, nameColor);
        drawNodes(ctx, belowAverageNodes, defaultRadius, nodeColors, nameColor);
        drawLinks(ctx, aboveAverageNodes, belowAverageNodes, connections, defaultRadius);

        // Criar o gráfico com os graus de cada nó na tela
        drawBarChart(nodeDegrees, nodeColors);
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
  const totalDegrees = Object.values(degrees).reduce(
    (sum, degree) => sum + degree,
    0
  );
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

  nodes.forEach((node) => {
    let r, g, b;

    // Gera valores RBG claros para tons pastéis
    do {
      r = Math.floor(Math.random() * 128 + 128);
      g = Math.floor(Math.random() * 128 + 128);
      b = Math.floor(Math.random() * 128 + 128);
    } while (r === 255 && g === 255 && b === 255); // Evitar branco puro

    // Converter para o formato hexadecimal
    const color = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    colors[node] = color;
  });

  return colors;
}

// Calcular a posição dos nós acima da média à esquerda do canvas formando uma linha reta vertical, mas com um zigue-zague
function calculateAboveAverageNodesPosition(aboveAverageNodes, canvas) {

  // Nós vão ocupar 1/3 do canvas à esquerda
  const canvasWidth = canvas.width / 3;
  const canvasHeight = canvas.height;
  const newCenterX = canvasWidth / 2;
  const totalNodes = Object.keys(aboveAverageNodes).length;
  const spacingY = canvasHeight / (totalNodes + 1); // Espaçamento entre os nós no eixo Y
  const zigzagOffsetX = canvasWidth / 4; // Deslocamento para o zigue-zague no eixo X

  let currentY = spacingY;
  let toggleZigZag = true; // Alternar deslocamento no eixo X para criar o zigue-zague

  // Calcular posição dos nós
  Object.keys(aboveAverageNodes).forEach(node => {
    const offsetX = toggleZigZag ? zigzagOffsetX : -zigzagOffsetX; // Alterna entre esquerda e direita no zigue-zague
    const xPosition = newCenterX + offsetX;

    // Atualiza as coordenadas do nó
    aboveAverageNodes[node] = { x: xPosition, y: currentY, degree: aboveAverageNodes[node] };

    // Atualizar a próxima posição no eixo Y e o padrão do zigue-zague
    currentY += spacingY;
    toggleZigZag = !toggleZigZag;
  });
}

// Calcular a posição dos nós baixo da média à direita do canvas formando uma grade, mas com os nós levemente deslocados
function calculateBelowAverageNodesPosition(belowAverageNodes, canvas) {

  // Nós vão ocupar 2/3 do canvas à direita
  const canvasWidth = canvas.width * (2 / 3);
  const canvasHeight = canvas.height;
  const newStartX = canvas.width / 3;
  const totalNode = Object.keys(belowAverageNodes).length;

  // Definir o número ideal de linhas e colunas para formar a grade
  const columns = Math.ceil(Math.sqrt(totalNode)); // Número de colunas baseado na raiz quadrada
  const rows = Math.ceil(totalNode / columns);

  // Calcular o espaçamento entre os nós
  const spacingX = canvasWidth / (columns + 1);
  const spacingY = canvasHeight / (rows + 1);

  let index = 0;

  // Calcular posição os nós na grade
  Object.keys(belowAverageNodes).forEach(node => {

    // Linha e coluna atuais 
    const row = Math.floor(index / columns);
    const col = index % columns;

    // Alternar a direção no eixo X e Y para criar o efeito de zigue-zague na grade
    const xPosition = newStartX + (col + 1) * spacingX + (row % 2 === 0 ? 0 : spacingX / 2);
    const yPosition = (row + 1) * spacingY + (col % 2 === 0 ? 0 : spacingY / 2);

    // Atualizar as coordenadas do nó 
    belowAverageNodes[node] = { x: xPosition, y: yPosition, degree: belowAverageNodes[node] };

    index++;
  });
}

// Desenhar os nós no canvas
function drawNodes(ctx, nodes, nodeRadius, nodeColor, nameColor) {
  Object.keys(nodes).forEach((node) => {
    const { x, y, degree } = nodes[node];
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
function drawLinks(ctx, aboveAverageNodes, belowAverageNodes, connections, defaultRadius) {
  connections.forEach(({ node1, node2 }) => {

    // Obter as coordenadas de cada nó
    const startNode = aboveAverageNodes[node1] || belowAverageNodes[node1];
    const endNode = aboveAverageNodes[node2] || belowAverageNodes[node2];

    // Verifica se as coordenadas estão definidas para ambos os nós
    if (startNode && endNode) {
      ctx.beginPath();
      const angle = Math.atan2(endNode.y - startNode.y, endNode.x - startNode.x);

      // Ajustar os raios de cada nó com base no grau
      const startRadius = defaultRadius + startNode.degree; 
      const endRadius = defaultRadius + endNode.degree; 

      // Ajuste das coordenadas para garantir que as linhas comecem e terminem nas bordas dos nós
      const startX = startNode.x + startRadius * Math.cos(angle);
      const startY = startNode.y + startRadius * Math.sin(angle);
      const endX = endNode.x - endRadius * Math.cos(angle);
      const endY = endNode.y - endRadius * Math.sin(angle);

      // Desenhar a linha entre os nós
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = "black";
      ctx.stroke();
    }
  });
}

// Desenhar o gráfico de barras, cada coluna tem uma cor
function drawBarChart(nodeDegrees, nodeColors) {
  google.charts.load("current", { packages: ["corechart"] });
  google.charts.setOnLoadCallback(() => {

    const data = new google.visualization.DataTable();
    
    data.addColumn("string", "Nó");
    data.addColumn("number", "Grau");
    data.addColumn({ type: "string", role: "style" }); // Coluna para cores 

    Object.entries(nodeDegrees).forEach(([node, degree]) => {
      data.addRow([node, degree, `color: ${nodeColors[node]}`]); 
    });

    // Configurações do gráfico
    const options = {
      title: "Graus dos Nós",
      width: 500,
      height: 350,
      hAxis: {
        title: "Nós",
      },
      vAxis: {
        title: "Grau",
      },
    };

    const chart = new google.visualization.ColumnChart(
      document.getElementById("chart")
    );

    chart.draw(data, options);
  });
}
