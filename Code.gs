// ---- LilGhost Studio · Inventario · API sobre Google Sheets ----
// Pega este código completo en Extensiones > Apps Script (reemplaza lo que haya).
// Cambia SECRET por tu propia palabra clave antes de publicar.

const SHEET_NAME = 'Hoja 1';   // <-- cambia esto si tu pestaña del Sheet se llama distinto
const SECRET = 'lghost2026';    // <-- cámbiala por tu propia clave

function doGet(e) {
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
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
}

function getAllItems() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1); // salta encabezados
  return rows
    .filter(r => r[0] !== '')
    .map(r => ({ id: String(r[0]), name: r[1], price: r[2], stock: r[3] }));
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
