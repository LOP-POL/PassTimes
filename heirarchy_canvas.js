const canvas = document.getElementById('canvas')
const world = document.getElementById('container')
const reset = document.getElementById('reset')

let transform = {
  x: 60,
  y: 60,
  zoom: 1,
}
let lastMouse = { x: 0, y: 0 }

let isPanning = false
let isDraggingNode = null

// Canvas styles
let canvasStyles = {}
let worldStyles = {}

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
}

canvas.style.cursor = "default"
canvas.style.backgroundImage = `radial-gradient(circle, #1e2a4a 1px, transparent 0)`
canvas.style.backgroundSize = `28px 28px`
canvas.style.backgroundPosition = `0px 0px`
world.style.transform = `translate(60px, 60px) scale(1)`


function setIsPanning(value) {
  isPanning = value
}
function setTransform(newTransform) {
  transform = newTransform
  setMovementStyles()
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
    lastMouse= { x: e.clientX, y: e.clientY };
  }
}


const handleTouchDown = (e) => {
  const touch = e.touches[0]
  isPanning = true
  setIsPanning(isPanning)
  lastMouse= { x: touch.clientX, y: touch.clientY }
}

// ── Node drag start ───────────────────────────────────────────────────────

const handleMouseMove = (e) => {
  const dx = e.clientX - lastMouse.x;
  const dy = e.clientY - lastMouse.y;
  lastMouse = { x: e.clientX, y: e.clientY };

  if (isPanning) {
    setTransform({ ...transform, x: transform.x + dx * 1.5, y: transform.y + dy * 1.5 });
  }
}


const handleTouchMove = (e) => {
  const touch = e.touches[0]
  const dx = touch.clientX - lastMouse.x;
  const dy = touch.clientY - lastMouse.y;
  lastMouse = { x: touch.clientX, y: touch.clientY };

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

canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('touchstart', handleTouchDown);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handelTouchEnd);
reset.addEventListener('click', resetView);
