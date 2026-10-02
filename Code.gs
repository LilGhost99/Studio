// ---- LilGhost Studio · Inventario · API sobre Google Sheets ----
// Pega este código completo en Extensiones > Apps Script (reemplaza lo que haya).
// Cambia SECRET por tu propia palabra clave antes de publicar.
// No subas tu clave real a GitHub: escríbela solo en Apps Script.
//
// Columnas del Sheet (fila 1 = encabezados):
//   A id · B nombre · C precio · D stock · E foto · F descripcion · G categoria · H visible
// La columna "foto" acepta un enlace de Google Drive (compartido como
// "Cualquier persona con el enlace") o cualquier URL de imagen.
// En "visible" escribe "no" para ocultar un producto del catálogo público.

const SHEET_NAME = 'Hoja 1';   // <-- cambia esto si tu pestaña del Sheet se llama distinto
const SECRET = 'CAMBIA_ESTA_CLAVE';    // <-- cámbiala por tu propia clave

function doGet(e) {
  // Catálogo público: solo lectura, sin clave, solo productos visibles.
  if (e.parameter.action === 'catalog') {
    return jsonResponse(getCatalog());
  }
  if (e.parameter.key !== SECRET) {
    return jsonResponse({ error: 'unauthorized' });
  }
  return jsonResponse(getAllItems());
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  if (body.key !== SECRET) {
    return jsonResponse({ error: 'unauthorized' });
  }

  const sheet = getSheet();

  if (body.action === 'update') {
    updateRow(sheet, body.item);
  } else if (body.action === 'add') {
    sheet.appendRow([body.item.id, body.item.name, body.item.price, body.item.stock]);
  } else if (body.action === 'delete') {
    deleteRow(sheet, body.item.id);
  }

  return jsonResponse(getAllItems());
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  // Si la pestaña no se llama SHEET_NAME, usa la primera pestaña del archivo.
  return ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
}

function getAllItems() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1); // salta encabezados
  return rows
    .filter(r => r[0] !== '')
    .map(r => ({ id: String(r[0]), name: r[1], price: r[2], stock: r[3] }));
}

function getCatalog() {
  const rows = getSheet().getDataRange().getValues().slice(1);
  return rows
    .filter(r => r[0] !== '' && !isHidden(r[7]))
    .map(r => ({
      id: String(r[0]),
      name: r[1],
      price: r[2],
      available: Number(r[3]) > 0,
      photo: imageUrl(r[4]),
      description: r[5] || '',
      category: r[6] || ''
    }));
}

function isHidden(value) {
  const v = String(value).trim().toLowerCase();
  return v === 'no' || v === 'false' || v === 'oculto';
}

// Convierte enlaces de Google Drive en una URL que se puede mostrar como imagen.
function imageUrl(value) {
  const url = String(value || '').trim();
  const match = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/);
  return match ? 'https://drive.google.com/thumbnail?id=' + match[1] + '&sz=w800' : url;
}

function updateRow(sheet, item) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(item.id)) {
      sheet.getRange(i + 1, 2).setValue(item.name);
      sheet.getRange(i + 1, 3).setValue(item.price);
      sheet.getRange(i + 1, 4).setValue(item.stock);
      return;
    }
  }
}

function deleteRow(sheet, id) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
