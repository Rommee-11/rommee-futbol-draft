// ===== Avatar de Rommee armado con piezas articuladas + patada + pelota + barra de fuerza =====
const AVT = {}, AVT_OSC = {};
["cabeza_perfil", "torso_perfil", "manga", "antebrazo", "muslo", "pantorrilla", "pie", "cabeza_espalda", "torso_espalda"].forEach(function (n) {
  const im = new Image();
  im.onload = function () {   // copia más oscura para los brazos y piernas del lado lejano
    const c = document.createElement("canvas"); c.width = im.width; c.height = im.height;
    const g = c.getContext("2d"); g.drawImage(im, 0, 0); g.globalCompositeOperation = "source-atop"; g.fillStyle = "rgba(0,10,30,.32)"; g.fillRect(0, 0, c.width, c.height);
    AVT_OSC[n] = c;
  };
  im.src = "img/avatar/" + n + ".png"; AVT[n] = im;
});
const RAD = Math.PI / 180, SUELO = 389, RBOLA = 80;      // SUELO: distancia de la cadera al piso con las piernas estiradas
function dib(ctx, nombre, px, py, oscuro) {
  const im = oscuro ? (AVT_OSC[nombre] || AVT[nombre]) : AVT[nombre];
  if (!im || !(im.width > 0)) { return; }
  ctx.drawImage(im, -px, -py);
}
function piernaAv(ctx, hx, th, kn, an, oscuro) {
  ctx.save(); ctx.translate(hx, 0); ctx.rotate(th * RAD);
  ctx.save(); ctx.translate(5, 160); ctx.rotate(kn * RAD);
  ctx.save(); ctx.translate(0, 178); ctx.rotate(an * RAD); dib(ctx, "pie", 30, 14, oscuro); ctx.restore();
  dib(ctx, "pantorrilla", 41, 14, oscuro); ctx.restore();
  dib(ctx, "muslo", 75, 28, oscuro); ctx.restore();
}
function brazoAv(ctx, sh, el, oscuro) {
  ctx.save(); ctx.translate(6, -225); ctx.rotate(sh * RAD);
  ctx.save(); ctx.translate(0, 98); ctx.rotate(el * RAD); dib(ctx, "antebrazo", 35, 12, oscuro); ctx.restore();
  dib(ctx, "manga", 51, 22, oscuro); ctx.restore();
}
// (x, ySuelo) = donde apoya el pie; s = escala; p = pose; alfa = transparencia
function dibujarAvatar(ctx, x, ySuelo, s, p, alfa) {
  ctx.save(); ctx.globalAlpha = alfa; ctx.translate(x, ySuelo); ctx.scale(s, s); ctx.translate(p.x, -SUELO + p.dip);
  piernaAv(ctx, -4, p.tF, p.kF, p.aF, true); piernaAv(ctx, 4, p.tN, p.kN, p.aN, false);
  ctx.save(); ctx.rotate(p.lean * RAD);
  brazoAv(ctx, p.sF, p.eF, true); dib(ctx, "torso_perfil", 62, 270, false);
  ctx.save(); ctx.translate(0, -256); ctx.rotate(p.head * RAD); dib(ctx, "cabeza_perfil", 118, 290, false); ctx.restore();
  brazoAv(ctx, p.sN, p.eN, false); ctx.restore();
  ctx.restore();
}

