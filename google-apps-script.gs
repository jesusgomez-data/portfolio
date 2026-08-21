/**
 * ============================================================
 * JGSTUDIO — SISTEMA CENTRAL DE PRESUPUESTOS
 * ============================================================
 *
 * Recibe:
 *   - presupuesto.html
 *   - venezuela.html
 *
 * Ambos utilizan exactamente el mismo contrato de datos.
 *
 * La única diferencia es:
 *
 *   EUR -> precios Europa
 *   USD -> precios América / internacional
 *   VE  -> precios Venezuela
 *
 * También conserva el formulario:
 *   JGStudio Reconstruye
 * ============================================================
 */


/* ============================================================
   CONFIGURACIÓN
   ============================================================ */

const SHEET_ID = "1ichfOhk5dECd-YONqOGcZO3v7A-TKoHXl7kEPVKJsqc";

const ADMIN_EMAIL = "jesusgomezgsantiago@gmail.com";


/* ============================================================
   HOJAS
   ============================================================ */

function getBudgetSheet_() {

  const ss = SpreadsheetApp.openById(SHEET_ID);

  return ss.getSheets()[0];
}


function getReconstruyeSheet_() {

  const ss = SpreadsheetApp.openById(SHEET_ID);

  let sheet = ss.getSheetByName("Postulaciones");

  if (!sheet) {

    sheet = ss.insertSheet("Postulaciones");

    setupReconstruyeSheet(sheet);
  }

  return sheet;
}


/* ============================================================
   TABLA CENTRAL DE PRECIOS
   ============================================================

   IMPORTANTE:

   Los nombres deben coincidir EXACTAMENTE
   con los enviados por los formularios.

   EUR = Europa
   USD = América / internacional
   VE  = Venezuela

   ============================================================ */

const PRECIOS = {

  "Landing Page": {
    EUR: 490,
    USD: 530,
    VE: 220
  },

  "Web Corporativa": {
    EUR: 890,
    USD: 960,
    VE: 380
  },

  "Tienda Online": {
    EUR: 1290,
    USD: 1390,
    VE: 550
  },

  "App / SaaS": {
    EUR: 2500,
    USD: 2700,
    VE: 1100
  },

  "Automatización & IA": {
    EUR: 390,
    USD: 420,
    VE: 180
  },

  "Branding & Contenido": {
    EUR: 350,
    USD: 380,
    VE: 150
  }

};


/* ============================================================
   ESTADOS
   ============================================================ */

const ESTADOS = [
  "Nuevo",
  "Contactado",
  "Propuesta enviada",
  "Ganado",
  "Perdido"
];


const ESTADOS_RECONSTRUYE = [
  "recibida",
  "en_revision",
  "admitida",
  "en_espera",
  "no_encaja"
];


/* ============================================================
   CALCULAR PRECIO
   ============================================================ */

function calcularPrecio(tipo, region) {

  const entry = PRECIOS[tipo];

  /*
   * Si por cualquier razón llega un tipo
   * que no existe, nunca rompemos el formulario.
   */

  if (!entry) {

    return {
      precio: "A definir",
      moneda: "-"
    };
  }


  /*
   * EUROPA
   */

  if (region === "EUR") {

    return {
      precio: entry.EUR,
      moneda: "EUR"
    };
  }


  /*
   * VENEZUELA
   *
   * El precio se muestra en USD.
   */

  if (region === "VE") {

    return {
      precio: entry.VE,
      moneda: "USD"
    };
  }


  /*
   * RESTO DE AMÉRICA / INTERNACIONAL
   */

  return {

    precio: entry.USD,
    moneda: "USD"

  };
}


/* ============================================================
   NORMALIZAR REGIÓN
   ============================================================ */

function normalizarRegion_(region) {

  const value = String(region || "")
    .trim()
    .toUpperCase();

  if (value === "EUR") {
    return "EUR";
  }

  if (value === "VE") {
    return "VE";
  }

  return "USD";
}


/* ============================================================
   NORMALIZAR TIPO DE PROYECTO
   ============================================================

   Esto evita que una versión antigua del formulario
   pueda generar "A definir".

   Ejemplos antiguos:

   Página web
   E-commerce
   Automatización
   IA
   Software a medida

   se convierten automáticamente a los nombres oficiales.

   ============================================================ */

