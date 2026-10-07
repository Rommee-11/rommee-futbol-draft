// =====================================================================
//  CARTAS TRAMPA: aparecen en la ruleta de ligas (casillero "CARTA TRAMPA").
//  solo: true  -> funciona jugando solo.   solo: false -> es para multijugador (todavía inactiva).
//  propia: true -> perjudica al que la saca.
//  t: [nombre, descripción] en cada idioma.
// =====================================================================
const CARTA_ID = "@@carta";
const CARTAS = [
  { id: "doble", solo: true, ico: "⚽⚽", t: {
    es: ["Doble penal", "¡Tenés dos intentos en el próximo penal! Se cuenta el mejor."], en: ["Double penalty", "You get two tries on the next kick! The best one counts."],
    pt: ["Pênalti duplo", "Você tem duas tentativas no próximo pênalti! Vale a melhor."], it: ["Doppio rigore", "Hai due tentativi al prossimo rigore! Conta il migliore."] } },
  { id: "bota", solo: true, ico: "👟", t: {
    es: ["Bota de oro", "En el próximo penal la zona verde (y todas las buenas) es mucho más ancha."], en: ["Golden boot", "On the next kick the green zone (and the good ones) is much wider."],
    pt: ["Chuteira de ouro", "No próximo pênalti a zona verde (e as boas) fica bem mais larga."], it: ["Scarpa d'oro", "Al prossimo rigore la zona verde (e le buone) è molto più larga."] } },
  { id: "comodin", solo: true, ico: "🃏", t: {
    es: ["Comodín de puesto", "El próximo jugador puede ser de CUALQUIER puesto (menos arquero) y ocupa el lugar que elegiste."], en: ["Position wildcard", "The next player can be from ANY position (not goalkeeper) and fills the spot you chose."],
    pt: ["Coringa de posição", "O próximo jogador pode ser de QUALQUER posição (menos goleiro) e ocupa a vaga escolhida."], it: ["Jolly di ruolo", "Il prossimo giocatore può essere di QUALSIASI ruolo (portiere escluso) e occupa il posto scelto."] } },
  { id: "descarte", solo: true, propia: true, ico: "🗑️", t: {
    es: ["Descarte", "Se va tu jugador de MENOR nivel y tenés que volver a sortear ese puesto."], en: ["Discard", "Your LOWEST-rated player leaves and you must draw that position again."],
    pt: ["Descarte", "Seu jogador de MENOR nível sai e você precisa sortear essa posição de novo."], it: ["Scarto", "Il tuo giocatore di livello PIÙ BASSO se ne va e devi sorteggiare di nuovo quel ruolo."] } },
  { id: "roja", solo: true, propia: true, ico: "🟥", t: {
    es: ["Tarjeta roja", "¡Expulsan a un jugador de tu equipo AL AZAR! Tenés que sortear de nuevo ese puesto."], en: ["Red card", "A RANDOM player from your team is sent off! You must draw that position again."],
    pt: ["Cartão vermelho", "Um jogador AO ACASO do seu time é expulso! Você precisa sortear essa posição de novo."], it: ["Cartellino rosso", "Un giocatore A CASO della tua squadra viene espulso! Devi sorteggiare di nuovo quel ruolo."] } },
  // ---- Multijugador (todavía no se sortean) ----
  { id: "robo", solo: false, ico: "🦹", t: { es: ["Robo de jugador", "Le robás un jugador a un rival (si no tiene Escudo)."], en: ["Player theft", "Steal a player from a rival (unless shielded)."], pt: ["Roubo de jogador", "Roube um jogador de um rival (se não tiver Escudo)."], it: ["Furto di giocatore", "Rubi un giocatore a un rivale (se non ha lo Scudo)."] } },
  { id: "escudo", solo: false, ico: "🛡️", t: { es: ["Escudo", "Te protege de UN robo."], en: ["Shield", "Protects you from ONE theft."], pt: ["Escudo", "Protege você de UM roubo."], it: ["Scudo", "Ti protegge da UN furto."] } },
  { id: "bloqueo", solo: false, ico: "🔒", t: { es: ["Bloqueo", "Bloqueás a un jugador tuyo: nadie ni ninguna carta te lo puede sacar."], en: ["Lock", "Lock one of your players: no user or card can take him."], pt: ["Bloqueio", "Bloqueia um jogador seu: ninguém nem carta pode tirá-lo."], it: ["Blocco", "Blocchi un tuo giocatore: nessuno e nessuna carta può portarlo via."] } },
  { id: "intercambio", solo: false, ico: "🔄", t: { es: ["Intercambio forzado", "Cambiás un jugador tuyo por uno de un rival."], en: ["Forced swap", "Swap one of your players with a rival's."], pt: ["Troca forçada", "Troque um jogador seu por um de um rival."], it: ["Scambio forzato", "Scambi un tuo giocatore con uno di un rivale."] } },
  { id: "lesion", solo: false, ico: "🤕", t: { es: ["Lesión", "Un rival pierde un jugador."], en: ["Injury", "A rival loses a player."], pt: ["Lesão", "Um rival perde um jogador."], it: ["Infortunio", "Un rivale perde un giocatore."] } },
  { id: "congelar", solo: false, ico: "🧊", t: { es: ["Congelar", "Un rival pierde su próximo turno."], en: ["Freeze", "A rival skips their next turn."], pt: ["Congelar", "Um rival perde a próxima vez."], it: ["Congela", "Un rivale salta il prossimo turno."] } },
  { id: "niebla", solo: false, ico: "🌫️", t: { es: ["Niebla", "A un rival se le tapa la barra del penal."], en: ["Fog", "A rival's penalty bar gets hidden."], pt: ["Neblina", "A barra do pênalti de um rival fica escondida."], it: ["Nebbia", "La barra del rigore di un rivale viene nascosta."] } },
  { id: "maldicion", solo: false, ico: "💀", t: { es: ["Maldición", "Maldecís al rival que elijas: su próximo penal es más difícil."], en: ["Curse", "Curse the rival you choose: their next kick is harder."], pt: ["Maldição", "Amaldiçoe o rival que escolher: o próximo pênalti dele é mais difícil."], it: ["Maledizione", "Maledici il rivale che scegli: il suo prossimo rigore è più difficile."] } }
];
