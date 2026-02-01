let cards = [];
let segmenter = null;

async function loadModel() {
  segmenter = await window.transformers.pipeline(
    "image-segmentation",
    "Xenova/u2net"
  );
}
loadModel();

document.getElementById("imageInput").addEventListener("change", e => {
  [...e.target.files].forEach(createCard);
});

function createCard(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = reader.result;

    const controls = document.createElement("div");
    controls.className = "controls";

    const cropBtn = btn("Crop", () => crop(card));
    const bgBtn = btn("Remove BG", () => removeBg(card));
    const smoothBtn = btn("Smooth", () => smooth(card));

    const bright = document.createElement("input");
    bright.type = "range";
    bright.min = 0.8;
    bright.max = 1.3;
    bright.step = 0.05;
    bright.value = 1;
    bright.oninput = () => brightness(card, bright.value);

    const dBtn = btn("Download", () => download(card));

    controls.append(cropBtn, bgBtn, smoothBtn, bright, dBtn);
    card.append(img, controls);
    document.getElementById("imageList").append(card);

    card.cropper = new Cropper(img, { aspectRatio: 1 });
    cards.push(card);
  };
  reader.readAsDataURL(file);
}

function btn(t, f) {
  const b = document.createElement("button");
  b.innerText = t;
  b.onclick = f;
  return b;
}

function crop(card) {
  const c = card.cropper.getCroppedCanvas();
  card.querySelector("img").src = c.toDataURL();
  card.cropper.destroy();
  card.cropper = new Cropper(card.querySelector("img"), { aspectRatio: 1 });
}

function brightness(card, v) {
  card.querySelector("img").style.filter = `brightness(${v})`;
}

function smooth(card) {
  card.querySelector("img").style.filter += " blur(0.6px)";
}

async function removeBg(card) {
  if (!segmenter) return alert("Model loading… wait");

  const img = card.querySelector("img");
  const res = await segmenter(img.src);
  const mask = res[0].mask;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  canvas.width = w;
  canvas.height = h;

  const base = new Image();
  base.src = img.src;
  await base.decode();

  ctx.drawImage(base, 0, 0);
  const data = ctx.getImageData(0, 0, w, h);
  const m = mask.data;

  for (let i = 0; i < m.length; i++) {
    if (m[i] < 128) data.data[i * 4 + 3] = 0;
  }
  ctx.putImageData(data, 0, 0);
  img.src = canvas.toDataURL();
}

function resizeAll() {
  const w = +document.getElementById("w").value;
  const h = +document.getElementById("h").value;
  cards.forEach(c => {
    const img = c.querySelector("img");
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    cv.getContext("2d").drawImage(img, 0, 0, w, h);
    img.src = cv.toDataURL();
  });
}

function autoCropAll() { cards.forEach(crop); }
function smoothAll() { cards.forEach(smooth); }
function removeBgAll() { cards.forEach(removeBg); }
function brightnessAll(v) { cards.forEach(c => brightness(c, v)); }

function download(card) {
  const a = document.createElement("a");
  a.href = card.querySelector("img").src;
  a.download = "image.png";
  a.click();
}

function downloadAll() { cards.forEach(download); }
function resetAll() { location.reload(); }
