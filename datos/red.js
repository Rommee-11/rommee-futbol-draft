// =====================================================================
//  RED: conexión con Firebase (la base de datos en internet donde viven las salas).
//  Todo el resto del multijugador usa solo estas funciones, así que si algún
//  día cambiamos de servicio, se cambia solamente este archivo.
//
//  Los datos de abajo (CONFIG) identifican tu proyecto de Firebase. No son secretos:
//  quien protege los datos son las "Reglas" que pegaste en la consola de Firebase.
// =====================================================================
const Red = (function () {
  const CONFIG = {
    apiKey: "AIzaSyDxxO3Sr_ef1OCXfStN9wSbS7K9nigD46s",
    authDomain: "rommee-futbol-draft.firebaseapp.com",
    databaseURL: "https://rommee-futbol-draft-default-rtdb.firebaseio.com",
    projectId: "rommee-futbol-draft",
    storageBucket: "rommee-futbol-draft.firebasestorage.app",
    messagingSenderId: "125254187450",
    appId: "1:125254187450:web:0276d202bb82536662c583"
  };
  const BASE = "https://www.gstatic.com/firebasejs/10.14.1/";
  let db = null, uid = null, offset = 0, listo = null;

  function cargar(src) {
    return new Promise(function (ok, mal) {
      const s = document.createElement("script"); s.src = src; s.async = false;
      s.onload = ok; s.onerror = function () { mal(new Error("sin-conexion")); };
      document.head.appendChild(s);
    });
  }
  // Conecta (una sola vez) y entra como usuario anónimo. Devuelve una promesa con el identificador del usuario.
  function iniciar() {
    if (listo) { return listo; }
    listo = (async function () {
      if (!window.firebase) {
        await cargar(BASE + "firebase-app-compat.js");
        await cargar(BASE + "firebase-auth-compat.js");
        await cargar(BASE + "firebase-database-compat.js");
      }
      if (!firebase.apps.length) { firebase.initializeApp(CONFIG); }
      const cred = await firebase.auth().signInAnonymously();
      uid = cred.user.uid; db = firebase.database();
      db.ref(".info/serverTimeOffset").on("value", function (s) { offset = s.val() || 0; });
      return uid;
    })();
    listo.catch(function () { listo = null; });
    return listo;
  }
  function ref(p) { return db.ref(p); }
  return {
    iniciar: iniciar,
    uid: function () { return uid; },
    ahora: function () { return Date.now() + offset; },               // hora del servidor (igual para todos)
    TS: function () { return firebase.database.ServerValue.TIMESTAMP; },
    get: function (p) { return ref(p).once("value").then(function (s) { return s.val(); }); },
    set: function (p, v) { return ref(p).set(v); },
    update: function (p, o) { return ref(p).update(o); },
    remove: function (p) { return ref(p).remove(); },
    // Escucha cambios. Devuelve una función para dejar de escuchar.
    on: function (p, cb) { const r = ref(p), f = function (s) { cb(s.val()); }; r.on("value", f); return function () { r.off("value", f); }; },
    // Cambio "atómico": fn(valorActual) devuelve el valor nuevo, o undefined para cancelar. Devuelve una promesa {ok, valor}.
    transaccion: function (p, fn) { return ref(p).transaction(fn, undefined, false).then(function (r) { return { ok: r.committed, valor: r.snapshot.val() }; }); },
    // Si se corta la conexión de este aparato, el servidor hace esto solo.
    alDesconectar: function (p, valor) { const d = ref(p).onDisconnect(); return valor === undefined ? d.remove() : d.set(valor); },
    cancelarDesconexion: function (p) { return ref(p).onDisconnect().cancel(); }
  };
})();
