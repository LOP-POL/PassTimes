import { chains } from "./heirarchy.js"
import { splitLevels, trackPosition } from "./heirarchy.js"


const canvas = document.getElementById('canvas')
const world = document.getElementById('container')
const reset = document.getElementById('reset')
const worldView = document.getElementById("world")
const toggleView = document.getElementById("viewToggle")
const resetBtn = document.getElementById("resetBtn")
const organise = document.getElementById("organise")


let temp = document.getElementsByTagName("template")[0];
let clon = temp.content.cloneNode(true);
let edgePaths = clon

document.addEventListener('DOMContentLoaded', () => {

  worldView.appendChild(clon);
  edgePaths = document.getElementById("edgePaths")
 
});

const rawNodes = []
function createNodes() {
  splitLevels().forEach((level) => {
    level.forEach((node) => {
      rawNodes.push(node)
    })
  })
}

createNodes()
const NODE_H = 200
const NODE_W = 400

let levels = splitLevels()

function layoutTree(levels, config = {}) {
  const {
    levelGap = 500,
    nodeGap = 500,
    startX = 100,
    startY = 50
  } = config;

  const positionedNodes = [];

  levels.forEach((level, levelIndex) => {
    const count = level.length;

    level.forEach((node, nodeIndex) => {
      const x =
        startX +
        (nodeIndex - (count - 1) / 2) * nodeGap;

      const y = startY + levelIndex * levelGap;

      positionedNodes.push({
        ...node,
        x,
        y
      });
    });
  });

  return positionedNodes;
}


// export let cookedNodes = rawNodes.map((node, index) => {
//   return (
//     {
//       id: node.nodeId,
//       x: index * NODE_W,
//       y: index * 100 + 1,
//       label: node.nodeName,
//       outputs: node.children.map(child => child.nodeId)
//     });
// })

let positioned = layoutTree(levels);

export let cookedNodes = positioned.map(node => ({
  id: node.nodeId,
  x: node.x,
  y: node.y,
  label: node.nodeName,
  outputs: node.children.map(child => child.nodeId)
}));





function edgePath(fromNode, toNode) {
  const x1 = fromNode.x + NODE_W;
  const y1 = fromNode.y + NODE_H / 2;
  const x2 = toNode.x;
  const y2 = toNode.y + NODE_H / 2;
  const cx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${cx} ${y1} ${cx} ${y2} ${x2} ${y2}`;
}

// ─── Build edge list from nodes ───────────────────────────────────────────────
function buildEdges(nodes) {
  const edges = [];
  nodes.forEach(n => {
    n.outputs.forEach(targetId => {
      edges.push({ from: n.id, to: targetId, id: `${n.id}-${targetId}` });
    });
  });
  return edges;
}

export let edges = buildEdges(cookedNodes)


let transform = {
  x: 60,
  y: 60,
  zoom: 1,
}
let lastMouse = { x: 0, y: 0 }

let isPanning = false
let isDraggingNode = null

let selectedNode = null

// Canvas styles
let canvasStyles = {}
let worldStyles = {}
let nodeStyles = {
  position: "absolute",
  left: 0,
  top: 0,
  width: NODE_W,
  height: NODE_H,

  border: `1.5px solid ${selectedNode ? "#fff" : "#79C7C5"}`,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  padding: "0 14px",
  gap: 10,
  cursor: "grab",
  boxShadow: selectedNode
    ? `0 0 0 2px #fff, 0 0 24px var(--teal-blue) 88`
    : `0 0 18px var(--teal-blue) 44, 0 4px 20px #0008`,
  userSelect: "none",
  transition: "box-shadow 0.15s, border-color 0.15s",
  zIndex: selectedNode ? 10 : 1,
}

