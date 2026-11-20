"use strict";

function pointVersVecteur(point) {
  return [point.x, point.y, 1];
}

function vecteurVersPoint(vecteur) {
  return { x: vecteur[0], y: vecteur[1] };
}

function multiplierMatriceVecteur(M, v) {
  if (M[0].length !== v.length) {
    throw new Error("Dimensions incompatibles pour le produit matrice × vecteur");
  }
  var resultat = [];
  for (var i = 0; i < M.length; i++) {
    var somme = 0;
    for (var k = 0; k < v.length; k++) {
      somme = somme + M[i][k] * v[k];
    }
    resultat.push(somme);
  }
  return resultat;
}

function multiplierMatrices(A, B) {
  if (A[0].length !== B.length) {
    throw new Error("Dimensions incompatibles pour le produit de matrices");
  }
  var C = [];
  for (var i = 0; i < A.length; i++) {
    var ligne = [];
    for (var j = 0; j < B[0].length; j++) {
      var somme = 0;
      for (var k = 0; k < B.length; k++) {
        somme = somme + A[i][k] * B[k][j];
      }
      ligne.push(somme);
    }
    C.push(ligne);
  }
  return C;
}

function matriceIdentite() {
  return [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ];
}

function versHomogene(M) {
  return [
    [M[0][0], M[0][1], 0],
    [M[1][0], M[1][1], 0],
    [0,       0,       1]
  ];
}

function echelleHorizontale(k) {
  return versHomogene([
    [k, 0],
    [0, 1]
  ]);
}

function echelleVerticale(k) {
  return versHomogene([
    [1, 0],
    [0, k]
  ]);
}

function translation(a, b) {
  return [
    [1, 0, a],
    [0, 1, b],
    [0, 0, 1]
  ];
}

function symetrieAxeX() {
  return versHomogene([
    [1,  0],
    [0, -1]
  ]);
}

function symetrieAxeY() {
  return versHomogene([
    [-1, 0],
    [ 0, 1]
  ]);
}

function rotation90() {
  return versHomogene([
    [0, -1],
    [1,  0]
  ]);
}

function rotation180() {
  return versHomogene([
    [-1,  0],
    [ 0, -1]
  ]);
}

function rotation270() {
  return versHomogene([
    [ 0, 1],
    [-1, 0]
  ]);
}

function homothetie(k) {
  return versHomogene([
    [k, 0],
    [0, k]
  ]);
}

function composer(matrices) {
  var M = matriceIdentite();
  for (var i = 0; i < matrices.length; i++) {
    M = multiplierMatrices(matrices[i], M);
  }
  return M;
}

function transformerPolygone(M, points) {
  return points.map(function (point) {
    return vecteurVersPoint(multiplierMatriceVecteur(M, pointVersVecteur(point)));
  });
}
