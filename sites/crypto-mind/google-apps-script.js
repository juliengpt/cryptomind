// ============================================================
// Google Apps Script — à coller dans ton Google Sheet
// ============================================================
//
// ÉTAPES :
// 1. Crée un nouveau Google Sheet (https://sheets.new)
// 2. Ajoute ces en-têtes en ligne 1 :
//    Date | Prénom | Nom | Email | Téléphone | Expérience | Source
// 3. Va dans Extensions > Apps Script
// 4. Supprime le code existant et colle tout ce fichier
// 5. Clique sur "Déployer" > "Nouveau déploiement"
// 6. Type : "Application Web"
// 7. Exécuter en tant que : "Moi"
// 8. Accès : "Tout le monde"
// 9. Clique "Déployer" et copie l'URL
// 10. Colle cette URL dans script.js à la ligne GOOGLE_SHEET_URL
// ============================================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = e.parameter;

    sheet.appendRow([
      data.date || new Date().toLocaleString('fr-FR'),
      data.firstName || '',
      data.lastName || '',
      data.email || '',
      data.phone || '',
      data.experience || '',
      data.source || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var data = e.parameter;
    if (data.email) {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      sheet.appendRow([
        data.date || new Date().toLocaleString('fr-FR'),
        data.firstName || '',
        data.lastName || '',
        data.email || '',
        data.phone || '',
        data.experience || '',
        data.source || ''
      ]);
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'ok' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService
      .createTextOutput('Lead webhook is active.')
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
