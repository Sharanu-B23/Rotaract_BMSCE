/**
 * =========================================================================================
 * ROTARACT CLUB OF BMSCE - SIMULTANEOUS MULTI-DEVICE MEMBER REGISTRATION HANDLER
 * =========================================================================================
 * 
 * Features:
 * 1. Concurrency Protected: 3+ people can register members at the exact same second without clashes.
 * 2. Dedicated Sheet Tab per Device: Automatically routes each registration to that device's tab:
 *    - "Desk 1 (Sharan)"
 *    - "Desk 2 (Samyak)"
 *    - "Desk 3 (Himashree)"
 *    - (Or any custom desk selected)
 * 3. Master Consolidated Tab: Also logs into "Master Registry" for a unified club member database.
 * 4. Auto Header Creation: If any tab is newly created, it automatically formats and colors the headers.
 * 5. Drive Screenshot Backup: Automatically saves payment screenshots into your Google Drive.
 * =========================================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Wait up to 30 seconds for concurrent requests from simultaneous devices
    lock.waitLock(30000);

    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(
        JSON.stringify({ result: "error", message: "No data received." })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Identify which desk / device submitted this
    var deskName = (data.desk || data.device || "Desk 1 (Sharan)").trim();

    // 2. Handle Payment Screenshot (if uploaded from Join Us)
    var driveScreenshotUrl = "N/A";
    if (data.screenshotBase64 && data.screenshotBase64.indexOf("base64,") !== -1) {
      try {
        var folder = getOrCreateFolder("Rotaract BMSCE Payment Screenshots");
        var parts = data.screenshotBase64.split("base64,");
        var metaPart = parts[0];
        var base64Data = parts[1];
        var mimeMatch = metaPart.match(/:(.*?);/);
        var mimeType = mimeMatch ? mimeMatch[1] : "image/png";
        var ext = (mimeType.indexOf("pdf") !== -1) ? "pdf" : "png";
        var fileName = (data.fullName || "Member") + " - (" + (data.usn || "USN") + ") - Payment Screenshot." + ext;
        var blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName);
        var file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        driveScreenshotUrl = file.getUrl();
      } catch (fErr) {
        driveScreenshotUrl = "Error saving screenshot";
      }
    }

    // 3. Prepare Member Data Row
    var timestamp = data.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    var receiptId = data.receiptId || ("RTR-ADM-" + new Date().getTime().toString().slice(-6));
    var fullName = data.fullName || "N/A";
    var usn = (data.usn || "N/A").toUpperCase();
    var collegeEmail = data.collegeEmail || data.email || "N/A";
    var personalEmail = data.personalEmail || "N/A";
    var yearOfStudy = data.yearOfStudy || data.academicYear || "N/A";
    var phone = data.phone || "N/A";
    var bloodGroup = data.bloodGroup || "Prefer not to say";
    var membershipType = data.membershipType || "RI - Rotary International membership";
    var payeeName = data.payeeName || "N/A";
    var feeAmount = data.amount || (membershipType.indexOf("RI") !== -1 ? 800 : 320);
    var transactionId = data.transactionId || "N/A";
    var registeredBy = data.addedBy || deskName;

    var rowData = [
      timestamp,
      receiptId,
      fullName,
      usn,
      collegeEmail,
      personalEmail,
      yearOfStudy,
      phone,
      bloodGroup,
      membershipType,
      payeeName,
      feeAmount,
      transactionId,
      driveScreenshotUrl,
      registeredBy,
      deskName
    ];

    // 4. Log to Dedicated Device / Desk Tab
    var deskSheet = getOrCreateSheetTab(ss, deskName, "#850028");
    deskSheet.appendRow(rowData);

    // 5. Also log to Master Registry tab (consolidated list of all 3 devices)
    var masterSheet = getOrCreateSheetTab(ss, "Master Registry", "#1E293B");
    masterSheet.appendRow(rowData);

    return ContentService.createTextOutput(
      JSON.stringify({
        result: "success",
        receiptId: receiptId,
        desk: deskName,
        message: "Registration recorded into " + deskName + " and Master Registry."
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ result: "error", error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

/**
 * Helper to get an existing sheet tab or create a new one with styled headers
 */
function getOrCreateSheetTab(ss, tabName, headerColor) {
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
  }

  // If newly created or empty, add headers
  if (sheet.getLastRow() === 0) {
    var headers = [
      "Timestamp",
      "Receipt ID",
      "Full Name",
      "USN",
      "College Email ID",
      "Personal Email ID",
      "Year of Study",
      "Phone (WhatsApp Enabled)",
      "Blood Group",
      "Type of Membership",
      "Payee Name (If paid online)",
      "Fee Amount (INR)",
      "Transaction Ref / UTR",
      "Payment Screenshot (Drive Link)",
      "Registered By",
      "Device / Desk"
    ];
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground(headerColor || "#850028");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * Helper to get or create Google Drive folder
 */
function getOrCreateFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}

function doGet(e) {
  return ContentService.createTextOutput("Rotaract BMSCE Multi-Device Registration Service is active.");
}
