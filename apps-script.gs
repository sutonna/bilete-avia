const SHEET_NAME = "Programari";

function doPost(e) {
  const sheet = getSheet();
  const data = e.parameter;

  sheet.appendRow([
    new Date(),
    data.clientName || "",
    data.phone || "",
    data.callDate || "",
    data.callTime || "",
    data.route || "",
    data.passengers || "",
    data.details || ""
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Primit la",
      "Nume",
      "Telefon",
      "Data apelului",
      "Ora apelului",
      "Ruta dorita",
      "Numar pasageri",
      "Detalii"
    ]);
  }

  return sheet;
}
