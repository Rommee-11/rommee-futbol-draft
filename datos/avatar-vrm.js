// =====================================================================
//  Avatar3D: personajes estilo anime hechos con el modelo VRM de ROMME.
//  Un solo archivo (romme-base.glb) sirve para TODOS: a cada jugador se le cambia
//  el color de piel, de pelo, la ropa del equipo, y se le ponen barba o lentes.
//  Se mueve con las mismas poses que el muñeco viejo (Per3D.aplicar).
//  Si el modelo no carga (sin internet, celular lento, o ?muneco=1) el juego
//  sigue usando el muñeco de siempre.
// =====================================================================
const Avatar3D = (function () {
  const T = window.THREE;
  const ARCHIVO = "datos/vrm/romme-base.glb", CARA_ROMME = "datos/vrm/cara-romme.jpg";
  const ESCALA = 0.88;                       // el modelo mide 2 m; lo achicamos para que quede parejo con el arco
  const PIEL_BASE = new T.Color("#f6e4d6");
  let estado = "no", base = null, avisar = [], grises = new Map(), caraRomme = null;
  const apagado = /[?&]muneco=1/.test(location.search);

  function listo() { return estado === "listo"; }
  function alListo(f) { if (estado === "listo") { f(); } else { avisar.push(f); } }
  function precargar() {
    if (estado !== "no" || apagado || !window.VRMCarga || !T) { if (apagado) { estado = "fallo"; } return; }
    estado = "cargando";
    const L = new window.VRMCarga.GLTFLoader(); L.register(function (p) { return new window.VRMCarga.VRMLoaderPlugin(p); });
    L.load(ARCHIVO, function (g) {
      base = g; base.scene.traverse(function (o) { if (o.isMesh) { o.frustumCulled = false; } });
      estado = "listo"; const a = avisar; avisar = []; a.forEach(function (f) { try { f(); } catch (e) { console.warn(e); } });
    }, null, function (e) { estado = "fallo"; console.warn("Avatar3D: no se pudo cargar el modelo", e); });
    new T.TextureLoader().load(CARA_ROMME, function (t) { t.flipY = false; if (T.sRGBEncoding) { t.encoding = T.sRGBEncoding; } caraRomme = t; });
  }

  function gris(tex) {                         // pelo en escala de grises, para poder teñirlo de cualquier color
    if (grises.has(tex)) { return grises.get(tex); }
    const im = tex.image, cv = document.createElement("canvas"); cv.width = im.width; cv.height = im.height;
    const g = cv.getContext("2d"); g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, cv.width, cv.height), a = d.data;
    for (let i = 0; i < a.length; i += 4) { const l = Math.min(255, (0.3 * a[i] + 0.59 * a[i + 1] + 0.11 * a[i + 2]) * 1.9); a[i] = a[i + 1] = a[i + 2] = l; }
    g.putImageData(d, 0, 0); const t = new T.CanvasTexture(cv); t.flipY = tex.flipY; if (T.sRGBEncoding) { t.encoding = T.sRGBEncoding; }
    grises.set(tex, t); return t;
  }
  const LUZ = 0.56;                                // las luces del juego son fuertes: oscurecemos un poco los colores para que la piel no se queme
  function pintar(m, hex, sombra) { m.color.set(hex).multiplyScalar(LUZ); if (m.shadeColorFactor) { m.shadeColorFactor.copy(m.color).multiplyScalar(sombra || 0.75); } }


  // ---------- lentes y barbas: piezas simples pegadas a la cabeza ----------
  // Medidas del modelo (metros, con el hueso de la cabeza en y=1.779, z=0.018): ojos y=1.846, nariz y=1.81, boca y=1.79, mentón y=1.765, cara al frente z≈0.11
  const CAB = { x: 0, y: 1.779, z: 0.018 };
  function accesorios(f, o) {
    const g = new T.Group(); const bone = f.hueso.J_Bip_C_Head; bone.add(g);
    const P = function (x, y, z) { return [x - CAB.x, y - CAB.y, z - CAB.z]; };
    const pieza = function (geo, mat, x, y, z, sx, sy, sz, rx, ry, rz) {
      const m = new T.Mesh(geo, mat); m.position.set.apply(m.position, P(x, y, z)); if (sx) { m.scale.set(sx, sy, sz); } m.rotation.set(rx || 0, ry || 0, rz || 0); g.add(m); return m;
    };
    if (o.lentes) {                                   // marco fino negro y vidrio casi transparente, para que se vean los ojos
      const lm = Per3D.matT(0x0a0a0a), vid = new T.MeshBasicMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.18, depthWrite: false });
      [-1, 1].forEach(function (s) {
        const cx = s * 0.04, cy = 1.85, w = 0.056, h = 0.042, t = 0.0045, z = 0.13, ry = -s * 0.3;
        const grp = new T.Group(); grp.position.set.apply(grp.position, P(cx, cy, z)); grp.rotation.y = ry; g.add(grp);
        [[0, h / 2, w, t], [0, -h / 2, w, t], [-w / 2, 0, t, h], [w / 2, 0, t, h]].forEach(function (b) { const m = new T.Mesh(new T.BoxGeometry(b[2], b[3], 0.006), lm); m.position.set(b[0], b[1], 0); grp.add(m); });
        const v = new T.Mesh(new T.PlaneGeometry(w, h), vid); v.position.z = 0.002; grp.add(v);
        pieza(new T.BoxGeometry(0.004, 0.004, 0.1), lm, s * 0.092, 1.855, 0.075);                         // patilla hacia la oreja
      });
      pieza(new T.BoxGeometry(0.03, 0.005, 0.006), lm, 0, 1.858, 0.135);                                // puente
    }
    const bm = Per3D.matT(o.colBarba || o.pelo || "#0b0b0b"), bs = o.barba | 0;
    const mand = function (desde, hasta, k) { const sh = new T.Mesh(new T.SphereGeometry(0.112 * k, 24, 14, 0, 6.3, desde, hasta - desde), bm); sh.scale.set(0.78, 1.05, 1.15); sh.position.set.apply(sh.position, P(0, 1.845, 0.028)); g.add(sh); };
    const bigote = function () { [-1, 1].forEach(function (s) { pieza(new T.BoxGeometry(0.03, 0.009, 0.012), bm, s * 0.016, 1.797, 0.126, 1, 1, 1, 0, -s * 0.25, s * 0.12); }); };
    const mejillas = function (alto) {             // barba a lo largo de la mandíbula (deja libre la boca)
      [-1, 1].forEach(function (s) { pieza(new T.SphereGeometry(0.02, 10, 8), bm, s * 0.062, 1.795 - alto * 0.5, 0.07, 0.6, 2.1 + alto * 8, 1.3, 0, 0, s * 0.42); });
    };
    if (bs === 1) { pieza(new T.SphereGeometry(0.02, 10, 8), bm, 0, 1.772, 0.107, 1, 1.4, 0.55); bigote(); }
    else if (bs === 2) { pieza(new T.SphereGeometry(0.018, 10, 8), bm, 0, 1.768, 0.104, 0.9, 1.6, 0.55); }
    else if (bs === 3) { bigote(); }
    else if (bs === 4) { mand(2.3, 2.72, 1.0); mejillas(0); bigote(); }
    else if (bs === 5) { mand(2.25, 2.85, 1.0); mejillas(0.004); bigote(); pieza(new T.SphereGeometry(0.035, 10, 8), bm, 0, 1.732, 0.092, 0.9, 1.9, 0.7); }
    else if (bs === 6) { bigote(); [-1, 1].forEach(function (s) { pieza(new T.SphereGeometry(0.02, 10, 8), bm, s * 0.09, 1.82, 0.045, 0.45, 2.0, 1.2); }); }
    return g;
  }


  // ---------- nombre y número en la espalda ----------
  const CHEST = { y: 1.373, z: -0.006 };                           // posición del hueso del pecho (el dibujo se pega ahí)
  const ZB_Y = [1.2, 1.3, 1.4, 1.5, 1.6], ZB_Z = [-0.15, -0.133, -0.124, -0.095, -0.065];   // forma de la espalda de la camiseta (medida)
  function zEspalda(x, y) {
    let i = 0; while (i < ZB_Y.length - 2 && y > ZB_Y[i + 1]) { i++; }
    const t = Math.max(0, Math.min(1, (y - ZB_Y[i]) / (ZB_Y[i + 1] - ZB_Y[i])));
    return ZB_Z[i] + (ZB_Z[i + 1] - ZB_Z[i]) * t + 2.4 * x * x - 0.008 - 0.03 * Math.max(0, Math.min(1, (y - 1.38) / 0.1));
  }
  const texEsp = new Map();
  function texturaEspalda(nombre, dorsal, color, borde) {
    const k = [nombre, dorsal, color, borde].join("|"); if (texEsp.has(k)) { return texEsp.get(k); }
    const c = document.createElement("canvas"); c.width = 384; c.height = 512; const g = c.getContext("2d");
    g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round"; g.fillStyle = color; g.strokeStyle = borde; 
    const nom = String(nombre || "").toUpperCase().slice(0, 12); let fs = 78;
    g.font = "900 " + fs + "px Arial Black, Impact, Arial, sans-serif";
    while (g.measureText(nom).width > 300 && fs > 24) { fs -= 3; g.font = "900 " + fs + "px Arial Black, Impact, Arial, sans-serif"; }
    g.lineWidth = Math.max(4, fs * 0.12); g.strokeText(nom, 192, 58); g.fillText(nom, 192, 58);
    const num = String(dorsal == null ? "" : dorsal); g.font = "900 " + (num.length > 1 ? 330 : 400) + "px Arial Black, Impact, Arial, sans-serif";
    g.lineWidth = 26; g.strokeText(num, 192, 305); g.fillText(num, 192, 305);
    const t = new T.CanvasTexture(c); t.anisotropy = 4; if (T.sRGBEncoding) { t.encoding = T.sRGBEncoding; }
    texEsp.set(k, t); return t;
  }
  function espalda(f, o) {
    const X0 = -0.12, X1 = 0.12, Y0 = 1.2, Y1 = 1.52, nx = 10, ny = 12, pos = [], uv = [], idx = [];
    const chest = f.hueso.J_Bip_C_Chest, modelo = f.modelo; f.raiz.updateMatrixWorld(true);
    const v = new T.Vector3();
    for (let j = 0; j <= ny; j++) { for (let i = 0; i <= nx; i++) {
      const x = X0 + (X1 - X0) * i / nx, y = Y0 + (Y1 - Y0) * j / ny;
      v.set(x, y, zEspalda(x, y)); modelo.localToWorld(v); chest.worldToLocal(v);                // de coordenadas del modelo a coordenadas del hueso del pecho
      pos.push(v.x, v.y, v.z); uv.push(1 - i / nx, j / ny);                                      // visto desde atrás, la izquierda del dibujo es la izquierda del jugador
    } }
    for (let j = 0; j < ny; j++) { for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i; idx.push(a, a + 1, a + nx + 1, a + 1, a + nx + 2, a + nx + 1); } }
    const geo = new T.BufferGeometry(); geo.setAttribute("position", new T.Float32BufferAttribute(pos, 3)); geo.setAttribute("uv", new T.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
    const m = new T.Mesh(geo, new T.MeshBasicMaterial({ map: texturaEspalda(o.nombre, o.dorsal, o.txtColor || "#ffffff", o.txtBorde || "#000000"), transparent: true, side: T.DoubleSide, depthWrite: false, color: 0xdddddd, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    m.renderOrder = 5; m.frustumCulled = false; chest.add(m); return m;
  }
  // suela con tapones: placa fina + 6 tapones bajo cada pie, pegados al hueso del pie
  const SUBE = 0.03;                                               // todo el cuerpo se levanta lo que miden los tapones, para que apoyen en el piso
  function tapones(f, o) {
    const T3 = T, col = new T.Color(o.suela || "#1a1a1a");
    const mat = new T.MeshLambertMaterial({ color: col });
    const placa = new T.BoxGeometry(0.09, 0.009, 0.225), tap = new T.CylinderGeometry(0.012, 0.0075, 0.021, 8);
    const pos = [[-0.03, -0.07], [0.03, -0.07], [-0.032, 0.015], [0.032, 0.015], [-0.03, 0.098], [0.03, 0.098]];
    const v = new T3.Vector3(); f.raiz.updateMatrixWorld(true);
    [["L", 0.08], ["R", -0.08]].forEach(function (lr) {
      const hueso = f.hueso["J_Bip_" + lr[0] + "_Foot"]; if (!hueso) { return; }
      const g = new T3.Group();
      const pl = new T3.Mesh(placa, mat); pl.position.set(0, -0.0045, 0.02); g.add(pl);
      pos.forEach(function (p) { const t = new T3.Mesh(tap, mat); t.position.set(p[0], -0.0195, p[1]); g.add(t); });
      g.children.forEach(function (c) {                              // de coordenadas del mundo (en reposo) a coordenadas del hueso
        v.set(lr[1] + c.position.x, c.position.y + SUBE, c.position.z); f.raiz.localToWorld(v); hueso.worldToLocal(v);
        c.position.copy(v); c.quaternion.copy(hueso.getWorldQuaternion(new T3.Quaternion()).invert().multiply(f.raiz.getWorldQuaternion(new T3.Quaternion())));
        c.scale.setScalar(1 / (hueso.getWorldScale(new T3.Vector3()).x));
      });
      hueso.add(g);
    });
  }
  // o: { piel, pelo, camisa, manga (detalle), short, media, bota, guantes, identidad (ROMME: pelo y cara originales), lentes, barba, colBarba }
  function crear(o) {
    const raiz = new T.Group(), cadera = new T.Group(), torso = new T.Group(), cuello = new T.Group(), cabeza = new T.Group();
    raiz.add(cadera); cadera.add(torso); torso.add(cuello); cuello.add(cabeza);
    const modelo = window.VRMCarga.SkeletonUtils.clone(base.scene); modelo.scale.setScalar(ESCALA); raiz.add(modelo);
    const hueso = {}; modelo.traverse(function (n) { if (n.isBone || /^J_Bip_/.test(n.name)) { hueso[n.name] = n; } });
    const lista = []; const copias = new Map();
    modelo.traverse(function (m) {
      if (!m.isMesh) { return; }
      m.material = (Array.isArray(m.material) ? m.material : [m.material]).map(function (x) {
        if (!copias.has(x)) { const c = x.clone(); c.name = x.name; copias.set(x, c); lista.push(c); } return copias.get(x);
      }); if (m.material.length === 1) { m.material = m.material[0]; }
    });
    const skin = new T.Color(o.piel || "#f1c27d");
    lista.forEach(function (m) {
      const n = m.name || "";
      if (/_SKIN/.test(n)) {
        m.color.setRGB(Math.min(1.15, skin.r / PIEL_BASE.r) * LUZ, Math.min(1.15, skin.g / PIEL_BASE.g) * LUZ, Math.min(1.15, skin.b / PIEL_BASE.b) * LUZ);
        if (m.shadeColorFactor) { m.shadeColorFactor.copy(m.color).multiplyScalar(0.8); }
        if (o.identidad && /Face_00_SKIN/.test(n) && caraRomme) { m.map = caraRomme; if (m.uniforms && m.uniforms.map) { m.uniforms.map.value = caraRomme; } }
      } else if (/_HAIR/.test(n)) {
        if (!o.identidad && m.map) { m.map = gris(m.map); if (m.uniforms && m.uniforms.map) { m.uniforms.map.value = m.map; } pintar(m, o.pelo || "#0b0b0b", 0.6); }
      } else if (/^KIT_camisa/.test(n)) { pintar(m, o.camisa || "#d62828"); }
      else if (/^KIT_detalle/.test(n)) { pintar(m, o.manga || "#ffffff"); }
      else if (/^KIT_short/.test(n)) { pintar(m, o.short || "#ffffff"); }
      else if (/^KIT_medias/.test(n)) { pintar(m, o.media || o.camisa || "#d62828"); }
      else if (/^KIT_botas/.test(n)) { pintar(m, o.bota || "#151515"); }
      else if (/^KIT_guantes/.test(n)) { if (o.guantes) { pintar(m, o.guantes); } else { m.visible = false; } }
      else if (!/EYE/.test(n)) { m.color.multiplyScalar(LUZ); if (m.shadeColorFactor) { m.shadeColorFactor.multiplyScalar(LUZ); } }
      m.needsUpdate = true;
    });
    const H = function (n) { return hueso["J_Bip_" + n]; };
    const rest = {}; Object.keys(hueso).forEach(function (k) { rest[k] = hueso[k].position.clone(); });
    const cadH = H("C_Hips");
    const brazos = [{ hombro: new T.Group(), codo: new T.Group(), lado: 1, ub: H("L_UpperArm"), lb: H("L_LowerArm") }, { hombro: new T.Group(), codo: new T.Group(), lado: -1, ub: H("R_UpperArm"), lb: H("R_LowerArm") }];
    const piernas = [{ cad: new T.Group(), rod: new T.Group(), lado: 1, ul: H("L_UpperLeg"), ll: H("L_LowerLeg") }, { cad: new T.Group(), rod: new T.Group(), lado: -1, ul: H("R_UpperLeg"), ll: H("R_LowerLeg") }];
    const sombra = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: Per3D.texSombra(), transparent: true, depthWrite: false }));
    sombra.rotation.x = -Math.PI / 2; sombra.position.y = 0.012; raiz.add(sombra);
    modelo.position.y += SUBE;
    const f = { modelo: modelo, raiz: raiz, cadera: cadera, torso: torso, cuello: cuello, cabeza: cabeza, brazos: brazos, piernas: piernas, sombra: sombra, vrm: true };
    // pone los huesos del modelo según los números de una pose (los mismos del muñeco)
    f.sync = function (p) {
      cadH.position.y = rest.J_Bip_C_Hips.y - p.bajo / ESCALA;
      const sp = H("C_Spine"), ch = H("C_Chest"), cu = H("C_Neck"), he = H("C_Head");
      sp.rotation.set(p.incl * 0.5, p.giro * 0.5, 0); ch.rotation.set(p.incl * 0.5, p.giro * 0.5, 0);
      cu.rotation.set(0, p.cab, 0); he.rotation.set(-0.35 * p.incl, 0, 0);
      brazos.forEach(function (b) {
        const L = b.lado > 0, s = L ? p.sL : p.sR, a = L ? p.aL : p.aR, e = L ? p.eL : p.eR;
        b.ub.rotation.set(-s, 0, -b.lado * (1.38 - a)); b.lb.rotation.set(0, -b.lado * e, 0);
      });
      piernas.forEach(function (l) {
        const L = l.lado > 0; l.ul.rotation.set(-(L ? p.hL : p.hR), 0, 0); l.ll.rotation.set(L ? p.kL : p.kR, 0, 0);
      });
    };
    f.hueso = hueso;
    if (!o.identidad || true) { tapones(f, o); }
    if (o.dorsal != null || o.nombre) { espalda(f, o); }
    if (!o.identidad && (o.lentes || o.barba)) { accesorios(f, o); }
    f.cabezaHueso = H("C_Head"); f.hueso = hueso; f.escala = ESCALA;
    f.sync(Per3D.pose0());
    return f;
  }
  return { precargar: precargar, listo: listo, alListo: alListo, crear: crear, ESCALA: ESCALA, apagado: apagado };
})();
window.Avatar3D = Avatar3D;
