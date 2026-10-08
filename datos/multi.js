// =====================================================================
//  MULTIJUGADOR (2 a 4 jugadores)
//  1) Menú: Crear sala / Unirse a sala      2) Sala: clave, camisetas, el creador comienza
//  3) Moneda (X o 0) para definir el orden  4) Partida por turnos (90 s), los demás miran
//  5) Resultado final
//  Todo se guarda en Firebase (ver red.js) bajo  salas/<CLAVE>
//  El CREADOR de la sala es quien maneja la sala y la moneda; el tiempo de cada turno lo vigilan todos.
// =====================================================================
const MT = {
  es: { crearSala: "CREAR SALA", unirseSala: "UNIRSE A SALA", ingresarCodigo: "Escribí la clave de la sala", unirse: "UNIRSE", conectando: "Conectando...", errConexion: "No se pudo conectar. Revisá tu internet e intentá de nuevo.", errSala: "No existe esa sala o ya empezó.", salaLlena: "La sala está llena (máximo 4).", claveSala: "Clave de la sala", compartiClave: "Pasale esta clave a tus amigos", copiar: "Copiar", copiado: "¡Copiada!", jugadoresSala: "Jugadores", eligeCamiseta: "Elegí tu camiseta", comenzar: "COMENZAR", esperaCreador: "Esperando que el creador comience...", faltanJug: "Hacen falta al menos 2 jugadores", faltanCam: "Todos tienen que elegir camiseta", salirSala: "SALIR", creador: "creador", ordenTitulo: "Orden de juego", eligeLado: "Elegí tu lado de la moneda", listoBtn: "LISTO", esperandoOtros: "Esperando a los demás...", saleLado: "Salió", ganaPuesto: "gana el puesto", empate: "Empate entre", nadie: "Nadie acertó, se repite", tiraMoneda: "¡Girando la moneda!", ordenFinal: "Orden definido. ¡A jugar!", turnoDe: "Turno de", tuTurno: "¡TU TURNO!", segundos: "s", espectando: "Estás mirando", puestoElegido: "Puesto", girandoFase: "Girando la ruleta de", sinElegir: "Eligiendo puesto...", expulsado: "Te expulsaron de la partida por no jugar a tiempo.", expulsadoTag: "expulsado", salioSala: "El creador cerró la sala.", salirPartida: "¿Salir de la partida? Vas a perder.", finTitulo: "¡Fin de la partida!", ganador: "GANADOR", volverMenu: "Volver al menú", equipoMulti: "Equipo", total: "Total", completo: "completo", cartaSalio: "Salió una carta trampa" },
  en: { crearSala: "CREATE ROOM", unirseSala: "JOIN ROOM", ingresarCodigo: "Type the room code", unirse: "JOIN", conectando: "Connecting...", errConexion: "Could not connect. Check your internet and try again.", errSala: "That room does not exist or has already started.", salaLlena: "The room is full (max 4).", claveSala: "Room code", compartiClave: "Give this code to your friends", copiar: "Copy", copiado: "Copied!", jugadoresSala: "Players", eligeCamiseta: "Pick your jersey", comenzar: "START", esperaCreador: "Waiting for the creator to start...", faltanJug: "At least 2 players are needed", faltanCam: "Everyone must pick a jersey", salirSala: "LEAVE", creador: "creator", ordenTitulo: "Playing order", eligeLado: "Pick your side of the coin", listoBtn: "READY", esperandoOtros: "Waiting for the others...", saleLado: "It landed on", ganaPuesto: "takes the spot", empate: "Tie between", nadie: "Nobody guessed, flip again", tiraMoneda: "Flipping the coin!", ordenFinal: "Order set. Let's play!", turnoDe: "Turn of", tuTurno: "YOUR TURN!", segundos: "s", espectando: "You are watching", puestoElegido: "Position", girandoFase: "Spinning the wheel of", sinElegir: "Choosing a position...", expulsado: "You were kicked out for not playing in time.", expulsadoTag: "kicked out", salioSala: "The creator closed the room.", salirPartida: "Leave the match? You will lose.", finTitulo: "Match over!", ganador: "WINNER", volverMenu: "Back to menu", equipoMulti: "Team", total: "Total", completo: "complete", cartaSalio: "A trap card came out" },
  pt: { crearSala: "CRIAR SALA", unirseSala: "ENTRAR NA SALA", ingresarCodigo: "Digite o código da sala", unirse: "ENTRAR", conectando: "Conectando...", errConexion: "Não foi possível conectar. Verifique a internet e tente de novo.", errSala: "Essa sala não existe ou já começou.", salaLlena: "A sala está cheia (máximo 4).", claveSala: "Código da sala", compartiClave: "Passe este código aos seus amigos", copiar: "Copiar", copiado: "Copiado!", jugadoresSala: "Jogadores", eligeCamiseta: "Escolha sua camisa", comenzar: "COMEÇAR", esperaCreador: "Esperando o criador começar...", faltanJug: "São necessários pelo menos 2 jogadores", faltanCam: "Todos devem escolher uma camisa", salirSala: "SAIR", creador: "criador", ordenTitulo: "Ordem de jogo", eligeLado: "Escolha seu lado da moeda", listoBtn: "PRONTO", esperandoOtros: "Esperando os outros...", saleLado: "Saiu", ganaPuesto: "fica com a posição", empate: "Empate entre", nadie: "Ninguém acertou, repete", tiraMoneda: "Girando a moeda!", ordenFinal: "Ordem definida. Vamos jogar!", turnoDe: "Vez de", tuTurno: "SUA VEZ!", segundos: "s", espectando: "Você está assistindo", puestoElegido: "Posição", girandoFase: "Girando a roleta de", sinElegir: "Escolhendo posição...", expulsado: "Você foi expulso por não jogar a tempo.", expulsadoTag: "expulso", salioSala: "O criador fechou a sala.", salirPartida: "Sair da partida? Você vai perder.", finTitulo: "Fim da partida!", ganador: "VENCEDOR", volverMenu: "Voltar ao menu", equipoMulti: "Time", total: "Total", completo: "completo", cartaSalio: "Saiu uma carta armadilha" },
  it: { crearSala: "CREA STANZA", unirseSala: "ENTRA IN STANZA", ingresarCodigo: "Scrivi il codice della stanza", unirse: "ENTRA", conectando: "Connessione...", errConexion: "Impossibile connettersi. Controlla internet e riprova.", errSala: "Questa stanza non esiste o è già iniziata.", salaLlena: "La stanza è piena (massimo 4).", claveSala: "Codice stanza", compartiClave: "Dai questo codice ai tuoi amici", copiar: "Copia", copiado: "Copiato!", jugadoresSala: "Giocatori", eligeCamiseta: "Scegli la tua maglia", comenzar: "INIZIA", esperaCreador: "In attesa che il creatore inizi...", faltanJug: "Servono almeno 2 giocatori", faltanCam: "Tutti devono scegliere una maglia", salirSala: "ESCI", creador: "creatore", ordenTitulo: "Ordine di gioco", eligeLado: "Scegli il tuo lato della moneta", listoBtn: "PRONTO", esperandoOtros: "In attesa degli altri...", saleLado: "È uscito", ganaPuesto: "prende il posto", empate: "Pareggio tra", nadie: "Nessuno ha indovinato, si ripete", tiraMoneda: "La moneta gira!", ordenFinal: "Ordine definito. Si gioca!", turnoDe: "Turno di", tuTurno: "TOCCA A TE!", segundos: "s", espectando: "Stai guardando", puestoElegido: "Ruolo", girandoFase: "Gira la ruota di", sinElegir: "Sceglie il ruolo...", expulsado: "Sei stato espulso per non aver giocato in tempo.", expulsadoTag: "espulso", salioSala: "Il creatore ha chiuso la stanza.", salirPartida: "Uscire dalla partita? Perderai.", finTitulo: "Fine della partita!", ganador: "VINCITORE", volverMenu: "Torna al menu", equipoMulti: "Squadra", total: "Totale", completo: "completa", cartaSalio: "È uscita una carta trappola" }
};
["es", "en", "pt", "it"].forEach(function (l) { Object.assign(TT[l], MT[l]); });

