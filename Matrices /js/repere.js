"use strict";

function calculerVue(listes, taille) {
  var xmin = 0, xmax = 0, ymin = 0, ymax = 0;
  listes.forEach(function (points) {
    points.forEach(function (p) {
      xmin = Math.min(xmin, p.x); xmax = Math.max(xmax, p.x);
      ymin = Math.min(ymin, p.y); ymax = Math.max(ymax, p.y);
    });
  });

  var etendue = Math.max(xmax - xmin, ymax - ymin, 4) * 1.3;

  return {
    taille: taille,
    centreX: (xmin + xmax) / 2,
    centreY: (ymin + ymax) / 2,
    echelle: taille / etendue
  };
}

function versPixel(vue, x, y) {
  return {
    px: vue.taille / 2 + (x - vue.centreX) * vue.echelle,
    py: vue.taille / 2 - (y - vue.centreY) * vue.echelle
  };
}

function choisirPas(echelle) {
  var pas = 1;
  var facteurs = [2, 2.5, 2];
  var i = 0;
  while (pas * echelle < 35) {
    pas = pas * facteurs[i % 3];
    i++;
  }
  return pas;
}

function dessinerRepere(ctx, vue) {
  var t = vue.taille;
  ctx.clearRect(0, 0, t, t);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, t, t);

  var pas = choisirPas(vue.echelle);
  var demi = t / 2 / vue.echelle;
  var xDebut = Math.ceil((vue.centreX - demi) / pas) * pas;
  var yDebut = Math.ceil((vue.centreY - demi) / pas) * pas;
  var origine = versPixel(vue, 0, 0);

  ctx.font = "11px sans-serif";
  ctx.lineWidth = 1;

  for (var x = xDebut; x <= vue.centreX + demi; x += pas) {
    var px = versPixel(vue, x, 0).px;
    ctx.strokeStyle = "#e6e6e6";
    ligne(ctx, px, 0, px, t);
    if (Math.abs(x) > 1e-9) {
      ctx.strokeStyle = "#333333";
      ligne(ctx, px, origine.py - 4, px, origine.py + 4);
      ctx.fillStyle = "#333333";
      ctx.textAlign = "center";
      ctx.fillText(formaterNombre(x), px, origine.py + 16);
    }
  }

  for (var y = yDebut; y <= vue.centreY + demi; y += pas) {
    var py = versPixel(vue, 0, y).py;
    ctx.strokeStyle = "#e6e6e6";
    ligne(ctx, 0, py, t, py);
    if (Math.abs(y) > 1e-9) {
      ctx.strokeStyle = "#333333";
      ligne(ctx, origine.px - 4, py, origine.px + 4, py);
      ctx.fillStyle = "#333333";
      ctx.textAlign = "right";
      ctx.fillText(formaterNombre(y), origine.px - 7, py + 4);
    }
  }

  ctx.strokeStyle = "#333333";
  ctx.lineWidth = 1.5;
  ligne(ctx, 0, origine.py, t, origine.py);
  ligne(ctx, origine.px, 0, origine.px, t);
  ctx.fillStyle = "#333333";
  ctx.textAlign = "left";
  ctx.fillText("x", t - 12, origine.py - 6);
  ctx.fillText("y", origine.px + 6, 12);
  ctx.textAlign = "right";
  ctx.fillText("O", origine.px - 5, origine.py + 14);
}

function ligne(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function dessinerPolygone(ctx, vue, points, style) {
  if (points.length === 0) return;

  ctx.beginPath();
  points.forEach(function (p, i) {
    var pix = versPixel(vue, p.x, p.y);
    if (i === 0) ctx.moveTo(pix.px, pix.py);
    else ctx.lineTo(pix.px, pix.py);
  });
  ctx.closePath();
  ctx.fillStyle = style.remplissage;
  ctx.fill();
  ctx.setLineDash(style.pointille ? [6, 4] : []);
  ctx.strokeStyle = style.trait;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "left";
  points.forEach(function (p, i) {
    var pix = versPixel(vue, p.x, p.y);
    ctx.fillStyle = style.trait;
    ctx.beginPath();
    ctx.arc(pix.px, pix.py, 3.5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText(nomSommet(i) + style.suffixe, pix.px + 6, pix.py - 6);
  });
}

function nomSommet(i) {
  return i < 26 ? String.fromCharCode(65 + i) : "P" + (i + 1);
}

function formaterNombre(v) {
  var arrondi = Math.round(v * 100) / 100;
  if (arrondi === 0) arrondi = 0;
  return String(arrondi);
}
