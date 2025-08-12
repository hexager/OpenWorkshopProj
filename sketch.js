let classifier;
let canvas;
let lastClassifyTime = 0;
const classifyIntervalMs = 350;
let modelReady = false;
const aboutBtn = select('#aboutBtn');

function setup() {
  // Responsive square canvas
  const holder = select('#canvas-holder');
  const size = holder.width - 20; // account for padding
  canvas = createCanvas(size, size);
  canvas.parent('canvas-holder');

  // White background, black ink (best for DoodleNet)
  background(255);
  stroke(0);
  updateStroke();
  strokeJoin(ROUND);
  strokeCap(ROUND);
  const aboutBtn = select('#aboutBtn');
  const modal = select('#aboutModal');
  const closeBtn = select('.close-btn');

  aboutBtn.mousePressed(() => modal.style('display', 'block'));
  closeBtn.mousePressed(() => modal.style('display', 'none'));
  // Also close if clicking outside the modal content
  window.onclick = function(event) {
    if (event.target == modal.elt) {
      modal.style('display', 'none');
    }
  }
  // Clear button
  select('#clearBtn').mousePressed(() => {
    background(255);
    select('#label').html('Label: —');
    select('#conf').html('Confidence: —');
  });
  

  // Load model and set ready flag
  classifier = ml5.imageClassifier('DoodleNet', () => {
    modelReady = true;
  });
}

function draw() {
  // Draw while pressed inside canvas
  if (mouseIsPressed && mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
    line(mouseX, mouseY, pmouseX, pmouseY);
  }

  // Only classify after model is ready, throttled
  if (modelReady && millis() - lastClassifyTime > classifyIntervalMs) {
    lastClassifyTime = millis();
    classifier.classify(canvas.elt, gotResult);
  }
}

function gotResult(err, results) {
  // Handle both standard error and odd cases
  if (err && !Array.isArray(err)) {
    return;
  }

  // Normalize when results might show up in the first arg in some builds
  let out = results;
  if (!out && Array.isArray(err)) out = err;
  if (!Array.isArray(out) || out.length === 0) return;

  const top = out[0];
  const label = top?.label ?? '—';
  const confVal = top?.confidence ?? 0;
  const conf = (confVal * 100).toFixed(1) + '%';
  select('#conf-bar').style('width', `${confVal * 100}%`);
  // Show even modest confidence so UI updates reliably
  if (confVal >= 0.2) {
    select('#label').html(`Label: ${label}`);
    select('#conf').html(`Confidence: ${conf}`);
  }
}

// Touch support
function touchMoved() {
  if (touchX >= 0 && touchX < width && touchY >= 0 && touchY < height) {
    line(touchX, touchY, ptouchX, ptouchY);
  }
  return false;
}

// Keep canvas responsive
function windowResized() {
  const holder = select('#canvas-holder');
  const size = holder.width - 20;
  resizeCanvas(size, size);
  background(255);
  updateStroke();
}
function updateStroke() {
const base = 42; // tuned for 400×400
const scaled = (width / 400) * base;
const sw = Math.max(6, Math.min(28, Math.round(scaled)));
strokeWeight(sw);
}