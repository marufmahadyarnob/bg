let cards = [];

document.getElementById("imageInput").addEventListener("change", e => {
  [...e.target.files].forEach(file => createCard(file));
});

function createCard(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = reader.result;

    img.onload = () => {
      card.cropper = new Cropper(img, { aspectRatio: 1 });
    };

    const controls = document.createElement("div");
    controls.className = "controls";

    const cropBtn = document.createElement("button");
    cropBtn.innerText = "Crop";
    cropBtn.onclick = () => crop(card);

    const bright = document.createElement("input");
    bright.type = "range"; bright.min = 0.8; bright.max = 1.3; bright.step = 0.05; bright.value = 1;
    bright.oninput = () => applyBrightness(card, bright.value);

    const smoothBtn = document.createElement("button");
    smoothBtn.innerText = "Smooth";
    smoothBtn.onclick = () => applySmooth(card);

    const bgBtn = document.createElement("button");
    bgBtn.innerText = "Remove BG";
    bgBtn.onclick = () => removeBg(card);

    const downBtn = document.createElement("button");
    downBtn.innerText = "Download";
    downBtn.onclick = () => download(card);

    controls.append(cropBtn, bright, smoothBtn, bgBtn, downBtn);
    card.append(img, controls);
    document.getElementById("imageList").append(card);
    cards.push(card);
  };
  reader.readAsDataURL(file);
}

function crop(card) {
  const canvas = card.cropper.getCroppedCanvas();
  card.cropper.destroy();
  card.querySelector("img").src = canvas.toDataURL();
  card.querySelector("img").onload = () => {
    card.cropper = new Cropper(card.querySelector("img"), { aspectRatio: 1 });
  };
}

function autoCropAll() { cards.forEach(crop); }

function applyBrightness(card, val) {
  const img = card.querySelector("img");
  img.style.filter = `brightness(${val})`;
}

function applySmooth(card) {
  const img = card.querySelector("img");
  const prevFilter = img.style.filter || "";
  img.style.filter = prevFilter + " blur(0.6px)";
}

/* Portrait BG remove for solid backgrounds */
function removeBg(card) {
  const img = card.querySelector("img");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);

  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = data.data;

  for (let i = 0; i < d.length; i += 4) {
    if (d[i] > 200 && d[i+1] > 200 && d[i+2] > 200) { d[i+3] = 0; }
  }

  ctx.putImageData(data, 0, 0);
  img.src = canvas.toDataURL();
}

function removeBgAll() { cards.forEach(c => removeBg(c)); }

function download(card) {
  const a = document.createElement("a");
  a.href = card.querySelector("img").src;
  a.download = "image.png";
  a.click();
}

function downloadAll() { cards.forEach(download); }