function normalizarTipoProyecto_(tipo) {

  const value = String(tipo || "").trim();

  const aliases = {

    "Página web": "Landing Page",

    "Landing": "Landing Page",

    "Web": "Web Corporativa",

    "E-commerce": "Tienda Online",

    "Tienda": "Tienda Online",

    "Automatización": "Automatización & IA",

    "IA": "Automatización & IA",

    "Automatización / IA": "Automatización & IA",

    "Software a medida": "App / SaaS",

    "Aplicación": "App / SaaS",

    "SaaS": "App / SaaS",

    "Branding": "Branding & Contenido"

  };


  if (aliases[value]) {

    return aliases[value];

  }


  return value;
}


/* ============================================================
   DO POST
   ============================================================ */

function doPost(e) {

  try {

    const p = e && e.parameter
      ? e.parameter
      : {};


    /* ========================================================
       FORMULARIO JGSTUDIO RECONSTRUYE
       ======================================================== */

    if (p.formulario_tipo === "reconstruye") {

      return handleReconstruye_(p);

    }


    /* ========================================================
       FORMULARIOS DE PRESUPUESTO
       ======================================================== */

    return handleBudgetLead_(p);


  } catch (error) {

    console.error(
      "ERROR GENERAL:",
      error
    );


    return jsonResponse_({

      ok: false,

      error: error.toString()

    });

  }

}


/* ============================================================
   RECONSTRUYE
   ============================================================ */

function handleReconstruye_(p) {

  const sheet = getReconstruyeSheet_();

  let fileUrl = "";


  /*
   * FOTO
   */

  if (p.fileData && p.fileName) {

    try {

      let folder;

      const folders =
        DriveApp.getFoldersByName(
          "ReconstruyeFotos"
        );


      if (folders.hasNext()) {

        folder = folders.next();

      } else {

        folder =
          DriveApp.createFolder(
            "ReconstruyeFotos"
          );

      }


      const fileBlob =
        Utilities.newBlob(

          Utilities.base64Decode(
            p.fileData
          ),

          p.fileType ||
            MimeType.JPEG,

          p.fileName

        );


      const file =
        folder.createFile(
          fileBlob
        );


      file.setSharing(

        DriveApp.Access.ANYONE_WITH_LINK,

        DriveApp.Permission.VIEW

      );


      fileUrl =
        file.getUrl();


    } catch (err) {

      fileUrl =
        "Error al subir foto: " +
        err.toString();

    }

  }


  /*
   * GUARDAR
   */

  sheet.appendRow([

    new Date(),

    p.negocio || "",

    p.nombre || "",

    p.whatsapp || "",

    p.zona || "",

    p.que_vendia || "",

    p.como_afecto || "",

    p.presencia_digital || "",

    fileUrl,

    p.referencia || "",

    "recibida",

    ""

  ]);


  return jsonResponse_({

    ok: true

  });

}


/* ============================================================
   LEAD DE PRESUPUESTO
   ============================================================ */

