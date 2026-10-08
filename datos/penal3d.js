// =====================================================================
//  ESCENA DE PENAL EN 3D (usa three.js, archivo datos/three.min.js)
//  Un jugador de camiseta celeste y blanca patea un penal contra un
//  arquero. La pelota entra al arco, vuelve hacia la pantalla y se
//  transforma en la ruleta de cartas.
//  Si el aparato no soporta 3D, el juego usa la patada 2D de avatar.js
// =====================================================================
const PENAL3D_OK = (function () {
  try {
    if (!window.THREE) { return false; }
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch (e) { return false; }
})();

const PenalMundo = (function () {
  let R = null;            // renderer
  let escena, cam, kicker, keeper, romme, balon, sombraBalon, red, huella, marca, listo = false, W = 0, H = 0, DPR = 1, firmaJugador = "";
  const GZ = -11;          // la línea de gol está a 11 m del punto penal (que es el origen)
  const BALON_R = 0.17;
  const T = THREE;

  // ---------- Texturas dibujadas con código ----------
  function lienzo(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
  function textura(c, rep) {
    const t = new T.CanvasTexture(c);
    t.anisotropy = 4; if (T.sRGBEncoding) { t.encoding = T.sRGBEncoding; }
    if (rep) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
    return t;
  }
  function texCesped() {
    const c = lienzo(1024, 1024), g = c.getContext("2d");
    const m = 1024 / 80;                                   // píxeles por metro (80 x 80 m: x de -40 a 40, z de -20 a 60)
    const X = function (x) { return (x + 40) * m; }, Z = function (z) { return (z + 20) * m; };
    for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? "#2f8d3e" : "#38a34a"; g.fillRect(0, i * 64, 1024, 64); }
    for (let i = 0; i < 9000; i++) { g.fillStyle = "rgba(" + (i % 2 ? "255,255,255" : "0,40,0") + ",.05)"; g.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 5); }
    g.strokeStyle = "#f4f4f4"; g.lineWidth = 5; g.lineJoin = "round";
    function rect(x1, z1, x2, z2) { g.strokeRect(X(x1), Z(z1), (x2 - x1) * m, (z2 - z1) * m); }
    g.beginPath(); g.moveTo(X(-34), Z(GZ)); g.lineTo(X(-34), Z(60)); g.moveTo(X(34), Z(GZ)); g.lineTo(X(34), Z(60)); g.moveTo(X(-34), Z(GZ)); g.lineTo(X(34), Z(GZ)); g.stroke();
    rect(-20.16, GZ, 20.16, GZ + 16.5);                    // área grande
    rect(-9.16, GZ, 9.16, GZ + 5.5);                       // área chica
    g.beginPath(); g.arc(X(0), Z(0), 9.15 * m, Math.acos(5.5 / 9.15) , Math.PI - Math.acos(5.5 / 9.15)); g.stroke();   // medialuna
    g.fillStyle = "#fff"; g.beginPath(); g.arc(X(0), Z(0), 0.22 * m, 0, 7); g.fill();               // punto penal
    return textura(c);
  }
  function texRed() {
    const c = lienzo(256, 128), g = c.getContext("2d");
    g.strokeStyle = "rgba(255,255,255,.85)"; g.lineWidth = 2;
    for (let x = 0; x <= 256; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 128); g.stroke(); }
    for (let y = 0; y <= 128; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); }
    return textura(c);
  }
  function texCarteles() {
    const c = lienzo(2048, 128), g = c.getContext("2d"), cols = ["#e63946", "#1d6fe0", "#ffd166", "#2ec27e", "#ff9f1c", "#7b2cbf"];
    for (let i = 0; i < 8; i++) {
      g.fillStyle = cols[i % 6]; g.fillRect(i * 256, 0, 256, 128);
      g.fillStyle = i % 2 && i % 6 !== 2 ? "#fff" : "#10131f"; g.font = "900 62px Arial Black, Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText("ROMMEE", i * 256 + 128, 66);
    }
    return textura(c);
  }
  function texBalon() {
    const c = lienzo(512, 256), g = c.getContext("2d");
    g.fillStyle = "#fafafa"; g.fillRect(0, 0, 512, 256);
    g.fillStyle = "#16181f";
    const pts = [[64, 60], [192, 60], [320, 60], [448, 60], [128, 128], [256, 128], [384, 128], [0, 128], [512, 128], [64, 196], [192, 196], [320, 196], [448, 196], [256, 20], [256, 240]];
    pts.forEach(function (p) { g.beginPath(); for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * 2 * Math.PI / 5; g.lineTo(p[0] + Math.cos(a) * 30, p[1] + Math.sin(a) * 30); } g.closePath(); g.fill(); });
    g.strokeStyle = "rgba(60,60,60,.55)"; g.lineWidth = 3;
    pts.forEach(function (p, i) { const q = pts[(i * 5 + 3) % pts.length]; if (Math.abs(p[0] - q[0]) < 140 && Math.abs(p[1] - q[1]) < 90) { g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); } });
    return textura(c);
  }
  // Alias a las herramientas compartidas (datos/personaje3d.js)
  const texPublico = Per3D.texPublico, texBrillo = Per3D.texBrillo, texSombra = Per3D.texSombra, mat = Per3D.mat, figura = Per3D.figura;
  const aplicar = Per3D.aplicar, mezcla = Per3D.mezcla, suave = Per3D.suave, fotograma = Per3D.fotograma, P = Per3D.P;

  // Poses del jugador
  const MIRA = -0.9;                    // gira la cabeza hacia la cámara (su derecha)
  const P_ESPERA = P({ cab: MIRA, sL: 0.2, sR: -0.1, eL: 0.5, eR: 0.7, aL: 0.15, aR: 0.2 });
  const P_CARGA = P({ cab: MIRA * 0.5, hR: -0.25, kR: 0.6, hL: 0.2, kL: 0.3, incl: -0.12, sL: 0.5, sR: -0.5, eL: 0.9, eR: 0.9, aL: 0.5, aR: 0.5, bajo: 0.05 });
  function pCarrera(fase) {
    const s = Math.sin(fase), c = Math.cos(fase);
    return P({ hL: 0.75 * s, hR: -0.75 * s, kL: 0.15 + 1.0 * Math.max(0, c), kR: 0.15 + 1.0 * Math.max(0, -c), sL: -0.8 * s, sR: 0.8 * s, eL: 1.1, eR: 1.1, incl: 0.2, giro: 0.12 * s, cab: MIRA * 0.15, bajo: 0.02 + 0.03 * Math.abs(c), aL: 0.1, aR: 0.1 });
  }
  const K_PLANTA = P({ hL: 0.3, kL: 0.3, hR: -0.5, kR: 1.0, incl: 0.1, sL: 0.7, sR: -0.5, eL: 0.6, eR: 0.6, aL: 0.6, aR: 0.4, bajo: 0.06, cab: 0 });
  const K_ATRAS = P({ hL: 0.25, kL: 0.4, hR: -1.0, kR: 1.7, incl: -0.05, giro: 0.25, sL: 0.9, sR: -0.7, eL: 0.4, eR: 0.5, aL: 0.9, aR: 0.6, bajo: 0.08, cab: 0 });
  const K_GOLPE = P({ hL: 0.2, kL: 0.45, hR: 1.2, kR: 0.12, incl: 0.2, giro: -0.3, sL: -0.5, sR: 0.8, eL: 0.5, eR: 0.5, aL: 0.8, aR: 0.4, bajo: 0.1, cab: 0 });
  const K_SIGUE = P({ hL: 0.1, kL: 0.2, hR: 1.45, kR: 0.5, incl: 0.28, giro: -0.4, sL: -0.6, sR: 0.9, eL: 0.6, eR: 0.5, aL: 0.9, aR: 0.4, bajo: 0.0, cab: 0 });
  const K_FIN = P({ hL: 0, kL: 0.05, hR: 0.1, kR: 0.2, incl: 0, giro: 0, sL: 2.6, sR: 2.6, eL: 0.2, eR: 0.2, aL: 0.5, aR: 0.5, cab: MIRA });

  function posePateo(u) {
    if (u < 0.9) { return pCarrera(u * 2 * Math.PI * 1.45); }
    if (u < 1.0) { return mezcla(pCarrera(0.9 * 2 * Math.PI * 1.45), K_PLANTA, suave((u - 0.9) / 0.1)); }
    return fotograma([[1.0, K_PLANTA], [1.14, K_ATRAS], [1.26, K_GOLPE], [1.55, K_SIGUE]], u);
  }
  // Festejo: corre con los brazos arriba
  function pFesteja(fase) {
    return Object.assign(pCarrera(fase), { sL: 2.7 + 0.2 * Math.sin(fase), sR: 2.7 - 0.2 * Math.sin(fase), eL: 0.3, eR: 0.3, aL: 0.6, aR: 0.6, incl: -0.08, giro: 0, cab: 0, bajo: 0.02 + 0.04 * Math.abs(Math.cos(fase)) });
  }
  const P_LAMENTO = P({ sL: 2.9, sR: 2.9, eL: 2.3, eR: 2.3, aL: 0.45, aR: 0.45, incl: 0.3, cab: 0.2, bajo: 0.05 });
  // Pose del arquero: de pie con las rodillas flexionadas / lanzándose
  const G_ESPERA = P({ hL: 0.5, hR: 0.5, kL: 0.8, kR: 0.8, incl: 0.2, sL: 0.5, sR: 0.5, eL: 1.0, eR: 1.0, aL: 0.95, aR: 0.95, bajo: 0.18 });
  const G_VUELO = P({ hL: 0.1, hR: 0.5, kL: 0.2, kR: 0.8, incl: 0, sL: 3.0, sR: 3.0, eL: 0.1, eR: 0.1, aL: 0.15, aR: 0.15, bajo: 0.0 });

  // ---------- Armado de la escena ----------
  function construir() {
    escena = new T.Scene(); escena.background = new T.Color(0x070b1a);
    cam = new T.PerspectiveCamera(40, 1.6, 0.1, 400);
    escena.add(new T.AmbientLight(0xdfe8ff, 0.95));
    const sol = new T.DirectionalLight(0xffffff, 0.75); sol.position.set(-12, 25, 18); escena.add(sol);
    const sol2 = new T.DirectionalLight(0x99aaff, 0.3); sol2.position.set(14, 10, -10); escena.add(sol2);
    // césped
    const cesp = new T.Mesh(new T.PlaneGeometry(80, 80), new T.MeshLambertMaterial({ map: texCesped() }));
    cesp.rotation.x = -Math.PI / 2; cesp.position.set(0, 0, 20); escena.add(cesp);
    const piso = new T.Mesh(new T.PlaneGeometry(400, 400), mat(0x1c5a29)); piso.rotation.x = -Math.PI / 2; piso.position.set(0, -0.02, 0); escena.add(piso);
    // tribunas con público (una "olla" alrededor)
    const olla = new T.Mesh(new T.CylinderGeometry(78, 48, 22, 64, 1, true), new T.MeshBasicMaterial({ map: texPublico(), side: T.BackSide, color: 0xdddddd }));
    olla.position.set(0, 11, 0); escena.add(olla);
    const techo = new T.Mesh(new T.CylinderGeometry(80, 80, 3, 64, 1, true), mat(0x0a0c16, { side: T.BackSide })); techo.position.set(0, 24, 0); escena.add(techo);
    // carteles publicitarios
    const cart = texCarteles(), cm = new T.MeshBasicMaterial({ map: cart });
    const cf = new T.Mesh(new T.BoxGeometry(76, 1.0, 0.2), cm); cf.position.set(0, 0.5, GZ - 6.5); cf.material.map.repeat.set(2, 1); cf.material.map.wrapS = T.RepeatWrapping; escena.add(cf);
    [-38, 38].forEach(function (x) { const cl = new T.Mesh(new T.BoxGeometry(0.2, 1.0, 100), new T.MeshBasicMaterial({ color: 0x1d6fe0 })); cl.position.set(x, 0.5, 38); escena.add(cl); });
    // reflectores
    const br = texBrillo();
    [[-52, 30, -44], [52, 30, -44], [-60, 30, 20], [60, 30, 20], [0, 32, -70]].forEach(function (p) {
      const s = new T.Sprite(new T.SpriteMaterial({ map: br, blending: T.AdditiveBlending, transparent: true, depthWrite: false })); s.position.set(p[0], p[1], p[2]); s.scale.set(36, 36, 1); escena.add(s);
    });
    // arco (postes, travesaño y red)
    const blanco = new T.MeshPhongMaterial({ color: 0xffffff, shininess: 70 });
    const arco = new T.Group(); arco.position.set(0, 0, GZ);
    [-3.66, 3.66].forEach(function (x) { const p = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 2.44, 14), blanco); p.position.set(x, 1.22, 0); arco.add(p); });
    const tr = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 7.44, 14), blanco); tr.rotation.z = Math.PI / 2; tr.position.set(0, 2.44, 0); arco.add(tr);
    const tred = texRed(), mr = function (rx, ry) { const m = new T.MeshBasicMaterial({ map: tred.clone(), transparent: true, opacity: 0.5, side: T.DoubleSide, depthWrite: false }); m.map.wrapS = m.map.wrapT = T.RepeatWrapping; m.map.repeat.set(rx, ry); m.map.needsUpdate = true; return m; };
    const inv = new T.MeshBasicMaterial({ visible: false });
    red = new T.Mesh(new T.BoxGeometry(7.32, 2.44, 2.0), [mr(2, 3), mr(2, 3), mr(10, 2), inv, inv, mr(10, 3)]);
    red.position.set(0, 1.22, -1.0); arco.add(red);
    marca = new T.Mesh(new T.RingGeometry(0.26, 0.4, 36), new T.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: 0.95, side: T.DoubleSide, depthTest: false, depthWrite: false }));
    marca.renderOrder = 20; marca.visible = false; marca.position.z = GZ + 0.12; escena.add(marca);       // anillo dorado que marca a dónde apuntaste
    huella = new T.Mesh(new T.SphereGeometry(BALON_R * 1.35, 14, 10), new T.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0, depthWrite: false })); huella.visible = false; escena.add(huella);
    [-3.66, 3.66].forEach(function (x) { const pp = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, 2.5, 8), blanco); pp.position.set(x, 1.22, -2.0); arco.add(pp); });
    escena.add(arco);
    // punto penal ya está dibujado en el césped; pelota
    balon = new T.Mesh(new T.SphereGeometry(BALON_R, 24, 18), new T.MeshPhongMaterial({ map: texBalon(), shininess: 40 })); escena.add(balon);
    sombraBalon = new T.Mesh(new T.PlaneGeometry(0.5, 0.5), new T.MeshBasicMaterial({ map: texSombra(), transparent: true, depthWrite: false })); sombraBalon.rotation.x = -Math.PI / 2; escena.add(sombraBalon);
    // jugadores: el que patea es el personaje del usuario; ROMME alienta al costado del arco
    ponerJugador(typeof perfil !== "undefined" ? perfil : {});
    keeper = figura({ piel: 0xc98f66, pelo: 0x2a1a10, camisa: 0xe8c200, short: 0x1b1b1b, media: 0x1b1b1b, guante: 0x39d353, mangaLarga: true, bota: 0x222222 });
    keeper.raiz.position.set(0, 0, GZ + 0.35); escena.add(keeper.raiz);
    romme = Per3D.figuraDePerfil(Per3D.ROMME); romme.raiz.position.set(-6.6, 0, GZ - 1.4); romme.raiz.scale.setScalar(1.12); escena.add(romme.raiz);
    listo = true;
  }
  function ponerJugador(p) {
    const f = Per3D.firma(p || {});
    if (kicker && f === firmaJugador) { return; }
    if (kicker) { escena.remove(kicker.raiz); }
    firmaJugador = f; kicker = Per3D.figuraDePerfil(p || {});
    kicker.raiz.rotation.y = Math.PI; escena.add(kicker.raiz);
  }
  const CAM0 = new T.Vector3(2.5, 1.5, 7.4), LOOK0 = new T.Vector3(0.1, 1.1, -1.2);
  let fovBase = 50;
  function zoom(k) { cam.fov = fovBase * k; cam.updateProjectionMatrix(); }
  function ponerCamara(pos, mira) { cam.position.copy(pos); cam.lookAt(mira); cam.updateMatrixWorld(); }
  function animarRomme(ts) {
    const a = Math.sin(ts / 170), r = romme;
    Per3D.aplicar(r, P({ sL: 2.75 + 0.3 * a, sR: 2.75 - 0.3 * a, eL: 0.25, eR: 0.25, aL: 0.55, aR: 0.55, hL: 0.1 * a, hR: -0.1 * a, kL: 0.2, kR: 0.2, cab: 0.2 * Math.sin(ts / 400) }));
    r.raiz.position.y = Math.abs(Math.sin(ts / 240)) * 0.14;
  }
  function crearRenderer(cvx) {
    R = new T.WebGLRenderer({ canvas: cvx, antialias: true, alpha: false, powerPreference: "high-performance" });
    if (T.sRGBEncoding) { R.outputEncoding = T.sRGBEncoding; }
  }
  function medir() {
    DPR = Math.min(1.6, window.devicePixelRatio || 1); W = window.innerWidth; H = window.innerHeight;
    R.setPixelRatio(DPR); R.setSize(W, H, false);
    cam.aspect = W / H;
    const hf = 60 * Math.PI / 180;                           // abertura horizontal fija, así el arco siempre se ve entero
    cam.fov = Math.min(80, 2 * Math.atan(Math.tan(hf / 2) / cam.aspect) * 180 / Math.PI);
    fovBase = cam.fov; cam.updateProjectionMatrix();
    ponerCamara(CAM0, LOOK0);
  }
  // Punto delante de la cámara donde la pelota se ve grande, en el centro (donde nace la ruleta)
  function puntoFrente() {
    const R1 = Math.min(W, H) * 0.21, f = (H / 2) / Math.tan(cam.fov * Math.PI / 360), d = BALON_R * f / R1;
    const dir = new T.Vector3(0, 0.08, 0.5).unproject(cam).sub(cam.position).normalize();
    return cam.position.clone().add(dir.multiplyScalar(d));
  }
  return {
    listo: function () { return listo; },
    preparar: function (cvx) {
      if (!R) { crearRenderer(cvx); }
      else if (R.domElement !== cvx) { throw new Error("un solo lienzo"); }
      if (!listo) { construir(); }
      medir();
    },
    renderer: function () { return R; },
    medir: medir,
    puntoFrente: puntoFrente,
    dibujar: function () { R.render(escena, cam); },
    ponerJugador: ponerJugador, ponerCamara: ponerCamara, zoom: zoom, animarRomme: animarRomme, CAM0: CAM0, LOOK0: LOOK0,
    kicker: function () { return kicker; }, keeper: function () { return keeper; }, balon: function () { return balon; }, sombraBalon: function () { return sombraBalon; }, red: function () { return red; }, huella: function () { return huella; }, marca: function () { return marca; },
    cam: function () { return cam; }, GZ: GZ, BALON_R: BALON_R,
    aplicar: aplicar, pose: { ESPERA: P_ESPERA, CARGA: P_CARGA, LAMENTO: P_LAMENTO, GK_ESPERA: G_ESPERA, GK_VUELO: G_VUELO }, posePateo: posePateo, pFesteja: pFesteja, mezcla: mezcla, suave: suave
  };
})();

