// =====================================================================
//  PERSONAJES EN 3D (three.js)
//  - figura(): muñeco articulado armado con formas simples
//  - figuraDePerfil(): arma el personaje a partir de lo que eligió el usuario
//    (piel, peinado, barba, camiseta, nombre y dorsal en la espalda)
//  - ROMME: el personaje fijo del creador del juego (ROMMEE 11)
//  - vistaPrevia(): visor 3D para la pantalla de creación
//  Las camisetas son diseños propios (no copian ninguna marca ni club).
// =====================================================================
const Per3D = (function () {
  const T = window.THREE;

  // ---------- Opciones que puede elegir el usuario ----------
  const PIELES = ["#ffe0c2", "#f1c27d", "#d9a066", "#a8693f", "#6b4129"];
  const COLORES = ["#0b0b0b", "#3b2417", "#6b4226", "#d9b24c", "#b5441f", "#a8a8a8", "#2a6fdb", "#e754a9"];
  const N_PELO = 10, N_BARBA = 7, N_CAMISA = 4;

  function lienzo(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
  function textura(c, rep) {
    const t = new T.CanvasTexture(c);
    t.anisotropy = 4; if (T.sRGBEncoding) { t.encoding = T.sRGBEncoding; }
    if (rep) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
    return t;
  }
  function mat(color, extra) { return new T.MeshLambertMaterial(Object.assign({ color: color }, extra || {})); }
  // ---------- Estilo anime: sombreado en escalones + contorno negro ----------
  let gradT = null;
  function grad() {
    if (!gradT) { gradT = new T.DataTexture(new Uint8Array([95, 95, 95, 255, 160, 160, 160, 255, 220, 220, 220, 255]), 3, 1, T.RGBAFormat); gradT.minFilter = gradT.magFilter = T.NearestFilter; gradT.generateMipmaps = false; gradT.needsUpdate = true; }
    return gradT;
  }
  function matTx(o) { return new T.MeshToonMaterial(Object.assign({ gradientMap: grad() }, o)); }
  function matT(color, extra) { return matTx(Object.assign({ color: color }, extra || {})); }
  function matB(color) { return new T.MeshBasicMaterial({ color: color }); }          // ojos: color plano, sin sombra
  let matCont = null;
  function contornear(raiz) {                                                           // casco invertido: copia más grande, negra, que solo se ve por detrás
    if (!matCont) {
      matCont = new T.ShaderMaterial({ side: T.BackSide, uniforms: { grosor: { value: 0.0085 } },
        vertexShader: "uniform float grosor; void main(){ vec3 p = position + normalize(normal) * grosor; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }",
        fragmentShader: "void main(){ gl_FragColor = vec4(0.04, 0.03, 0.07, 1.0); }" });
    }
    const lista = [];
    raiz.traverse(function (m) { if (m.isMesh && m.material && m.material.isMeshToonMaterial && !m.material.transparent) { lista.push(m); } });
    lista.forEach(function (m) { const c = new T.Mesh(m.geometry, matCont); c.renderOrder = -1; m.add(c); });
  }
  function col(v, lista) { return typeof v === "string" ? v : lista[v | 0] || lista[0]; }

  // ---------- Camisetas (cada una con su diseño propio) ----------
  // dibujar(g): dibuja el dibujo repetido alrededor del cuerpo en un lienzo de 512 x 256
  const CAMISAS = [
    { id: "rayo", base: "#c8102e", manga: "#ffffff", short: "#f4f4f4", media: "#c8102e", txt: "#ffffff", borde: "#5a0716",
      dibujar: function (g) { g.strokeStyle = "#ffffff"; g.lineWidth = 16; for (let i = -4; i < 12; i++) { g.beginPath(); g.moveTo(i * 64, 256); g.lineTo(i * 64 + 128, 0); g.stroke(); } } },
    { id: "selva", base: "#128a3e", manga: "#ffd23f", short: "#0b4f26", media: "#ffd23f", txt: "#ffe680", borde: "#06260f",
      dibujar: function (g) { g.fillStyle = "#ffd23f"; for (let y = 10; y < 256; y += 46) { g.fillRect(0, y, 512, 13); } } },
    { id: "noche", base: "#14285e", manga: "#ff8c1a", short: "#0d1a3d", media: "#ff8c1a", txt: "#ff9f33", borde: "#050b1f",
      dibujar: function (g) { g.strokeStyle = "#ff8c1a"; g.lineWidth = 12; g.lineJoin = "miter"; for (const y0 of [88, 176]) { g.beginPath(); for (let x = 0; x <= 512; x += 32) { g.lineTo(x, y0 + ((x / 32) % 2 ? -14 : 14)); } g.stroke(); } } },
    { id: "sol", base: "#ffcf1f", manga: "#151515", short: "#151515", media: "#ffcf1f", txt: "#151515", borde: "#fff3b0",
      dibujar: function (g) { g.fillStyle = "#151515"; for (let i = 0; i < 8; i++) { for (const cy of [64, 192]) { const cx = i * 64 + 32; g.beginPath(); g.moveTo(cx, cy - 26); g.lineTo(cx + 18, cy); g.lineTo(cx, cy + 26); g.lineTo(cx - 18, cy); g.closePath(); g.fill(); } } } },
    // camiseta fija del creador del juego (celeste y blanca, rayas verticales)
    { id: "romme", base: "#7fd0ff", manga: "#ffffff", short: "#14285e", media: "#ffffff", txt: "#14285e", borde: "#ffffff",
      dibujar: function (g) { g.fillStyle = "#ffffff"; for (let i = 0; i < 8; i++) { g.fillRect(i * 64 + 32, 0, 32, 256); } } }
  ];

  function texCamisa(k) {
    const c = lienzo(512, 256), g = c.getContext("2d"), cm = CAMISAS[k];
    g.fillStyle = cm.base; g.fillRect(0, 0, 512, 256); cm.dibujar(g);
    return textura(c);
  }
  // Nombre y número de la espalda: se dibujan aparte (transparente) y se pegan sobre la camiseta
  function texEspalda(k, nombre, dorsal) {
    const c = lienzo(256, 256), g = c.getContext("2d"), cm = CAMISAS[k];
    const nom = String(nombre || "").toUpperCase().slice(0, 12), num = String(dorsal == null ? "" : dorsal);
    g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
    if (nom) {
      let fs = 54; g.font = "900 " + fs + "px Arial Black, Arial, sans-serif";
      while (g.measureText(nom).width > 244 && fs > 12) { fs -= 2; g.font = "900 " + fs + "px Arial Black, Arial, sans-serif"; }
      g.lineWidth = 7; g.strokeStyle = cm.borde; g.strokeText(nom, 128, 40); g.fillStyle = cm.txt; g.fillText(nom, 128, 40);
    }
    if (num) {
      g.font = "900 " + (num.length > 1 ? 150 : 170) + "px Arial Black, Arial, sans-serif";
      g.lineWidth = 12; g.strokeStyle = cm.borde; g.strokeText(num, 128, 158); g.fillStyle = cm.txt; g.fillText(num, 128, 158);
    }
    return textura(c);
  }
  // Miniatura del diseño de camiseta (para elegir en el creador)
  function dibujarMiniatura(cv, k) {
    const c = lienzo(512, 256), g = c.getContext("2d"), cm = CAMISAS[k];
    g.fillStyle = cm.base; g.fillRect(0, 0, 512, 256); cm.dibujar(g);
    const h = cv.getContext("2d"); h.drawImage(c, 0, 0, 512, 256, 0, 0, cv.width, cv.height);
  }
  function texSombra() {
    const c = lienzo(64, 64), g = c.getContext("2d"), gr = g.createRadialGradient(32, 32, 2, 32, 32, 32);
    gr.addColorStop(0, "rgba(0,0,0,.6)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return textura(c);
  }
  function texBrillo() {
    const c = lienzo(128, 128), g = c.getContext("2d"), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(.25, "rgba(255,244,190,.55)"); gr.addColorStop(1, "rgba(255,244,190,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    return textura(c);
  }
  function texPublico() {
    const c = lienzo(2048, 512), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#0b0e1c"); gr.addColorStop(1, "#1d2140");
    g.fillStyle = gr; g.fillRect(0, 0, 2048, 512);
    const cols = ["#e63946", "#ffffff", "#ffd166", "#4cc9f0", "#f72585", "#80ed99", "#ff9f1c", "#9d4edd", "#2a7de1"], piel = ["#f6d3b0", "#d9a066", "#8d5a3b", "#ffe0c2"];
    for (let fila = 0; fila < 34; fila++) {
      const y = 14 + fila * 14.5, esc = 0.7 + fila / 34 * 0.5;
      for (let x = (fila % 2) * 6; x < 2048; x += 12 + Math.random() * 4) {
        g.fillStyle = cols[(Math.random() * cols.length) | 0]; g.fillRect(x - 5 * esc, y + 3, 10 * esc, 9 * esc);
        g.fillStyle = piel[(Math.random() * 4) | 0]; g.beginPath(); g.arc(x, y, 4 * esc, 0, 7); g.fill();
        if (Math.random() < 0.06) { g.fillStyle = cols[(Math.random() * cols.length) | 0]; g.fillRect(x - 1, y - 14, 2, 12); }
      }
      g.fillStyle = "rgba(0,0,0,.22)"; g.fillRect(0, y + 12, 2048, 2);
    }
    const sombra = g.createLinearGradient(0, 0, 0, 512); sombra.addColorStop(0, "rgba(0,0,0,.55)"); sombra.addColorStop(.35, "rgba(0,0,0,0)"); g.fillStyle = sombra; g.fillRect(0, 0, 2048, 512);
    return textura(c, [2, 1]);
  }

  // ---------- Muñeco articulado ----------
  // o: piel, pelo (color), peloEstilo 0..9, barbaEstilo 0..6, colBarba, camisaTex, manga, short, media, lentes, guante, mangaLarga, bota
  function figura(o) {
    const raiz = new T.Group(), cadera = new T.Group(); cadera.position.y = 0.88; raiz.add(cadera);
    const piel = matT(o.piel), camis = o.camisaTex ? matTx({ map: o.camisaTex }) : matT(o.camisa), short = matT(o.short), media = matT(o.media), guante = matT(o.guante || o.piel);
    const camisManga = o.manga ? matT(o.manga) : camis;
    const torso = new T.Group(); cadera.add(torso);
    const tm = new T.Mesh(new T.CapsuleGeometry(0.16, 0.3, 4, 14), camis); tm.scale.set(1.22, 1, 0.8); tm.position.y = 0.31; torso.add(tm);
    if (o.espalda) {
      const L = 1.7, de = new T.Mesh(new T.CylinderGeometry(0.1655, 0.1655, 0.3, 20, 1, true, Math.PI - L / 2, L), matTx({ map: o.espalda, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
      de.scale.set(1.22, 1, 0.8); de.position.y = 0.305; torso.add(de);
    }
    const cin = new T.Mesh(new T.CylinderGeometry(0.2, 0.2, 0.1, 16), short); cin.scale.set(1.1, 1, 0.8); cin.position.y = 0.02; torso.add(cin);
    const cuello = new T.Group(); cuello.position.y = 0.66; torso.add(cuello);
    const cabeza = new T.Group(); cabeza.position.y = 0.16; cuello.add(cabeza);
    const crh = new T.Mesh(new T.SphereGeometry(0.15, 24, 18), piel); crh.scale.set(0.95, 1.08, 1); cabeza.add(crh);
    [-1, 1].forEach(function (s) { const oi = new T.Mesh(new T.SphereGeometry(0.035, 10, 8), piel); oi.position.set(s * 0.145, 0, 0); cabeza.add(oi); });
    const nariz = new T.Mesh(new T.SphereGeometry(0.026, 10, 8), piel); nariz.position.set(0, -0.02, 0.15); cabeza.add(nariz);

    // ----- peinados -----
    const negro = matT(o.pelo);
    const add = function (geo, x, y, z, sx, sy, sz) { const m = new T.Mesh(geo, negro); m.position.set(x, y, z); if (sx) { m.scale.set(sx, sy, sz); } cabeza.add(m); return m; };
    const gorro = function (th, ry) { const pe = new T.Mesh(new T.SphereGeometry(0.158, 20, 14, 0, 6.3, 0, th), negro); pe.position.y = 0.012; pe.rotation.x = ry || -0.18; cabeza.add(pe); };
    const ps = o.peloEstilo == null ? 1 : o.peloEstilo;
    if (ps === 0) {                                                  // afro
      add(new T.SphereGeometry(0.2, 20, 16), 0, 0.1, -0.09);
      for (let i = 0; i < 26; i++) { const a = i * 2.4, b = Math.acos(1 - (i + 0.5) / 26 * 1.1), r = 0.195; add(new T.SphereGeometry(0.058, 8, 6), Math.sin(b) * Math.cos(a) * r, 0.1 + Math.cos(b) * r, -0.09 + Math.sin(b) * Math.sin(a) * r * 0.9); }
    } else if (ps === 1) { gorro(1.25); }                            // corto
    else if (ps === 2) { gorro(1.25); add(new T.BoxGeometry(0.27, 0.05, 0.07), 0, 0.105, 0.125).rotation.x = 0.35; }   // flequillo
    else if (ps === 3) {                                             // mohicano
      gorro(0.75, -0.05);
      for (let i = 0; i < 6; i++) { add(new T.BoxGeometry(0.045, 0.09 + (i % 2) * 0.02, 0.06), 0, 0.17 - Math.abs(i - 2.5) * 0.012, 0.1 - i * 0.045); }
    } else if (ps === 4) {                                           // largo suelto
      gorro(1.3); add(new T.SphereGeometry(0.17, 16, 12), 0, -0.08, -0.07, 1.05, 1.7, 0.7);
      [-1, 1].forEach(function (s) { add(new T.SphereGeometry(0.06, 8, 6), s * 0.135, -0.02, 0.0, 0.7, 2.2, 0.9); });
    } else if (ps === 5) {                                           // colita
      gorro(1.28); add(new T.SphereGeometry(0.06, 10, 8), 0, 0.03, -0.17); add(new T.CapsuleGeometry(0.04, 0.2, 4, 8), 0, -0.1, -0.2);
    } else if (ps === 6) {                                           // rulos
      gorro(1.15);
      for (let i = 0; i < 22; i++) { const a = i * 2.4, b = Math.acos(1 - (i + 0.5) / 22 * 0.95), r = 0.165; add(new T.SphereGeometry(0.052, 8, 6), Math.sin(b) * Math.cos(a) * r, 0.03 + Math.cos(b) * r, Math.sin(b) * Math.sin(a) * r); }
    } else if (ps === 7) { /* calvo */ }
    else if (ps === 8) { gorro(0.8, -0.1); add(new T.SphereGeometry(0.12, 14, 10), 0, 0.16, 0.03, 1.1, 0.6, 1.3); }   // undercut con jopo
    else if (ps === 10) {                                            // pelo rizado de ROMME: volumen arriba y atrás, la frente y la cara quedan libres
      gorro(1.0, -0.32);
      for (let i = 0; i < 30; i++) { const a = i * 2.4, b = Math.acos(1 - (i + 0.5) / 30 * 0.85), r = 0.168; add(new T.SphereGeometry(0.058, 8, 6), Math.sin(b) * Math.cos(a) * r * 1.05, 0.075 + Math.cos(b) * r, -0.05 + Math.sin(b) * Math.sin(a) * r); }
      [-1, 1].forEach(function (s) { add(new T.SphereGeometry(0.05, 8, 6), s * 0.135, 0.07, -0.02); add(new T.SphereGeometry(0.045, 8, 6), s * 0.12, 0.03, -0.075); });
    }
    else if (ps === 9) { gorro(1.25); add(new T.SphereGeometry(0.07, 12, 10), 0, 0.19, -0.03); add(new T.SphereGeometry(0.03, 8, 6), 0, 0.14, -0.03); }   // moño

    // mechones puntiagudos tipo manga (solo estilos de pelo corto)
    const pincho = function (x, y, z, rx, rz, L, r) { const m = new T.Mesh(new T.ConeGeometry(r, L, 6), negro); m.position.set(x, y, z); m.rotation.set(rx, 0, rz); cabeza.add(m); };
    if (ps === 1 || ps === 2 || ps === 8 || ps === 9) {
      pincho(0, 0.165, 0.045, -0.5, 0, 0.16, 0.05); pincho(-0.07, 0.15, 0.05, -0.4, 0.55, 0.14, 0.045); pincho(0.07, 0.15, 0.05, -0.4, -0.55, 0.14, 0.045);
      pincho(-0.12, 0.1, 0.0, -0.1, 0.95, 0.13, 0.04); pincho(0.12, 0.1, 0.0, -0.1, -0.95, 0.13, 0.04); pincho(0, 0.15, -0.07, 0.6, 0, 0.15, 0.05);
      pincho(-0.06, 0.125, 0.115, -1.3, 0.25, 0.1, 0.03); pincho(0.04, 0.128, 0.118, -1.3, -0.2, 0.09, 0.03);
    }
    // ----- cara -----
    if (o.lentes) {
      const lm = new T.MeshPhongMaterial({ color: 0x0a0a0a, shininess: 90, specular: 0x8899aa });
      [-1, 1].forEach(function (s) { const l = new T.Mesh(new T.BoxGeometry(0.1, 0.06, 0.03), lm); l.position.set(s * 0.058, 0.035, 0.142); l.rotation.y = s * 0.28; cabeza.add(l); });
      const pu = new T.Mesh(new T.BoxGeometry(0.04, 0.012, 0.02), lm); pu.position.set(0, 0.05, 0.15); cabeza.add(pu);
    } else {
      [-1, 1].forEach(function (s) {                                  // ojos estilo anime: blanco grande, iris de color, pupila y brillo
        const gr = new T.Group(); gr.position.set(s * 0.058, 0.03, 0.134); gr.rotation.y = s * 0.3; cabeza.add(gr);
        const bl = new T.Mesh(new T.SphereGeometry(0.033, 12, 10), matB(0xffffff)); bl.scale.set(0.95, 1.25, 0.28); gr.add(bl);
        const ir = new T.Mesh(new T.SphereGeometry(0.026, 12, 10), matB(o.ojos || 0x2a7fd0)); ir.scale.set(0.9, 1.15, 0.2); ir.position.set(0, -0.003, 0.012); gr.add(ir);
        const pu = new T.Mesh(new T.SphereGeometry(0.014, 10, 8), matB(0x05080f)); pu.scale.set(0.9, 1.2, 0.2); pu.position.set(0, -0.003, 0.02); gr.add(pu);
        const br = new T.Mesh(new T.SphereGeometry(0.007, 8, 6), matB(0xffffff)); br.position.set(s * -0.008, 0.012, 0.026); br.scale.set(1, 1, 0.3); gr.add(br);
        const ce = new T.Mesh(new T.BoxGeometry(0.075, 0.014, 0.02), matT(o.pelo)); ce.position.set(s * 0.058, 0.082, 0.14); ce.rotation.z = -s * 0.22; ce.rotation.y = s * 0.3; cabeza.add(ce);   // ceja marcada
      });
    }
    const boca = new T.Mesh(new T.BoxGeometry(0.05, 0.01, 0.01), matT(0x5a2a22)); boca.position.set(0, -0.06, 0.145); cabeza.add(boca);

    // ----- barbas -----
    const bm = matT(o.colBarba || o.pelo), bs = o.barbaEstilo | 0;
    const bad = function (geo, x, y, z, sx, sy, sz) { const m = new T.Mesh(geo, bm); m.position.set(x, y, z); if (sx) { m.scale.set(sx, sy, sz); } cabeza.add(m); return m; };
    const bigote = function () { bad(new T.BoxGeometry(0.085, 0.022, 0.025), 0, -0.043, 0.148); [-1, 1].forEach(function (s) { bad(new T.SphereGeometry(0.014, 6, 6), s * 0.045, -0.052, 0.145); }); };
    const mandibula = function () { const sh = new T.Mesh(new T.SphereGeometry(0.1585, 24, 14, 0, 6.3, 2.08, 1.0), bm); sh.scale.set(0.95, 1.08, 1); cabeza.add(sh); };
    if (bs === 1) { bad(new T.SphereGeometry(0.04, 10, 8), 0, -0.105, 0.125, 1, 1.2, 0.6); bigote(); }                      // candado
    else if (bs === 2) { bad(new T.SphereGeometry(0.03, 10, 8), 0, -0.115, 0.125, 0.9, 1.5, 0.6); }                       // perilla
    else if (bs === 3) { bigote(); }                                                                                       // bigote
    else if (bs === 4) { mandibula(); bigote(); }                                                                          // barba corta
    else if (bs === 5) { mandibula(); bigote(); bad(new T.SphereGeometry(0.06, 10, 8), 0, -0.2, 0.09, 0.9, 2.0, 0.7); }   // barba larga
    else if (bs === 6) { bigote(); [-1, 1].forEach(function (s) { bad(new T.BoxGeometry(0.03, 0.12, 0.06), s * 0.135, -0.025, 0.06); bad(new T.BoxGeometry(0.03, 0.05, 0.05), s * 0.125, -0.085, 0.07); }); }   // patillas

    // ----- brazos -----
    const brazos = [];
    [1, -1].forEach(function (s) {
      const hombro = new T.Group(); hombro.position.set(s * 0.26, 0.55, 0); torso.add(hombro);
      const manga = new T.Mesh(new T.CapsuleGeometry(0.06, 0.12, 4, 10), camisManga); manga.position.y = -0.1; hombro.add(manga);
      const brazo = new T.Mesh(new T.CapsuleGeometry(0.05, 0.12, 4, 10), o.mangaLarga ? camisManga : piel); brazo.position.y = -0.2; hombro.add(brazo);
      const codo = new T.Group(); codo.position.y = -0.3; hombro.add(codo);
      const antebrazo = new T.Mesh(new T.CapsuleGeometry(0.043, 0.16, 4, 10), o.mangaLarga ? camisManga : piel); antebrazo.position.y = -0.13; codo.add(antebrazo);
      const mano = new T.Mesh(new T.SphereGeometry(o.guante ? 0.07 : 0.05, 10, 8), guante); mano.position.y = -0.27; codo.add(mano);
      brazos.push({ hombro: hombro, codo: codo, lado: s });
    });
    // ----- piernas -----
    const piernas = [];
    [1, -1].forEach(function (s) {
      const pierna = new T.Group(); pierna.position.set(s * 0.1, 0, 0); cadera.add(pierna);
      const muslo = new T.Mesh(new T.CapsuleGeometry(0.085, 0.2, 4, 10), piel); muslo.position.y = -0.2; pierna.add(muslo);
      const pantalon = new T.Mesh(new T.CylinderGeometry(0.098, 0.108, 0.26, 14), short); pantalon.position.y = -0.13; pierna.add(pantalon);
      const rodilla = new T.Group(); rodilla.position.y = -0.4; pierna.add(rodilla);
      const canilla = new T.Mesh(new T.CapsuleGeometry(0.062, 0.22, 4, 10), piel); canilla.position.y = -0.19; rodilla.add(canilla);
      const med = new T.Mesh(new T.CylinderGeometry(0.07, 0.066, 0.25, 12), media); med.position.y = -0.24; rodilla.add(med);
      const tobillo = new T.Group(); tobillo.position.y = -0.4; rodilla.add(tobillo);
      const bota = new T.Mesh(new T.BoxGeometry(0.11, 0.075, 0.27), matT(o.bota || 0x151515)); bota.position.set(0, -0.03, 0.06); tobillo.add(bota);
      piernas.push({ cad: pierna, rod: rodilla, lado: s });
    });
    const sombra = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: texSombra(), transparent: true, depthWrite: false }));
    sombra.rotation.x = -Math.PI / 2; sombra.position.y = 0.012; raiz.add(sombra);
    contornear(raiz);
    return { raiz: raiz, cadera: cadera, torso: torso, cuello: cuello, cabeza: cabeza, brazos: brazos, piernas: piernas, sombra: sombra };
  }

  // Personaje armado a partir del perfil del usuario (o de ROMME)
  const ROMME = { nombre: "ROMMEE", dorsal: 11, piel: "#e0ac84", pelo: 10, colPelo: "#0a0a0a", barba: 1, colBarba: "#0a0a0a", camisa: 4, lentes: true };
  function figuraDePerfil(p) {
    p = p || {};
    const k = Math.max(0, Math.min(4, p.camisa | 0)), cm = CAMISAS[k];
    if (window.Avatar3D && Avatar3D.listo()) {                      // personaje estilo anime (modelo VRM)
      return Avatar3D.crear({
        piel: col(p.piel == null ? 1 : p.piel, PIELES), pelo: col(p.colPelo == null ? 0 : p.colPelo, COLORES), identidad: p === ROMME,
        camisa: cm.base, manga: cm.manga, short: cm.short, media: cm.media, lentes: !!p.lentes, barba: p.barba | 0,
        colBarba: col(p.colBarba == null ? (p.colPelo == null ? 0 : p.colPelo) : p.colBarba, COLORES)
      });
    }
    return figura({
      piel: col(p.piel == null ? 1 : p.piel, PIELES), pelo: col(p.colPelo == null ? 0 : p.colPelo, COLORES), peloEstilo: p.pelo == null ? 1 : p.pelo,
      barbaEstilo: p.barba | 0, colBarba: col(p.colBarba == null ? (p.colPelo == null ? 0 : p.colPelo) : p.colBarba, COLORES),
      camisaTex: texCamisa(k), espalda: texEspalda(k, p.nombre, p.dorsal), manga: cm.manga, short: cm.short, media: cm.media, lentes: !!p.lentes
    });
  }
  // Arquero: camiseta amarilla, short negro y guantes verdes
  function figuraArquero() {
    if (window.Avatar3D && Avatar3D.listo()) { return Avatar3D.crear({ piel: "#c98f66", pelo: "#2a1a10", camisa: "#e8c200", manga: "#1b1b1b", short: "#1b1b1b", media: "#1b1b1b", bota: "#222222", guantes: "#39d353" }); }
    return figura({ piel: 0xc98f66, pelo: 0x2a1a10, camisa: 0xe8c200, short: 0x1b1b1b, media: 0x1b1b1b, guante: 0x39d353, mangaLarga: true, bota: 0x222222 });
  }
  function firma(p) { return (window.Avatar3D && Avatar3D.listo() ? "v" : "m") + JSON.stringify([p.nombre, p.dorsal, p.piel, p.pelo, p.colPelo, p.barba, p.colBarba, p.camisa, p.lentes]); }

  // ---------- Poses ----------
  function pose0() { return { hL: 0, hR: 0, kL: 0.05, kR: 0.05, sL: 0.05, sR: 0.05, eL: 0.25, eR: 0.25, aL: 0.12, aR: 0.12, incl: 0, giro: 0, cab: 0, bajo: 0 }; }
  function mezcla(a, b, t) { const r = {}; for (const k in a) { r[k] = a[k] + (b[k] - a[k]) * t; } return r; }
  function aplicar(f, p) {
    f.piernas.forEach(function (l) { const L = l.lado > 0; l.cad.rotation.x = -(L ? p.hL : p.hR); l.rod.rotation.x = L ? p.kL : p.kR; });
    f.brazos.forEach(function (b) { const L = b.lado > 0; b.hombro.rotation.x = -(L ? p.sL : p.sR); b.hombro.rotation.z = b.lado * (L ? p.aL : p.aR); b.codo.rotation.x = -(L ? p.eL : p.eR); });
    f.torso.rotation.x = p.incl; f.torso.rotation.y = p.giro + 0.09 * (p.hL - p.hR); f.cuello.rotation.y = p.cab - 0.05 * (p.hL - p.hR);   // el torso y la cabeza acompañan el paso
    f.cabeza.rotation.x = -0.45 * p.incl;                                                                                      // la cabeza se mantiene mirando al frente
    f.cadera.position.y = 0.88 - p.bajo;
    if (f.sync) { f.sync(p); }                                   // personaje VRM: mover también los huesos del modelo
  }
  function suave(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }
  function fotograma(fr, u) {
    if (u <= fr[0][0]) { return fr[0][1]; }
    for (let i = 1; i < fr.length; i++) { if (u <= fr[i][0]) { return mezcla(fr[i - 1][1], fr[i][1], suave((u - fr[i - 1][0]) / (fr[i][0] - fr[i - 1][0]))); } }
    return fr[fr.length - 1][1];
  }
  function P(o) { return Object.assign(pose0(), o); }

  // ---------- Visor 3D para la pantalla de creación ----------
  function vistaPrevia(cv) {
    const R = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true });
    if (T.sRGBEncoding) { R.outputEncoding = T.sRGBEncoding; }
    const esc = new T.Scene(), cam = new T.PerspectiveCamera(30, 0.8, 0.1, 50);
    esc.add(new T.AmbientLight(0xffffff, 0.95)); const luz = new T.DirectionalLight(0xffffff, 0.8); luz.position.set(2, 4, 5); esc.add(luz);
    const base = new T.Mesh(new T.CylinderGeometry(0.62, 0.7, 0.06, 40), new T.MeshLambertMaterial({ color: 0x1769b9 })); base.position.y = -0.03; esc.add(base);
    const aro = new T.Mesh(new T.TorusGeometry(0.66, 0.025, 8, 48), new T.MeshBasicMaterial({ color: 0x8fdcff })); aro.rotation.x = Math.PI / 2; aro.position.y = 0.0; esc.add(aro);
    let fig = null, ang = 0.4, arrastre = false, xPrev = 0, raf = 0, activo = true, ultimo = null, t0 = performance.now();
    function medir() { const w = cv.clientWidth || 300, h = cv.clientHeight || 380; R.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); cam.position.set(0, 0.98, 3.95); cam.lookAt(0, 0.84, 0); }
    function poner(p) {
      if (fig) { esc.remove(fig.raiz); }
      ultimo = p; fig = figuraDePerfil(p); esc.add(fig.raiz);
    }
    if (window.Avatar3D) { Avatar3D.alListo(function () { if (ultimo) { poner(ultimo); } }); }
    function cuadro(ts) {
      if (!activo) { return; }
      if (fig) {
        if (!arrastre) { ang += 0.006; }
        fig.raiz.rotation.y = ang;
        const r = Math.sin(ts / 600) * 0.012;
        aplicar(fig, Object.assign(P({ sL: 0.08, sR: 0.08, eL: 0.2, eR: 0.2, aL: 0.14, aR: 0.14 }), { bajo: r }));
      }
      R.render(esc, cam); raf = requestAnimationFrame(cuadro);
    }
    cv.addEventListener("pointerdown", function (e) { arrastre = true; xPrev = e.clientX; try { cv.setPointerCapture(e.pointerId); } catch (x) {} });
    cv.addEventListener("pointermove", function (e) { if (arrastre) { ang += (e.clientX - xPrev) * 0.012; xPrev = e.clientX; } });
    ["pointerup", "pointercancel"].forEach(function (n) { cv.addEventListener(n, function () { arrastre = false; }); });
    medir(); raf = requestAnimationFrame(cuadro);
    return {
      poner: poner, medir: medir,
      girarA: function (a) { ang = a; },
      foto: function () {                                       // imagen chica del personaje de frente (para el menú)
        const f = document.createElement("canvas"); f.width = 120; f.height = 150;
        if (!fig) { return ""; }
        const antes = ang; ang = 0.25; fig.raiz.rotation.y = ang;
        const w = cv.width, h = cv.height; cam.position.set(0, 1.45, 3.2); cam.lookAt(0, 1.3, 0); R.render(esc, cam);
        const g = f.getContext("2d"), sw = Math.min(w, h * 0.8), sh = sw * 1.25; g.drawImage(cv, (w - sw) / 2, (h - sh) / 2, sw, sh, 0, 0, 120, 150);
        cam.position.set(0, 0.98, 3.95); cam.lookAt(0, 0.84, 0); ang = antes;
        try { return f.toDataURL("image/png"); } catch (e) { return ""; }
      },
      detener: function () { activo = false; cancelAnimationFrame(raf); },
      reanudar: function () { if (!activo) { activo = true; raf = requestAnimationFrame(cuadro); } },
      liberar: function () { activo = false; cancelAnimationFrame(raf); try { R.dispose(); R.forceContextLoss(); } catch (e) {} }
    };
  }

  return {
    PIELES: PIELES, COLORES: COLORES, N_PELO: N_PELO, N_BARBA: N_BARBA, N_CAMISA: N_CAMISA, CAMISAS: CAMISAS, ROMME: ROMME,
    dibujarMiniatura: dibujarMiniatura, lienzo: lienzo, textura: textura, mat: mat, texCamisa: texCamisa, texSombra: texSombra, texBrillo: texBrillo, texPublico: texPublico,
    figura: figura, figuraDePerfil: figuraDePerfil, figuraArquero: figuraArquero, matT: matT, firma: firma, vistaPrevia: vistaPrevia,
    pose0: pose0, mezcla: mezcla, aplicar: aplicar, suave: suave, fotograma: fotograma, P: P
  };
})();