// ----- Poses -----
const REPOSO = { x: 0, dip: 0, lean: 0, head: 0, sN: 8, eN: -14, sF: -4, eF: -12, tN: 2, kN: 0, aN: -2, tF: -2, kF: 0, aF: 2 };
const PREP0 = { x: 0, dip: 28, lean: -2, head: -2, sN: 30, eN: -30, sF: -40, eF: -25, tN: 28, kN: 60, aN: 8, tF: -14, kF: 30, aF: -16 };
const PREP = { x: 700, dip: 70, lean: 6, head: -2, sN: 55, eN: -35, sF: -70, eF: -30, tN: 48, kN: 105, aN: 15, tF: -38, kF: 75, aF: -37 };
const GOLPE = { x: 740, dip: 80, lean: -10, head: 0, sN: 62, eN: -30, sF: -90, eF: -25, tN: -50, kN: 14, aN: 18, tF: -40, kF: 80, aF: -40 };
const FINAL = { x: 780, dip: 30, lean: -4, head: 0, sN: 40, eN: -30, sF: -60, eF: -30, tN: -78, kN: 6, aN: 10, tF: -12, kF: 25, aF: -13 };
function lerpP(a, b, k) { const o = {}; for (const c in a) { o[c] = a[c] + (b[c] - a[c]) * k; } return o; }
function ss(k) { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); }
function pCorrer(u) {          // dos pasos de carrera (0 a 0,8 segundos)
  const f = u / 0.8, ph = 6.2832 * f;
  const r = { x: 660 * f, dip: -10 * Math.abs(Math.sin(ph)), lean: 10, head: -4, tN: -40 * Math.sin(ph), kN: 30 + 45 * (0.5 + 0.5 * Math.cos(ph + 0.9)),
    tF: 40 * Math.sin(ph), kF: 30 + 45 * (0.5 + 0.5 * Math.cos(ph + 0.9 + Math.PI)), sN: 40 * Math.sin(ph), eN: -75, sF: -40 * Math.sin(ph), eF: -75, aN: 0, aF: 0 };
  r.aN = -(r.tN + r.kN) * 0.5; r.aF = -(r.tF + r.kF) * 0.5;
  return lerpP(REPOSO, r, ss(u / 0.12));
}
const T_GOLPE = 1.1;           // instante en que el pie toca la pelota
function poseDe(u) {
  if (u <= 0.8) { return pCorrer(u); }
  if (u <= 0.98) { return lerpP(pCorrer(0.8), PREP, ss((u - 0.8) / 0.18)); }
  if (u <= 1.08) { const k = (u - 0.98) / 0.1; return lerpP(PREP, GOLPE, k * k); }
  if (u <= 1.7) { return lerpP(GOLPE, FINAL, ss((u - 1.08) / 0.62)); }
  return FINAL;
}
function respirar(ts) { const s = Math.sin(ts / 500); return lerpP(REPOSO, { x: 0, dip: 4, lean: 1, head: 2, sN: 10, eN: -16, sF: -6, eF: -14, tN: 2, kN: 1, aN: -2, tF: -2, kF: 1, aF: 2 }, 0.5 + 0.5 * s); }
// Posición de la pelota en reposo, calculada para que quede justo delante del pie en el momento del golpe
function posBola() {
  const rot = function (x, y, a) { a *= RAD; return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]; };
  const g = GOLPE, k = rot(5, 160, g.tN), t = rot(0, 178, g.tN + g.kN), pt = rot(93, 28, g.tN + g.kN + g.aN);
  const tobX = 4 + k[0] + t[0], punta = tobX + pt[0];
  return { x: g.x + punta + RBOLA * 0.9, y: SUELO - RBOLA };      // y: altura del centro respecto de la cadera en reposo
}