// set movement styles
function setMovementStyles() {
  const dotSpacing = 28 * transform.zoom;
  const dotOffsetX = transform.x % dotSpacing;
  const dotOffsetY = transform.y % dotSpacing;

  canvas.style.cursor = isPanning ? "grabbing" : "default"
  canvas.style.backgroundImage = `radial-gradient(circle, #1e2a4a ${Math.max(1, transform.zoom * 2)}px, transparent 0)`
  canvas.style.backgroundSize = `${dotSpacing}px ${dotSpacing}px`
  canvas.style.backgroundPosition = `${dotOffsetX}px ${dotOffsetY}px`
  world.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`
  worldView.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`
}

canvas.style.cursor = "default"
canvas.style.backgroundImage = `radial-gradient(circle, #1e2a4a 1px, transparent 0)`
canvas.style.backgroundSize = `28px 28px`
canvas.style.backgroundPosition = `0px 0px`
world.style.transform = `translate(60px, 60px) scale(1)`
worldView.style.transform = `translate(60px, 60px) scale(1)`

function setNodes(newNodes) {
  cookedNodes = newNodes
}

function setIsPanning(value) {
  isPanning = value
}
function setTransform(newTransform) {
  transform = newTransform
  setMovementStyles()
}

function setSelected(value) {
  selectedNode = value
}

const handleNodeDragStart = (e, id) => {
  isDraggingNode = id;
  lastMouse = { x: e.clientX, y: e.clientY };
  isPanning = false;

  document.querySelectorAll('#edgePaths path').forEach(path => path.remove());
  createEdgePathsDom(edges);

}

function createNodeDiv(nodes) {
  worldView.innerHTML = ''; // clear first
  nodes.forEach((node) => {

    const mainDiv = document.createElement('div')
    const dotLeft = document.createElement('div')
    const label = document.createElement('p')
    const dotRight = document.createElement('div')

    // create associated attributes for styles and such

    mainDiv.classList.add('canvasNode')
    mainDiv.dataset.nodeId = node.id

    Object.assign(mainDiv.style, { ...nodeStyles, left: node.x, top: node.y })
    mainDiv.style.left = `${node.x}px`
    mainDiv.style.top = `${node.y}px`

    dotLeft.classList.add('cnodeDotLeft')
    dotRight.classList.add('cnodeDotRight')

    // Giving it the eventListeners

    mainDiv.onmousedown = (e) => {
      e.stopPropagation();
      handleNodeDragStart(e, mainDiv.dataset.nodeId)
      setSelected(mainDiv.dataset.nodeId)
    }

    label.textContent = node.label

    mainDiv.appendChild(dotLeft)
    mainDiv.appendChild(label)
    mainDiv.appendChild(dotRight)

    worldView.appendChild(mainDiv)

  })

}
// Plain JS



export function createEdgePathsDom(edgesList = edges) {

  edgesList.forEach((edge) => {
    const fromNode = cookedNodes.find(n => n.id === edge.from);
    const toNode = cookedNodes.find(n => n.id === edge.to);
    if (!fromNode || !toNode) return;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', '#79C7C5')
    path.setAttribute('stroke-width', '1.5px')
    path.setAttribute('stroke-opacity', '0.6px')
    path.setAttribute('filter', 'url(#glow)')
    path.setAttribute('d', edgePath(fromNode, toNode))

    edgePaths.appendChild(path)


  })

}


canvas.addEventListener('wheel', (e) => {

  e.preventDefault()

  const { x, y, zoom } = transform

  const delta = e.deltaY * -0.002;
  const newZoom = Math.min(Math.max(zoom * (1 + delta), 0.15), 4);

  const rect = canvas.getBoundingClientRect()

  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  // Keep the world point under cursor fixed
  const newX = mx - (mx - x) * (newZoom / zoom);
  const newY = my - (my - y) * (newZoom / zoom);
  setTransform({ x: newX, y: newY, zoom: newZoom })

})

// ── Pan (middle mouse or background drag) ─────────────────────────────────
const handleMouseDown = (e) => {
  if (e.button === 1 || e.button === 0) {
    isPanning = true;
    setIsPanning(isPanning)
    lastMouse = { x: e.clientX, y: e.clientY };
  }
}


