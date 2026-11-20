"use strict";

var TRANSFORMATIONS = {
  echelleX: {
    parametres: "k",
    matrice: function (p) { return echelleHorizontale(p.k); },
    libelle: function (p) { return "Échelle horizontale, k = " + formaterNombre(p.k); }
  },
  echelleY: {
    parametres: "k",
    matrice: function (p) { return echelleVerticale(p.k); },
    libelle: function (p) { return "Échelle verticale, k = " + formaterNombre(p.k); }
  },
  translation: {
    parametres: "ab",
    matrice: function (p) { return translation(p.a, p.b); },
    libelle: function (p) { return "Translation de vecteur (" + formaterNombre(p.a) + ", " + formaterNombre(p.b) + ")"; }
  },
  symetrieX: {
    parametres: "aucun",
    matrice: function () { return symetrieAxeX(); },
    libelle: function () { return "Symétrie par rapport à l'axe des abscisses"; }
  },
  symetrieY: {
    parametres: "aucun",
    matrice: function () { return symetrieAxeY(); },
    libelle: function () { return "Symétrie par rapport à l'axe des ordonnées"; }
  },
  rotation90: {
    parametres: "aucun",
    matrice: function () { return rotation90(); },
    libelle: function () { return "Rotation de 90° (antihoraire)"; }
  },
  rotation180: {
    parametres: "aucun",
    matrice: function () { return rotation180(); },
    libelle: function () { return "Rotation de 180° (antihoraire)"; }
  },
  rotation270: {
    parametres: "aucun",
    matrice: function () { return rotation270(); },
    libelle: function () { return "Rotation de 270° (antihoraire)"; }
  },
  homothetie: {
    parametres: "k",
    matrice: function (p) { return homothetie(p.k); },
    libelle: function (p) { return "Homothétie de rapport k = " + formaterNombre(p.k); }
  }
};

var EXEMPLES = [
  {
    points: [{ x: 1, y: 1 }, { x: 4, y: 1 }, { x: 2, y: 3 }],
    etapes: [
      { type: "echelleX", parametres: { k: 2 } },
      { type: "symetrieX", parametres: {} },
      { type: "rotation90", parametres: {} }
    ]
  },
  {
    points: [{ x: 2, y: 0 }, { x: 6, y: 2 }, { x: 4, y: 6 }, { x: 0, y: 4 }],
    etapes: [
      { type: "homothetie", parametres: { k: 0.5 } },
      { type: "symetrieY", parametres: {} }
    ]
  },
  {
    points: [{ x: 1, y: 1 }, { x: 3, y: 1 }, { x: 1, y: 2 }],
    etapes: [
      { type: "translation", parametres: { a: 2, b: 1 } },
      { type: "rotation90", parametres: {} }
    ]
  }
];

var historique = [];

var corpsPoints = document.getElementById("corps-points");
var erreurPoints = document.getElementById("erreur-points");
var choixTransformation = document.getElementById("choix-transformation");
var paramK = document.getElementById("param-k");
var paramAB = document.getElementById("param-ab");
var erreurTransformation = document.getElementById("erreur-transformation");
var listeHistorique = document.getElementById("historique");
var historiqueVide = document.getElementById("historique-vide");
var canvas = document.getElementById("repere");
var ctx = canvas.getContext("2d");
var formule = document.getElementById("formule");
var zoneMatrice = document.getElementById("matrice-composee");
var corpsCoordonnees = document.getElementById("corps-coordonnees");

function ajouterLignePoint(x, y) {
  var tr = document.createElement("tr");
  tr.innerHTML =
    '<td class="nom"></td>' +
    '<td><input type="number" step="any" class="champ-x"></td>' +
    '<td><input type="number" step="any" class="champ-y"></td>' +
    '<td><button type="button" class="supprimer" title="Supprimer ce point">×</button></td>';
  tr.querySelector(".champ-x").value = x;
  tr.querySelector(".champ-y").value = y;
  tr.querySelector(".supprimer").addEventListener("click", function () {
    tr.remove();
    afficherTout();
  });
  corpsPoints.appendChild(tr);
}

function remplirPoints(points) {
  corpsPoints.innerHTML = "";
  points.forEach(function (p) { ajouterLignePoint(p.x, p.y); });
}

function lirePoints() {
  var lignes = corpsPoints.querySelectorAll("tr");
  var points = [];
  for (var i = 0; i < lignes.length; i++) {
    var x = lignes[i].querySelector(".champ-x").value;
    var y = lignes[i].querySelector(".champ-y").value;
    if (x === "" || y === "" || !isFinite(Number(x)) || !isFinite(Number(y))) {
      erreurPoints.textContent = "Le point " + nomSommet(i) + " a une coordonnée vide ou invalide.";
      return null;
    }
    points.push({ x: Number(x), y: Number(y) });
  }
  erreurPoints.textContent = "";
  return points;
}

function mettreAJourLignesPoints() {
  var lignes = corpsPoints.querySelectorAll("tr");
  lignes.forEach(function (tr, i) {
    tr.querySelector(".nom").textContent = nomSommet(i);
    tr.querySelector(".supprimer").disabled = lignes.length <= 3;
  });
}