const MT2 = {
  es: { volverSala: "VOLVER A TU SALA", compartir: "Compartir", invitacion: "¡Vení a jugar conmigo a ROMMEE FUTBOL DRAFT! Sala: {c}", ausente: "sin conexión", hayAusentes: "Esperá a que vuelvan los jugadores sin conexión" },
  en: { volverSala: "BACK TO YOUR ROOM", compartir: "Share", invitacion: "Come play ROMMEE FUTBOL DRAFT with me! Room: {c}", ausente: "offline", hayAusentes: "Wait for the offline players to come back" },
  pt: { volverSala: "VOLTAR PARA SUA SALA", compartir: "Compartilhar", invitacion: "Venha jogar ROMMEE FUTBOL DRAFT comigo! Sala: {c}", ausente: "sem conexão", hayAusentes: "Espere os jogadores sem conexão voltarem" },
  it: { volverSala: "TORNA ALLA TUA STANZA", compartir: "Condividi", invitacion: "Vieni a giocare a ROMMEE FUTBOL DRAFT con me! Stanza: {c}", ausente: "offline", hayAusentes: "Aspetta che i giocatori offline tornino" }
};
["es", "en", "pt", "it"].forEach(function (l) { Object.assign(TT[l], MT2[l]); });

const Multi = (function () {
  const DUR_TURNO = 90000, MAX = 4, GRACIA = 600000, GIRO_MS = 4000, VER_RES_MS = 2400, VER_ORDEN_MS = 3500, LETRAS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const S = { activo: false, codigo: null, uid: null, host: false, v: null, off: [], camOrig: null, estadoVisto: "", nroLocal: 0, timer: 0, hostBusy: "", vig: 0, cargando: false, jugando: false, termino: false };
  let monAnim = "", pend = null;
  const LS = "rommee_sala";

  function t(k) { return L()[k] || k; }
  function $(id) { return document.getElementById(id); }
  function msg(txt) { $("msgMulti").textContent = txt || ""; }
  function vista(n) { ["menu", "unirse", "sala", "moneda"].forEach(function (x) { $("mv-" + x).style.display = x === n ? "block" : "none"; }); msg(""); }

  // ---------- estilos propios ----------
  const st = document.createElement("style");
  st.textContent = [
    ".mvista { display: none; }",
    ".claveBig { font-size: clamp(38px, 12vw, 64px); font-weight: 900; letter-spacing: .25em; color: #ffd23f; text-shadow: 0 3px 0 #0a2a5e; margin: 6px 0; }",
    ".jugSala { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,.08); border-radius: 12px; padding: 6px 10px; margin: 6px 0; }",
    ".jugSala canvas { width: 64px; height: 40px; border-radius: 6px; background: rgba(0,0,0,.25); }",
    ".jugSala .nm { flex: 1; font-weight: bold; text-align: left; } .jugSala .tag { font-size: 12px; opacity: .8; }",
    ".kitM { cursor: pointer; border: 3px solid transparent; border-radius: 12px; background: rgba(255,255,255,.08); color: #fff; padding: 4px; margin: 3px; }",
    ".kitM.sel { border-color: #ffd23f; } .kitM[disabled] { opacity: .3; cursor: not-allowed; }",
    ".kitM canvas { display: block; width: 92px; height: 56px; }",
    ".monedaCaja { perspective: 700px; width: 150px; height: 150px; margin: 14px auto; }",
    ".mon { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; }",
    ".mon .cara { position: absolute; inset: 0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 88px; font-weight: 900; backface-visibility: hidden; -webkit-backface-visibility: hidden; border: 8px solid #b8860b; box-shadow: inset 0 0 18px rgba(0,0,0,.4), 0 6px 14px rgba(0,0,0,.5); background: radial-gradient(circle at 35% 30%, #fff3b0, #ffd23f 55%, #c99700); }",
    ".mon .cx { color: #d62828; } .mon .c0 { color: #1d4fb8; transform: rotateY(180deg); }",
    ".ladoBtn { font-size: 46px; font-weight: 900; width: 96px; height: 96px; border-radius: 50%; border: 4px solid #fff; background: rgba(255,255,255,.12); color: #fff; margin: 6px; cursor: pointer; }",
    ".ladoBtn.sel { background: #ffd23f; color: #0a2a5e; border-color: #fff; box-shadow: 0 0 18px #ffd23f; }",
    ".ordenFila { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin: 8px 0; }",
    ".ordenChip { background: rgba(2,22,44,.85); border: 2px solid #8fdcff; border-radius: 20px; padding: 6px 14px; font-weight: bold; }",
    ".ordenChip.vac { opacity: .4; border-style: dashed; }",
    "#mTurno { position: fixed; top: 6px; left: 50%; transform: translateX(-50%); z-index: 70; background: #ffd23f; color: #0a2a5e; font-weight: 900; padding: 6px 18px; border-radius: 24px; box-shadow: 0 4px 14px rgba(0,0,0,.5); display: none; pointer-events: none; font-size: clamp(14px, 4vw, 20px); }",
    "#mTurno.urge { background: #e63946; color: #fff; animation: latido .6s infinite; }",
    "@keyframes latido { 50% { transform: translateX(-50%) scale(1.08); } }",
    "#espect { position: fixed; inset: 0; z-index: 50; display: none; overflow-y: auto; background: rgba(3,26,46,.94); padding: 14px; box-sizing: border-box; text-align: center; }",
    "#espect .grande { font-size: clamp(22px, 6vw, 40px); font-weight: 900; color: #ffd23f; margin: 8px 0 2px; }",
    "#espect .reloj { font-size: clamp(30px, 9vw, 56px); font-weight: 900; }",
    "#espect .reloj.urge { color: #e63946; }",
    ".cadena { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; margin: 10px 0; }",
    ".cadena .eslabon { background: rgba(255,255,255,.1); border: 2px solid #8fdcff; border-radius: 12px; padding: 6px 12px; min-width: 90px; }",
    ".cadena .eslabon small { display: block; opacity: .7; font-size: 11px; } .cadena .eslabon.act { border-color: #ffd23f; background: rgba(255,210,63,.18); }",
    ".nivelBig { font-size: 56px; font-weight: 900; color: #ffd700; }",
    ".tablasM { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 12px; }",
    ".tablaM { background: rgba(2,22,44,.85); border: 2px solid rgba(143,220,255,.35); border-radius: 14px; padding: 8px 10px; min-width: 210px; max-width: 300px; text-align: left; font-size: 13px; }",
    ".tablaM.turno { border-color: #ffd23f; } .tablaM.fuera { opacity: .45; }",
    ".tablaM h4 { margin: 0 0 6px 0; color: #8fdcff; font-size: 15px; }",
    ".tablaM .fl { display: flex; justify-content: space-between; gap: 6px; padding: 1px 0; } .tablaM .fl b { color: #ffd700; }",
    "#finMulti { position: fixed; inset: 0; z-index: 80; display: none; background: radial-gradient(ellipse at 50% 30%, #3a2a6a, #0b0a1e 75%); text-align: center; padding: 0; box-sizing: border-box; }",
    "#finMulti canvas { position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; }",
    "#finMulti .panel { position: relative; text-align: center; }",
    ".rankFila { display: flex; justify-content: space-between; padding: 8px 12px; margin: 6px 0; border-radius: 10px; background: rgba(255,255,255,.08); font-weight: bold; }",
    ".rankFila.g { background: rgba(255,210,63,.25); border: 2px solid #ffd23f; }"
  ].join("\n");
  document.head.appendChild(st);
  const eTurno = document.createElement("div"); eTurno.id = "mTurno"; document.body.appendChild(eTurno);
  const eEsp = document.createElement("div"); eEsp.id = "espect"; document.body.appendChild(eEsp);
  const eFin = document.createElement("div"); eFin.id = "finMulti"; eFin.innerHTML = '<canvas id="cvFiestaM"></canvas><div class="finGrid" id="finMultiGrid"></div>'; document.body.appendChild(eFin);

  // ---------- utilidades ----------
  function claveAzar() { let c = ""; for (let i = 0; i < 5; i++) { c += LETRAS[Math.floor(Math.random() * LETRAS.length)]; } return c; }
  function ruta(p) { return "salas/" + S.codigo + (p ? "/" + p : ""); }
  function miJug() { return { n: perfil.nombre || "?", cam: -1, num: 0, on: true, act: true, lado: "", listo: false, t: Red.ahora(), pf: { d: perfil.dorsal | 0, p: perfil.piel | 0, c: perfil.colPelo | 0, b: perfil.barba | 0, cb: perfil.colBarba | 0, l: perfil.lentes ? 1 : 0 } }; }
  function jugs(v) { v = v || S.v; return (v && v.jug) || {}; }
  function ids(v) { return Object.keys(jugs(v)).sort(function (a, b) { return (jugs(v)[a].t || 0) - (jugs(v)[b].t || 0) || (a < b ? -1 : 1); }); }
  function nombre(u) { const j = jugs()[u]; return j ? j.n : "?"; }
  // Firebase puede devolver la lista de jugadores como "arreglo con huecos": se ignoran los huecos
  function eqLista(j) { const r = []; if (j && j.eq) { Object.keys(j.eq).forEach(function (k) { if (j.eq[k]) { r.push([+k, j.eq[k]]); } }); } return r.sort(function (a, b) { return a[0] - b[0]; }); }
  function cantEq(j) { return eqLista(j).length; }
  function totalEq(j) { return eqLista(j).reduce(function (s, e) { return s + (e[1].nivel || 0); }, 0); }
  function claveJugador(j) { return (j.nombre + "|" + j.equipo).replace(/[.#$\[\]\/]/g, "_"); }
  function limpiarTimer() { clearInterval(S.timer); S.timer = 0; }
  function mini(cv, k) { if (cv && k >= 0 && typeof Per3D_OK === "function" && Per3D_OK()) { try { Per3D.dibujarMiniatura(cv, k); } catch (e) {} } }

  // ---------- sala recordada (para "Volver a tu sala") ----------
  function guardarSala() { try { localStorage.setItem(LS, JSON.stringify({ c: S.codigo, t: Date.now() })); } catch (e) {} }
  function olvidarSala() { try { localStorage.removeItem(LS); } catch (e) {} }
  function salaGuardada() { try { const o = JSON.parse(localStorage.getItem(LS)); if (o && o.c && Date.now() - o.t < 3 * 3600000) { return o; } } catch (e) {} return null; }
  function mostrarVolver() { const b = $("btnVolverSala"), g = salaGuardada(); if (b) { b.style.display = g ? "block" : "none"; if (g) { b.textContent = t("volverSala") + " (" + g.c + ")"; } } }
  // El creador lleva más de GRACIA ausente (sala de espera): la sala se considera abandonada
  function creadorVencido(v) { const c = v && v.jug && v.jug[v.creador]; return !!(c && c.on === false && c.vis && Red.ahora() - c.vis > GRACIA); }
  // Marca "estoy acá" y deja preparado el aviso automático "se me cortó la conexión" (no borra nada: solo marca ausente)
  function presencia() {
    if (!S.activo || !S.codigo) { return; }
    const p = ruta("jug/" + S.uid);
    Red.get(p).then(function (x) {
      if (!x || !S.activo) { return; }
      Red.update(p, { on: true }).catch(function () {});
      Red.alDesconectar(p + "/on", false).catch(function () {});
      Red.alDesconectar(p + "/vis", Red.TS()).catch(function () {});
    }).catch(function () {});
  }
  // Cada 15 s: limpia salas de espera abandonadas y jugadores que llevan mucho ausentes
  function vigilar() {
    if (!S.activo || !S.v) { return; }
    const v = S.v, J = jugs(v), ahora = Red.ahora();
    if (v.estado === "sala") {
      if (creadorVencido(v)) { Red.remove("salas/" + S.codigo).catch(function () {}); return; }
      if (S.host) {
        ids(v).forEach(function (u) {
          const j = J[u];
          if (u !== S.uid && j.on === false && j.vis && ahora - j.vis > GRACIA) {
            Red.remove(ruta("jug/" + u)).catch(function () {});
            if (j.cam >= 0) { Red.remove(ruta("camisas/" + j.cam)).catch(function () {}); }
          }
        });
      }
    } else if (v.estado === "moneda") { hostMoneda(); }
  }
  function alVolverVisible() { if (!document.hidden && S.activo) { presencia(); } }
  document.addEventListener("visibilitychange", alVolverVisible);

  // ---------- pantallas del menú ----------
  function abrir() { limpiarSesion(); ir("multi"); vista("menu"); mostrarVolver(); }
  function volver() { const g = salaGuardada(); if (!g) { mostrarVolver(); return; } entrarPorCodigo(g.c); }
  // Enlace de invitación (?sala=CLAVE): entra solo a la sala
  function invitacionPendiente() { if (!pend) { return; } const c = pend; pend = null; abrir(); $("inpCodigo").value = c; unirse(); }
  function leerInvitacion() {
    try {
      const q = new URLSearchParams(location.search).get("sala");
      if (q) { pend = q.trim().toUpperCase().slice(0, 5); history.replaceState(null, "", location.href.split(/[?#]/)[0]); if (typeof saltarIntro === "function") { saltarIntro(); } }
    } catch (e) {}
  }
  function enlace() { return location.href.split(/[?#]/)[0] + "?sala=" + S.codigo; }
  function compartir() {
    const txt = t("invitacion").replace("{c}", S.codigo), url = enlace();
    if (navigator.share) { navigator.share({ title: "ROMMEE FUTBOL DRAFT", text: txt, url: url }).catch(function () {}); return; }
    try { navigator.clipboard.writeText(txt + " " + url); $("btnCompartir").textContent = t("copiado"); } catch (e) {}
  }
  function verUnirse() { vista("unirse"); $("inpCodigo").value = ""; $("inpCodigo").focus(); }

  async function conectar() {
    msg(t("conectando"));
    try { S.uid = await Red.iniciar(); return true; } catch (e) { msg(t("errConexion")); return false; }
  }

  async function crear() {
    if (S.cargando) { return; } S.cargando = true;
    try {
      if (!(await conectar())) { return; }
      for (let i = 0; i < 6; i++) {
        const c = claveAzar();
        const r = await Red.transaccion("salas/" + c, function (cur) { return cur === null ? { creador: S.uid, estado: "sala", creada: Red.ahora() } : undefined; });
        if (r.ok) { S.codigo = c; S.host = true; break; }
      }
      if (!S.codigo) { msg(t("errConexion")); return; }
      await entrarEnSala();
    } catch (e) { msg(t("errConexion")); } finally { S.cargando = false; }
  }
  async function unirse() { const c = ($("inpCodigo").value || "").trim().toUpperCase(); if (c.length < 3) { return; } await entrarPorCodigo(c); }
  async function entrarPorCodigo(c) {
    if (S.cargando) { return; } S.cargando = true;
    try {
      if (!(await conectar())) { return; }
      const v = await Red.get("salas/" + c);
      if (v && v.estado === "sala" && creadorVencido(v)) { Red.remove("salas/" + c).catch(function () {}); olvidarSala(); mostrarVolver(); msg(t("errSala")); return; }
      if (!v || (v.estado !== "sala" && !(v.jug && v.jug[S.uid]))) { olvidarSala(); mostrarVolver(); msg(t("errSala")); return; }
      S.codigo = c; S.host = v.creador === S.uid;
      const r = await Red.transaccion("salas/" + c + "/jug", function (cur) {
        cur = cur || {};
        if (cur[S.uid]) { return cur; }
        if (Object.keys(cur).length >= MAX) { return undefined; }
        cur[S.uid] = miJug(); return cur;
      });
      if (!r.ok) { S.codigo = null; msg(t("salaLlena")); return; }
      await entrarEnSala(true);
    } catch (e) { msg(t("errConexion")); } finally { S.cargando = false; }
  }
  async function entrarEnSala(yaEsta) {
    S.activo = true; S.camOrig = perfil.camisa; S.estadoVisto = ""; S.nroLocal = 0; S.termino = false; S.jugando = false;
    if (!yaEsta) { await Red.set(ruta("jug/" + S.uid), miJug()); }
    guardarSala();
    S.off.push(Red.on(ruta(), onSala));
    S.off.push(Red.on(".info/connected", function (c) { if (c) { presencia(); } }));         // cada vez que se recupera la conexión: "estoy acá" otra vez
    clearInterval(S.vig); S.vig = setInterval(vigilar, 15000);
    vista("sala");
  }

  // ---------- cambios de la sala ----------
  function onSala(v) {
    if (!S.activo) { return; }
    if (v === null || !v.jug || (!v.jug[v.creador] && v.estado === "sala")) { if (!S.termino) { cerrarPorCreador(); } return; }
    if (!v.jug[S.uid]) { if (v.estado === "sala") { cerrarPorCreador(); } return; }
    S.v = v;
    if (S.estadoVisto !== v.estado) {
      S.estadoVisto = v.estado;
    }
    if (v.estado === "sala") { dibujarSala(); hostSala(); }
    else if (v.estado === "moneda") { dibujarMoneda(); hostMoneda(); }
    else if (v.estado === "juego") { juego(); }
    else if (v.estado === "fin") { fin(); }
  }
  function cerrarPorCreador() { olvidarSala(); const m = t("salioSala"); salir(true); ir("multi"); vista("menu"); msg(m); }

  // ---------- SALA DE ESPERA ----------
  function dibujarSala() {
    if (!S.v || S.estadoVisto !== "sala") { return; }
    vista("sala"); $("msgMulti").textContent = "";
    const v = S.v, J = jugs(), lista = ids(), mias = J[S.uid] || {}, tomadas = v.camisas || {};
    let h = '<div class="panel" style="text-align:center"><h4>' + t("claveSala") + '</h4><div class="claveBig">' + esc(S.codigo) + '</div><small>' + t("compartiClave") + '</small><br><button id="btnCompartir" class="gb" style="width:auto;padding:8px 18px" onclick="Multi.compartir()">📤 ' + t("compartir") + '</button> <button id="btnCopiar" onclick="Multi.copiar()">' + t("copiar") + "</button></div>";
    h += '<div class="panel"><h4>' + t("jugadoresSala") + " (" + lista.length + "/" + MAX + ")</h4>";
    lista.forEach(function (u) { const j = J[u]; h += '<div class="jugSala"><canvas width="92" height="56" data-cam="' + (j.cam | 0) + '" data-ok="' + (j.cam >= 0 ? 1 : 0) + '"></canvas><span class="nm">' + esc(j.n) + (u === S.uid ? " (vos)" : "") + '</span><span class="tag">' + (u === v.creador ? "★ " + t("creador") + " " : "") + (j.on === false ? "⚠ " + t("ausente") : "") + "</span></div>"; });
    h += "</div>";
    h += '<div class="panel"><h4>' + t("eligeCamiseta") + '</h4><div style="text-align:center">';
    for (let i = 0; i < 4; i++) { const dueno = tomadas[i], ocupada = dueno && dueno !== S.uid; h += '<button class="kitM' + (mias.cam === i ? " sel" : "") + '" ' + (ocupada ? "disabled" : "") + ' onclick="Multi.camisa(' + i + ')"><canvas width="92" height="56" data-kit="' + i + '"></canvas>' + esc(L().camisetas[i]) + "</button>"; }
    h += "</div></div>";
    const todos = lista.length >= 2 && lista.every(function (u) { return J[u].cam >= 0 && J[u].on !== false; });
    if (S.host) { h += '<button class="gb" ' + (todos ? "" : "disabled") + ' onclick="Multi.comenzar()">' + t("comenzar") + "</button><p>" + (lista.length < 2 ? t("faltanJug") : (!todos ? (lista.some(function (u) { return J[u].on === false; }) ? t("hayAusentes") : t("faltanCam")) : "")) + "</p>"; }
    else { h += "<p>" + t("esperaCreador") + "</p>"; }
    h += '<button onclick="Multi.salirBtn()">' + t("salirSala") + "</button>";
    $("mv-sala").innerHTML = h;
    Array.prototype.forEach.call($("mv-sala").querySelectorAll("canvas"), function (cv) {
      if (cv.dataset.kit !== undefined) { mini(cv, +cv.dataset.kit); } else if (cv.dataset.ok === "1") { mini(cv, +cv.dataset.cam); }
    });
  }
  function copiar() {
    try { navigator.clipboard.writeText(S.codigo); $("btnCopiar").textContent = t("copiado"); } catch (e) {}
  }
  async function camisa(i) {
    const mias = jugs()[S.uid]; if (!mias || mias.cam === i) { return; }
    const r = await Red.transaccion(ruta("camisas/" + i), function (cur) { return (cur === null || cur === S.uid) ? S.uid : undefined; });
    if (!r.ok) { return; }
    if (mias.cam >= 0) { Red.remove(ruta("camisas/" + mias.cam)).catch(function () {}); }
    Red.update(ruta("jug/" + S.uid), { cam: i });
  }
  function hostSala() {}
  async function comenzar() {
    if (!S.host) { return; }
    const J = jugs(), lista = ids();
    if (lista.length < 2 || !lista.every(function (u) { return J[u].cam >= 0 && J[u].on !== false; })) { return; }
    const up = { estado: "moneda", moneda: { ronda: 1, estado: "elegir", res: "", t0: 0, cand: lista, rest: lista, orden: [], ult: null } };
    lista.forEach(function (u) { up["jug/" + u + "/lado"] = ""; up["jug/" + u + "/listo"] = false; });
    Red.update(ruta(), up);
  }

  // ---------- MONEDA ----------
  function dibujarMoneda() {
    const v = S.v, m = v.moneda; if (!m) { return; }
    vista("moneda");
    const J = jugs(), cand = m.cand || [], orden = m.orden || [], total = ids().length, mia = J[S.uid] || {};
    const soyCand = cand.indexOf(S.uid) >= 0;
    let h = '<div class="panel" style="text-align:center"><h4>' + t("ordenTitulo") + '</h4><div class="ordenFila">';
    for (let i = 0; i < total; i++) { const u = orden[i]; h += u ? '<span class="ordenChip">' + (i + 1) + "º " + esc(nombre(u)) + "</span>" : '<span class="ordenChip vac">' + (i + 1) + "º ?</span>"; }
    h += "</div>";
    h += '<div class="monedaCaja"><div class="mon" id="mon"><div class="cara cx">X</div><div class="cara c0">0</div></div></div>';
    if (m.estado === "elegir") {
      if (m.ult) { h += "<p><b>" + t("saleLado") + " " + esc(m.ult.res) + "</b> · " + (function (g) { return g.length === 0 ? t("nadie") : (g.length === 1 ? esc(nombre(g[0])) + " " + t("ganaPuesto") + " " + m.ult.pos + "º" : t("empate") + " " + g.map(nombre).map(esc).join(", ")); })(m.ult.g || []) + "</p>"; }
      if (soyCand) {
        h += "<p>" + t("eligeLado") + "</p><div>";
        ["X", "0"].forEach(function (l) { h += '<button class="ladoBtn' + (mia.lado === l ? " sel" : "") + '" ' + (mia.listo ? "disabled" : "") + ' onclick="Multi.lado(\'' + l + "')\">" + l + "</button>"; });
        h += '</div><button class="gb" style="width:min(70vw,260px)" ' + (mia.lado && !mia.listo ? "" : "disabled") + ' onclick="Multi.listo()">' + t("listoBtn") + "</button>";
      }
      h += "<p>" + cand.map(function (u) { const j = J[u] || {}; return esc(j.n || "?") + (j.listo ? " ✔" : " …") + (j.listo || u === S.uid ? "" : ""); }).join(" · ") + "</p>";
    } else if (m.estado === "girando") { h += "<h3>" + t("tiraMoneda") + "</h3>"; }
    else if (m.estado === "fin") { h += "<h3>" + t("ordenFinal") + "</h3>"; }
    h += "</div>";
    const caja = $("mv-moneda"), girando = m.estado === "girando";
    // Para no cortar la animación de la moneda, el panel se rehace solo si cambió algo importante
    const firma = JSON.stringify([m.estado, m.ronda, m.res, orden, cand.map(function (u) { const j = J[u] || {}; return [j.lado, j.listo]; })]);
    if (caja.dataset.f !== firma) { caja.dataset.f = firma; caja.innerHTML = h; animarMoneda(m); }
  }
  function animarMoneda(m) {
    const e = $("mon"); if (!e) { return; }
    const fin = (m.res === "X" ? 0 : 180);
    if (m.estado === "girando") {
      const falta = Math.max(0, GIRO_MS - (Red.ahora() - m.t0));
      if (falta <= 0) { e.style.transform = "rotateY(" + (360 * 6 + fin) + "deg)"; return; }
      e.style.transition = "none"; e.style.transform = "rotateY(0deg)"; void e.offsetWidth;
      e.style.transition = "transform " + (falta / 1000) + "s cubic-bezier(.15,.6,.2,1)";
      e.style.transform = "rotateY(" + (360 * 6 + fin) + "deg)";
    } else if (m.res) { e.style.transform = "rotateY(" + (360 * 6 + fin) + "deg)"; }
  }
  function lado(l) { const j = jugs()[S.uid]; if (!j || j.listo) { return; } Red.update(ruta("jug/" + S.uid), { lado: l }); }
  function listo() { const j = jugs()[S.uid]; if (!j || !j.lado || j.listo) { return; } Red.update(ruta("jug/" + S.uid), { listo: true }); }

  // Lo que solo hace el creador: tirar la moneda cuando todos están listos y armar el resultado
  function hostMoneda() {
    if (!S.host) { return; }
    const v = S.v, m = v.moneda, J = jugs(); if (!m) { return; }
    // quien se desconectó sale del sorteo
    const idsAct = ids().filter(function (u) { return J[u].act !== false; });
    const caidos = idsAct.filter(function (u) { return J[u].on === false && (!J[u].vis || Red.ahora() - J[u].vis > 45000); });
    if (caidos.length && m.estado === "elegir") {
      const up = {}; caidos.forEach(function (u) { up["jug/" + u + "/act"] = false; });
      const quedan = function (a) { return (a || []).filter(function (u) { return caidos.indexOf(u) < 0; }); };
      up.moneda = Object.assign({}, m, { cand: quedan(m.cand), rest: quedan(m.rest) });
      if (up.moneda.rest.length === 0) { return; }
      Red.update(ruta(), up); return;
    }
    if (m.estado === "elegir") {
      const cand = m.cand || []; if (!cand.length) { return; }
      if (cand.every(function (u) { return J[u] && J[u].listo; }) && S.hostBusy !== "tirar" + m.ronda) {
        S.hostBusy = "tirar" + m.ronda;
        Red.transaccion(ruta("moneda"), function (cur) { if (!cur || cur.estado !== "elegir" || cur.ronda !== m.ronda) { return undefined; } cur.estado = "girando"; cur.res = Math.random() < 0.5 ? "X" : "0"; cur.t0 = Red.ahora(); return cur; });
      }
    } else if (m.estado === "girando" && S.hostBusy !== "res" + m.ronda) {
      S.hostBusy = "res" + m.ronda;
      const falta = Math.max(0, GIRO_MS + VER_RES_MS - (Red.ahora() - m.t0));
      setTimeout(function () { resolverMoneda(m.ronda); }, falta);
    } else if (m.estado === "fin" && S.hostBusy !== "ini") {
      S.hostBusy = "ini";
      setTimeout(iniciarPartida, VER_ORDEN_MS);
    }
  }
  async function resolverMoneda(ronda) {
    const v = await Red.get(ruta()); if (!v || v.estado !== "moneda" || v.moneda.ronda !== ronda || v.moneda.estado !== "girando") { return; }
    const m = v.moneda, J = v.jug, R = m.res, up = {};
    let cand = m.cand || [], rest = (m.rest || []).slice(), orden = (m.orden || []).slice();
    const g = cand.filter(function (u) { return J[u] && J[u].lado === R; });
    let ult = { res: R, g: g, pos: orden.length + 1 };
    if (g.length === 1) { orden.push(g[0]); rest = rest.filter(function (u) { return u !== g[0]; }); cand = rest.slice(); }
    else if (g.length > 1) { cand = g; }
    if (rest.length === 1) { orden.push(rest[0]); rest = []; cand = []; }
    (m.cand || []).concat(rest).forEach(function (u) { up["jug/" + u + "/lado"] = ""; up["jug/" + u + "/listo"] = false; });
    if (rest.length === 0) {
      orden.forEach(function (u, i) { up["jug/" + u + "/num"] = i + 1; });
      up.moneda = { ronda: ronda + 1, estado: "fin", res: R, t0: m.t0, cand: [], rest: [], orden: orden, ult: ult };
    } else {
      up.moneda = { ronda: ronda + 1, estado: "elegir", res: R, t0: m.t0, cand: cand, rest: rest, orden: orden, ult: ult };
    }
    S.hostBusy = "";
    Red.update(ruta(), up);
  }
  function iniciarPartida() {
    const v = S.v; if (!v || v.estado !== "moneda") { return; }
    const formas = Object.keys(FORMACIONES), orden = v.moneda.orden;
    Red.update(ruta(), { estado: "juego", juego: { form: formas[Math.floor(Math.random() * formas.length)], uid: orden[0], nro: 1, t0: Red.ahora(), dur: DUR_TURNO, vivo: null } });
  }

  // ---------- PARTIDA ----------
  function miTurno() { return S.activo && S.jugando && S.v && S.v.juego && S.v.juego.uid === S.uid && !S.termino; }
  function juego() {
    const v = S.v, jv = v.juego; if (!jv) { return; }
    const mia = jugs()[S.uid];
    if (mia && mia.act === false) { expulsadoYo(); return; }
    if (!S.jugando) {
      S.jugando = true; limpiarPartida(); if (mia && mia.cam >= 0) { perfil.camisa = mia.cam; }
      el("selForm").value = jv.form; ir("pantallaJuego"); empezar();
      eqLista(mia).forEach(function (e) {                                              // si volvés a la partida, recupero tu equipo
        const d = e[1], jg = JUGADORES.filter(function (x) { return x.nombre === d.nombre && x.equipo === d.equipo; })[0] || { nombre: d.nombre, equipo: d.equipo, nivel: d.nivel, nacionalidad: d.nac, edad: 0 };
        if (slots[e[0]]) { slots[e[0]].jugador = jg; }
      });
      dibujarCancha();
      $("btnReiniciar").style.display = "none";
      S.timer = setInterval(tic, 250);
    }
    if (jv.fin) { return; }
    if (S.nroLocal !== jv.nro) {
      S.nroLocal = jv.nro;
      if (jv.uid === S.uid) { empezarMiTurno(); }
    }
    dibujarEspectador();
  }
  function empezarMiTurno() {
    PT1.detener(); el("zonaRuleta").style.display = "none"; el("presentacion").classList.remove("visible");
    slotActivo = null; fase = 0; sel = {}; girando = false; comodinPuesto = false; pickRes = null; tokGiro++; revelaOculta(); el("aviso").textContent = L().tocaPuesto; dibujarCancha();
    eTurno.style.display = "block";
  }
  function restante() { const jv = S.v && S.v.juego; return jv ? Math.max(0, (jv.t0 + jv.dur - Red.ahora()) / 1000) : 0; }
  function tic() {
    if (!S.activo || !S.v || !S.v.juego) { return; }
    const jv = S.v.juego, r = restante(), mio = jv.uid === S.uid;
    const txt = Math.ceil(r);
    if (mio && !S.termino && !jv.fin) { eTurno.style.display = "block"; eTurno.textContent = t("tuTurno") + "  " + txt + t("segundos"); eTurno.classList.toggle("urge", r < 15); }
    else { eTurno.style.display = "none"; }
    const rl = eEsp.querySelector(".reloj"); if (rl) { rl.textContent = txt + t("segundos"); rl.classList.toggle("urge", r < 15); }
    if (!jv.fin && r <= 0 && Red.ahora() > jv.t0 + jv.dur + 1200) { pasarTurno(jv.nro, true); }     // se acabó el tiempo: expulsado
  }
  // Pasa el turno al siguiente. Si "expulsar" es true, el que estaba jugando queda afuera.
  function siguiente(v, actual, excluir) {
    const J = v.jug, lista = Object.keys(J).filter(function (u) { return J[u].act !== false && u !== excluir && cantEq(J[u]) < 11; })
      .sort(function (a, b) { return J[a].num - J[b].num; });
    if (!lista.length) { return null; }
    const n = (J[actual] || {}).num || 0;
    return lista.filter(function (u) { return J[u].num > n; })[0] || lista[0];
  }
  async function pasarTurno(nroEsperado, expulsar, vista) {
    const v = vista || S.v; if (!v || !v.juego || v.juego.nro !== nroEsperado) { return; }
    const quien = v.juego.uid, sig = siguiente(v, quien, expulsar ? quien : null);
    const r = await Red.transaccion(ruta("juego"), function (cur) {
      if (!cur || cur.nro !== nroEsperado || cur.fin) { return undefined; }
      if (sig === null) { cur.fin = true; return cur; }
      cur.uid = sig; cur.nro = cur.nro + 1; cur.t0 = Red.ahora(); cur.vivo = null; return cur;
    });
    if (!r.ok) { return; }
    const up = {};
    if (expulsar) { up["jug/" + quien + "/act"] = false; }
    if (sig === null) { up.estado = "fin"; }
    if (Object.keys(up).length) { Red.update(ruta(), up); }
  }

  // Lo que el jugador de turno va contando a los espectadores
  function reportar(pendiente) {
    if (!miTurno()) { return; }
    const cad = [sel.liga || "", sel.equipo || "", sel.nac || "", ""];
    if (pendiente !== undefined && fase >= 1) { cad[fase - 1] = pendiente; }
    const vivo = { pos: slotActivo !== null && slots[slotActivo] ? slots[slotActivo].pos : "", fase: fase, cad: cad, n: lista ? lista.length : 0, giro: !!(pendiente === undefined && fase >= 1), carta: "", nivel: 0, t: Red.ahora() };
    if (fase === 4 && pendiente !== undefined && jugadorActual) { vivo.nivel = jugadorActual.nivel; }
    Red.set(ruta("juego/vivo"), vivo).catch(function () {});
  }
  function reportarCarta(id) { if (miTurno()) { Red.set(ruta("juego/vivo"), { pos: slotActivo !== null && slots[slotActivo] ? slots[slotActivo].pos : "", fase: 1, cad: ["", "", "", ""], n: 0, giro: false, carta: id, nivel: 0, t: Red.ahora() }).catch(function () {}); } }
  function usado(j) { return !!(S.v && S.v.usados && S.v.usados[claveJugador(j)]); }
  // Se sumó un jugador a mi equipo: guardarlo, bloquearlo para los demás y pasar el turno
  function alSumar(idx, j) {
    if (!miTurno()) { return; }
    const up = {}; up["jug/" + S.uid + "/eq/" + idx] = { nombre: j.nombre, equipo: j.equipo, nivel: j.nivel, pos: slots[idx].pos, nac: j.nacionalidad };
    up["usados/" + claveJugador(j)] = S.uid;
    const nro = S.v.juego.nro, vv = JSON.parse(JSON.stringify(S.v));        // copia con mi jugador ya sumado (no esperamos a que vuelva de la red)
    vv.jug[S.uid].eq = vv.jug[S.uid].eq || {}; vv.jug[S.uid].eq[idx] = up["jug/" + S.uid + "/eq/" + idx];
    Red.update(ruta(), up);
    pasarTurno(nro, false, vv);
  }
  function alQuitar(idx) {                 // carta: se va un jugador mío y queda libre para los demás
    const j = slots[idx] && slots[idx].jugador; if (!j || !S.activo) { return; }
    const up = {}; up["jug/" + S.uid + "/eq/" + idx] = null; up["usados/" + claveJugador(j)] = null; Red.update(ruta(), up);
  }
  function completo() {}                   // el final lo decide pasarTurno cuando ya nadie puede jugar

  function dibujarEspectador() {
    const v = S.v, jv = v.juego, J = jugs();
    if (jv.fin) { eEsp.style.display = "none"; eTurno.style.display = "none"; return; }
    if (jv.uid === S.uid) { eEsp.style.display = "none"; return; }
    eEsp.style.display = "block";
    const vivo = jv.vivo, NF = L().fases;
    let h = '<div style="font-size:14px;opacity:.8">' + t("espectando") + '</div><div class="grande">' + t("turnoDe") + " " + esc(nombre(jv.uid)) + ' (#' + ((J[jv.uid] || {}).num || "") + ')</div><div class="reloj">' + Math.ceil(restante()) + t("segundos") + "</div>";
    if (vivo && vivo.carta) {
      const c = CARTAS.filter(function (x) { return x.id === vivo.carta; })[0];
      h += '<div class="panel" style="text-align:center"><h3>🃏 ' + t("cartaSalio") + "</h3>" + (c ? "<b>" + c.ico + " " + esc((c.t[ajustes.idioma] || c.t.es)[0]) + "</b><p>" + esc((c.t[ajustes.idioma] || c.t.es)[1]) + "</p>" : "") + "</div>";
    } else if (vivo && vivo.pos) {
      h += "<p>" + t("puestoElegido") + ": <b>" + esc(POS[vivo.pos] || vivo.pos) + "</b></p><div class=\"cadena\">";
      for (let i = 0; i < 4; i++) { h += '<div class="eslabon' + (vivo.fase === i + 1 ? " act" : "") + '"><small>' + esc(NF[i]) + "</small>" + (vivo.cad[i] ? esc(vivo.cad[i] === CARTA_ID ? L().cartaTrampa : vivo.cad[i]) : "…") + "</div>"; }
      h += "</div>";
      if (vivo.giro) { h += "<p>" + t("girandoFase") + " <b>" + esc(NF[vivo.fase - 1] || "") + "</b>...</p>"; }
      if (vivo.nivel) { h += '<div class="nivelBig">' + vivo.nivel + "</div>"; }
    } else { h += "<p>" + t("sinElegir") + "</p>"; }
    h += '<div class="tablasM">' + ids().map(function (u) {
      const j = J[u];
      return '<div class="tablaM' + (u === jv.uid ? " turno" : "") + (j.act === false ? " fuera" : "") + '"><h4>#' + (j.num || "") + " " + esc(j.n) + (u === S.uid ? " (vos)" : "") + (j.act === false ? " · " + t("expulsadoTag") : "") + " — " + totalEq(j) + "</h4>" +
        eqLista(j).map(function (e) { return '<div class="fl"><span>' + esc(e[1].pos) + " " + esc(e[1].nombre) + "</span><b>" + e[1].nivel + "</b></div>"; }).join("") + "</div>";
    }).join("") + "</div>";
    eEsp.innerHTML = h;
  }

  function expulsadoYo() {
    if (S.termino) { return; }
    olvidarSala(); const m = t("expulsado"); salir(true); ir("menu"); setTimeout(function () { alert(m); }, 100);
  }

  // ---------- FINAL ----------
  function fin() {
    if (S.termino) { return; }
    S.termino = true; olvidarSala(); limpiarTimer(); eEsp.style.display = "none"; eTurno.style.display = "none";
    try { PT1.detener(); } catch (e) {}
    const J = jugs(), lista = ids().map(function (u) { return { u: u, j: J[u], tot: totalEq(J[u]), fuera: J[u].act === false }; })
      .sort(function (a, b) { return (a.fuera - b.fuera) || (b.tot - a.tot); });
    const ganador = lista.length && !lista[0].fuera ? lista[0] : (lista[0] || null);
    const gj = ganador ? ganador.j : null, form = S.v && S.v.juego && S.v.juego.form, plantilla = (typeof FORMACIONES !== "undefined" && FORMACIONES[form]) || [];
    const jugadores = gj ? eqLista(gj).map(function (e) { const s = plantilla[e[0]] || ["", 50, 50]; return { x: s[1], y: s[2], nombre: e[1].nombre, nivel: e[1].nivel || 0 }; }) : [];
    FinalUI.render($("finMultiGrid"), {
      nombre: gj ? gj.n : "", total: ganador ? ganador.tot : 0, form: form, jugadores: jugadores,
      ranking: lista.map(function (r) { return { n: r.j.n, tot: r.tot, gan: !!ganador && r.u === ganador.u && !r.fuera, yo: r.u === S.uid, fuera: r.fuera }; }),
      botones: '<button class="gb" onclick="Multi.salirBtn(true)">' + t("volverMenu") + "</button>"
    });
    eFin.style.display = "block";
    if (gj) {                                             // todos ven al campeón festejando con la copa
      const pf = gj.pf || {}, look = ganador.u === S.uid ? perfil : { nombre: gj.n, dorsal: pf.d == null ? 10 : pf.d, piel: pf.p, colPelo: pf.c, barba: pf.b, colBarba: pf.cb, lentes: !!pf.l, camisa: gj.cam >= 0 ? gj.cam : 0 };
      if (ganador.u === S.uid) { look.camisa = gj.cam >= 0 ? gj.cam : look.camisa; }
      try { if (Per3D_OK() && typeof Fiesta3D !== "undefined") { Fiesta3D.iniciar($("cvFiestaM"), look); } } catch (e) {}
    }
  }

  // ---------- salir / limpiar ----------
  function limpiarSesion() {
    if (S.codigo && S.uid) { try { Red.cancelarDesconexion(ruta("jug/" + S.uid)).catch(function () {}); } catch (e) {} }
    S.off.forEach(function (f) { try { f(); } catch (e) {} }); S.off = []; limpiarTimer(); clearInterval(S.vig); S.vig = 0;
    if (S.camOrig !== null && S.camOrig !== undefined) { perfil.camisa = S.camOrig; S.camOrig = null; }
    S.activo = false; S.codigo = null; S.host = false; S.v = null; S.estadoVisto = ""; S.nroLocal = 0; S.hostBusy = ""; S.jugando = false; S.termino = false;
    eEsp.style.display = "none"; eTurno.style.display = "none"; eFin.style.display = "none";
    try { Fiesta3D.detener && Fiesta3D.detener(); } catch (e) {}
    const b = $("btnReiniciar"); if (b) { b.style.display = ""; }
    const mc = $("mv-moneda"); if (mc) { mc.dataset.f = ""; }
  }
  // quedarse o irse; "silencioso" = ya no hace falta avisar a la sala
  function salir(silencioso) {
    if (!silencioso) { olvidarSala(); }
    const c = S.codigo, u = S.uid, estado = S.estadoVisto, host = S.host, v = S.v;
    if (S.activo && c && !silencioso) {
      try {
        if (estado === "sala") {
          if (host) { Red.remove("salas/" + c); } else { Red.remove("salas/" + c + "/jug/" + u); }
          const j = v && v.jug && v.jug[u]; if (j && j.cam >= 0) { Red.remove("salas/" + c + "/camisas/" + j.cam); }
        } else if (estado === "juego" && v && v.juego && !v.juego.fin) {
          const nro = v.juego.nro, mio = v.juego.uid === u;
          Red.update("salas/" + c + "/jug/" + u, { act: false }).then(function () { if (mio) { S.v = Object.assign({}, v); } });
          if (mio) { const sig = siguiente(Object.assign({}, v, { jug: Object.assign({}, v.jug, { [u]: Object.assign({}, v.jug[u], { act: false }) }) }), u, u); Red.transaccion("salas/" + c + "/juego", function (cur) { if (!cur || cur.nro !== nro || cur.fin) { return undefined; } if (sig === null) { cur.fin = true; return cur; } cur.uid = sig; cur.nro++; cur.t0 = Red.ahora(); cur.vivo = null; return cur; }).then(function (r) { if (r.ok && sig === null) { Red.update("salas/" + c, { estado: "fin" }); } }); }
        } else if (estado === "fin" && host) { Red.remove("salas/" + c); }
      } catch (e) {}
    }
    limpiarSesion();
  }
  function salirBtn(alFinal) {
    if (!alFinal && S.estadoVisto === "juego" && !confirm(t("salirPartida"))) { return; }
    salir(false); limpiarPartida(); ir("menu");
  }

  return { leer: leerInvitacion, volver: volver, compartir: compartir, invitacionPendiente: invitacionPendiente, abrir: abrir, verUnirse: verUnirse, crear: crear, unirse: unirse, camisa: camisa, copiar: copiar, comenzar: comenzar, lado: lado, listo: listo, salirBtn: salirBtn, salir: salir,
    reportar: reportar, reportarCarta: reportarCarta, usado: usado, alSumar: alSumar, alQuitar: alQuitar, completo: completo, miTurno: miTurno,
    get activo() { return S.activo && S.jugando; }, _S: S };
})();
window.Multi = Multi;
aplicarIdioma();
Multi.leer();