function handleBudgetLead_(p) {

  const sheet =
    getBudgetSheet_();


  /* ----------------------------------------------------------
     DATOS
     ---------------------------------------------------------- */

  const clientName =
    String(p.name || "").trim();


  const email =
    String(
      p._replyto ||
      p.email ||
      ""
    ).trim();


  const whatsapp =
    String(
      p.whatsapp ||
      p.telefono ||
      ""
    ).trim();


  const company =
    String(
      p.empresa ||
      ""
    ).trim();


  const city =
    String(
      p.city ||
      ""
    ).trim();


  /*
   * NORMALIZAMOS REGIÓN
   */

  const region =
    normalizarRegion_(
      p.region
    );


  /*
   * NORMALIZAMOS PROYECTO
   */

  const projectType =
    normalizarTipoProyecto_(
      p.tipo_proyecto
    );


  /*
   * PRESUPUESTO DEL CLIENTE
   */

  const budget =
    String(
      p.presupuesto ||
      p.presupuesto_estimado ||
      ""
    ).trim();


  /*
   * PLAZO
   */

  const deadline =
    String(
      p.plazo ||
      ""
    ).trim();


  /*
   * DETALLES
   */

  const details =
    String(
      p.message ||
      p.detalles ||
      ""
    ).trim();


  /*
   * EXTRAS
   */

  const extras =
    String(
      p.extras ||
      ""
    ).trim();


  /* ----------------------------------------------------------
     PRECIO JGSTUDIO
     ---------------------------------------------------------- */

  const calc =
    calcularPrecio(
      projectType,
      region
    );


  /* ----------------------------------------------------------
     EXTRAS + CIUDAD
     ---------------------------------------------------------- */

  let extrasCompleto = "";


  if (city) {

    extrasCompleto =
      "Ciudad: " + city;

  }


  if (extras) {

    if (extrasCompleto) {

      extrasCompleto +=
        " | " + extras;

    } else {

      extrasCompleto =
        extras;

    }

  }


  /* ----------------------------------------------------------
     GUARDAR EN SHEETS
     ----------------------------------------------------------

     1  Fecha
     2  Nombre
     3  Email
     4  WhatsApp
     5  Empresa
     6  Región
     7  Tipo de proyecto
     8  Presupuesto
     9  Plazo
     10 Precio sugerido
     11 Moneda
     12 Detalles
     13 Extras / Ciudad
     14 Estado
     15 Nota interna

     ---------------------------------------------------------- */

  sheet.appendRow([

    new Date(),

    clientName,

    email,

    whatsapp,

    company,

    region,

    projectType,

    budget,

    deadline,

    calc.precio,

    calc.moneda,

    details,

    extrasCompleto,

    "Nuevo",

    ""

  ]);


  /* ----------------------------------------------------------
     EMAIL
     ---------------------------------------------------------- */

  const marketName =
    region === "EUR"
      ? "Europa"
      : region === "VE"
        ? "Venezuela"
        : "América / Internacional";


  const emailSubject =
    `🚨 Nuevo lead JGStudio — ${marketName} — ${projectType || "Proyecto web"}`;


  const emailBody = `

NUEVO LEAD — JGSTUDIO
=====================

🌎 MERCADO
${marketName}

Código región:
${region}


👤 DATOS DEL CLIENTE
--------------------

Nombre:
${clientName || "No indicado"}

Empresa:
${company || "No indicada"}

Email:
${email || "No indicado"}

WhatsApp:
${whatsapp || "No indicado"}

Ciudad:
${city || "No indicada"}


💻 PROYECTO
-----------

Tipo:
${projectType || "No indicado"}

Presupuesto aproximado:
${budget || "No indicado"}

Plazo:
${deadline || "No indicado"}


📝 DETALLES
-----------

${details || "El cliente no indicó detalles adicionales."}


➕ EXTRAS
--------

${extras || "Ninguno"}


💰 PRECIO SUGERIDO JGSTUDIO
---------------------------

${calc.precio} ${calc.moneda}


📊 ESTADO
---------

Nuevo


📅 FECHA
--------

${new Date().toLocaleString("es-ES")}


=====================

JGStudio
Sistema automático de presupuestos.

`;


  /* ----------------------------------------------------------
     ENVIAR EMAIL
     ---------------------------------------------------------- */

  try {

    MailApp.sendEmail({

      to: ADMIN_EMAIL,

      subject: emailSubject,

      body: emailBody,

      replyTo:
        email || ADMIN_EMAIL,

      name:
        "JGStudio — Nuevos Leads"

    });


  } catch (mailError) {

    console.error(
      "ERROR EMAIL:",
      mailError
    );

  }


  /* ----------------------------------------------------------
     RESPUESTA
     ---------------------------------------------------------- */

  return jsonResponse_({

    ok: true,

    message:
      "Lead recibido correctamente",

    region: region,

    tipo_proyecto:
      projectType,

    precio:
      calc.precio,

    moneda:
      calc.moneda

  });

}


/* ============================================================
   RESPUESTA JSON
   ============================================================ */

function jsonResponse_(data) {

  return ContentService

    .createTextOutput(
      JSON.stringify(data)
    )

    .setMimeType(
      ContentService.MimeType.JSON
    );

}


/* ============================================================
   CONFIGURAR HOJA PRINCIPAL
   ============================================================ */

