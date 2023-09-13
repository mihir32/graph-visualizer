let graph = new vis.Network(
    document.getElementById("graph"),
    { nodes: [], edges: [] },
    {
        nodes: {
            shape: 'circle',  // Set the shape to 'circle' for names to appear inside
            color: {
                background: 'lightgreen',  // Set the background color to light green
                border: 'darkgreen'  // You can keep this as darkgreen or change it as you like
            },
            font: {
                size: 18,  // Font size for the name text
                color: 'black'  // Font color
            }
        },
        edges: {
            arrows: 'to'
        },
        physics: {
            enabled: true,
            stabilization: {
                enabled: true,
                iterations: 1000
            }
        },
        layout: {
            improvedLayout: true
        },
        interaction: {
            zoomView: false  // Disable zoom if you don't need it
        }
    }
);


// Function to add a new node to the graph
function addNode() {
    let nodeName = document.getElementById("node-input").value.trim().toUpperCase();
    if (nodeName) {
        let existingNodes = graph.body.data.nodes.getIds();
        if (existingNodes.includes(nodeName)) {
            alert("Node already exists!");
        } else {
            let newNode = { id: nodeName, label: nodeName };
            graph.body.data.nodes.add(newNode);
        }
        document.getElementById("node-input").value = ""; // Clear the input box
    }
}

// Function to add a new edge to the graph
function addEdge() {
    let fromNode = document.getElementById("from-node-input").value.trim().toUpperCase();
    let toNode = document.getElementById("to-node-input").value.trim().toUpperCase();
    let distance = document.getElementById("distance-input").value.trim();

    if (parseFloat(distance) < 0) {
        alert("Negative weights are not allowed!");
        return;
    }

    let existingNodes = graph.body.data.nodes.getIds();

    if (fromNode && toNode && distance) {
        if (existingNodes.includes(fromNode) && existingNodes.includes(toNode)) {
            let newEdge = { from: fromNode, to: toNode, label: distance };
            graph.body.data.edges.add(newEdge);
            document.getElementById("from-node-input").value = ""; // Clear the input box
            document.getElementById("to-node-input").value = "";   // Clear the input box
            document.getElementById("distance-input").value = "";  // Clear the input box
        } else {
            alert("One or both nodes do not exist!");
        }
    }
}

class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    enqueue(element, priority) {
        this.elements.push({ element, priority });
        this.sort();
    }

    dequeue() {
        return this.elements.shift();
    }

    sort() {
        this.elements.sort((a, b) => a.priority - b.priority);
    }

    isEmpty() {
        return this.elements.length === 0;
    }

    changePriority(element, priority) {
        this.elements.forEach(item => {
            if (item.element === element) {
                item.priority = priority;
            }
        });
        this.sort();
    }
}


function findShortestPath() {
    let sourceNode = document.getElementById("source-node-input").value.trim().toUpperCase();
    let targetNode = document.getElementById("target-node-input").value.trim().toUpperCase();

    if (sourceNode && targetNode) {
        let distances = {};
        let previousNodes = {};
        let queue = new PriorityQueue();

        graph.body.data.nodes.forEach(node => {
            distances[node.id] = Infinity;
            previousNodes[node.id] = null;
            queue.enqueue(node.id, Infinity);
        });

        distances[sourceNode] = 0;
        queue.changePriority(sourceNode, 0);

        while (!queue.isEmpty()) {
            let current = queue.dequeue();
            graph.getConnectedEdges(current.element, { outgoing: true }).forEach(edge => {
                let edgeData = graph.body.data.edges.get(edge);
                let neighbor = edgeData.to;
                let distance = distances[current.element] + parseInt(edgeData.label);
                
                if (distance < distances[neighbor]) {
                    distances[neighbor] = distance;
                    previousNodes[neighbor] = current.element;
                    queue.changePriority(neighbor, distance);
                }
            });
        }

        let shortestPath = [];
        let current = targetNode;
        
        while (current !== null) {
            if (previousNodes[current] === null && current !== sourceNode) {
                alert("No path found.");
                return; // Exit the function if a disconnected node is encountered
            }
            shortestPath.unshift(current);
            current = previousNodes[current];
        }

        if (shortestPath.length > 1) {
            // Highlight the path on the graph
            let highlightedEdges = [];
            for (let i = 0; i < shortestPath.length - 1; i++) {
                let fromNodeId = shortestPath[i];
                let toNodeId = shortestPath[i + 1];
                let edges = graph.getConnectedEdges(fromNodeId, { outgoing: true });
                
                let minWeight = Infinity;
                let minWeightEdge = null;
                for (let edge of edges) {
                    let edgeData = graph.body.data.edges.get(edge);
                    if (edgeData.to === toNodeId && parseInt(edgeData.label) < minWeight) {
                        minWeight = parseInt(edgeData.label);
                        minWeightEdge = edge;
                    }
                }

                if (minWeightEdge !== null) {
                    highlightedEdges.push(minWeightEdge);
                    graph.body.data.edges.update({ id: minWeightEdge, color: { color: "#2B7CE9" } });
                }
            }
            graph.setSelection({ edges: highlightedEdges });
        } else {
            alert("No path found.");
        }
    }
}



