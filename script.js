let nodes = [];
let edges = [];

function createGraph() {
    const adjacencyListText = document.getElementById("adjacencyList").value;
    const adjacencyList = parseAdjacencyList(adjacencyListText);

    nodes = Object.keys(adjacencyList).map(node => ({ id: node, label: node }));

    edges = [];
    for (const node in adjacencyList) {
        const neighbors = adjacencyList[node];
        neighbors.forEach(neighbor => edges.push({ from: node, to: neighbor }));
    }

    updateGraph();
}

function parseAdjacencyList(adjacencyListText) {
    const lines = adjacencyListText.trim().split("\n");
    const adjacencyList = {};

    lines.forEach(line => {
        const [node, neighborsStr] = line.split(":");
        const neighbors = neighborsStr.trim().split(" ");
        adjacencyList[node] = neighbors;
    });

    return adjacencyList;
}

function updateGraph() {
    const container = document.getElementById("graph");

    const data = {
        nodes: nodes,
        edges: edges,
    };

    const options = {
        layout: {
            hierarchical: false,
        },
    };

    new vis.Network(container, data, options);
}

window.addEventListener("DOMContentLoaded", () => {
    updateGraph();
});