// =====================================================================
//  Controlador: misma forma que la patada 2D (Patada), pero en 3D.
//  cv = lienzo que se reemplaza, btn = botón PATEA, relleno = barra de fuerza,
//  cuando(fuerza) = cuando la pelota llega a primer plano, alSoltar() = al soltar,
//  panel = pantalla que muestra la ruleta (se oculta hasta que llega la pelota)
// =====================================================================
const TXT_ZONA = {
  es: { elegi: "👆 ELEGÍ DÓNDE PATEAR", legend: "★ = premio: más estrellas, más riesgo", apuntas: "🎯 Apuntás: ", listo: "¡Apretá PATEA con la línea en el verde!", f: ["Abajo", "Arriba"], c: ["Izquierda", "Centro", "Derecha"], sin: "¡Primero elegí una zona del arco!" },
  en: { elegi: "👆 PICK WHERE TO SHOOT", legend: "★ = reward: more stars, more risk", apuntas: "🎯 Aiming: ", listo: "Press KICK with the line in the green!", f: ["Bottom", "Top"], c: ["Left", "Center", "Right"], sin: "Pick a zone of the goal first!" },
  pt: { elegi: "👆 ESCOLHA ONDE CHUTAR", legend: "★ = prêmio: mais estrelas, mais risco", apuntas: "🎯 Mira: ", listo: "Aperte CHUTA com a linha no verde!", f: ["Baixo", "Alto"], c: ["Esquerda", "Centro", "Direita"], sin: "Escolha primeiro uma zona do gol!" },
  it: { elegi: "👆 SCEGLI DOVE TIRARE", legend: "★ = premio: più stelle, più rischio", apuntas: "🎯 Mira: ", listo: "Premi TIRA con la linea nel verde!", f: ["Basso", "Alto"], c: ["Sinistra", "Centro", "Destra"], sin: "Prima scegli una zona della porta!" }
};
function txtZona() { return TXT_ZONA[(typeof ajustes !== "undefined" && ajustes.idioma) || "es"] || TXT_ZONA.es; }
function PatadaPenal(cv, btn, relleno, cuando, alSoltar, panel) {
  const M = PenalMundo, T = THREE;
  const ZX = [-2.55, 0, 2.55], ZY = [0.5, 1.95];          // dónde queda cada zona del arco (metros): columnas izq/centro/der y filas abajo/arriba
  // Cámaras: 1) APUNTAR: de frente al arco (el pateador queda detrás de la cámara, no se ve). 2) SUBE: se aleja y rodea hasta quedar detrás del pateador. 3) PATADA: sigue la jugada desde atrás del pateador.
  const CAMF = new T.Vector3(0, 1.45, -1.6), LOOKF = new T.Vector3(0, 1.3, -11), CAMP_ = new T.Vector3(5.0, 2.6, -0.5), CAMP = new T.Vector3(3.0, 1.8, 6.2);
  const G = 5.0, FIN = { gol: 2.9, ataja: 2.5, afuera: 2.1 };   // gravedad de la pelota y cuánto dura la escena después del golpe (en tiempo de jugada)
  let zonaSel = null, keeperTarde = false, impacto = false, tSube = 0, opPenal = null;
  let giroIni = 1.25, est = "off", raf = 0, ts0 = 0, tSuelta = 0, fija = 0, zIni = 2.9, lado = 1, destino = new T.Vector3(), dur = 0.6, res = null;
  const bv = new T.Vector3();
  const BAR = BarraTiming.crear(relleno.parentNode, relleno);
  const rt = document.createElement("div"); rt.className = "resPenal"; if (panel) { panel.appendChild(rt); }
  // ---------- Las 6 zonas del arco para apuntar (botones transparentes encima del arco 3D) ----------
  const zon = document.createElement("div"); zon.className = "zonasTiro"; if (panel) { panel.appendChild(zon); }
  const hint = document.createElement("div"); hint.className = "hintZona"; zon.appendChild(hint);
  const zb = [], ESTRELLAS = [["★★", "★", "★★"], ["★★★", "★★", "★★★"]];       // premio de cada zona (fila 0 abajo, fila 1 arriba)
  [1, 0].forEach(function (f) { [0, 1, 2].forEach(function (c) {
    const b = document.createElement("button"); b.type = "button"; b.className = "zonaT"; b.dataset.c = c; b.dataset.f = f; b.textContent = ESTRELLAS[f][c];
    b.addEventListener("pointerdown", function (e) { e.stopPropagation(); if (e.preventDefault) { e.preventDefault(); } elegirZona(c, f); });
    zon.appendChild(b); zb.push(b);
  }); });
  function pintarZonas() {
    const t = txtZona();
    zb.forEach(function (b) { b.classList.toggle("sel", !!zonaSel && +b.dataset.c === zonaSel.c && +b.dataset.f === zonaSel.f); });
    hint.className = "hintZona";
    hint.innerHTML = zonaSel ? t.apuntas + t.f[zonaSel.f] + " · " + t.c[zonaSel.c] + "<small>" + t.listo + "</small>" : t.elegi + "<small>" + t.legend + "</small>";
  }
  function avisarZona() { hint.className = "hintZona alerta"; zon.classList.remove("late"); void zon.offsetWidth; zon.classList.add("late"); }
  // Tocaste una zona: queda marcada y la cámara se aleja para mostrar al jugador de espaldas y la barra
  function elegirZona(c, f) {
    if (est !== "apunta") { return; }
    zonaSel = { c: c, f: f }; pintarZonas();
    const mk = M.marca(); mk.position.set(ZX[c], ZY[f], M.GZ + 0.12); mk.visible = true;
    est = "sube"; tSube = ts0;
    zon.classList.remove("m-apunta"); if (panel) { panel.classList.remove("apunta"); }
    BAR.iniciar(opPenal);
  }
  function ubicarZonas() {                                           // proyecta el arco 3D a la pantalla para que cada botón quede justo sobre su zona
    const c = lienzo(); if (!c || !panel || !M.listo()) { return; }
    const cam = M.cam(); cam.updateMatrixWorld();
    const cr = c.getBoundingClientRect(), zr = zon.getBoundingClientRect(), v = new T.Vector3();
    if (!zr.width) { return; }
    function pt(x, y) { v.set(x, y, M.GZ).project(cam); return [cr.left + (v.x + 1) / 2 * cr.width - zr.left, cr.top + (1 - v.y) / 2 * cr.height - zr.top]; }
    zb.forEach(function (b) {
      const c0 = +b.dataset.c, f = +b.dataset.f, x0 = -3.66 + c0 * 2.44, x1 = x0 + 2.44, y0 = f * 1.22, y1 = y0 + 1.22;
      const p = [pt(x0, y0), pt(x1, y0), pt(x0, y1), pt(x1, y1)], xs = p.map(function (a) { return a[0]; }), ys = p.map(function (a) { return a[1]; });
      const L = Math.min.apply(null, xs), Rr = Math.max.apply(null, xs), Tt = Math.min.apply(null, ys), Bb = Math.max.apply(null, ys);
      b.style.left = L.toFixed(1) + "px"; b.style.top = Tt.toFixed(1) + "px"; b.style.width = (Rr - L).toFixed(1) + "px"; b.style.height = (Bb - Tt).toFixed(1) + "px";
    });
  }
  function lienzo() { return M.renderer() ? M.renderer().domElement : null; }
  function ponerPelotaEnElPunto() {
    M.balon().position.set(0, M.BALON_R, 0); M.balon().rotation.set(0, 0, 0);
    M.sombraBalon().position.set(0, 0.015, 0); M.sombraBalon().scale.set(0.9, 0.9, 1); M.sombraBalon().visible = true;
  }
  function sombrasFiguras() {
    const k = M.kicker(), g = M.keeper();
    k.sombra.scale.set(0.9, 0.9, 1); g.sombra.scale.set(0.9, 0.9, 1);
    g.sombra.position.set(0, 0.012, 0); k.sombra.position.set(0, 0.012, 0);
  }
  // Dónde va la pelota: a la zona que elegiste (si es gol entra ahí, si ataja el arquero llega ahí, si es afuera se va por arriba o al costado)
  function elegirTiro(r) {
    const t = r.tiro, jx = (Math.random() - 0.5) * 0.5, jy = (Math.random() - 0.5) * 0.3;
    lado = t.c === 0 ? -1 : (t.c === 2 ? 1 : (Math.random() < 0.5 ? -1 : 1));
    if (r.res === "gol") { destino.set(ZX[t.c] + jx, ZY[t.f] + jy, M.GZ - 0.5 - Math.random() * 0.5); }
    else if (r.res === "ataja") { destino.set(ZX[t.c] + jx * 0.4, ZY[t.f] + jy * 0.4, M.GZ + 0.5); }
    else if (t.f === 1) { destino.set(ZX[t.c] + jx, 3.0 + Math.random() * 0.6, M.GZ - 0.4); }           // arriba: por encima del travesaño
    else { destino.set(lado * (4.5 + Math.random() * 1.0), 0.6 + Math.random() * 1.2, M.GZ - 0.4); }    // abajo: pasa al costado del palo
    keeperTarde = r.res === "gol" && r.keeper.c === t.c && r.keeper.f === t.f;                        // adivinó la zona pero el tiro era muy bueno: llega tarde
    impacto = false;
  }
  function esperaKeeper(ts) {
    const g = M.keeper(), s = Math.sin(ts / 520);
    g.raiz.position.set(s * 0.45, 0, M.GZ + 0.35); g.raiz.rotation.set(0, 0, 0);
    M.aplicar(g, M.mezcla(M.pose.GK_ESPERA, M.pose.GK_ESPERA, 0));
    g.sombra.position.x = 0;
  }
  function moverKeeper(ub, ts) {        // ub = segundos desde que la pelota sale del pie. El arquero se tira a SU zona (al azar)
    const g = M.keeper();
    if (ub < 0.08) { esperaKeeper(ts); return; }
    const kc = res.keeper.c, alto = res.keeper.f === 1, dir = kc - 1;     // dir: -1 izquierda, 0 centro, 1 derecha
    const k = M.suave((ub - 0.05) / (dur * (keeperTarde ? 1.5 : 0.9)));
    if (dir !== 0) {
      g.raiz.position.set(ZX[kc] * k, (alto ? 0.95 : 0.35) * Math.sin(Math.min(1, k) * Math.PI) * (keeperTarde ? 0.7 : 1) + (alto ? 0.25 * k : 0), M.GZ + 0.35);
      g.raiz.rotation.set(0, 0, -dir * (alto ? 1.0 : 1.35) * k);
      M.aplicar(g, M.mezcla(M.pose.GK_ESPERA, M.pose.GK_VUELO, k));
    } else {                                                              // al medio: salta con los brazos arriba o se agacha
      g.raiz.position.set(Math.sin(ts / 520) * 0.45 * (1 - k), (alto ? 0.7 : 0.0) * Math.sin(Math.min(1, k) * Math.PI), M.GZ + 0.35);
      g.raiz.rotation.set(0, 0, 0);
      M.aplicar(g, M.mezcla(M.pose.GK_ESPERA, M.pose.GK_VUELO, (alto ? 1 : 0.4) * k));
    }
  }
  // Después del golpe la pelota sigue sola: queda en la red (gol), rebota lejos de las manos (ataja) o sigue de largo (afuera)
  function iniciarLibre(r) {
    const sg = destino.x >= 0 ? 1 : -1;
    if (r === "gol") { bv.set(destino.x / dur * 0.08, 0.3, -2.4); }
    else if (r === "ataja") { bv.set(sg * (1.2 + Math.random() * 1.6), 2.2 + Math.random() * 1.4, 3.8 + Math.random() * 2.0); }
    else { bv.set(destino.x / dur * 0.85, (destino.y - M.BALON_R - 1.4) / dur * 0.9, destino.z / dur * 0.8); }
  }
  function integrar(du, r) {
    const b = M.balon(), p = b.position, R = M.BALON_R;
    bv.y -= G * du; p.x += bv.x * du; p.y += bv.y * du; p.z += bv.z * du;
    if (r === "gol") {                                                   // adentro de la red: no puede salir
      if (p.z < M.GZ - 1.85) { p.z = M.GZ - 1.85; bv.z *= -0.15; bv.x *= 0.6; }
      if (p.x > 3.45) { p.x = 3.45; bv.x *= -0.2; } if (p.x < -3.45) { p.x = -3.45; bv.x *= -0.2; }
      if (p.y > 2.3) { p.y = 2.3; bv.y = -Math.abs(bv.y) * 0.2; }
    } else if (p.z < M.GZ - 5.9) { p.z = M.GZ - 5.9; bv.z *= -0.25; bv.x *= 0.7; }      // el cartel de atrás frena la pelota
    if (p.y < R) {
      p.y = R;
      if (bv.y < 0) { bv.y = -bv.y * 0.45; if (bv.y < 0.9) { bv.y = 0; } bv.x *= 0.82; bv.z *= 0.82; }
      if (bv.y === 0) { const f = Math.exp(-1.6 * du); bv.x *= f; bv.z *= f; }               // rueda y se va frenando
    }
    b.rotation.x += bv.z * du / R * 0.9; b.rotation.z -= bv.x * du / R * 0.9;
    M.sombraBalon().visible = true; M.sombraBalon().position.set(p.x, 0.015, p.z); M.sombraBalon().scale.setScalar(0.9 * (1 - 0.5 * Math.min(1, p.y / 2)));
  }
  const UG = 1.22, LENTO = 1.6, VEL = 1.5;   // VEL: ritmo general de la jugada (carrera, patada, vuelo)   // LENTO: cámara lenta del vuelo
  let tPrev = 0, miraAct = new T.Vector3();
  const _pc = new T.Vector3(), _bz = new T.Vector3(), _ob = new T.Vector3(), _pa = new T.Vector3();
  function bezier(a, c, b2, t) { const m = 1 - t; return _bz.set(m * m * a.x + 2 * m * t * c.x + t * t * b2.x, m * m * a.y + 2 * m * t * c.y + t * t * b2.y, m * m * a.z + 2 * m * t * c.z + t * t * b2.z); }
  function mostrarRes(r) {
    const d = (typeof L === "function") ? L() : {};
    rt.textContent = r === "gol" ? (d.resGol || "¡GOOOL!") : (r === "ataja" ? (d.resAtaja || "¡LO ATAJÓ!") : (d.resAfuera || "¡AFUERA!"));
    rt.className = "resPenal ver " + r;
  }
  function cuadro(ts) {
    const dtc = Math.min(0.05, Math.max(0, (ts - (tPrev || ts)) / 1000)); tPrev = ts;
    ts0 = ts; if (est === "off" || est === "fin") { return; }
    const k = M.kicker(), b = M.balon(), mk = M.marca();
    M.animarRomme(ts);
    if (mk.visible) { const sc = 1 + 0.12 * Math.sin(ts / 160); mk.scale.set(sc, sc, 1); }
    if (est === "apunta" || est === "sube" || est === "espera") {
      k.raiz.position.set(0, 0, zIni); k.raiz.rotation.y = Math.PI - 1.25; M.aplicar(k, Object.assign({}, M.pose.ESPERA, { bajo: Math.sin(ts / 700) * 0.012 }));
      esperaKeeper(ts); M.zoom(1);
      if (est === "apunta") { M.ponerCamara(CAMF, LOOKF); }
      else if (est === "sube") {                                         // la cámara se aleja y rodea hasta quedar detrás del pateador
        const t = (ts - tSube) / 1000, e = M.suave((t - 0.3) / 1.2);
        M.ponerCamara(bezier(CAMF, CAMP_, M.CAM0, e), _ob.copy(LOOKF).lerp(M.LOOK0, e));
        if (t >= 1.6) { est = "espera"; btn.classList.remove("apagado"); }
      } else { M.ponerCamara(M.CAM0, M.LOOK0); BAR.actualizar(ts); }
    } else if (est === "patada") {
      const u = (ts - tSuelta) / 1000 * VEL, zK = 0.62, gol = res.res === "gol", tImp = UG + dur, uR = Math.max(1.55, tImp - 0.1);
      const zBase = function (x) { return zK - 0.15 - 0.3 * Math.min(1, (x - 1.6) / 1.5); };
      let zz, yy = 0;
      if (u < 1.0) { zz = zIni + (zK - zIni) * M.suave(u / 1.0); }
      else if (u < 1.6) { zz = zK - (u - 1.0) * 0.25; if (u > 1.3 && u < 1.55) { yy = 0.08 * Math.sin((u - 1.3) / 0.25 * Math.PI); } }
      else if (gol && u > uR) { const v = Math.min(u - uR, 1.8); zz = zBase(uR) - 1.45 * v - 1.45 * v * v; yy = 0.06 * Math.abs(Math.sin(v * 9)); }   // festeja corriendo hacia el arco
      else { zz = zBase(u); }
      let xx = 0, vdir = res.tiro.c === 2 ? -1 : 1;                      // al festejar se abre hacia el costado contrario al de la jugada, así no tapa la pelota
      if (gol && u > uR) { xx = vdir * 3.0 * M.suave((u - uR) / 1.6); }
      k.raiz.position.set(xx, yy, zz);
      k.raiz.rotation.y = Math.PI - giroIni * (1 - M.suave(u / 0.4)) - (gol && u > uR ? vdir * 0.6 * M.suave((u - uR) / 0.5) : 0);
      let pz = M.posePateo(Math.min(u, 1.55));
      if (u > uR) { pz = gol ? M.mezcla(pz, M.pFesteja((u - uR) * 2 * Math.PI * 1.9), M.suave((u - uR) / 0.4)) : M.mezcla(pz, M.pose.LAMENTO, M.suave((u - uR) / 0.6)); }
      M.aplicar(k, pz);
      const uBalon = u - UG;
      moverKeeper(Math.max(0, uBalon), ts);
      const H = M.huella();
      if (uBalon >= 0) {
        if (uBalon < dur) {                                  // vuelo hacia el arco
          const t = uBalon / dur, y0 = M.BALON_R;
          b.position.set(destino.x * t, y0 + (destino.y - y0) * t + 0.9 * Math.sin(t * Math.PI) * (1 - 0.5 * t), destino.z * t);
          M.sombraBalon().position.set(b.position.x, 0.015, b.position.z); M.sombraBalon().scale.setScalar(0.9 * (1 - 0.5 * Math.min(1, b.position.y / 2)));
          b.rotation.x += 0.4; b.rotation.y += 0.25;
        } else {                                              // golpea la red / las manos del arquero y la pelota sigue sola
          const t2 = uBalon - dur, r = res.res;
          if (!impacto) { impacto = true; b.position.copy(destino); iniciarLibre(r); mostrarRes(r); }
          integrar(dtc * VEL, r);
          if (t2 > 1.7) { rt.className = "resPenal"; }
          if (r === "gol" && t2 < 0.55) {                    // la red se estira y marca la forma de la pelota
            const kk = Math.sin(Math.min(1, t2 / 0.55) * Math.PI), sq = Math.min(1, t2 / 0.12);
            M.red().scale.z = 1 + 0.3 * kk; H.visible = true; H.material.opacity = 0.85 * (1 - t2 / 0.55) * sq;
            H.position.set(destino.x, destino.y, destino.z - 0.12 - 0.1 * kk); H.scale.set(1 + 0.25 * kk, 1 + 0.25 * kk, 0.7 + 0.5 * kk);
          } else { M.red().scale.z = 1; H.visible = false; }
          if (t2 > FIN[r] && est === "patada") { est = "llegada"; terminar(); }
        }
      } else { b.position.set(0, M.BALON_R, 0); }
      // cámara desde atrás del pateador: lo sigue, se acerca despacio y después del golpe mira cómo queda todo en el arco
      const p1 = M.suave(u / (tImp + 0.6));
      _pc.copy(M.CAM0).lerp(CAMP, p1);
      const w = M.suave(uBalon / (dur * 0.5)); _ob.copy(M.LOOK0).lerp(_pa.set(b.position.x, b.position.y + 0.1, b.position.z), w);
      if (uBalon > dur) { _pa.set(destino.x * 0.08, 1.15, M.GZ + 0.5); _ob.lerp(_pa, M.suave((uBalon - dur) / 0.7)); }
      miraAct.lerp(_ob, 1 - Math.exp(-dtc * 6));
      M.ponerCamara(_pc, miraAct); M.zoom(1 - 0.30 * M.suave((u - 0.5) / (tImp - 0.1)) - 0.04 * M.suave((uBalon - dur) / 1.2));
    }
    M.dibujar();
    if (est !== "fin" && est !== "off") { raf = requestAnimationFrame(cuadro); }
  }
  function terminar(rapido) {
    const c = lienzo(); rt.className = "resPenal"; M.marca().visible = false;
    if (panel) { panel.classList.remove("pre", "apunta"); const fl = document.createElement("div"); fl.className = "flashPenal"; panel.appendChild(fl); setTimeout(function () { if (fl.parentNode) { fl.parentNode.removeChild(fl); } }, 900); }
    cuando(fija, res);                                 // aparece la ruleta (y empieza a girar)
    if (c) { c.style.transition = "opacity " + (rapido ? ".15s" : ".6s") + " ease-in"; c.style.opacity = "0"; }
    setTimeout(function () { est = "fin"; if (c) { c.style.display = "none"; } }, rapido ? 180 : 650);
  }
  const NOM_ZONA = function () { return (typeof L === "function" && L().zonas) || null; };
  function patear() {                                  // se apretó PATEA: la línea se frena donde está
    if (est === "apunta") { avisarZona(); return; }    // todavía falta elegir a dónde patear
    if (est !== "espera") { return; }
    const r = BAR.parar(NOM_ZONA());
    if (!r) { return; }
    res = BarraTiming.resolverTiro(zonaSel, r); fija = Math.random(); est = "patada"; tSuelta = ts0; btn.disabled = true;
    zon.classList.add("oculta");
    dur = (0.62 - 0.22 * Math.random()) * LENTO; miraAct.copy(M.LOOK0);
    elegirTiro(res); alSoltar();
  }
  function saltar() {
    if (est !== "apunta" && est !== "sube" && est !== "espera" && est !== "patada") { return; }
    if (est !== "patada") { res = BarraTiming.resolverTiro(zonaSel || { c: Math.floor(Math.random() * 3), f: Math.floor(Math.random() * 2) }, { zona: "naranja" }); fija = Math.random(); alSoltar(); btn.disabled = true; BAR.detener(); zon.classList.add("oculta"); }
    est = "skip"; terminar(true);
  }
  const bs = document.createElement("button"); bs.className = "btnSaltar"; bs.type = "button";
  bs.addEventListener("pointerdown", function (e) { e.stopPropagation(); if (e.preventDefault) { e.preventDefault(); } saltar(); });
  bs.addEventListener("click", function (e) { e.stopPropagation(); });
  const fila = document.createElement("div"); fila.className = "filaPatea"; btn.parentNode.insertBefore(fila, btn); fila.appendChild(btn); fila.appendChild(bs);
  btn.addEventListener("pointerdown", function (e) { try { btn.setPointerCapture(e.pointerId); } catch (x) {} if (e.preventDefault) { e.preventDefault(); } patear(); });
  btn.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  btn.addEventListener("keydown", function (e) { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); patear(); } });
  window.addEventListener("resize", function () { if (est !== "off" && est !== "fin" && M.listo()) { M.medir(); M.zoom(1); if (est === "apunta") { M.ponerCamara(CAMF, LOOKF); ubicarZonas(); } } });
  return {
    reiniciar: function () {
      cancelAnimationFrame(raf);
      try { M.preparar(window.__lienzoPenal || (window.__lienzoPenal = document.createElement("canvas"))); } catch (e) { return false; }
      M.ponerJugador(typeof perfil !== "undefined" ? perfil : {}); M.zoom(1);
      const c = lienzo();
      if (c.parentNode !== cv.parentNode || c.nextSibling !== cv) { cv.parentNode.insertBefore(c, cv); }
      c.className = "cvPatada gl"; c.style.display = "block"; c.style.transition = "none"; c.style.opacity = "1";
      cv.style.display = "none";
      if (panel) { panel.classList.add("penal", "pre", "apunta"); }
      bs.textContent = (typeof L === "function" && L().saltar) || "Skip ⏭";
      zonaSel = null; impacto = false; opPenal = opcionesPenal();
      zon.className = "zonasTiro m-apunta"; pintarZonas(); M.marca().visible = false;
      M.medir(); M.zoom(1); M.ponerCamara(CAMF, LOOKF);
      est = "apunta"; res = null; btn.disabled = false; btn.classList.add("apagado"); zIni = 2.9; giroIni = 1.25; rt.className = "resPenal"; tPrev = 0;
      BAR.detener();
      ponerPelotaEnElPunto(); sombrasFiguras(); M.red().scale.z = 1; M.huella().visible = false; M.keeper().raiz.visible = true; M.keeper().raiz.rotation.set(0, 0, 0);
      raf = requestAnimationFrame(cuadro); ubicarZonas();
    },
    detener: function () {
      cancelAnimationFrame(raf); est = "off"; BAR.detener(); rt.className = "resPenal"; try { M.marca().visible = false; } catch (e) {}
      const c = lienzo(); if (c && c.parentNode === cv.parentNode) { c.style.display = "none"; }
      if (panel) { panel.classList.remove("penal", "pre", "apunta"); }
    },
    estado: function () { return est; }
  };
}

// Elige 3D si se puede, y si no (o si falla al armarse), usa la patada 2D de siempre
function PatadaAuto(cv, btn, relleno, cuando, alSoltar, panel) {
  let p3 = null, p2 = null, uso = null;
  if (PENAL3D_OK) { try { p3 = PatadaPenal(cv, btn, relleno, cuando, alSoltar, panel); } catch (e) { p3 = null; } }
  return {
    reiniciar: function () {
      if (p3) { if (p3.reiniciar() !== false) { uso = p3; return; } p3 = null; }
      if (!p2) { p2 = Patada(cv, btn, relleno, cuando, alSoltar); }
      cv.style.display = ""; uso = p2; p2.reiniciar();
    },
    detener: function () { if (uso) { uso.detener(); } },
    estado: function () { return uso ? uso.estado() : "off"; }
  };
}