function afficherParametres() {
  var t = TRANSFORMATIONS[choixTransformation.value];
  paramK.hidden = t.parametres !== "k";
  paramAB.hidden = t.parametres !== "ab";
  erreurTransformation.textContent = "";
}

function lireNombre(id) {
  var valeur = document.getElementById(id).value;
  if (valeur === "" || !isFinite(Number(valeur))) return null;
  return Number(valeur);
}

function ajouterTransformation(type, parametres) {
  var t = TRANSFORMATIONS[type];
  historique.push({
    libelle: t.libelle(parametres),
    matrice: t.matrice(parametres)
  });
}

function appliquerTransformation() {
  var type = choixTransformation.value;
  var t = TRANSFORMATIONS[type];
  var parametres = {};

  if (t.parametres === "k") {
    parametres.k = lireNombre("champ-k");
    if (parametres.k === null) {
      erreurTransformation.textContent = "Saisissez une valeur numérique pour k.";
      return;
    }
  } else if (t.parametres === "ab") {
    parametres.a = lireNombre("champ-a");
    parametres.b = lireNombre("champ-b");
    if (parametres.a === null || parametres.b === null) {
      erreurTransformation.textContent = "Saisissez des valeurs numériques pour a et b.";
      return;
    }
  }

  erreurTransformation.textContent = "";
  ajouterTransformation(type, parametres);
  afficherTout();
}

function reinitialiser() {
  historique = [];
  erreurTransformation.textContent = "";
  afficherTout();
}

function chargerExemple(numero) {
  var exemple = EXEMPLES[numero];
  remplirPoints(exemple.points);
  historique = [];
  exemple.etapes.forEach(function (etape) {
    ajouterTransformation(etape.type, etape.parametres);
  });
  afficherTout();
}

function creerMatriceHTML(M) {
  var table = document.createElement("table");
  table.className = "matrice";
  M.forEach(function (ligneM) {
    var tr = document.createElement("tr");
    ligneM.forEach(function (valeur) {
      var td = document.createElement("td");
      td.textContent = formaterNombre(valeur);
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
  return table;
}

function afficherHistorique() {
  listeHistorique.innerHTML = "";
  historiqueVide.hidden = historique.length > 0;
  historique.forEach(function (etape, i) {
    var li = document.createElement("li");
    li.appendChild(document.createTextNode("T" + (i + 1) + " : " + etape.libelle));
    li.appendChild(document.createElement("br"));
    li.appendChild(creerMatriceHTML(etape.matrice));
    listeHistorique.appendChild(li);
  });
}

function texteFormule() {
  if (historique.length === 0) return "M = I (aucune transformation)";
  var noms = [];
  for (var i = historique.length; i >= 1; i--) noms.push("T" + i);
  return "M = " + noms.join(" × ");
}

function afficherCoordonnees(points, transformes) {
  corpsCoordonnees.innerHTML = "";
  points.forEach(function (p, i) {
    var q = transformes[i];
    var tr = document.createElement("tr");
    [nomSommet(i),
     "(" + formaterNombre(p.x) + ", " + formaterNombre(p.y) + ")",
     "(" + formaterNombre(q.x) + ", " + formaterNombre(q.y) + ")"
    ].forEach(function (texte) {
      var td = document.createElement("td");
      td.textContent = texte;
      tr.appendChild(td);
    });
    corpsCoordonnees.appendChild(tr);
  });
}

function afficherTout() {
  mettreAJourLignesPoints();
  afficherHistorique();
  formule.textContent = texteFormule();

  var M = composer(historique.map(function (etape) { return etape.matrice; }));
  zoneMatrice.innerHTML = "";
  zoneMatrice.appendChild(creerMatriceHTML(M));

  var points = lirePoints();
  if (points === null) {
    dessinerRepere(ctx, calculerVue([], canvas.width));
    corpsCoordonnees.innerHTML = "";
    return;
  }

  var transformes = transformerPolygone(M, points);

  var vue = calculerVue([points, transformes], canvas.width);
  dessinerRepere(ctx, vue);
  dessinerPolygone(ctx, vue, points, {
    trait: "#7a7a7a", remplissage: "rgba(122, 122, 122, 0.12)", pointille: true, suffixe: ""
  });
  if (historique.length > 0) {
    dessinerPolygone(ctx, vue, transformes, {
      trait: "#c2410c", remplissage: "rgba(194, 65, 12, 0.18)", pointille: false, suffixe: "'"
    });
  }

  afficherCoordonnees(points, transformes);
}

document.getElementById("bouton-ajouter").addEventListener("click", function () {
  ajouterLignePoint(0, 0);
  afficherTout();
});

corpsPoints.addEventListener("input", afficherTout);

choixTransformation.addEventListener("change", afficherParametres);
document.getElementById("bouton-appliquer").addEventListener("click", appliquerTransformation);
document.getElementById("bouton-reinitialiser").addEventListener("click", reinitialiser);

document.querySelectorAll("[data-exemple]").forEach(function (bouton) {
  bouton.addEventListener("click", function () {
    chargerExemple(Number(bouton.dataset.exemple));
  });
});

remplirPoints([{ x: 1, y: 1 }, { x: 4, y: 1 }, { x: 2, y: 3 }]);
afficherParametres();
afficherTout();
