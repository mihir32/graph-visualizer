let graph = new vis.Network(
    document.getElementById("graph"),
    { nodes: [], edges: [] },
    {
        nodes: {
            shape: 'circle',
            color: {
                background: 'lightgreen',
                border: 'darkgreen'
            },
            font: {
                size: 18,
                color: 'black'
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
            zoomView: true
        }
    }
);


// Function to clear the output

// Function to clear the output
function clearOutput() {
    document.getElementById("output-box").innerHTML = "";
}

// Function to display algorithm function, name, and text in the output box
function displayOutput(algorithmFunction, algorithmName, text) {
    const outputBox = document.getElementById("output-box");
    outputBox.innerHTML = `<strong>${algorithmFunction}</strong><br><em>${algorithmName}</em><br>${text}`;
}

// Function to display text in the output box
function displayTextOutput(text) {
    document.getElementById("output-box").innerText = text;
}

// Function to display array as a list in the output box
function displayArrayOutput(array) {
    const outputBox = document.getElementById("output-box");
    array.forEach(item => {
        const listItem = document.createElement("li");
        listItem.innerText = item;
        outputBox.appendChild(listItem);
    });
}


// Function to reset highlighted edges
function resetHighlightedEdges() {
    let allEdges = graph.body.data.edges.getIds();
    allEdges.forEach(edgeId => {
        graph.body.data.edges.update({ id: edgeId, color: { color: "#2B7CE9" }, dashes: false });
    });
}

function addNode() {
    let nodeName = document.getElementById("node-input").value.trim().toUpperCase();
    console.log(`Attempting to add node: ${nodeName}`);  // Debug log

    if (nodeName) {
        let existingNodes = graph.body.data.nodes.getIds();
        console.log(`Existing nodes: ${existingNodes}`);  // Debug log

        if (existingNodes.includes(nodeName)) {
            console.log("Node already exists!");  // Debug log
            alert("Node already exists!");
        } else {
            let newNode = { id: nodeName, label: nodeName };
            graph.body.data.nodes.add(newNode);
            console.log("Node added successfully");  // Debug log
        }
        document.getElementById("node-input").value = "";
    }

    // Force a redraw of the graph to update its internal state
    graph.redraw();
}
function addEdge() {
    let fromNode = document.getElementById("from-node-input").value.trim().toUpperCase();
    let toNode = document.getElementById("to-node-input").value.trim().toUpperCase();
    let distance = document.getElementById("distance-input").value.trim();

    console.log(`Attempting to add edge from ${fromNode} to ${toNode} with distance ${distance}`);  // Debug log
    
    if (isNaN(parseFloat(distance)) || !isFinite(distance)) {
        alert("Please enter a valid number for distance!");
        return;
    }


    if (parseFloat(distance) < 0) {
        console.log("Negative weights are not allowed!");  // Debug log
        alert("Negative weights are not allowed!");
        return;
    }

    let existingNodes = graph.body.data.nodes.getIds();
   // let existingEdges = graph.body.data.edges.getIds();

    if (fromNode && toNode && distance) {
        if (existingNodes.includes(fromNode) && existingNodes.includes(toNode)) {
            let newEdge = { from: fromNode, to: toNode, label: distance };
            graph.body.data.edges.add(newEdge);
            resetHighlightedEdges();  // Reset highlighted edges
        } else {
            alert("One or both nodes do not exist!");
        }
    }

    console.log("Edges after adding: ", graph.body.data.edges.get()); // Debug log

     // Force a redraw of the graph to update its internal state
     graph.redraw();
        

    // Clear the input boxes
    document.getElementById("from-node-input").value = "";
    document.getElementById("to-node-input").value = "";
    document.getElementById("distance-input").value = "";
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

// Function to toggle the visibility of the input fields for source and target nodes
function toggleInputFieldsForShortestPath(show) {
    const sourceTargetInputs = document.getElementById("source-target-inputs");
    sourceTargetInputs.style.display = show ? "block" : "none";
}


// Use Dijkstra's Algorithm to find the shortest path.
function findShortestPath() {
    let highlightedEdges = [];  // Define the array if it's not already defined
    clearOutput();  // Clear the previous output
    resetHighlightedEdges(); // Reset any previously highlighted edges
    
    // Fetch the source and target nodes from the user input
    let sourceNode = document.getElementById("source-node-input").value.trim().toUpperCase();
    let targetNode = document.getElementById("target-node-input").value.trim().toUpperCase();


    console.log(`Finding shortest path from ${sourceNode} to ${targetNode}`);  // Debug log
    // Fetch existing nodes to make sure we have the most up-to-date state
    let existingNodes = graph.body.data.nodes.getIds();
    
    // Check if source and target nodes exist in the graph
    if (!existingNodes.includes(sourceNode) || !existingNodes.includes(targetNode)) {
        displayOutput("Shortest Path", "Dijkstra's Algorithm", "Source or target node does not exist!");
        return;
    }

    // Initialize Dijkstra's internal state
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

    // Main Dijkstra's loop
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

    // Construct the shortest path
    let shortestPath = [];
    let current = targetNode;
    
    while (current !== null) {
        if (previousNodes[current] === null && current !== sourceNode) {
            displayOutput("Shortest Path", "Dijkstra's Algorithm", "No path found.");
            return;
        }
        shortestPath.unshift(current);
        current = previousNodes[current];
    }

    // Clear input boxes after executing the algorithm
    document.getElementById("source-node-input").value = "";
    document.getElementById("target-node-input").value = "";

    console.log(`Shortest path found: ${shortestPath.join(" -> ")}`);  // Debug log
    console.log("Distances: ", distances);
    console.log("Previous Nodes: ", previousNodes);


    // Highlight the path and display the result
    if (shortestPath.length > 1) {
        let pathLength = 0;
        for (let i = 0; i < shortestPath.length - 1; i++) {
            let edgesBetweenNodes = graph.body.data.edges.get({
                filter: edge => edge.from === shortestPath[i] && edge.to === shortestPath[i + 1]
            });

            let edge = edgesBetweenNodes.sort((a, b) => parseInt(a.label) - parseInt(b.label))[0];

            pathLength += parseInt(edge.label);

            // Highlight this edge on the graph
            highlightedEdges.push(edge.id);
            graph.body.data.edges.update({
                id: edge.id,
                color: { color: "#FFD700" },
                dashes: true
            });
        }
        displayOutput("Shortest Path", "Dijkstra's Algorithm", `Path: ${shortestPath.join(" -> ")}<br>Length: ${pathLength}`);
    } else {
        displayOutput("Shortest Path", "Dijkstra's Algorithm", "No path found.");
    }
}


// Function to reset node color to default
function resetNodeColor(nodeId) {
    graph.body.data.nodes.update({
        id: nodeId,
        color: {
            background: 'lightgreen',
            border: 'darkgreen'
        }
    });
}

// Function to highlight nodes one by one based on topological order
function highlightNodesSequentially(sortedNodes) {
    let delay = 0; // milliseconds

    // Reset all node colors to default before starting highlighting
    sortedNodes.forEach(node => {
        resetNodeColor(node);
    });

    for (let i = 0; i < sortedNodes.length; i++) {
        setTimeout(() => {
            // Reset the previous node's color if it's not the first node
            if (i > 0) {
                resetNodeColor(sortedNodes[i - 1]);
            }

            // Highlight the current node
            graph.body.data.nodes.update({
                id: sortedNodes[i],
                color: {
                    background: "#FFD700",  // Gold color
                    border: "#B8860B"  // Dark goldenrod
                }
            });
        }, delay);

        delay += 1000;  // Increment the delay for the next node
    }

    // Reset the color of the last node after highlighting is complete
    setTimeout(() => {
        resetNodeColor(sortedNodes[sortedNodes.length - 1]);
    }, delay);
}


// Function to perform topological sorting using Kahn's Algorithm
function topologicalSort() {
    clearOutput();  // Clear the previous output
    resetHighlightedEdges(); // Reset any previously highlighted edges bu shortest path

    // Check if there are any nodes in the graph
    if (graph.body.data.nodes.length === 0) {
        displayOutput("Topological Sort", "Using Kahn's Algorithm", "Graph is empty. Add some nodes and edges first.");
        return;
    }

    let indegree = {};
    graph.body.data.nodes.forEach(node => {
        indegree[node.id] = 0;
    });
    graph.body.data.edges.forEach(edge => {
        indegree[edge.to] += 1;
    });

    let queue = [];
    for (let nodeId in indegree) {
        if (indegree[nodeId] === 0) {
            queue.push(nodeId);
        }
    }

    let sortedNodes = [];
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
        displayOutput("Topological Sort", "Using Kahn's Algorithm", sortedNodes.join(", "));
        // Call the highlightNodesSequentially function here
        highlightNodesSequentially(sortedNodes);
    } else {
        displayOutput("Topological Sort", "Using Kahn's Algorithm", "Graph contains a cycle. Topological sorting is not possible.");
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

// Function to clear the graph and output box
document.getElementById("clear-btn").addEventListener("click", function() {
    graph.body.data.nodes.clear();
    graph.body.data.edges.clear();
    graph.redraw();
    document.getElementById("output-box").innerHTML = "";
});


// Event listeners
document.getElementById("add-node-btn").addEventListener("click", addNode);
document.getElementById("add-edge-btn").addEventListener("click", addEdge);

// New event listener for toggling the input fields when "Find Shortest Path" is clicked
document.getElementById("find-path-btn").addEventListener("click", function() {
    toggleInputFieldsForShortestPath(true);
});

// New event listener for the "Execute" button to run findShortestPath
document.getElementById("execute-path-btn").addEventListener("click", findShortestPath);

document.getElementById("find-mst-btn").addEventListener("click", function() {
    toggleInputFieldsForShortestPath(false);
    // Your existing code for finding MST
});

document.getElementById("topological-sort-btn").addEventListener("click", function() {
    toggleInputFieldsForShortestPath(false);
    topologicalSort();
});

// document.getElementById("clear-btn").addEventListener("click", clearGraph);