const handleTouchDown = (e) => {
  const touch = e.touches[0]
  isPanning = true
  setIsPanning(isPanning)
  lastMouse = { x: touch.clientX, y: touch.clientY }
}

// ── Node drag start ───────────────────────────────────────────────────────

const handleMouseMove = (e) => {
  const dx = e.clientX - lastMouse.x;
  const dy = e.clientY - lastMouse.y;
  lastMouse = { x: e.clientX, y: e.clientY };


  if (isDraggingNode) {
    // Move node in world-space (divide by zoom to convert screen delta → world delta)
    const { zoom } = transform;
    cookedNodes = cookedNodes.map(n =>
      n.id === isDraggingNode
        ? { ...n, x: n.x + dx / zoom, y: n.y + dy / zoom }
        : n
    )

    const node = cookedNodes.find(n => n.id === isDraggingNode);

    if (node) {
      const el = document.querySelector(`[data-node-id="${node.id}"]`);

      if (el) {
        el.style.left = `${node.x}px`;
        el.style.top = `${node.y}px`;
      }
    }


    // redraw edges
    document.getElementById('edgePaths').innerHTML = '';
    createEdgePathsDom(edges);

    return;
  }

  if (isPanning) {
    setTransform({ ...transform, x: transform.x + dx * 1.5, y: transform.y + dy * 1.5 });
  }
}


const handleTouchMove = (e) => {
  const touch = e.touches[0]
  const dx = touch.clientX - lastMouse.x;
  const dy = touch.clientY - lastMouse.y;
  lastMouse = { x: touch.clientX, y: touch.clientY };

  if (isDraggingNode) {
    // Move node in world-space (divide by zoom to convert screen delta → world delta)
    const { zoom } = transform;
    cookedNodes = cookedNodes.map(n =>
      n.id === isDraggingNode
        ? { ...n, x: n.x + dx / zoom, y: n.y + dy / zoom }
        : n
    )
    return;
  }

  if (isPanning) {
    setTransform({ ...transform, x: transform.x + dx * 1.5, y: transform.y + dy * 1.5 });
  }
}

const handleMouseUp = () => {
  isPanning = false;
  setIsPanning(isPanning)
  isDraggingNode = null;
}

const handelTouchEnd = () => {
  isPanning = false;
  setIsPanning(isPanning)
  isDraggingNode = null;
}


// ── Reset view ────────────────────────────────────────────────────────────
const resetView = () => {
  transform = { x: 60, y: 60, zoom: 1 };
  setMovementStyles();
}

function reDraw(e) {
  levels = splitLevels(e.chains)
  positioned = layoutTree(levels)
  cookedNodes = positioned.map(node => ({
    id: node.nodeId,
    x: node.x,
    y: node.y,
    label: node.nodeName,
    outputs: node.children.map(child => child.nodeId)
  }));

  createNodeDiv(cookedNodes)

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      temp = document.getElementsByTagName("template")[0];
      clon = temp.content.cloneNode(true);
      edgePaths = clon
      edges = buildEdges(cookedNodes)

      createEdgePathsDom(edges)
    });
  } else {
    temp = document.getElementsByTagName("template")[0];
    clon = temp.content.cloneNode(true);
    edgePaths = clon
    worldView.appendChild(clon);
    edgePaths = document.getElementById("edgePaths")
    
    edges = buildEdges(cookedNodes)

    createEdgePathsDom(edges)
  }



}
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('touchstart', handleTouchDown);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handelTouchEnd);
reset.addEventListener('click', resetView);
resetBtn.addEventListener("click", resetView);


createNodeDiv(cookedNodes)

createEdgePathsDom(edges)

toggleView.addEventListener("click", () => {
  createEdgePathsDom()

})

organise.addEventListener("click", () => {
  cookedNodes = positioned.map(node => ({
    id: node.nodeId,
    x: node.x,
    y: node.y,
    label: node.nodeName,
    outputs: node.children.map(child => child.nodeId)
  }));

  createNodeDiv(cookedNodes)
  createEdgePathsDom(edges)
})
window.addEventListener('updatedChains', reDraw)
