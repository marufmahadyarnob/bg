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
    img.onload = () => {
      card.cropper = new Cropper(img, { aspectRatio: 1 });
    };
    img.src = reader.result;

    const controls = document.createElement("div");
    controls.className = "controls";

    controls.append(
      btn("Crop", () => crop(card)),
      btn("Remove BG", () => removeBg(card)),
      btn("Smooth", () => smooth(card)),
      brightnessSlider(card),
      btn("Download", () => download(card))
    );

    card.append(img, controls);
    document.getElementById("imageList").append(card);
    cards.push(card);
  };
  reader.readAsDataURL(file);
}

function btn(text, fn) {
  const b = document.createElement("button");
  b.innerText = text;
  b.onclick = fn;
  return b;
}

function brightnessSlider(card) {
  const r = document.createElement("input");
  r.type = "range";
  r.min = 0.8;
  r.max = 1.3;
  r.step = 0.05;
  r.value = 1;
  r.oninput = () => {
    card.querySelector("img").style.filter = `brightness(${r.value})`;
  };
  return r;
}

function crop(card) {
  const canvas = card.cropper.getCroppedCanvas();
  card.cropper.destroy();
  card.querySelector("img").src = canvas.toDataURL();
  card.querySelector("img").onload = () => {
    card.cropper = new Cropper(card.querySelector("img"), { aspectRatio: 1 });
  };
}

function smooth(card) {
  const img = card.querySelector("img");
  img.style.filter = "brightness(1.05) blur(0.6px)";
}

/* Portrait-friendly BG remove (color-based) */
function removeBg(card) {
  const img = card.querySelector("img");
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");

  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);

  const data = ctx.getImageData(0, 0, c.width, c.height);
  const d = data.data;

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i+1], b = d[i+2];
    if (r > 200 && g > 200 && b > 200) {
      d[i+3] = 0; // transparent
    }
  }

  ctx.putImageData(data, 0, 0);
  img.src = c.toDataURL();
}

/* GLOBAL */

function autoCropAll() { cards.forEach(crop); }
function smoothAll() { cards.forEach(smooth); }
function removeBgAll() { cards.forEach(removeBg); }

function brightnessAll(v) {
  cards.forEach(c => {
    c.querySelector("img").style.filter = `brightness(${v})`;
  });
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

function download(card) {
  const a = document.createElement("a");
  a.href = card.querySelector("img").src;
  a.download = "image.png";
  a.click();
}

function downloadAll() { cards.forEach(download); }
function resetAll() { location.reload(); } 
