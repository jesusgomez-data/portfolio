/**
 * JGStudio — Receptor de solicitudes de presupuesto
 * Proyecto independiente (script.google.com) apuntando a la hoja por ID.
 */
const SHEET_ID = "1ichfOhk5dECd-YONqOGcZO3v7A-TKoHXl7kEPVKJsqc";
function getSheet_() {
  return SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
}

/* ───────────────────────────────────────────────
   TABLA DE PRECIOS — edita estos números cuando quieras.
   No toques nada más de este archivo si solo quieres
   cambiar precios.
   EUR = España / Europa · USD = EEUU y resto de América · VE = Venezuela
─────────────────────────────────────────────── */
const PRECIOS = {
  "Landing Page":         { EUR: 490,  USD: 530,  VE: 220 },
  "Web Corporativa":      { EUR: 890,  USD: 960,  VE: 380 },
  "Tienda Online":        { EUR: 1290, USD: 1390, VE: 550 },
  "App / SaaS":           { EUR: 2500, USD: 2700, VE: 1100 },
  "Automatización & IA":  { EUR: 390,  USD: 420,  VE: 180 },
  "Branding & Contenido": { EUR: 350,  USD: 380,  VE: 150 }
};

const ESTADOS = ["Nuevo", "Contactado", "Propuesta enviada", "Ganado", "Perdido"];

/* Calcula el precio sugerido según tipo de proyecto + región */
function calcularPrecio(tipo, region) {
  const entry = PRECIOS[tipo];
  if (!entry) return { precio: "A definir", moneda: "-" };
  if (region === "EUR") return { precio: entry.EUR, moneda: "EUR" };
  if (region === "VE")  return { precio: entry.VE,  moneda: "USD" }; // Venezuela: siempre USD, nunca bolívares
  return { precio: entry.USD, moneda: "USD" }; // USD u OTRO -> USD por defecto
}

/* Recibe cada envío del formulario web y añade una fila */
function doPost(e) {
  const sheet = getSheet_();
  const p = e.parameter;
  const calc = calcularPrecio(p.tipo_proyecto, p.region);

  sheet.appendRow([
    new Date(),
    p.name || "",
    p._replyto || "",
    p.telefono || "",
    p.empresa || "",
    p.region || "",
    p.tipo_proyecto || "",
    p.presupuesto || "",
    p.plazo || "",
    calc.precio,
    calc.moneda,
    p.message || "",
    p.extras || "",
    "Nuevo",
    ""
  ]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Ejecuta esta función UNA SOLA VEZ manualmente (botón ▶ en el editor)
 * para darle formato profesional a la hoja: cabecera, columna de
 * Estado con desplegable de colores, etc.
 */
function setupSheet() {
  const sheet = getSheet_();

  sheet.setFrozenRows(1);
  const header = sheet.getRange(1, 1, 1, 15);
  header.setFontWeight("bold").setBackground("#0f0f0f").setFontColor("#ffffff");
  sheet.setRowHeight(1, 32);

  for (let col = 1; col <= 15; col++) sheet.setColumnWidth(col, 150);
  sheet.setColumnWidth(12, 280); // Detalles
  sheet.setColumnWidth(13, 220); // Extras
  sheet.setColumnWidth(15, 200); // Nota

  // Desplegable para la columna "Estado" (col 14)
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(ESTADOS, true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 14, 500, 1).setDataValidation(rule);

  // Formato condicional por Estado
  const estadoRange = sheet.getRange(2, 14, 500, 1);
  const rules = [
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Nuevo").setBackground("#b8860b").setFontColor("#fff").setRanges([estadoRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Contactado").setBackground("#1f5c7a").setFontColor("#fff").setRanges([estadoRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Propuesta enviada").setBackground("#6b4fa0").setFontColor("#fff").setRanges([estadoRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Ganado").setBackground("#1e7e4f").setFontColor("#fff").setRanges([estadoRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Perdido").setBackground("#7a1f1f").setFontColor("#fff").setRanges([estadoRange]).build(),
    // Resalta en rojo oscuro las filas de Venezuela en la columna Región (col 6)
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("VE").setBackground("#3a1212").setFontColor("#f0ece5").setRanges([sheet.getRange(2, 6, 500, 1)]).build()
  ];
  sheet.setConditionalFormatRules(rules);
}