// Function to perform topological sorting on the graph
function topologicalSort() {
    let indegree = {};

    // Initialize the indegree for all nodes to 0
    graph.body.data.nodes.forEach(node => {
        indegree[node.id] = 0;
    });

    // Calculate the indegree for each node
    graph.body.data.edges.forEach(edge => {
        indegree[edge.to] += 1;
    });

    // Create a queue to store nodes with indegree 0
    let queue = [];

    // Add nodes with indegree 0 to the queue
    for (let nodeId in indegree) {
        if (indegree[nodeId] === 0) {
            queue.push(nodeId);
        }
    }

    let sortedNodes = [];

    // Perform topological sorting
    while (queue.length > 0) {
        let currentNode = queue.shift();
        sortedNodes.push(currentNode);

        graph.getConnectedEdges(currentNode, { outgoing: true }).forEach(edge => {
            let neighborNode = graph.body.data.edges.get(edge).to;
            indegree[neighborNode] -= 1;
            if (indegree[neighborNode] === 0) {
                queue.push(neighborNode);
            }
        });
    }

    if (sortedNodes.length === graph.body.data.nodes.getIds().length) {
        alert("Topological Sorting Order: " + sortedNodes.join(", "));
    } else {
        alert("Graph contains a cycle. Topological sorting is not possible.");
    }
}


// Function to find the Minimum Spanning Tree (MST) using Kruskal's algorithm
function findMST() {
    // Get all the edges from the graph
    const allEdges = graph.body.data.edges.get();

    // Sort the edges in ascending order of their weight (distance)
    const sortedEdges = allEdges.sort((a, b) => a.label - b.label);

    const mstEdges = [];
    const mstNodes = new Set();

    // Initialize the disjoint-set data structure for cycle detection
    const parent = {};
    const rank = {};

    function makeSet(node) {
        parent[node] = node;
        rank[node] = 0;
    }

    function find(node) {
        if (parent[node] !== node) {
            parent[node] = find(parent[node]);
        }
        return parent[node];
    }

    function union(nodeA, nodeB) {
        const rootA = find(nodeA);
        const rootB = find(nodeB);

        if (rootA !== rootB) {
            if (rank[rootA] > rank[rootB]) {
                parent[rootB] = rootA;
            } else if (rank[rootA] < rank[rootB]) {
                parent[rootA] = rootB;
            } else {
                parent[rootB] = rootA;
                rank[rootA]++;
            }
            return true;
        }

        return false;
    }

    // Create a set for each node
    graph.body.data.nodes.forEach(node => {
        makeSet(node.id);
    });

    // Iterate through the sorted edges and add them to the MST if they don't form a cycle
    sortedEdges.forEach(edge => {
        const { from, to } = edge;
        if (union(from, to)) {
            mstEdges.push(edge);
            mstNodes.add(from);
            mstNodes.add(to);
        }
    });

    // Create a data object for the MST
    const mstData = {
        nodes: graph.body.data.nodes.get(mstNodes),
        edges: mstEdges,
    };

    return mstData;
}

// Function to visualize the Minimum Spanning Tree (MST)
function visualizeMST(mstEdges) {
    // Clear previous MST visualization if any
    if (mstGraph !== null) {
        mstGraph.destroy();
    }

    // Create a new container for the MST graph
    const mstContainer = document.getElementById("mst-graph");

    // Set options for MST graph visualization
    const mstOptions = {
        ...graphOptions,
        physics: false, // Disable physics for the MST graph
        edges: {
            ...graphOptions.edges,
            color: {
                color: "#848484", // Set color for MST edges
            },
        },
    };

    // Initialize the MST graph using vis.Network
    mstGraph = new vis.Network(mstContainer, mstEdges, mstOptions);
}

// Function to clear the graph and the MST visualization
function clearGraph() {
    clearPath(); // Call your existing clearPath function to clear shortest path
    // No need to clear topological sorting as it does not affect the graph visualization.

    // Clear the original graph
    let allEdges = graph.body.data.edges.getIds();
    allEdges.forEach(edgeId => {
        graph.body.data.edges.update({ id: edgeId, color: { color: "#2B7CE9" } });
    });

    graph.setSelection({ edges: [] });

    // Clear the MST graph
    if (mstGraph !== null) {
        mstGraph.destroy();
    }
}

// ... (previous code)

// Add event listeners for the buttons
document.getElementById("add-node-btn").addEventListener("click", addNode);
document.getElementById("add-edge-btn").addEventListener("click", addEdge);
document.getElementById("find-path-btn").addEventListener("click", findShortestPath);
document.getElementById("clear-path-btn").addEventListener("click", clearPath);
document.getElementById("find-mst-btn").addEventListener("click", () => {
    let mstData = findMST();
    visualizeMST(mstData);
});
document.getElementById("topological-sort-btn").addEventListener("click", topologicalSort);
document.getElementById("clear-btn").addEventListener("click", clearGraph);