// ----- Pelota de fútbol -----
function pent(g, cx, cy, r, rot) { g.beginPath(); for (let i = 0; i < 5; i++) { const a = rot + i * 1.2566 - 1.5708; g[i ? "lineTo" : "moveTo"](cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath(); g.fill(); }
function dibujarBalon(g, x, y, r, ang, alfa) {
  g.save(); g.globalAlpha = alfa; g.translate(x, y); g.rotate(ang);
  const gr = g.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r); gr.addColorStop(0, "#ffffff"); gr.addColorStop(1, "#c4ccd6");
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
  g.save(); g.beginPath(); g.arc(0, 0, r, 0, 7); g.clip();
  g.fillStyle = "#1b1b1b"; pent(g, 0, 0, r * 0.36, 0);
  for (let i = 0; i < 5; i++) { const a = i * 1.2566 - 1.5708; pent(g, Math.cos(a) * r * 0.98, Math.sin(a) * r * 0.98, r * 0.3, a + 1.5708 + 0.63); }
  g.strokeStyle = "#1b1b1b"; g.lineWidth = Math.max(1, r * 0.03);
  for (let i = 0; i < 5; i++) { const a = i * 1.2566 - 1.5708; g.beginPath(); g.moveTo(Math.cos(a) * r * 0.36, Math.sin(a) * r * 0.36); g.lineTo(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7); g.stroke(); }
  g.restore();
  g.strokeStyle = "rgba(0,0,0,.55)"; g.lineWidth = Math.max(1, r * 0.04); g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke();
  g.restore();
}

// ----- Patada con barra de fuerza (se usa en cada ruleta) -----
// cv: lienzo a pantalla completa | btn: botón PATEA | relleno: barra de fuerza | cuando(fuerza 0..1): se llama al llegar la pelota
function Patada(cv, btn, relleno, cuando, alSoltar) {
  const g = cv.getContext("2d"), CICLO = 1200, DVUELO = 0.95;
  let est = "off", raf = 0, ts0 = 0, tSuelta = 0, tLlega = 0, fija = 0, res = null, A = {};
  const BAR = BarraTiming.crear(relleno.parentNode, relleno);
  function medir() {
    const d = Math.min(2, window.devicePixelRatio || 1), w = window.innerWidth, h = window.innerHeight;
    cv.width = Math.round(w * d); cv.height = Math.round(h * d);
    const sc = Math.min(h * 0.42, w * 0.36) / 960, b = posBola();
    A = { d: d, w: w, h: h, sc: sc, x0: w * 0.07, suelo: h * 0.9, bx: w * 0.07 + b.x * sc, by: h * 0.9 - SUELO * sc + b.y * sc, r0: RBOLA * sc, R1: Math.min(w, h) * 0.21 };
  }
  function cuadro(ts) {
    ts0 = ts; if (est === "off" || est === "fin") { return; }
    g.setTransform(A.d, 0, 0, A.d, 0, 0); g.clearRect(0, 0, A.w, A.h);
    let pose, bx = A.bx, by = A.by, rb = A.r0, ab = 0, alfaB = 1, alfaP = 1;
    if (est === "espera") { pose = respirar(ts); BAR.actualizar(ts); }
    else {
      const u = (ts - tSuelta) / 1000; pose = poseDe(u);
      if (est === "patada" && u >= T_GOLPE) {
        const t = Math.min(1, (u - T_GOLPE) / DVUELO), m = 1 - t, cx = A.w * 0.5, cy = A.h * 0.44, qx = A.bx * 0.4 + cx * 0.6, qy = Math.min(A.by, cy) - A.h * 0.32;
        bx = m * m * A.bx + 2 * m * t * qx + t * t * cx; by = m * m * A.by + 2 * m * t * qy + t * t * cy;
        rb = A.r0 + (A.R1 - A.r0) * Math.pow(t, 1.7); ab = t * 12;
        if (t >= 1) { est = "llegada"; tLlega = ts; cuando(fija, res); }
      } else if (est === "llegada") {
        const k = Math.min(1, (ts - tLlega) / 450); bx = A.w * 0.5; by = A.h * 0.44; rb = A.R1 * (1 + k * 0.6); ab = 12 + k * 3; alfaB = 1 - k; alfaP = 1 - k;
        if (k >= 1) { est = "fin"; g.clearRect(0, 0, A.w, A.h); return; }
      }
    }
    dibujarAvatar(g, A.x0, A.suelo, A.sc, pose, alfaP);
    dibujarBalon(g, bx, by, rb, ab, alfaB);
    raf = requestAnimationFrame(cuadro);
  }
  function patear() {
    if (est !== "espera") { return; }
    const r = BAR.parar((typeof L === "function" && L().zonas) || null);
    if (!r) { return; }
    res = r; fija = Math.random(); est = "patada"; tSuelta = ts0; btn.disabled = true; alSoltar();
  }
  btn.addEventListener("pointerdown", function (e) { try { btn.setPointerCapture(e.pointerId); } catch (x) {} if (e.preventDefault) { e.preventDefault(); } patear(); });
  btn.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  btn.addEventListener("keydown", function (e) { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); patear(); } });
  return {
    reiniciar: function () { cancelAnimationFrame(raf); medir(); est = "espera"; res = null; btn.disabled = false; BAR.iniciar(opcionesPenal()); raf = requestAnimationFrame(cuadro); },
    detener: function () { cancelAnimationFrame(raf); est = "off"; BAR.detener(); if (A.w) { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); } },
    estado: function () { return est; }
  };
}
