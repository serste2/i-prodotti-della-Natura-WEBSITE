document.querySelector("#layerText").textContent =
  "Curve di livello · infiltrazione · ristagni";
const body = document.body,
  tryButtons = document.querySelectorAll(".try,.tryBig"),
  ecosystem = document.querySelector("#ecosystem");
const gestureSwitch = document.querySelector(".gesture-switcher");
if (gestureSwitch && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let gestureSet = "biomass", gestureTimer = 0, gesturePaused = false;
  const paintGestureSet = () => {
    gestureSwitch.dataset.set = gestureSet;
    gestureSwitch.querySelectorAll(".biomass-photo,.biomass-copy").forEach(el => el.setAttribute("aria-hidden", String(gestureSet !== "biomass")));
    gestureSwitch.querySelectorAll(".cignula-photo,.cignula-copy").forEach(el => el.setAttribute("aria-hidden", String(gestureSet !== "cignula")));
  };
  const scheduleGestureSet = () => {
    clearTimeout(gestureTimer);
    if (gesturePaused) return;
    gestureTimer = setTimeout(() => {
      gestureSet = gestureSet === "biomass" ? "cignula" : "biomass";
      paintGestureSet();
      scheduleGestureSet();
    }, 5000);
  };
  gestureSwitch.addEventListener("pointerenter", () => { gesturePaused = true; clearTimeout(gestureTimer); });
  gestureSwitch.addEventListener("pointerleave", () => { gesturePaused = false; scheduleGestureSet(); });
  gestureSwitch.addEventListener("focusin", () => { gesturePaused = true; clearTimeout(gestureTimer); });
  gestureSwitch.addEventListener("focusout", e => { if (!gestureSwitch.contains(e.relatedTarget)) { gesturePaused = false; scheduleGestureSet(); } });
  paintGestureSet();
  scheduleGestureSet();
} else if (gestureSwitch) {
  gestureSwitch.dataset.set = "biomass";
  gestureSwitch.querySelectorAll(".cignula-photo,.cignula-copy").forEach(el => el.setAttribute("aria-hidden", "true"));
}
tryButtons.forEach(
  (b) =>
    (b.onclick = () => {
      resetEco();
      ecosystem.showModal();
      requestAnimationFrame(sizeEco);
      startEcoAnimation();
    }),
);
const menu = document.querySelector(".menu"),
  nav = document.querySelector("nav");
menu.onclick = () => {
  const open = nav.classList.toggle("open");
  menu.textContent = open ? "CHIUDI" : "MENU";
  menu.setAttribute("aria-expanded", open);
};
nav
  .querySelectorAll("a")
  .forEach((a) => (a.onclick = () => nav.classList.remove("open")));
document.querySelectorAll(".layers button").forEach(
  (b) =>
    (b.onclick = () => {
      document
        .querySelectorAll(".layers button")
        .forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      const [t, d, c] = b.dataset.layer.split("|");
      document.querySelector("#layerTitle").textContent = t;
      document.querySelector("#layerText").textContent = d;
    }),
);
const future = [
  "CÍGNULA",
  "INBRUMA Aulivi",
  "INBRUMA Boschiva",
  "INBRUMA DeVigna",
  "AKARIZERA",
  "RESINA VIVA",
  "FRONDA",
  "SCAGLIA",
];
document.querySelector("#futureList").innerHTML = future
  .map(
    (p, i) =>
      `<button data-reserve="${p}"><span>${String(i + 3).padStart(2, "0")}</span><b>${p}</b><em>SEGNALA INTERESSE ↗</em></button>`,
  )
  .join("");
const dialog = document.querySelector("#reserve");
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-reserve]");
  if (b) {
    document.querySelector("#reserveTitle").textContent = b.dataset.reserve;
    dialog.showModal();
  }
});
document.querySelector("#reserve .x").onclick = () => dialog.close();
document.querySelectorAll("form").forEach(
  (f) =>
    (f.onsubmit = (e) => {
      e.preventDefault();
      f.innerHTML =
        '<p class="success"><b>ANTEPRIMA DEL MODULO.</b><br>La richiesta non è stata inviata. Il servizio sarà disponibile alla pubblicazione.</p>';
    }),
);
document.querySelectorAll("main section").forEach((section, sectionIndex) => {
  const visitor = document.createElement("span");
  visitor.className = `ink-visitor ink-visitor-${sectionIndex % 3}`;
  visitor.setAttribute("aria-hidden", "true");
  section.append(visitor);
});
const ecoCanvas = document.querySelector("#ecoCanvas"),
  ex = ecoCanvas.getContext("2d"),
  mixButtons = [...document.querySelectorAll("#depositQueue button")],
  brush = document.querySelector("#brushSize"),
  fieldImage = new Image(),
  timerImage = new Image(),
  sowingImage = new Image(),
  farmerAtlas = new Image(),
  seatedFarmerImage = new Image();
fieldImage.src = "/assets/interaction-field-ink.png";
timerImage.src = "/assets/interaction-field-ink.png";
sowingImage.src = "/assets/interaction-field-ink.png";
farmerAtlas.src = "/assets/farmer-sowing-clean.webp";
seatedFarmerImage.src = "/assets/farmer-seated-ink.png";
const wateringCan = document.querySelector("#wateringCan"),
  plantButtons = document.querySelector("#plantButtons"),
  announcement = document.querySelector("#ecoAnnouncement"),
  macerationClock = document.querySelector("#macerationClock"),
  clockValue = document.querySelector("#clockValue");
const mixColors = {
  carbonari: { matter: "#67584a", accent: "#332d27" },
  aulivi: { matter: "#77705d", accent: "#3a3b35" },
  devigna: { matter: "#77675e", accent: "#42372f" },
};
let deposits = [],
  bagFilled = { carbonari: 0, aulivi: 0, devigna: 0 },
  watered = [],
  seeded = [],
  growthSites = [],
  renderedPlants = [],
  harvestedPlants = new Set(),
  harvestPrizeAt = 0,
  harvestDiscount = 0,
  harvestCompleteShown = false,
  pourAnimations = [],
  mix = "carbonari",
  ecoMode = "brush",
  painting = false,
  anim,
  growth = 0,
  waterTotal = 0,
  waterRemaining = 0,
  mixProgress = 0,
  stirElapsed = 0,
  stirLastTime = 0,
  ladleHeld = false,
  ladlePos = null,
  lastStirAt = 0,
  stirAngle = 0,
  stirTurns = 0,
  cloudTravel = 0,
  lastCloudTime = 0,
  cloudAnim = 0,
  lastMixPoint = null,
  timerStart = 0,
  farmerSowingSites = [],
  sowingProgress = 0,
  discoveredSeeds = new Set(),
  canPos = { x: 0.22, y: 0.72 };