function setupSheet() {

  const sheet =
    getBudgetSheet_();


  sheet.setFrozenRows(1);


  const headers = [

    "Fecha",
    "Nombre",
    "Email",
    "WhatsApp",
    "Empresa",
    "Región",
    "Tipo de proyecto",
    "Presupuesto",
    "Plazo",
    "Precio sugerido",
    "Moneda",
    "Detalles",
    "Extras / Ciudad",
    "Estado",
    "Nota interna"

  ];


  sheet
    .getRange(
      1,
      1,
      1,
      headers.length
    )
    .setValues([
      headers
    ]);


  sheet
    .getRange(
      1,
      1,
      1,
      headers.length
    )
    .setFontWeight("bold")
    .setBackground("#0f0f0f")
    .setFontColor("#ffffff");


  sheet.setRowHeight(
    1,
    32
  );


  for (
    let col = 1;
    col <= 15;
    col++
  ) {

    sheet.setColumnWidth(
      col,
      150
    );

  }


  sheet.setColumnWidth(
    12,
    350
  );


  sheet.setColumnWidth(
    13,
    280
  );


  sheet.setColumnWidth(
    15,
    200
  );


  /*
   * DROPDOWN ESTADO
   */

  const rule =
    SpreadsheetApp
      .newDataValidation()
      .requireValueInList(
        ESTADOS,
        true
      )
      .setAllowInvalid(false)
      .build();


  sheet
    .getRange(
      2,
      14,
      500,
      1
    )
    .setDataValidation(
      rule
    );


  /*
   * FORMATO CONDICIONAL
   */

  const estadoRange =
    sheet.getRange(
      2,
      14,
      500,
      1
    );


  const rules = [

    SpreadsheetApp
      .newConditionalFormatRule()
      .whenTextEqualTo("Nuevo")
      .setBackground("#b8860b")
      .setFontColor("#fff")
      .setRanges([estadoRange])
      .build(),

    SpreadsheetApp
      .newConditionalFormatRule()
      .whenTextEqualTo("Contactado")
      .setBackground("#1f5c7a")
      .setFontColor("#fff")
      .setRanges([estadoRange])
      .build(),

    SpreadsheetApp
      .newConditionalFormatRule()
      .whenTextEqualTo("Propuesta enviada")
      .setBackground("#6b4fa0")
      .setFontColor("#fff")
      .setRanges([estadoRange])
      .build(),

    SpreadsheetApp
      .newConditionalFormatRule()
      .whenTextEqualTo("Ganado")
      .setBackground("#1e7e4f")
      .setFontColor("#fff")
      .setRanges([estadoRange])
      .build(),

    SpreadsheetApp
      .newConditionalFormatRule()
      .whenTextEqualTo("Perdido")
      .setBackground("#7a1f1f")
      .setFontColor("#fff")
      .setRanges([estadoRange])
      .build()

  ];


  sheet.setConditionalFormatRules(
    rules
  );

}


/* ============================================================
   CONFIGURAR HOJA RECONSTRUYE
   ============================================================ */

function setupReconstruyeSheet(sheet) {

  if (!sheet) {

    const ss =
      SpreadsheetApp.openById(
        SHEET_ID
      );

    sheet =
      ss.getSheetByName(
        "Postulaciones"
      ) ||
      ss.insertSheet(
        "Postulaciones"
      );

  }


  sheet.setFrozenRows(1);


  const headers = [

    "Fecha",
    "Nombre Negocio",
    "Nombre Contacto",
    "WhatsApp",
    "Zona",
    "Actividad",
    "Cómo afectó",
    "Presencia Digital",
    "Foto (Google Drive)",
    "Referencia",
    "Estado",
    "Notas Internas"

  ];


  sheet
    .getRange(
      1,
      1,
      1,
      headers.length
    )
    .setValues([
      headers
    ]);


  sheet
    .getRange(
      1,
      1,
      1,
      headers.length
    )
    .setFontWeight("bold")
    .setBackground("#D63031")
    .setFontColor("#ffffff");


  sheet.setRowHeight(
    1,
    32
  );


  for (
    let col = 1;
    col <= 12;
    col++
  ) {

    sheet.setColumnWidth(
      col,
      150
    );

  }


  sheet.setColumnWidth(
    7,
    280
  );


  sheet.setColumnWidth(
    9,
    220
  );


  sheet.setColumnWidth(
    12,
    220
  );


  const rule =
    SpreadsheetApp
      .newDataValidation()
      .requireValueInList(
        ESTADOS_RECONSTRUYE,
        true
      )
      .setAllowInvalid(false)
      .build();


  sheet
    .getRange(
      2,
      11,
      500,
      1
    )
    .setDataValidation(
      rule
    );

}