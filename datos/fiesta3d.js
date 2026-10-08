// =====================================================================
//  FESTEJO FINAL EN 3D
//  Cuando se completan los 11 jugadores: el personaje del usuario festeja
//  de frente con una copa, el público aplaude, hay fuegos artificiales y
//  papel picado. ROMME alienta al costado. El puntaje se muestra en HTML.
// =====================================================================
const Fiesta3D = (function () {
  const T = window.THREE;
  let R = null, esc, cam, jugador, romme, copa, hinchas = null, conf = null, fuegos = null, listo = false, raf = 0, activo = false, t0 = 0, firma = "", W = 0, H = 0;
  const NF = 260, NC = 520, NP = 2600;
  const dummy = () => (typeof T !== "undefined") ? new T.Object3D() : null;

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function texCesped() {
    const c = Per3D.lienzo(512, 512), g = c.getContext("2d");
    for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? "#2f8d3e" : "#38a34a"; g.fillRect(0, i * 32, 512, 32); }
    return Per3D.textura(c, [3, 3]);
  }
  function crearCopa() {
    const pts = [[0.001, 0], [0.1, 0], [0.1, 0.03], [0.045, 0.07], [0.03, 0.09], [0.028, 0.2], [0.05, 0.23], [0.11, 0.27], [0.15, 0.36], [0.155, 0.48], [0.14, 0.5], [0.12, 0.46], [0.1, 0.32], [0.001, 0.27]].map(function (p) { return new T.Vector2(p[0], p[1]); });
    const dorado = new T.MeshPhongMaterial({ color: 0xffc83a, shininess: 130, specular: 0xfff0b0, emissive: 0x3a2600, side: T.DoubleSide });
    const g = new T.Group(); g.add(new T.Mesh(new T.LatheGeometry(pts, 28), dorado));
    [-1, 1].forEach(function (s) { const a = new T.Mesh(new T.TorusGeometry(0.085, 0.017, 8, 18, Math.PI * 1.25), dorado); a.position.set(s * 0.15, 0.37, 0); a.rotation.z = s > 0 ? -Math.PI * 0.62 : Math.PI * 1.62 - Math.PI; g.add(a); });
    const bola = new T.Mesh(new T.SphereGeometry(0.05, 12, 10), dorado); bola.position.y = 0.52; g.add(bola);
    g.scale.setScalar(1.8); return g;
  }
  function construir() {
    esc = new T.Scene(); esc.background = new T.Color(0x070b1a);
    cam = new T.PerspectiveCamera(45, 1.6, 0.1, 300);
    esc.add(new T.AmbientLight(0xdfe8ff, 0.95));
    const sol = new T.DirectionalLight(0xffffff, 0.85); sol.position.set(-6, 12, 10); esc.add(sol);
    const luz2 = new T.DirectionalLight(0xffd9a0, 0.4); luz2.position.set(8, 6, -4); esc.add(luz2);
    const cesp = new T.Mesh(new T.PlaneGeometry(240, 240), new T.MeshLambertMaterial({ map: texCesped() })); cesp.rotation.x = -Math.PI / 2; esc.add(cesp);
    // olla de tribunas lejana
    const olla = new T.Mesh(new T.CylinderGeometry(120, 62, 40, 64, 1, true), new T.MeshBasicMaterial({ map: Per3D.texPublico(), side: T.BackSide, color: 0xdddddd }));
    olla.position.y = 20; esc.add(olla);
    // reflectores
    const br = Per3D.texBrillo();
    [[-45, 26, -50], [45, 26, -50], [0, 30, -80], [-70, 26, -10], [70, 26, -10]].forEach(function (p) {
      const s = new T.Sprite(new T.SpriteMaterial({ map: br, blending: T.AdditiveBlending, transparent: true, depthWrite: false })); s.position.set(p[0], p[1], p[2]); s.scale.set(44, 44, 1); esc.add(s);
    });
    // tribuna cercana con hinchas que aplauden (gradas escalonadas)
    const filas = 6, porFila = Math.ceil(NF / filas);
    const escalon = new T.MeshLambertMaterial({ color: 0x2a2f4a });
    for (let r = 0; r < filas; r++) { const e = new T.Mesh(new T.BoxGeometry(60, 0.5 + r * 0.5, 1.9), escalon); e.position.set(0, (0.5 + r * 0.5) / 2, -9 - r * 1.9); esc.add(e); }
    const cuerpoGeo = new T.CapsuleGeometry(0.2, 0.35, 3, 8), cabezaGeo = new T.SphereGeometry(0.16, 10, 8), manoGeo = new T.SphereGeometry(0.07, 6, 6);
    const mB = new T.InstancedMesh(cuerpoGeo, new T.MeshLambertMaterial({ color: 0xffffff }), NF);
    const mC = new T.InstancedMesh(cabezaGeo, new T.MeshLambertMaterial({ color: 0xffffff }), NF);
    const mM = new T.InstancedMesh(manoGeo, new T.MeshLambertMaterial({ color: 0xffffff }), NF * 2);
    const cols = ["#e63946", "#ffffff", "#ffd166", "#4cc9f0", "#f72585", "#80ed99", "#ff9f1c", "#9d4edd", "#2a7de1"], pieles = ["#f6d3b0", "#d9a066", "#8d5a3b", "#ffe0c2", "#6b4129"];
    const datos = [], cc = new T.Color();
    for (let i = 0; i < NF; i++) {
      const r = i % filas, k = (i / filas) | 0;
      const x = -29 + (k + (r % 2) * 0.5) * (58 / porFila) + rnd(-0.2, 0.2), y0 = 0.5 + r * 0.5, z = -9 - r * 1.9 + rnd(-0.3, 0.3);
      datos.push({ x: x, y: y0, z: z, ph: rnd(0, 6.28), v: rnd(5, 9), alto: Math.random() < 0.3 });
      mB.setColorAt(i, cc.set(cols[(Math.random() * cols.length) | 0])); mC.setColorAt(i, cc.set(pieles[(Math.random() * pieles.length) | 0]));
      mM.setColorAt(i * 2, cc.set(pieles[(Math.random() * pieles.length) | 0])); mM.setColorAt(i * 2 + 1, cc.set(pieles[(Math.random() * pieles.length) | 0]));
    }
    esc.add(mB); esc.add(mC); esc.add(mM); hinchas = { b: mB, c: mC, m: mM, d: datos, o: dummy() };
    // confeti
    const confGeo = new T.PlaneGeometry(0.17, 0.1), cm = new T.InstancedMesh(confGeo, new T.MeshBasicMaterial({ side: T.DoubleSide }), NC);
    const cd = [];
    for (let i = 0; i < NC; i++) { cd.push({ x: rnd(-11, 11), y: rnd(0, 14), z: rnd(-6, 8), vy: rnd(0.9, 2.1), ph: rnd(0, 6.28), g: rnd(2, 6), rx: rnd(0, 6), ry: rnd(0, 6) }); cm.setColorAt(i, cc.set(cols[(Math.random() * cols.length) | 0])); }
    esc.add(cm); conf = { m: cm, d: cd, o: dummy() };
    // fuegos artificiales
    const pos = new Float32Array(NP * 3), col = new Float32Array(NP * 3), vel = new Float32Array(NP * 3), vida = new Float32Array(NP);
    const geo = new T.BufferGeometry(); geo.setAttribute("position", new T.BufferAttribute(pos, 3)); geo.setAttribute("color", new T.BufferAttribute(col, 3));
    const pt = new T.Points(geo, new T.PointsMaterial({ size: 2.2, map: br, vertexColors: true, transparent: true, blending: T.AdditiveBlending, depthWrite: false, sizeAttenuation: true }));
    pt.frustumCulled = false; esc.add(pt);
    for (let i = 0; i < NP; i++) { pos[i * 3 + 1] = -100; }
    fuegos = { pos: pos, col: col, vel: vel, vida: vida, geo: geo, sig: 0, proxima: 0 };
    // copa y personaje de ROMME
    copa = crearCopa(); esc.add(copa);
    romme = Per3D.figuraDePerfil(Per3D.ROMME); romme.raiz.position.set(-2.9, 0, -0.6); romme.raiz.rotation.y = 0.45; esc.add(romme.raiz);
    listo = true;
    if (window.Avatar3D) { Avatar3D.alListo(function () {
      if (romme && !romme.vrm) { const pr = romme.raiz.position.clone(), ry = romme.raiz.rotation.y; esc.remove(romme.raiz); romme = Per3D.figuraDePerfil(Per3D.ROMME); romme.raiz.position.copy(pr); romme.raiz.rotation.y = ry; esc.add(romme.raiz); }
      if (jugador && !jugador.vrm) { const pp = typeof perfil !== "undefined" ? perfil : {}; esc.remove(jugador.raiz); jugador = null; firma = ""; poner(pp); }
    }); }
  }
  function poner(p) {
    const f = Per3D.firma(p || {});
    if (jugador && f === firma) { return; }
    if (jugador) { esc.remove(jugador.raiz); }
    firma = f; jugador = Per3D.figuraDePerfil(p || {}); esc.add(jugador.raiz);
  }
  function explotar(t) {
    const f = fuegos, n = 110, cx = rnd(-26, 26), cy = rnd(20, 34), cz = rnd(-52, -26);
    const c = new T.Color().setHSL(Math.random(), 1, 0.6), c2 = new T.Color().setHSL(Math.random(), 1, 0.65);
    for (let i = 0; i < n; i++) {
      const k = f.sig; f.sig = (f.sig + 1) % NP;
      const a = Math.random() * 6.283, b = Math.acos(2 * Math.random() - 1), v = rnd(7, 13);
      f.pos[k * 3] = cx; f.pos[k * 3 + 1] = cy; f.pos[k * 3 + 2] = cz;
      f.vel[k * 3] = Math.sin(b) * Math.cos(a) * v; f.vel[k * 3 + 1] = Math.cos(b) * v; f.vel[k * 3 + 2] = Math.sin(b) * Math.sin(a) * v;
      const cc = i % 3 ? c : c2; f.col[k * 3] = cc.r; f.col[k * 3 + 1] = cc.g; f.col[k * 3 + 2] = cc.b; f.vida[k] = rnd(1.4, 2.2);
    }
  }
  function medir() {
    W = window.innerWidth; H = window.innerHeight; R.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1)); R.setSize(W, H, false);
    cam.aspect = W / H;
    const hf = 56 * Math.PI / 180; cam.fov = Math.min(75, 2 * Math.atan(Math.tan(hf / 2) / cam.aspect) * 180 / Math.PI); cam.updateProjectionMatrix();
  }
  function cuadro(ts) {
    if (!activo) { return; }
    const t = (ts - t0) / 1000, dt = Math.min(0.05, Math.max(0.001, (ts - (cuadro.p || ts)) / 1000)); cuadro.p = ts;
    // personaje del usuario: salta con la copa en alto
    const sal = Math.abs(Math.sin(t * 3.1)) * 0.2, a = Math.sin(t * 6.2);
    Per3D.aplicar(jugador, Per3D.P({ sL: 3.0 + 0.1 * a, sR: 3.0 - 0.1 * a, eL: 0.2, eR: 0.2, aL: -0.32, aR: -0.32, hL: 0.25 * a, hR: -0.25 * a, kL: 0.15 + 0.3 * Math.max(0, a), kR: 0.15 + 0.3 * Math.max(0, -a), cab: 0.25 * Math.sin(t * 1.3), incl: 0 }));
    jugador.raiz.position.y = sal; jugador.raiz.rotation.y = 0.12 * Math.sin(t * 0.9);
    copa.position.set(0, 2.1 + sal + 0.02 * Math.sin(t * 9), 0.0); copa.rotation.y = t * 1.3;
    const b = Math.sin(t * 5.4), r = romme;
    Per3D.aplicar(r, Per3D.P({ sL: 2.8 + 0.3 * b, sR: 2.8 - 0.3 * b, eL: 0.25, eR: 0.25, aL: 0.5, aR: 0.5, hL: 0.12 * b, hR: -0.12 * b, kL: 0.2, kR: 0.2 }));
    r.raiz.position.y = Math.abs(Math.sin(t * 3.4 + 1)) * 0.18;
    // cámara: apenas se mueve para que se sienta viva
    cam.position.set(Math.sin(t * 0.35) * 0.9, 1.2, 6.4); cam.lookAt(0, 1.55, 0);
    // hinchas aplaudiendo
    const h = hinchas, o = h.o;
    for (let i = 0; i < NF; i++) {
      const d = h.d[i], y = d.y + Math.abs(Math.sin(t * d.v * 0.5 + d.ph)) * 0.14;
      o.rotation.set(0, 0, 0); o.scale.set(1, 1, 1);
      o.position.set(d.x, y + 0.55, d.z); o.updateMatrix(); h.b.setMatrixAt(i, o.matrix);
      o.position.set(d.x, y + 1.05, d.z); o.updateMatrix(); h.c.setMatrixAt(i, o.matrix);
      const ap = 0.5 + 0.5 * Math.sin(t * d.v + d.ph);
      for (let s = 0; s < 2; s++) {
        const sg = s ? 1 : -1;
        if (d.alto) { o.position.set(d.x + sg * (0.3 + 0.08 * ap), y + 1.45 + 0.12 * Math.sin(t * d.v + d.ph + s), d.z + 0.05); }
        else { o.position.set(d.x + sg * (0.04 + 0.2 * (1 - ap)), y + 0.85, d.z + 0.3); }
        o.updateMatrix(); h.m.setMatrixAt(i * 2 + s, o.matrix);
      }
    }
    h.b.instanceMatrix.needsUpdate = h.c.instanceMatrix.needsUpdate = h.m.instanceMatrix.needsUpdate = true;
    // papel picado cayendo con viento
    const cf = conf, oc = cf.o;
    for (let i = 0; i < NC; i++) {
      const d = cf.d[i]; d.y -= d.vy * dt; d.x += Math.sin(t * 0.8 + d.ph) * 1.4 * dt + 0.6 * dt; d.rx += dt * 4; d.ry += dt * 3;
      if (d.y < 0) { d.y = 14; d.x = rnd(-11, 11); }
      if (d.x > 12) { d.x = -12; }
      oc.position.set(d.x, d.y, d.z); oc.rotation.set(d.rx, d.ry, 0); oc.updateMatrix(); cf.m.setMatrixAt(i, oc.matrix);
    }
    cf.m.instanceMatrix.needsUpdate = true;
    // fuegos artificiales
    const f = fuegos;
    if (t >= f.proxima) { explotar(t); f.proxima = t + rnd(0.35, 0.8); }
    for (let i = 0; i < NP; i++) {
      if (f.vida[i] > 0) {
        f.vida[i] -= dt; f.vel[i * 3 + 1] -= 5.5 * dt;
        f.pos[i * 3] += f.vel[i * 3] * dt; f.pos[i * 3 + 1] += f.vel[i * 3 + 1] * dt; f.pos[i * 3 + 2] += f.vel[i * 3 + 2] * dt;
        const k = Math.max(0, Math.min(1, f.vida[i] / 1.2)); f.col[i * 3] *= 0.992; f.col[i * 3 + 1] *= 0.992; f.col[i * 3 + 2] *= 0.992;
        if (f.vida[i] <= 0) { f.pos[i * 3 + 1] = -100; }
      }
    }
    f.geo.attributes.position.needsUpdate = true; f.geo.attributes.color.needsUpdate = true;
    R.render(esc, cam);
    raf = requestAnimationFrame(cuadro);
  }
  return {
    iniciar: function (cvx, perfil) {
      try {
        if (!R) { R = new T.WebGLRenderer({ canvas: cvx, antialias: true, alpha: false }); if (T.sRGBEncoding) { R.outputEncoding = T.sRGBEncoding; } }
        if (!listo) { construir(); }
        poner(perfil); medir();
      } catch (e) { return false; }
      cancelAnimationFrame(raf); activo = true; t0 = performance.now(); cuadro.p = 0; raf = requestAnimationFrame(cuadro); return true;
    },
    detener: function () { activo = false; cancelAnimationFrame(raf); },
    medir: function () { if (R && listo) { medir(); } }
  };
})();
