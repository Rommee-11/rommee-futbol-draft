// =====================================================================
//  Barra de puntería del penal ("apretar en el momento justo")
//  Una línea blanca va y viene por una barra de colores (rojo, naranja,
//  amarillo, verde). Al apretar PATEA la línea se frena y el color donde
//  quedó decide qué tan probable es el gol y qué tan buenos son los
//  jugadores que van a salir en la ruleta.
//
//  Para cambiar los números del juego tocá solo esta parte de arriba.
// =====================================================================
const BarraTiming = (function () {
  // Mitad del ancho de cada zona (la barra mide 1). Verde 14 %, amarillo 22 %, naranja 26 %, el resto rojo
  const MED = { verde: 0.05, amarillo: 0.14, naranja: 0.26 };
  // Probabilidades de cada color: [gol, ataja el arquero, afuera]
  const PROB = { verde: [85, 10, 5], amarillo: [65, 22, 13], naranja: [45, 30, 25], rojo: [25, 35, 40] };
  // Qué tanto se inclina la suerte hacia los mejores jugadores (0 = todo al azar)
  const SUERTE = { verde: 1.5, amarillo: 1.0, naranja: 0.6, rojo: 0.2 }, SUERTE_ATAJA = -0.3, SUERTE_AFUERA = -0.6;
  const ORDEN = ["rojo", "naranja", "amarillo", "verde"];
  const COLOR = { verde: "#2ecc71", amarillo: "#ffd23f", naranja: "#f77f00", rojo: "#e63946" };
  const T_BARRIDO = 0.85, T_MIN = 0.5, ESPERA_INI = 0.8;   // segundos que tarda una pasada, mínimo, y espera antes de arrancar

  function zonaEn(x, c, mult) {
    const d = Math.abs(x - c);
    if (d <= MED.verde * mult) { return "verde"; }
    if (d <= MED.amarillo * mult) { return "amarillo"; }
    if (d <= MED.naranja * mult) { return "naranja"; }
    return "rojo";
  }
  function resultado(zona) {                       // sortea gol / ataja / afuera según el color
    const p = PROB[zona], r = Math.random() * 100;
    const res = r < p[0] ? "gol" : (r < p[0] + p[1] ? "ataja" : "afuera");
    return { zona: zona, res: res, k: res === "gol" ? SUERTE[zona] : (res === "ataja" ? SUERTE_ATAJA : SUERTE_AFUERA) };
  }
  function crear(barra, relleno) {
    relleno.style.display = "none";
    const cur = document.createElement("div"); cur.className = "cursorB"; barra.appendChild(cur);
    const txt = document.createElement("div"); txt.className = "zonaTxt"; barra.parentNode.insertBefore(txt, barra.nextSibling);
    let c = 0.5, pos = 0, dir = 1, pasadas = 0, mult = 1, intentos = 1, hechos = [], activo = false, espera = 0, tPrev = 0;
    function pintar() {
      const h = [MED.verde, MED.amarillo, MED.naranja].map(function (m) { return m * mult; });
      const L = function (v) { return (Math.max(0, Math.min(1, v)) * 100).toFixed(2) + "%"; };
      const s = [["rojo", 0, c - h[2]], ["naranja", c - h[2], c - h[1]], ["amarillo", c - h[1], c - h[0]], ["verde", c - h[0], c + h[0]],
        ["amarillo", c + h[0], c + h[1]], ["naranja", c + h[1], c + h[2]], ["rojo", c + h[2], 1]];
      barra.style.background = "linear-gradient(90deg," + s.map(function (z) { return COLOR[z[0]] + " " + L(z[1]) + "," + COLOR[z[0]] + " " + L(z[2]); }).join(",") + ")";
    }
    function poner() { cur.style.left = (pos * 100).toFixed(2) + "%"; }
    return {
      // opciones: { mult: agrandar las zonas (carta Bota de oro), intentos: 2 con la carta Doble penal }
      iniciar: function (op) {
        op = op || {}; mult = op.mult || 1; intentos = op.intentos || 1; hechos = [];
        c = 0.3 + Math.random() * 0.4; pos = 0; dir = 1; pasadas = 0; espera = ESPERA_INI; tPrev = 0; activo = true;
        barra.classList.remove("parada"); txt.textContent = ""; txt.style.color = ""; pintar(); poner();
      },
      actualizar: function (ts) {
        if (!activo) { return; }
        const dt = tPrev ? Math.min(0.05, (ts - tPrev) / 1000) : 0; tPrev = ts;
        if (espera > 0) { espera -= dt; return; }
        const dur = Math.max(T_MIN, T_BARRIDO * Math.pow(0.93, pasadas));
        pos += dir * dt / dur;
        if (pos >= 1) { pos = 1; dir = -1; pasadas++; } else if (pos <= 0) { pos = 0; dir = 1; pasadas++; }
        poner();
      },
      // Devuelve null si todavía falta un intento (Doble penal), o el resultado final
      parar: function (nombres) {
        if (!activo) { return null; }
        const z = zonaEn(pos, c, mult); hechos.push(z);
        txt.textContent = (nombres && nombres[z]) || z.toUpperCase(); txt.style.color = COLOR[z];
        if (hechos.length < intentos) { espera = 0.5; return null; }
        activo = false; barra.classList.add("parada");
        const mejor = hechos.reduce(function (a, b) { return ORDEN.indexOf(b) > ORDEN.indexOf(a) ? b : a; });
        return resultado(mejor);
      },
      detener: function () { activo = false; },
      activa: function () { return activo; },
      PROB: PROB, SUERTE: SUERTE, resultado: resultado, zonaEn: zonaEn
    };
  }
  return { crear: crear, resultado: resultado, PROB: PROB, SUERTE: SUERTE, COLOR: COLOR };
})();

// Modificadores que activan las cartas (se gastan en el siguiente penal)
window.MOD_PENAL = { bota: false, doble: false };
function opcionesPenal() {
  const o = { mult: window.MOD_PENAL.bota ? 1.8 : 1, intentos: window.MOD_PENAL.doble ? 2 : 1 };
  window.MOD_PENAL.bota = false; window.MOD_PENAL.doble = false;
  return o;
}