const fieldPlants = [
  { name: "Amaranthus hypochondriacus", x: .36, y: .61, color: "#c0a68d", shape: "amaranth", text: "Uno studio in serra su un macerato microbico di Inula ha osservato crescita e sviluppo radicale di Amaranthus hypochondriacus.", url: "https://wjarr.com/content/biostimulant-derived-fermentation-inula-viscosa-inort-germination-and-growth-amaranthus" },
  { name: "Lactuca sativa", x: .52, y: .56, color: "#d9c8a8", shape: "lettuce", text: "Uno studio del 2020 ha misurato i parametri agronomici della lattuga in prove con biostimolanti a base di Inula.", url: "https://www.isroset.org/journal/IJSRMS/full_paper_view.php?paper_id=2157" },
  { name: "Spinacia oleracea", x: .68, y: .49, color: "#b7b1a0", shape: "spinach", text: "Nello stesso studio sono state osservate crescita dello spinacio e interazioni con Pythium spp.", url: "https://www.isroset.org/journal/IJSRMS/full_paper_view.php?paper_id=2157" },
  { name: "Solanum lycopersicum", x: .76, y: .68, color: "#c0a68d", shape: "tomato", text: "Una ricerca su estratti di Dittrichia viscosa ha esaminato l’attività contro Alternaria su pomodoro.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10295540/" },
];
// Illustrative seed mixes connect study species to each INBRUMA patch.
// This does not imply that the formulations themselves were tested in those papers.
const formulationSpecies = {
  carbonari: ["amaranth", "lettuce"],
  aulivi: ["spinach"],
  devigna: ["lettuce", "tomato"],
};
const fieldFacts = [
  "L’Inula delle Grotte cresce nel nostro campo a Cana, in Maremma.",
  "CÍGNULA unisce Inula e cisto; nel kit la card conduce a CÍGNULApp tramite QR.",
  "INBRUMA nasce dalla trasformazione della biomassa raccolta e tracciata in azienda.",
  "Nel campo convivono Inula, cisto, olivi e altre piante: osserviamo i loro cicli nel tempo.",
  "Per INBRUMA Aulivi valorizziamo anche le potature degli olivi.",
];
let factIndex = -1, factInterval, canHeld = false;
const faunaImage = new Image(), cloudImage = new Image();
const cropsAtlas = new Image(), biomassAtlas = new Image(), ladleAtlas = new Image(), lizardImage = new Image();
faunaImage.src = "/assets/ink-fauna-clean.webp";
cloudImage.src = "/assets/ink-clouds-clean.webp";
cropsAtlas.src = "/assets/ink-crops-atlas.png";
biomassAtlas.src = "/assets/inbruma-brush-atlas.png";
ladleAtlas.src = "/assets/wood-ladle-ripples-atlas.png";
lizardImage.src = "/assets/lacerta-viridis-ink.png";
function sizeEco() {
  const d = devicePixelRatio || 1,
    w = ecoCanvas.clientWidth,
    h = ecoCanvas.clientHeight;
  ecoCanvas.width = w * d;
  ecoCanvas.height = h * d;
  ex.setTransform(d, 0, 0, d, 0, 0);
  paintEco();
}
let foregroundLayer = null, foregroundWidth = 0, foregroundHeight = 0;
function background() {
  const w = ecoCanvas.clientWidth,
    h = ecoCanvas.clientHeight;
  const scene =
    ecoMode === "macerating"
      ? timerImage
      : ecoMode === "sowing"
        ? sowingImage
        : fieldImage;
  ex.fillStyle = "#e9dfca";
  ex.fillRect(0, 0, w, h);
  if (scene.complete && scene.naturalWidth) {
    // The cut-out sky is the furthest plane; the ink foreground is drawn later.
    ex.drawImage(scene, 0, 0, scene.naturalWidth, scene.naturalHeight * .26,
      0, 0, w, h * .26);
  }
}
function drawForeground() {
  const w = ecoCanvas.clientWidth, h = ecoCanvas.clientHeight;
  if (w <= 0 || h <= 0 || !fieldImage.complete || !fieldImage.naturalWidth) return;
  const width = Math.ceil(w), height = Math.ceil(h);
  if (!foregroundLayer || foregroundWidth !== width || foregroundHeight !== height) {
    foregroundLayer = document.createElement("canvas");
    foregroundLayer.width = width; foregroundLayer.height = height;
    foregroundWidth = width; foregroundHeight = height;
    const ctx = foregroundLayer.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(fieldImage, 0, 0, width, height);
    const pixels = ctx.getImageData(0, 0, width, height);
    const data = pixels.data;
    for (let y = 0; y < Math.floor(height * .26); y++) {
      // Light parchment becomes transparent, while dark etched leaves and ridge remain.
      const lowerBlend = Math.max(0, Math.min(1, (y / height - .18) / .08));
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const luminance = data[i] * .3 + data[i + 1] * .59 + data[i + 2] * .11;
        const ink = Math.max(0, Math.min(1, (205 - luminance) / 62));
        data[i + 3] = Math.round(data[i + 3] * (ink + (1 - ink) * lowerBlend));
      }
    }
    ctx.putImageData(pixels, 0, 0);
  }
  ex.drawImage(foregroundLayer, 0, 0, w, h);
}
function playablePoint(x, y) {
  const w = ecoCanvas.clientWidth, h = ecoCanvas.clientHeight;
  const nx = x / w, ny = y / h;
  // Exact field boundary traced from the user's marked reference image.
  const boundary = [
    [.023, .342], [.169, .342], [.205, .374], [.339, .391],
    [.376, .426], [.608, .430], [.698, .447], [.765, .490],
    [.754, .527], [.753, .574], [.735, .611], [.735, .703],
    [.739, .738], [.733, .764], [.749, .800], [.744, .861],
    [.720, .883], [.724, .932], [.702, .951], [.607, .927],
    [.607, .878], [.551, .824], [.519, .781], [.509, .727],
    [.495, .781], [.469, .713], [.443, .672], [.424, .696],
    [.349, .600], [.279, .566], [.218, .491], [.163, .491],
    [.103, .432], [.023, .423]
  ];
  let inside = false;
  for (let i = 0, j = boundary.length - 1; i < boundary.length; j = i++) {
    const [xi, yi] = boundary[i], [xj, yj] = boundary[j];
    if (((yi > ny) !== (yj > ny)) &&
      nx < (xj - xi) * (ny - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function inkHash(n) { return (Math.sin(n * 127.1 + 19.7) * 43758.5453) % 1; }
function mound(d) {
  const settled = ecoMode === "future" || ecoMode === "growing";
  if (biomassAtlas.complete && biomassAtlas.naturalWidth) {
    const row = { carbonari: 0, aulivi: 1, devigna: 2 }[d.mix];
    const depth = .58 + d.y / ecoCanvas.clientHeight * .65;
    const width = d.size * depth * (1.8 + Math.abs(inkHash(d.seed + 3)) * .5);
    ex.save(); ex.translate(d.x, d.y); ex.rotate((inkHash(d.seed) - .5) * .32);
    ex.scale(d.seed % 2 ? 1 : -1, 1);
    ex.globalAlpha = settled ? .47 : .89;
    if (settled) ex.filter = "brightness(1.3) saturate(.65)";
    ex.drawImage(biomassAtlas, 40, row * 313, 1580, 313, -width / 2, -width * .16, width, width * .26);
    ex.restore(); return;
  }
  const c = mixColors[d.mix], seed = d.seed || 1;
  ex.save(); ex.translate(d.x, d.y);
  ex.rotate((inkHash(seed) - .5) * .35);
  ex.scale(seed % 2 ? 1 : -1, 1);
  const depth = .58 + d.y / ecoCanvas.clientHeight * .65;
  const sx = d.size * depth * (.8 + Math.abs(inkHash(seed + 3)) * .5);
  const sy = d.size * depth * (.18 + Math.abs(inkHash(seed + 8)) * .08);
  ex.globalAlpha = settled ? .53 : 1;
  ex.fillStyle = settled ? "#d9cab0" : "#c3b49a";
  ex.strokeStyle = c.accent; ex.lineWidth = 1.25;
  ex.beginPath();
  ex.moveTo(-sx, 0);
  for (let i = 0; i <= 12; i++) {
    const xx = -sx + i * sx / 6, yy = -sy * (.45 + Math.abs(inkHash(seed + i)) * .65);
    ex.lineTo(xx, yy);
  }
  ex.lineTo(sx, sy * .3);
  for (let i = 12; i >= 0; i--) ex.lineTo(-sx + i * sx / 6, sy * (.3 + Math.abs(inkHash(seed + i + 30)) * .5));
  ex.closePath(); ex.fill(); ex.stroke();
  ex.strokeStyle = c.matter; ex.lineWidth = .9;
  for (let k = 0; k < 17; k++) {
    const xx = (k / 16 - .5) * sx * 1.8;
    const yy = (inkHash(seed + k * 3) - .5) * sy * .8;
    ex.beginPath(); ex.moveTo(xx - 3, yy + 2);
    ex.quadraticCurveTo(xx + 1, yy - sy * (.3 + k % 3 * .15), xx + (k % 2 ? 5 : -4), yy - sy * .38);
    ex.stroke();
    if (d.mix === "aulivi" && k % 2 === 0) {
      ex.beginPath(); ex.ellipse(xx + 3, yy - sy * .4, 5, 1.4, -.45, 0, 7); ex.stroke();
      ex.beginPath(); ex.ellipse(xx - 2, yy - sy * .3, 5, 1.4, .45, 0, 7); ex.stroke();
    } else if (d.mix === "devigna" && k % 3 === 0) {
      ex.beginPath(); ex.arc(xx + 4, yy - sy * .5, 4, .4, Math.PI * 1.9); ex.stroke();
    } else if (d.mix === "carbonari" && k % 3 === 0) {
      ex.beginPath(); ex.ellipse(xx + 3, yy - sy * .4, 4, 2, -.4, 0, 7); ex.stroke();
    }
  }
  ex.restore();
}
function plant(p, scale = 1, offset = 0) {
  if (cropsAtlas.complete && cropsAtlas.naturalWidth) {
    const w = ecoCanvas.clientWidth, h = ecoCanvas.clientHeight;
    const x = p.x * w, y = p.y * h;
    const type = { amaranth: 0, lettuce: 1, spinach: 2, tomato: 3 }[p.shape] ?? 0;
    const ratio = [1, .55, .65, .9][type];
    const depth = Math.max(0, Math.min(1, (y / h - .52) / .27));
    const height = h * (.075 + depth * .17) * scale / .23 * ratio;
    const width = height * 510 / 768;
    const variation = Math.abs(offset);
    ex.save(); ex.translate(x, y); ex.rotate(((variation % 7) - 3) * .018);
    if (variation % 2) ex.scale(-1, 1);
    ex.globalAlpha = .93;
    ex.filter = "saturate(1.18) contrast(1.03)";
    const buried = height * .12;
    ex.beginPath();
    ex.moveTo(-width * .58, -height * 1.12);
    ex.lineTo(width * .58, -height * 1.12);
    for (let k = 12; k >= 0; k--) {
      const nx = (k / 12 - .5) * width * 1.16;
      const ground = height * (.008 + Math.sin(k * 1.73 + offset) * .009);
      ex.lineTo(nx, ground);
    }
    ex.closePath(); ex.clip();
    ex.drawImage(cropsAtlas, type * 511, 0, 511, 768, -width / 2, -height, width, height + buried);
    if (p.shape === "tomato") {
      // The atlas carries pale unripe fruit; recolour only the two fruit areas,
      // preserving the engraved texture, sepals, leaves and dark ink outlines.
      ex.save();
      ex.globalCompositeOperation = "color";
      ex.globalAlpha = .92;
      ex.fillStyle = "#d52f2f";
      [[.085, -.315, .052], [.205, -.275, .055]].forEach(([tx, ty, tr]) => {
        ex.beginPath();
        ex.arc(width * tx, height * ty, width * tr, 0, Math.PI * 2);
        ex.fill();
      });
      ex.restore();
    }
    ex.restore(); return;
  }
  const x = p.x * ecoCanvas.clientWidth,
    y = p.y * ecoCanvas.clientHeight,
    H = Math.min(110, ecoCanvas.clientHeight * 0.17) * scale * (0.75 + y / ecoCanvas.clientHeight * 0.4);
  ex.save();
  ex.translate(x, y);
  ex.strokeStyle = "#15120e";
  ex.fillStyle = p.color;
  ex.lineWidth = Math.max(1.2, 2 * scale);
  ex.beginPath();
  ex.moveTo(0, 0);
  ex.bezierCurveTo(-8, -H * 0.35, 10, -H * 0.7, 0, -H);
  ex.stroke();
  for (let k = 1; k < 6; k++) {
    const yy = (-H * k) / 6,
      s = k % 2 ? 1 : -1;
    ex.beginPath();
    ex.ellipse(s * (14 + k * 2), yy, 18 * scale, 6 * scale, -s * 0.35, 0, 7);
    ex.fill();
    ex.stroke();
    ex.save(); ex.strokeStyle = "#15120e"; ex.lineWidth = .55;
    for (let j = 0; j < 3; j++) {
      ex.beginPath(); ex.moveTo(s * (10 + k * 2 + j * 5), yy - 3 * scale);
      ex.lineTo(s * (19 + k * 2 + j * 5), yy + 2 * scale); ex.stroke();
    }
    ex.restore();
  }
  if (p.shape === "amaranth") {
    for (let k = 0; k < 18; k++) {
      ex.beginPath();
      ex.arc(((k % 3) - 1) * 5, -H - k * 0.9, 3.2, 0, 7);
      ex.fill();
    }
  }
  if (p.shape === "lettuce" || p.shape === "spinach") {
    for (let k = 0; k < 9; k++) {
      const a = (k * 6.28) / 9;
      ex.beginPath();
      ex.ellipse(
        Math.cos(a) * 18,
        -8 + Math.sin(a) * 8,
        25 * scale,
        10 * scale,
        a,
        0,
        7,
      );
      ex.fill();
      ex.stroke();
    }
  }
  if (p.shape === "tomato") {
    for (let k = 0; k < 7; k++) {
      const a = k * 2.2;
      ex.beginPath();
      ex.arc(Math.cos(a) * 25, -H * 0.42 + Math.sin(a) * 25, 8 * scale, 0, 7);
      ex.fill();
      ex.stroke();
    }
  }
  ex.beginPath();
  ex.arc(0, -H, 12, 0, 7);
  ex.fill();
  ex.stroke();
  ex.restore();
}
function wetMark(p) {
  ex.save(); ex.fillStyle = "#5f6b68"; ex.strokeStyle = "#525b59"; ex.lineWidth = .65;
  for (let k = 0; k < 17; k++) {
    const angle = k * 2.399, radius = p.size * (.15 + (k % 5) * .16);
    const x = p.x + Math.cos(angle) * radius, y = p.y + Math.sin(angle) * radius * .3;
    ex.beginPath(); ex.ellipse(x, y, .8 + k % 3 * .35, 1.7, -.3, 0, 7);
    if (k % 3) ex.stroke(); else ex.fill();
  }
  ex.restore();
}
function drawPourAnimations(now) {
  pourAnimations = pourAnimations.filter(a => now - a.start < 1050);
  for (const a of pourAnimations) {
    const frame = Math.min(2, Math.floor((now - a.start) / 350));
    ex.save(); ex.strokeStyle = "#414e51"; ex.fillStyle = "#9fa8a3"; ex.lineWidth = 1;
    const originX = a.spoutX, originY = a.spoutY;
    for (let k = 0; k < 8; k++) {
      const t = Math.min(.96, .1 + (frame + (k % 3) * .27) / 2.8);
      const x = originX + (a.x - originX) * t + (k - 3.5) * 2.2;
      const y = originY + (a.y - originY) * t + (k % 3) * 2;
      ex.beginPath(); ex.moveTo(x, y - 4); ex.quadraticCurveTo(x - 3, y, x, y + 3);
      ex.quadraticCurveTo(x + 3, y, x, y - 4); ex.fill(); ex.stroke();
    }
    ex.restore();
  }
}
function drawClouds(now) {
  if (!lastCloudTime) lastCloudTime = now;
  cloudTravel += Math.min(100, now - lastCloudTime) * (ecoMode === "macerating" ? .033 : .0025);
  lastCloudTime = now;
  const w = ecoCanvas.clientWidth, h = ecoCanvas.clientHeight;
  if (!cloudImage.complete || !cloudImage.naturalWidth) return;
  ex.save();
  ex.beginPath(); ex.rect(0, 0, w, h * .18); ex.clip();
  // Complete cloud contours, including wisps; source cells have unequal widths.
  const crops = [[15, 180, 825, 320], [850, 180, 685, 320], [1535, 180, 510, 320]];
  for (let k = 0; k < 3; k++) {
    const width = w * .14;
    const x = ((w * (k * .37) + cloudTravel) % (w + width)) - width;
    ex.globalAlpha = .46;
    ex.drawImage(cloudImage, ...crops[k].map((v, i) => v * (i % 2 ? cloudImage.naturalHeight / 680 : cloudImage.naturalWidth / 2048)), x, h * (.02 + k % 2 * .018), width, width * crops[k][3] / crops[k][2]);
  }
  ex.restore();
}
function drawFauna(now) {
  if (!faunaImage.complete || !faunaImage.naturalWidth) return;
  const w = ecoCanvas.clientWidth, h = ecoCanvas.clientHeight;
  const creatures = [
    [0, .34, .40, 32, true], [1, .59, .34, 30, true],
    [0, .69, .46, 21, true], [1, .48, .52, 17, true],
    [0, .53, .39, 18, true], [1, .37, .58, 20, true],
    [0, .62, .59, 18, true], [1, .75, .55, 16, true],
    [2, .38, .77, 25, false], [2, .65, .70, 20, false],
    [3, .74, .83, 45, false], [3, .29, .87, 33, false],
  ];
  creatures.forEach(([type, nx, ny, size, flies], i) => {
    const t = now / (flies ? 1100 : 4600) + i * 1.7;
    const dx = flies ? Math.sin(t) * w * .018 : Math.sin(t) * w * .004;
    const dy = flies ? Math.cos(t * 1.3) * h * .014 : 0;
    ex.save(); ex.globalAlpha = .86;
    const cellW = faunaImage.naturalWidth / 2, cellH = faunaImage.naturalHeight / 2;
    const aspect = cellW / cellH;
    ex.drawImage(faunaImage, (type % 2) * cellW, Math.floor(type / 2) * cellH, cellW, cellH,
      nx * w + dx - size / 2, ny * h + dy - size / aspect / 2,
      size, size / aspect);
    ex.restore();
  });
}
function drawLadle(now) {
  const w = ecoCanvas.clientWidth, h = ecoCanvas.clientHeight;
  const pos = ladleHeld && ladlePos ? ladlePos : { x: w * .11, y: h * .78, angle: -.08 };
  if (!ladleAtlas.complete || !ladleAtlas.naturalWidth) return;
  if (ladleHeld || now - lastStirAt < 520) {
    const frame = Math.floor(now / 170) % 3;
    ex.save(); ex.globalAlpha = .62 * (ladleHeld ? 1 : Math.max(0, 1 - (now - lastStirAt) / 520));
    ex.drawImage(ladleAtlas, 630, frame * 313, 1000, 313,
      w * .11 - w * .09, h * .78 - h * .033, w * .18, h * .067);
    ex.restore();
  }
  ex.save(); ex.translate(pos.x, pos.y); ex.rotate(pos.angle ?? -.08);
  ex.drawImage(ladleAtlas, 55, 0, 520, 941, -29, -133, 58, 139);
  ex.restore();
}
function drawSeatedFarmer() {
  if (!seatedFarmerImage.complete || !seatedFarmerImage.naturalWidth) return;
  const w = ecoCanvas.clientWidth, h = ecoCanvas.clientHeight;
  const height = h * .78, width = height * seatedFarmerImage.naturalWidth / seatedFarmerImage.naturalHeight;
  ex.drawImage(seatedFarmerImage, w * .86 - width * .51, h * .99 - height, width, height);
}
function drawFarmer() {
  const { x, y, frame } = farmerSowingSites[Math.min(2, Math.floor(Math.min(1, sowingProgress) * 3))] || {};
  const pose = farmerAtlas;
  const rect = [[15, 20, 520, 990], [550, 20, 515, 990], [1080, 20, 456, 990]][frame ?? 0];
  const h = ecoCanvas.clientHeight;
  const t = Math.min(1, sowingProgress);
  // Three still poses, each anchored to a real deposit+water overlap. Draw the complete texture.
  if (Number.isFinite(x) && Number.isFinite(y) && pose?.complete && pose.naturalWidth) {
    const height = h * (.27 + Math.max(0, Math.min(1, (y / h - .53) / .26)) * .18);
    const width = height * rect[2] / rect[3];
    ex.drawImage(pose, ...rect, x - width * .5, y - height, width, height);
  }
  ex.save(); ex.fillStyle = "#595047";
  for (const seed of seeded) {
    if (seed.t > t) continue;
    ex.beginPath(); ex.ellipse(seed.x, seed.y, 1.1, 2, -.3, 0, 7); ex.fill();
  }
  ex.restore();
}
function seedField() {
  seeded = [];
  deposits.forEach((deposit, i) => {
    const species = formulationSpecies[deposit.mix] || [];
    const angle = i * 2.39996 + deposit.seed * .37;
    const radius = Math.min(12, Math.max(3, deposit.size * .28));
    const x = deposit.x + Math.cos(angle) * radius;
    const y = deposit.y + Math.sin(angle) * radius * .58;
    if (playablePoint(x, y)) seeded.push({
      x, y, size: deposit.size, t: i / Math.max(1, deposits.length - 1),
      mix: deposit.mix, species: species[i % Math.max(1, species.length)]
    });
  });
}
function getDepositPatches() {
  const patches = [];
  const w = ecoCanvas.clientWidth, h = ecoCanvas.clientHeight;
  for (const d of deposits) {
    let patch = patches.find(p => p.mix === d.mix &&
      Math.hypot(p.x - d.x, p.y - d.y) < Math.max(46, d.size + p.radius * .45));
    if (!patch) {
      patch = { x: d.x, y: d.y, mix: d.mix, radius: d.size * .45, deposits: [] };
      patches.push(patch);
    }
    patch.deposits.push(d);
    const n = patch.deposits.length;
    patch.x += (d.x - patch.x) / n;
    patch.y += (d.y - patch.y) / n;
    patch.radius = Math.max(patch.radius, Math.hypot(d.x - patch.x, d.y - patch.y) + d.size * .45);
  }
  return patches.filter(p => p.x > 0 && p.x < w && p.y > 0 && p.y < h && playablePoint(p.x, p.y));
}
function computeGrowthSites() {
  growthSites = [];
  seeded.forEach((seed, i) => {
    const nearbyWater = watered.some(a =>
      Math.hypot((a.x - seed.x) / 1.35, (a.y - seed.y) / .8) <
      Math.max(34, seed.size + a.size * .55));
    const species = fieldPlants.find(p => p.shape === seed.species);
    if (nearbyWater && species) growthSites.push({
      x: seed.x, y: seed.y, size: seed.size, species, mix: seed.mix, seedIndex: i
    });
  });
}
function waterCoversDeposit(mark, deposit) {
  return Math.hypot((mark.x - deposit.x) / 1.35, (mark.y - deposit.y) / .8) <
    Math.max(34, deposit.size + mark.size * .65);
}
function countUnwateredDeposits(marks = watered) {
  return deposits.filter(deposit => !marks.some(mark => waterCoversDeposit(mark, deposit))).length;
}
function selectFarmerSowingSites() {
  const w = ecoCanvas.clientWidth, h = ecoCanvas.clientHeight;
  const candidates = [];
  deposits.forEach(d => {
    const nearbyWater = watered.filter(a =>
      Math.hypot((a.x - d.x) / 1.35, (a.y - d.y) / .8) < Math.max(34, d.size + a.size * .55));
    if (!nearbyWater.length) return;
    const water = nearbyWater.reduce((best, a) => a.size > best.size ? a : best);
    const x = d.x * .58 + water.x * .42;
    const y = d.y * .58 + water.y * .42;
    if (playablePoint(x, y)) candidates.push({ x, y, mix: d.mix });
  });
  // Pick separated locations from actual INBRUMA marks that also overlap a watered area.
  candidates.sort((a, b) => a.y - b.y || a.x - b.x);
  const selected = [];
  for (const candidate of candidates) {
    if (selected.every(p => Math.hypot(p.x - candidate.x, p.y - candidate.y) > Math.min(w, h) * .045)) selected.push(candidate);
    if (selected.length === 3) break;
  }
  farmerSowingSites = selected.slice(0, 3).map((site, i) => ({ ...site, frame: i }));
}
function paintEco() {
  const now = performance.now();
  background(); drawClouds(now); drawForeground();
  deposits.forEach(mound);
  watered.forEach(wetMark);
  if (ecoMode === "watering") drawPourAnimations(now);
  if (ecoMode === "sowing") drawFarmer(now);
  else if (!["future", "growing"].includes(ecoMode)) drawSeatedFarmer();
  if (ecoMode === "mixing") drawLadle(now);
  if (ecoMode === "future" || ecoMode === "growing") {
    const candidates = growthSites.flatMap((site, i) =>
      Array.from({ length: 4 }, (_, j) => {
        const angle = j * 2.39996 + i * 1.31;
        const radius = j ? Math.min(20, 7 + site.size * .32) : 0;
        const x = site.x + Math.cos(angle) * radius;
        const y = site.y + Math.sin(angle) * radius * .58;
        const species = site.species;
        return { ...species, id: `${i}-${j}`, x: x / ecoCanvas.clientWidth, y: y / ecoCanvas.clientHeight,
          mix: site.mix, variation: site.seedIndex + j - 1,
          size: Math.max(.08, growth) * (.18 + (j % 4) * .024) };
      }).filter(p => playablePoint(p.x * ecoCanvas.clientWidth, p.y * ecoCanvas.clientHeight))
    );
    const plants = [];
    for (const p of candidates) {
      if (plants.every(q => Math.hypot((p.x - q.x) * ecoCanvas.clientWidth,
        (p.y - q.y) * ecoCanvas.clientHeight * 1.35) > 17)) plants.push(p);
    }
    renderedPlants = plants.sort((a, b) => a.y - b.y);
    renderedPlants.forEach(p => { if (!harvestedPlants.has(p.id)) plant(p, p.size, p.variation); });
  }
  if (lizardImage.complete && lizardImage.naturalWidth) {
    const w = ecoCanvas.clientWidth, h = ecoCanvas.clientHeight;
    ex.save(); ex.globalAlpha = .75;
    ex.drawImage(lizardImage, w * .035, h * .48, Math.min(100, w * .075), Math.min(56, h * .07));
    ex.restore();
  }
  drawFauna(now);
}
function animateEco(now) {
  if (!ecosystem.open) { cloudAnim = 0; lastCloudTime = 0; return; }
  if (!["macerating", "sowing", "growing"].includes(ecoMode)) paintEco();
  cloudAnim = requestAnimationFrame(animateEco);
}
function startEcoAnimation() {
  if (!cloudAnim) cloudAnim = requestAnimationFrame(animateEco);
}
function bagsComplete() {
  return Object.values(bagFilled).every((value) => value === 100);
}
function updateEco() {
  const n =
      ecoMode === "watering"
        ? Math.max(0, Math.ceil(waterRemaining / Math.max(1, waterTotal) * 100))
        : ecoMode === "mixing"
          ? Math.round(mixProgress)
          : bagFilled[mix],
    future = ["growing", "future"].includes(ecoMode);
  document.querySelector("#cignulaAmount").textContent = n + "%";
  document.querySelector(".basin-meter em").style.width = n + "%";
  document.querySelector("#water").disabled = !bagsComplete() || ecoMode !== "brush";
  document.querySelector("#basinLabel").textContent =
    ecoMode === "watering"
      ? "MACERATO DA DISTRIBUIRE"
      : ecoMode === "mixing"
        ? "INGREDIENTI MESCOLATI"
        : ecoMode === "brush" ? `SACCO ${mixButtons.find(b => b.dataset.mix === mix)?.querySelector("span").textContent ?? "INBRUMA"}` : "CAMPO PREPARATO";
  document.querySelector("#basinHint").textContent =
    ecoMode === "watering"
      ? "svuotalo da 100 a 0 sul terreno con INBRUMA"
      : ecoMode === "mixing"
        ? "mescola nel catino fino al 100%"
        : ecoMode === "brush" ? "distribuito · completa tutti e tre i sacchi" : "INBRUMA, acqua e semi";
  const copy = {
    brush: [
      "BRUSH / INBRUMA",
      "SCEGLI E DISTRIBUISCI",
      "Clicca un sacco nel pannello sotto il campo e distribuisci la biomassa. Completa tutti e tre al 100%.",
    ],
    mixing: [
      "CÍGNULA / PREPARAZIONE",
      "MESCOLA GLI INGREDIENTI",
      "Afferra il mestolo nel catino e segui il bordo interno con movimenti circolari.",
    ],
    macerating: [
      "CÍGNULA / MACERAZIONE",
      "IL TEMPO FA IL SUO LAVORO",
      "5–10 giorni reali, rappresentati qui in 15 secondi.",
    ],
    watering: [
      "CÍGNULA / ANNAFFIATOIO",
      "ANNAFFIA TUTTA L’INBRUMA",
      "Il livello cala solo quando bagni una nuova area coperta. Continua finché tutto il terreno preparato è annaffiato.",
    ],
    seeds: [
      "SEMI / RICERCA",
      "PRIMA DI SEMINARE, SCOPRI",
      "Apri i quattro contenitori: ogni seme racconta una connessione con la ricerca sull’Inula.",
    ],
    sowing: [
      "SEMINA / CAMPO",
      "ORA SI SEMINA",
      "La farmer distribuisce i semi sul terreno preparato.",
    ],
    future: ["RACCOLTA", "", ""],
  };
  const c = copy[ecoMode] || copy[future ? "future" : "brush"];
  document.querySelector("#ecoState").textContent = c[0];
  document.querySelector("#ecoPrompt").textContent = c[1];
  document.querySelector("#ecoHint").textContent = c[2];
  const shell = document.querySelector(".eco-shell");
  shell.classList.toggle("eco-future", future);
  shell.classList.toggle("eco-mixing", ecoMode === "mixing");
  shell.classList.toggle("eco-macerating", ecoMode === "macerating");
  shell.classList.toggle("eco-watering", ecoMode === "watering");
  shell.classList.toggle("eco-brush", ecoMode === "brush");
  shell.classList.toggle("eco-sowing", ecoMode === "sowing");
  shell.classList.toggle("eco-seeds", ecoMode === "seeds");
  document.querySelector("#seedDiscovery").hidden = ecoMode !== "seeds";
  document.querySelector("#inbrumaSupplies").hidden = ecoMode !== "brush" || bagsComplete();
  document.querySelector(".brush-size").hidden = ecoMode !== "brush" || bagsComplete();
  document.querySelector("#water").hidden = ecoMode !== "brush" || !bagsComplete();
  document.querySelector(".eco-controls").hidden = ["macerating", "sowing"].includes(ecoMode);
  mixButtons.forEach((b) => {
    const filled = bagFilled[b.dataset.mix];
    b.disabled = ecoMode !== "brush" || filled >= 100;
    b.hidden = ecoMode !== "brush" || filled >= 100;
    b.setAttribute("aria-pressed", String(b.dataset.mix === mix && ecoMode === "brush"));
    b.classList.toggle("empty", filled >= 100);
    b.classList.toggle("active", b.dataset.mix === mix && ecoMode === "brush");
    b.querySelector("b").textContent = `${filled}%`;
    b.querySelector("em").style.width = `${filled}%`;
    b.setAttribute("aria-label", `${b.querySelector("span").textContent}, ${filled}% distribuito`);
  });
  brush.disabled = ecoMode !== "brush";
  wateringCan.classList.toggle("visible", ecoMode === "watering");
  wateringCan.classList.toggle("held", canHeld);
  document.querySelector("#canPrompt").classList.toggle("visible", ecoMode === "watering");
  macerationClock.classList.toggle("visible", ecoMode === "macerating");
  plantButtons.classList.toggle("visible", future);
  shell.classList.toggle("eco-harvesting", future);
  positionCan();
}
function addDeposit(e) {
  if (ecoMode !== "brush") return;
  if (bagFilled[mix] >= 100) return;
  const r = ecoCanvas.getBoundingClientRect(),
    x = e.clientX - r.left,
    y = e.clientY - r.top;
  if (!playablePoint(x, y)) return;
  const last = deposits.findLast((deposit) => deposit.mix === mix);
  if (last && Math.hypot(last.x - x, last.y - y) < +brush.value * 0.45) return;
  // One deposit is 1%: 100 full mounds per bag, independent of brush size.
  const step = 1;
  const increment = Math.min(100 - bagFilled[mix], step);
  deposits.push({ x, y, size: +brush.value * increment / step, mix, seed: deposits.length + 1 });
  bagFilled[mix] += increment;
  if (bagFilled[mix] === 100) {
    const next = mixButtons.find((button) => bagFilled[button.dataset.mix] < 100);
    if (next) mix = next.dataset.mix;
    announcement.textContent = bagsComplete()
      ? "Tutti e tre i sacchi sono vuoti. Ora puoi preparare CÍGNULA."
      : "Sacco vuoto. Puoi distribuire un altro tipo di INBRUMA.";
  }
  updateEco();
  paintEco();
}
function positionCan() {
  const w = ecoCanvas.clientWidth, h = ecoCanvas.clientHeight;
  const overMound = deposits.some(d => Math.hypot((d.x - canPos.x * w) / 1.5, (d.y - canPos.y * h) / .8) < Math.max(35, d.size * 1.8));
  wateringCan.classList.toggle("pour-ready", canHeld && overMound);
  if (canHeld) {
    const cw = wateringCan.offsetWidth, ch = wateringCan.offsetHeight;
    const angle = (overMound ? 70 : -14) * Math.PI / 180;
    const dx = cw * (.94 - .5), dy = ch * (.28 - .5);
    const headX = cw * .5 + Math.cos(angle) * dx - Math.sin(angle) * dy;
    const headY = ch * .5 + Math.sin(angle) * dx + Math.cos(angle) * dy;
    wateringCan.style.left = (canPos.x * w - headX) + "px";
    wateringCan.style.top = (canPos.y * h - Math.max(66, h * .17) - headY) + "px";
  } else {
    wateringCan.style.left = canPos.x * 100 + "%";
    wateringCan.style.top = canPos.y * 100 + "%";
  }
  const prompt = document.querySelector("#canPrompt");
  prompt.style.left = canPos.x * 100 + "%"; prompt.style.top = canPos.y * 100 + "%";
  prompt.textContent = canHeld ? "SINISTRO: ANNAFFIA" : "DESTRO: SOLLEVA";
}
function canSpoutPoint() {
  const computed = getComputedStyle(wateringCan);
  const matrix = new DOMMatrixReadOnly(computed.transform);
  const origin = computed.transformOrigin.split(" ").map(parseFloat);
  const dx = wateringCan.offsetWidth * .94 - origin[0];
  const dy = wateringCan.offsetHeight * .28 - origin[1];
  return { x: wateringCan.offsetLeft + origin[0] + matrix.a * dx + matrix.c * dy + matrix.e,
    y: wateringCan.offsetTop + origin[1] + matrix.b * dx + matrix.d * dy + matrix.f };
}
function pourAt(x, y) {
  if (ecoMode !== "watering" || waterRemaining <= 0 || !canHeld) return;
  const r = ecoCanvas.getBoundingClientRect(),
    px = x - r.left,
    py = y - r.top;
  if (!playablePoint(px, py)) return;
  const last = watered.at(-1);
  if (last && Math.hypot(last.x - px, last.y - py) < 24) return;
  canPos = { x: px / r.width, y: py / r.height };
  positionCan();
  const spout = canSpoutPoint();
  const mark = { x: px, y: py, size: Math.max(20, +brush.value * .85) };
  const before = countUnwateredDeposits();
  const after = countUnwateredDeposits([...watered, mark]);
  if (after === before) {
    announcement.textContent = "Questa zona è già bagnata o non contiene INBRUMA. Porta il macerato su una nuova area coperta.";
    updateEco();
    paintEco();
    return;
  }
  watered.push(mark);
  pourAnimations.push({ x: px, y: py, spoutX: spout.x, spoutY: spout.y, start: performance.now() });
  waterRemaining = after;
  if (waterRemaining === 0) {
    announcement.textContent =
      "L’annaffiatoio è vuoto. Tutto il macerato è stato distribuito.";
    prepareSeedDiscovery();
    return;
  }
  updateEco();
  paintEco();
}
function mixAt(x, y) {
  if (ecoMode !== "mixing") return;
  const r = ecoCanvas.getBoundingClientRect();
  const px = x - r.left, py = y - r.top, now = performance.now();
  if (px > r.width * .24 || py < r.height * .65 || py > r.height * .89) return;
  if (!ladleHeld) {
    if (Math.hypot(px - r.width * .11, py - r.height * .78) > Math.max(48, r.width * .055)) return;
    ladleHeld = true;
    stirLastTime = now; lastMixPoint = { x: px, y: py };
    return;
  }
  const cx = r.width * .11, cy = r.height * .78;
  const a = Math.atan2((py - cy) / r.height, (px - cx) / r.width);
  if (lastMixPoint) {
    const before = Math.atan2((lastMixPoint.y - cy) / r.height, (lastMixPoint.x - cx) / r.width);
    let delta = a - before;
    delta = Math.atan2(Math.sin(delta), Math.cos(delta));
    const radius = Math.hypot(px - cx, py - cy);
    if (Math.abs(delta) > .015 && Math.abs(delta) < .7 && radius > 12 && radius < r.width * .14) {
      stirTurns += Math.abs(delta);
      stirElapsed += Math.min(80, now - stirLastTime);
    }
  }
  const rx = Math.min(r.width * .045, 52), ry = Math.min(r.height * .055, 40);
  const nextAngle = Math.sin(a) * .14;
  stirAngle += Math.atan2(Math.sin(nextAngle - stirAngle), Math.cos(nextAngle - stirAngle)) * .24;
  ladlePos = { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry, angle: stirAngle };
  lastStirAt = now;
  lastMixPoint = { x: px, y: py }; stirLastTime = now;
  mixProgress = Math.min(100, stirElapsed / 7000 * 100, stirTurns / (Math.PI * 4) * 100);
  updateEco(); paintEco();
  if (mixProgress >= 100) startMaceration();
}
function showNextFact() {
  const card = document.querySelector("#fieldFact");
  let next = Math.floor(Math.random() * fieldFacts.length);
  if (next === factIndex) next = (next + 1) % fieldFacts.length;
  factIndex = next;
  card.querySelector("small").textContent = `DAL CAMPO · ${String(next + 1).padStart(2, "0")}`;
  card.querySelector("p").textContent = fieldFacts[next];
  card.classList.add("visible");
}
function startMaceration() {
  ecoMode = "macerating";
  timerStart = performance.now();
  showNextFact();
  factInterval = setInterval(showNextFact, 4000);
  announcement.textContent =
    "Ingredienti mescolati. Inizia la macerazione aerobica: da 5 a 10 giorni reali, compressi qui in 15 secondi.";
  updateEco();
  function tick(now) {
    const elapsed = Math.min(15000, now - timerStart),
      remaining = Math.max(0, 15 - Math.floor(elapsed / 1000));
    document.querySelector("#clockValue").textContent = remaining;
    paintEco();
    if (elapsed < 15000) anim = requestAnimationFrame(tick);
    else {
      clearInterval(factInterval);
      document.querySelector("#fieldFact").classList.remove("visible");
      ecoMode = "watering";
      canHeld = false;
      waterTotal = deposits.length;
      waterRemaining = countUnwateredDeposits();
      canPos = { x: 0.2, y: 0.72 };
      announcement.textContent =
        "Il macerato è pronto. Solleva l’annaffiatoio con il tasto destro, poi annaffia il campo con il sinistro.";
      updateEco();
      paintEco();
      ecoCanvas.focus();
    }
  }
  anim = requestAnimationFrame(tick);
}
function beginSowing() {
  if (ecoMode !== "seeds" || discoveredSeeds.size !== fieldPlants.length) return;
  const sowingStart = performance.now();
  document.querySelector("#plantEvidence").hidden = true;
  document.querySelector("#plantEvidence").classList.remove("open");
  ecoMode = "sowing";
  sowingProgress = 0;
  seedField();
  selectFarmerSowingSites();
  updateEco();
  function sow(now) {
    sowingProgress = Math.min(1, (now - sowingStart) / 9000);
    paintEco();
    if (sowingProgress < 1) anim = requestAnimationFrame(sow);
    else { computeGrowthSites(); finishSowing(); }
  }
  anim = requestAnimationFrame(sow);
  function finishSowing() {
    localStorage.setItem("inulaFieldComplete", "1");
    localStorage.removeItem("inulaHarvest");
    harvestedPlants = new Set(); harvestDiscount = 0; harvestPrizeAt = 0; harvestCompleteShown = false;
    const w = ecoCanvas.clientWidth, h = ecoCanvas.clientHeight;
    localStorage.setItem("inulaFieldLayout", JSON.stringify({
      deposits: deposits.map(d => ({ ...d, x: d.x / w, y: d.y / h, size: d.size / w })),
      watered: watered.map(a => ({ ...a, x: a.x / w, y: a.y / h, size: a.size / w }))
    }));
    document.querySelector("#reopenField").classList.add("ready");
    ecosystem.close();
    location.hash = "home";
    document.querySelector("#fieldReturnMessage").hidden = false;
    document.querySelector("#fieldReward").showModal();
  }
}
function showFieldJourneyPrompt() {
  document.querySelector("#fieldJourneyPrompt").hidden = false;
  clearTimeout(window.fieldJourneyTimeout);
  window.fieldJourneyTimeout = setTimeout(() => {
    document.querySelector("#fieldJourneyPrompt").hidden = true;
  }, 9000);
}
document.querySelector("#fieldReward").addEventListener("close", showFieldJourneyPrompt);
document.querySelector(".reward-close").onclick = () => document.querySelector("#fieldReward").close();
document.querySelector("#copyReward").onclick = async () => {
  const feedback = document.querySelector("#rewardFeedback");
  try {
    await navigator.clipboard.writeText("INULA05");
    feedback.textContent = "Codice copiato. Continua a esplorare il sito e cerca «RIAPRI IL CAMPO».";
  } catch {
    feedback.textContent = "Seleziona il codice INULA05 e comunicalo nella richiesta del primo ordine.";
  }
};
document.querySelector("#fieldJourneyPrompt button").onclick = () => {
  document.querySelector("#fieldJourneyPrompt").hidden = true;
};
mixButtons.forEach(
  (b) =>
    (b.onclick = () => {
      if (ecoMode !== "brush" || bagFilled[b.dataset.mix] >= 100) return;
      mix = b.dataset.mix;
      updateEco();
    }),
);
ecoCanvas.addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;
  painting = true;
  ecoCanvas.setPointerCapture(e.pointerId);
  if (ecoMode === "brush") addDeposit(e);
  if (ecoMode === "mixing") mixAt(e.clientX, e.clientY);
  if (ecoMode === "watering" && e.button === 0) pourAt(e.clientX, e.clientY);
});
ecoCanvas.addEventListener("pointermove", (e) => {
  if (!painting) return;
  if (ecoMode === "brush") addDeposit(e);
  if (ecoMode === "mixing") mixAt(e.clientX, e.clientY);
  if (ecoMode === "watering" && e.buttons === 1) pourAt(e.clientX, e.clientY);
});
ecoCanvas.addEventListener("pointerup", () => {
  painting = false;
  lastMixPoint = null;
  ladleHeld = false; ladlePos = null;
});
document.querySelector("#water").onclick = () => {
  if (!bagsComplete()) return;
  mixProgress = 0; stirElapsed = 0; stirTurns = 0; stirAngle = -.42; ladleHeld = false; ladlePos = null; lastStirAt = 0;
  ecoMode = "mixing";
  announcement.textContent =
    "Gli ingredienti di CÍGNULA sono nel catino. Mescolali con gesti circolari fino al 100%.";
  updateEco();
  paintEco();
  ecoCanvas.focus();
};
function openFuture() {
  ecoMode = "growing";
  try {
    const savedHarvest = JSON.parse(localStorage.getItem("inulaHarvest") || "null");
    harvestedPlants = new Set(savedHarvest?.ids || []);
    harvestDiscount = savedHarvest?.discount || 0;
    harvestPrizeAt = savedHarvest?.prizeAt || 0;
    harvestCompleteShown = !!savedHarvest?.completeShown;
  } catch { harvestedPlants = new Set(); }
  ecosystem.showModal();
  sizeEco();
  updateEco();
  if (!deposits.length) {
    try {
      const saved = JSON.parse(localStorage.getItem("inulaFieldLayout") || "null");
      if (saved) {
        const w = ecoCanvas.clientWidth, h = ecoCanvas.clientHeight;
        deposits = saved.deposits.map(d => ({ ...d, x: d.x * w, y: d.y * h, size: d.size * w }));
        watered = saved.watered.map(a => ({ ...a, x: a.x * w, y: a.y * h, size: a.size * w }));
        seedField();
      }
    } catch { /* The current field still opens if an older saved layout is invalid. */ }
  }
  computeGrowthSites();
  growth = 0.05;
  paintEco();
  if (!harvestPrizeAt && renderedPlants.length) harvestPrizeAt = Math.min(renderedPlants.length,
    3 + Math.floor(Math.random() * Math.max(1, Math.min(7, renderedPlants.length - 2))));
  document.querySelector("#harvestBins").hidden = true;
  updateHarvestBins();
  startEcoAnimation();
  const start = performance.now();
  cancelAnimationFrame(anim);
  function grow(t) {
    growth = Math.min(1, (t - start) / 1800);
    paintEco();
    if (growth < 1) anim = requestAnimationFrame(grow);
    else {
      ecoMode = "future";
      updateEco();
      paintEco();
    }
  }
  anim = requestAnimationFrame(grow);
}
function showEvidence(p) {
  const card = document.querySelector("#plantEvidence");
  card.querySelector("h3").textContent = p.name;
  card.querySelector("p").textContent = p.text;
  card.querySelector("a").href = p.url;

  card.hidden = false;
  card.classList.add("open");
  card.querySelector(".evidenceClose").focus({ preventScroll: true });
}
const harvestKinds = [
  ["amaranth", "bag", "AMARANTO"], ["lettuce", "crate", "LATTUGA"],
  ["spinach", "tray", "SPINACI"], ["tomato", "basket", "POMODORI"]
];
function produceDrawing(shape, n) {
  const stroke = 'stroke="#282721" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';
  const fill = { amaranth: "#8b615b", lettuce: "#9eac8c", spinach: "#879b81", tomato: "#d6322f" }[shape];
  const drawing = shape === "amaranth"
    ? `<path d="M11 19Q4 13 9 5Q14 0 17 8Q20 15 11 19Z" fill="${fill}" ${stroke}/><path d="M11 17L14 5M9 12l6 2M11 9l5 1" fill="none" ${stroke}/>`
    : shape === "lettuce"
      ? `<path d="M3 14Q1 9 6 7Q5 2 11 4Q17 1 18 7Q23 10 19 16Q15 20 7 18Z" fill="${fill}" ${stroke}/><path d="M11 17Q9 10 12 5M8 15Q6 12 6 9M14 16Q17 12 17 8" fill="none" ${stroke}/>`
      : shape === "spinach"
        ? `<path d="M11 19Q2 13 5 7Q9 2 18 4Q22 12 11 19Z" fill="${fill}" ${stroke}/><path d="M11 18L16 6M10 13l-4-3M12 11l6-1" fill="none" ${stroke}/>`
        : `<circle cx="12" cy="12" r="8" fill="${fill}" ${stroke}/><path d="M12 5l-3-2 1 4-4 1 5 1 2 2 1-3 4-1-4-1-1-4Z" fill="#73806b" ${stroke}/>`;
  return `<svg viewBox="0 0 24 24" aria-hidden="true" style="transform:rotate(${(n % 5 - 2) * 9}deg)">${drawing}</svg>`;
}
function updateHarvestBins() {
  document.querySelector("#harvestBins").innerHTML = "";
  document.querySelector("#harvestBins").hidden = true;
  document.querySelector("#plantButtons").innerHTML = harvestKinds.map(([shape, , label]) => {
    const count = renderedPlants.filter(p => p.shape === shape && harvestedPlants.has(p.id)).length;
    return `<div class="fruit-count" aria-label="${label}: ${count} raccolti">${produceDrawing(shape, count)}<span>${label}</span><b aria-hidden="true">${count}</b></div>`;
  }).join("");
}
function collectPlant(p) {
  harvestedPlants.add(p.id);
  const completed = renderedPlants.length > 0 && harvestedPlants.size >= renderedPlants.length;
  if (!harvestDiscount && harvestedPlants.size >= harvestPrizeAt) {
    harvestDiscount = [10, 15, 20][Math.floor(Math.random() * 3)];
    const code = `RACCOLTO${harvestDiscount}`;
    document.querySelector("#harvestRewardTitle").innerHTML = `${harvestDiscount}% DAL<br /><em>RACCOLTO.</em>`;
    document.querySelector("#harvestCode").textContent = code;
    if (!completed) document.querySelector("#harvestReward").showModal();
  }
  localStorage.setItem("inulaHarvest", JSON.stringify({ ids:[...harvestedPlants], discount:harvestDiscount, prizeAt:harvestPrizeAt, completeShown:harvestCompleteShown || completed }));
  updateHarvestBins(); paintEco();
  announcement.textContent = `Raccolto: ${harvestedPlants.size} piante su ${renderedPlants.length}. I prodotti sono nei contenitori accanto al catino.`;
  if (completed && !harvestCompleteShown) {
    harvestCompleteShown = true;
    localStorage.setItem("inulaHarvest", JSON.stringify({ ids:[...harvestedPlants], discount:harvestDiscount, prizeAt:harvestPrizeAt, completeShown:true }));
    showHarvestComplete();
  }
}
function showHarvestComplete() {
  const counts = harvestKinds.map(([shape, , label]) => ({
    shape, label, count:renderedPlants.filter(p => p.shape === shape && harvestedPlants.has(p.id)).length
  }));
  document.querySelector("#harvestCompleteCount").textContent =
    `Hai raccolto tutti e ${harvestedPlants.size} i frutti del campo. Complimenti!`;
  document.querySelector("#harvestCompleteSummary").innerHTML = counts.map((item, i) =>
    `<span>${produceDrawing(item.shape, i)}<b>${item.count}</b><small>${item.label}</small></span>`
  ).join("");
  document.querySelector("#harvestCompleteDiscount").innerHTML = harvestDiscount
    ? `Il tuo sconto sul prossimo ordine: <strong>${harvestDiscount}%</strong> · codice <code>RACCOLTO${harvestDiscount}</code>.`
    : "Ti resta il codice del primo ordine: INULA05 · sconto 5%.";
  document.querySelector("#harvestComplete").showModal();
}
document.querySelector(".harvest-close").onclick = () => document.querySelector("#harvestReward").close();
document.querySelector(".harvest-complete-close").onclick = () => document.querySelector("#harvestComplete").close();
document.querySelectorAll("[data-harvest-product]").forEach(button => {
  button.addEventListener("click", () => {
    const product = button.dataset.harvestProduct;
    const code = harvestDiscount ? `RACCOLTO${harvestDiscount}` : "INULA05";
    document.querySelector("#harvestComplete").close();
    ecosystem.close();
    document.querySelector("#reserveTitle").textContent = product;
    const form = document.querySelector("#reserve form");
    const note = form?.querySelector("textarea");
    if (note) note.value = `Prodotto: ${product}\nCodice sconto: ${code}`;
    dialog.showModal();
  });
});
document.querySelector("#copyHarvest").onclick = async () => {
  const code = document.querySelector("#harvestCode").textContent;
  try { await navigator.clipboard.writeText(code); document.querySelector("#harvestFeedback").textContent = "Codice copiato."; }
  catch { document.querySelector("#harvestFeedback").textContent = `Seleziona e comunica il codice ${code}.`; }
};
ecoCanvas.addEventListener("click", (e) => {
  if (ecoMode !== "future") return;
  const r = ecoCanvas.getBoundingClientRect(),
    px = e.clientX - r.left, py = e.clientY - r.top;
  const hit = renderedPlants.filter(p => !harvestedPlants.has(p.id)).map(p => {
    const depth = Math.max(0, Math.min(1, (p.y - .52) / .27));
    const shapeRatio = { lettuce:.55, spinach:.65, tomato:.9, amaranth:1 }[p.shape] || 1;
    const height = r.height * (.075 + depth * .17) * p.size / .23 * shapeRatio;
    const dx = Math.abs(px - p.x * r.width), dy = py - p.y * r.height;
    return { p, distance:dx + Math.abs(dy + height * .45) * .4, valid:dx < Math.max(18,height*.43) && dy < 9 && dy > -height-12 };
  }).filter(v => v.valid).sort((a,b) => a.distance-b.distance)[0];
  if (hit) { collectPlant(hit.p); return; }

});
ecoCanvas.addEventListener("keydown", (e) => {
  if (ecoMode === "mixing" && (e.key === " " || e.key === "Enter")) {
    e.preventDefault();
    if (!stirLastTime) stirLastTime = performance.now();
    stirElapsed += Math.min(700, performance.now() - stirLastTime);
    stirLastTime = performance.now();
    mixProgress = Math.min(100, stirElapsed / 7000 * 100);
    updateEco();
    paintEco();
    if (mixProgress >= 100) startMaceration();
    return;
  }
  if (ecoMode !== "watering") return;
  const step = e.shiftKey ? 0.04 : 0.02;
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "Enter"].includes(e.key))
    e.preventDefault();
  if (e.key === "ArrowLeft") canPos.x = Math.max(0.15, canPos.x - step);
  if (e.key === "ArrowRight") canPos.x = Math.min(0.88, canPos.x + step);
  if (e.key === "ArrowUp") canPos.y = Math.max(0.32, canPos.y - step);
  if (e.key === "ArrowDown") canPos.y = Math.min(0.9, canPos.y + step);
  positionCan();
  if (e.key === "Enter" && !canHeld) { canHeld = true; updateEco(); }
  if (e.key === " ") {
    const r = ecoCanvas.getBoundingClientRect();
    pourAt(r.left + canPos.x * r.width, r.top + canPos.y * r.height);
  }
});
let evidenceTrigger = null;
function closeEvidence() {
  const card = document.querySelector("#plantEvidence");
  card.classList.remove("open");
  card.hidden = true;
  evidenceTrigger?.focus({ preventScroll: true });
}
document.querySelector(".evidenceClose").onclick = closeEvidence;
document.querySelector("#plantEvidence").addEventListener("keydown", e => {
  if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); closeEvidence(); }
});
const seedNames = ["AMARANTO", "LATTUGA", "SPINACI", "POMODORO"];
const seedRects = [[0, 0, 516, 680], [516, 0, 535, 680], [1051, 0, 457, 680], [1508, 0, 540, 680]];
const seedContainers = document.querySelector("#seedContainers");
seedContainers.innerHTML = fieldPlants.map((p, i) => {
  const [x, y, w, h] = seedRects[i];
  return `<button type="button" data-seed="${p.shape}" aria-controls="plantEvidence" aria-label="Scopri i semi di ${seedNames[i].toLowerCase()} e lo studio collegato"><svg viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false"><defs><clipPath id="seed-clip-${i}"><rect width="${w}" height="${h}" /></clipPath></defs><g clip-path="url(#seed-clip-${i})"><image href="/assets/seed-containers.webp" x="${-x}" y="${-y}" width="2048" height="680" /></g></svg><b>${seedNames[i]}</b><small>APRI I SEMI ↗</small></button>`;
}).join("");
function updateSeedProgress() {
  const count = discoveredSeeds.size, pct = count / fieldPlants.length * 100;
  const button = document.querySelector("#sowField");
  button.disabled = count < fieldPlants.length;
  button.querySelector("b").textContent = `${pct}%`;
  button.querySelector("em").style.width = `${pct}%`;
  button.querySelector("span").textContent = count === fieldPlants.length ? "SEMINA IL CAMPO ↗" : "SEMINA";
  button.querySelector("small").textContent = count === fieldPlants.length ? "Hai scoperto tutti i semi. Clicca per iniziare." : `${count} / ${fieldPlants.length} schede scoperte`;
  button.setAttribute("aria-label", count === fieldPlants.length ? "Semina il campo, tutte le quattro schede scoperte" : `Semina, ${count} di quattro schede scoperte`);
  seedContainers.querySelectorAll("button").forEach(b => {
    const seen = discoveredSeeds.has(b.dataset.seed);
    b.classList.toggle("discovered", seen);
    b.querySelector("small").textContent = seen ? "SCOPERTA ✓ · RIAPRI" : "APRI I SEMI ↗";
  });
}
function prepareSeedDiscovery() {
  ecoMode = "seeds";
  painting = false;
  canHeld = false;
  document.querySelector("#fieldFact").classList.remove("visible");
  clearInterval(factInterval);
  updateSeedProgress();
  updateEco();
  paintEco();
  announcement.textContent = "Il campo è pronto. Apri i quattro contenitori dei semi per scoprire gli studi e sbloccare la semina.";
  seedContainers.querySelector("button").focus({ preventScroll: true });
}
seedContainers.addEventListener("click", e => {
  const button = e.target.closest("button[data-seed]");
  if (!button || ecoMode !== "seeds") return;
  evidenceTrigger = button;
  showEvidence(fieldPlants.find(p => p.shape === button.dataset.seed));
  discoveredSeeds.add(button.dataset.seed);
  updateSeedProgress();
  announcement.textContent = `${discoveredSeeds.size} di quattro schede scoperte.${discoveredSeeds.size === 4 ? " La barra semina è pronta: cliccala per iniziare." : ""}`;
});
document.querySelector("#sowField").onclick = beginSowing;
function resetEco() {
  cancelAnimationFrame(anim);
  clearInterval(factInterval);
  document.querySelector("#fieldFact").classList.remove("visible");
  canHeld = false;
  document.querySelector("#harvestBins").hidden = true;
  deposits = [];
  bagFilled = { carbonari: 0, aulivi: 0, devigna: 0 };
  watered = []; seeded = []; growthSites = []; renderedPlants = []; pourAnimations = [];
  mix = "carbonari";
  ecoMode = "brush";
  growth = 0;
  waterTotal = 0;
  waterRemaining = 0;
  mixProgress = 0; stirElapsed = 0; stirTurns = 0; stirAngle = -.42; stirLastTime = 0; ladleHeld = false; ladlePos = null; lastStirAt = 0;
  timerStart = 0;
  sowingProgress = 0;
  discoveredSeeds.clear();
  updateSeedProgress();
  evidenceTrigger = null;
  document.querySelector("#plantEvidence").hidden = true;
  lastMixPoint = null;
  document.querySelector("#clockValue").textContent = "15";
  document.querySelector("#plantEvidence").classList.remove("open");
  updateEco();
  paintEco();
}
wateringCan.addEventListener("contextmenu", (e) => { e.preventDefault(); if (ecoMode === "watering") { canHeld = true; updateEco(); } });
 wateringCan.addEventListener("pointerdown", (e) => {
  if (ecoMode === "watering" && e.button === 0 && canHeld) {
    const r = ecoCanvas.getBoundingClientRect();
    pourAt(r.left + canPos.x * r.width, r.top + canPos.y * r.height);
  }
});
wateringCan.addEventListener("click", () => { if (ecoMode === "watering" && matchMedia("(pointer: coarse)").matches) { canHeld = true; updateEco(); } });
ecoCanvas.addEventListener("contextmenu", (e) => { e.preventDefault(); if (ecoMode === "watering") { canHeld = true; updateEco(); } });
document.querySelector(".eco-stage").addEventListener("pointermove", (e) => {
  if (ecoMode !== "watering" || !canHeld) return;
  const r=ecoCanvas.getBoundingClientRect();
  canPos={x:Math.max(.14,Math.min(.9,(e.clientX-r.left)/r.width)),y:Math.max(.32,Math.min(.9,(e.clientY-r.top)/r.height))};
  positionCan();
});
document.querySelector("#resetEco").onclick = resetEco;
document.querySelector(".eco-close").onclick = () => ecosystem.close();
document.querySelector("#reopenField").onclick = openFuture;
ecosystem.addEventListener("close", () => {
  if (!["future", "sowing"].includes(ecoMode)) resetEco();
});
[fieldImage, timerImage, sowingImage, faunaImage, cloudImage, cropsAtlas, biomassAtlas, ladleAtlas, lizardImage, farmerAtlas, seatedFarmerImage].forEach((image) => {
  image.onload = () => ecosystem.open && paintEco();
});
addEventListener("resize", () => {
  if (ecosystem.open) sizeEco();
});
if (localStorage.getItem("inulaFieldComplete"))
  document.querySelector("#reopenField").classList.add("ready");
updateEco();
