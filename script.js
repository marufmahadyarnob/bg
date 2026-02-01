let cards = [];

document.getElementById("input").addEventListener("change", e => {
  [...e.target.files].forEach(loadImage);
});

function loadImage(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = reader.result;

    img.onload = () => {
      card.cropper = new Cropper(img, { aspectRatio: 1 });
    };

    const cropBtn = makeBtn("Crop", () => crop(card));

    const bright = document.createElement("input");
    bright.type = "range";
    bright.min = 0.8;
    bright.max = 1.3;
    bright.step = 0.05;
    bright.value = 1;
    bright.oninput = () =>
      img.style.filter = `brightness(${bright.value})`;

    const smoothBtn = makeBtn("Smooth", () =>
      img.style.filter = "brightness(1.05) blur(0.6px)"
    );

    const bgBtn = makeBtn("Remove BG", () => removeBg(img));

    const downBtn = makeBtn("Download", () => download(img));

    card.append(img, cropBtn, bright, smoothBtn, bgBtn, downBtn);
    document.getElementById("list").append(card);
    cards.push(card);
  };
  reader.readAsDataURL(file);
}

function makeBtn(text, fn) {
  const b = document.createElement("button");
  b.innerText = text;
  b.onclick = fn;
  return b;
}

function crop(card) {
  const canvas = card.cropper.getCroppedCanvas();
  card.cropper.destroy();
  card.querySelector("img").src = canvas.toDataURL();
  card.querySelector("img").onload = () => {
    card.cropper = new Cropper(card.querySelector("img"), { aspectRatio: 1 });
  };
}

function autoCropAll() {
  cards.forEach(crop);
}

function resizeAll() {
  const w = +document.getElementById("w").value;
  const h = +document.getElementById("h").value;

  cards.forEach(card => {
    const img = card.querySelector("img");
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    c.getContext("2d").drawImage(img, 0, 0, w, h);
    img.src = c.toDataURL();
  });
}

/* SIMPLE portrait BG remove (white background) */
function removeBg(img) {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const data = ctx.getImageData(0, 0, c.width, c.height);
  const d = data.data;

  for (let i = 0; i < d.length; i += 4) {
    if (d[i] > 220 && d[i+1] > 220 && d[i+2] > 220) {
      d[i+3] = 0;
    }
  }

  ctx.putImageData(data, 0, 0);
  img.src = c.toDataURL();
}

function download(img) {
  const a = document.createElement("a");
  a.href = img.src;
  a.download = "image.png";
  a.click();
}

function downloadAll() {
  cards.forEach(c => download(c.querySelector("img")));
}
