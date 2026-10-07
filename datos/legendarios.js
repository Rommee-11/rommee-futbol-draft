// =====================================================================
//  LIGA DE LEGENDARIOS: no tiene equipos reales, todos juegan en "Leyendas".
//  Cada fila: [nombre, dorsal, edad, nacionalidad, puesto, nivel]
//  Edad 0 = se muestra "Leyenda". Para agregar uno nuevo, sumá una fila (el puesto usa los mismos códigos que jugadores.js).
//  Los niveles son aproximados (FC / iconos); los marcados con (est.) son estimados.
// =====================================================================
const LIGA_LEGENDARIOS = "Liga de Legendarios";
EQUIPOS[LIGA_LEGENDARIOS] = ["Leyendas"];
PLANTELES["Leyendas"] = [
  // Arqueros
  ["Lev Yashin", 1, 0, "Rusia", "POR", 92], ["Gianluigi Buffon", 1, 0, "Italia", "POR", 91], ["Oliver Kahn", 1, 0, "Alemania", "POR", 91],
  ["Iker Casillas", 1, 0, "España", "POR", 90], ["Peter Schmeichel", 1, 0, "Dinamarca", "POR", 89], ["Petr Čech", 1, 0, "República Checa", "POR", 88],
  // Laterales derechos
  ["Cafu", 2, 0, "Brasil", "LD", 91], ["Carlos Alberto Torres", 4, 0, "Brasil", "LD", 91], ["Javier Zanetti", 4, 0, "Argentina", "LD", 89],
  ["Carles Puyol", 5, 0, "España", "LD", 89], ["Lilian Thuram", 15, 0, "Francia", "LD", 88], ["Gianluca Zambrotta", 19, 0, "Italia", "LD", 86],
  // Laterales izquierdos
  ["Paolo Maldini", 3, 0, "Italia", "LI", 92], ["Roberto Carlos", 6, 0, "Brasil", "LI", 90], ["Marcelo", 12, 0, "Brasil", "LI", 89],
  ["Philipp Lahm", 21, 0, "Alemania", "LI", 89], ["Ashley Cole", 3, 0, "Inglaterra", "LI", 86],
  // Defensores centrales
  ["Franz Beckenbauer", 5, 0, "Alemania", "DFC", 92], ["Franco Baresi", 6, 0, "Italia", "DFC", 91], ["Bobby Moore", 6, 0, "Inglaterra", "DFC", 90],
  ["Giorgio Chiellini", 3, 0, "Italia", "DFC", 89], ["Alessandro Nesta", 13, 0, "Italia", "DFC", 89], ["Fabio Cannavaro", 5, 0, "Italia", "DFC", 89],
  ["Rio Ferdinand", 5, 0, "Inglaterra", "DFC", 88], ["Fernando Hierro", 4, 0, "España", "DFC", 88], ["Daniel Passarella", 6, 0, "Argentina", "DFC", 87],
  // Mediocentros defensivos
  ["Lothar Matthäus", 10, 0, "Alemania", "MCD", 90], ["Patrick Vieira", 4, 0, "Francia", "MCD", 88], ["Fernando Redondo", 6, 0, "Argentina", "MCD", 88],
  ["Claude Makélélé", 4, 0, "Francia", "MCD", 87], ["Xabi Alonso", 14, 0, "España", "MCD", 87], ["Gennaro Gattuso", 8, 0, "Italia", "MCD", 86],
  ["Michael Essien", 5, 0, "Ghana", "MCD", 86],
  // Mediocentros
  ["Andrés Iniesta", 8, 0, "España", "MC", 92], ["Xavi Hernández", 6, 0, "España", "MC", 91], ["Andrea Pirlo", 21, 0, "Italia", "MC", 90],
  ["Toni Kroos", 8, 0, "Alemania", "MC", 90], ["Steven Gerrard", 8, 0, "Inglaterra", "MC", 89], ["Frank Lampard", 8, 0, "Inglaterra", "MC", 88],
  ["Paul Scholes", 18, 0, "Inglaterra", "MC", 88], ["Yaya Touré", 42, 0, "Costa de Marfil", "MC", 88],
  // Mediocampistas ofensivos
  ["Diego Maradona", 10, 0, "Argentina", "MCO", 95], ["Zinedine Zidane", 10, 0, "Francia", "MCO", 94], ["Johan Cruyff", 14, 0, "Países Bajos", "MCO", 93],
  ["Kaká", 8, 0, "Brasil", "MCO", 91], ["Zico", 10, 0, "Brasil", "MCO", 91], ["Roberto Baggio", 10, 0, "Italia", "MCO", 91],
  ["Alessandro Del Piero", 10, 0, "Italia", "MCO", 90], ["Alfredo Di Stéfano", 9, 0, "Argentina", "MCO", 90], ["Lionel Messi", 10, 0, "Argentina", "MCO", 89],
  ["Juan Román Riquelme", 10, 0, "Argentina", "MCO", 88],
  // Mediocampistas derechos
  ["Luís Figo", 7, 0, "Portugal", "MD", 89], ["David Beckham", 7, 0, "Inglaterra", "MD", 88], ["Dirk Kuyt", 18, 0, "Países Bajos", "MD", 87],
  // Mediocampistas izquierdos
  ["Pavel Nedvěd", 11, 0, "República Checa", "MI", 88], ["Bastian Schweinsteiger", 31, 0, "Alemania", "MI", 88], ["Robert Pirès", 7, 0, "Francia", "MI", 88],
  ["Michael Laudrup", 10, 0, "Dinamarca", "MI", 88], ["John Barnes", 11, 0, "Inglaterra", "MI", 87],
  // Extremos derechos
  ["Garrincha", 7, 0, "Brasil", "ED", 92], ["George Best", 7, 0, "Irlanda del Norte", "ED", 90], ["Jairzinho", 7, 0, "Brasil", "ED", 89],
  ["Hristo Stoichkov", 8, 0, "Bulgaria", "ED", 89], ["Gareth Bale", 11, 0, "Gales", "ED", 88], ["Andriy Shevchenko", 7, 0, "Ucrania", "ED", 88],
  // Extremos izquierdos
  ["Ronaldinho", 10, 0, "Brasil", "EI", 93], ["Thierry Henry", 14, 0, "Francia", "EI", 91], ["Rivaldo", 10, 0, "Brasil", "EI", 90], ["Franck Ribéry", 7, 0, "Francia", "EI", 88],
  // Delanteros centro
  ["Pelé", 10, 0, "Brasil", "DC", 95], ["Ronaldo Nazário", 9, 0, "Brasil", "DC", 94], ["Ferenc Puskás", 10, 0, "Hungría", "DC", 92],
  ["Gerd Müller", 13, 0, "Alemania", "DC", 92], ["Zlatan Ibrahimović", 10, 0, "Suecia", "DC", 92], ["Eusébio", 13, 0, "Portugal", "DC", 91],
  ["Marco van Basten", 9, 0, "Países Bajos", "DC", 91], ["Raúl González", 7, 0, "España", "DC", 90], ["Gabriel Batistuta", 9, 0, "Argentina", "DC", 89],
  ["Mario Kempes", 10, 0, "Argentina", "DC", 88], ["Hernán Crespo", 9, 0, "Argentina", "DC", 86], ["Sergio Agüero", 10, 0, "Argentina", "DC", 86],
  ["Robert Lewandowski", 9, 0, "Polonia", "DC", 84], ["Cristiano Ronaldo", 7, 0, "Portugal", "DC", 84], ["Karim Benzema", 9, 0, "Francia", "DC", 82],
  ["Luis Suárez", 9, 0, "Uruguay", "DC", 80]
];
// Se suma a la lista general de jugadores (misma forma que arma jugadores.js)
(function () {
  PLANTELES["Leyendas"].forEach(function (r) {
    JUGADORES.push({ nombre: r[0], equipo: "Leyendas", nacionalidad: r[3], posicion: PUESTOS[r[4]] || r[4], nivel: r[5], edad: r[2], dorsal: r[1] });
  });
})();
