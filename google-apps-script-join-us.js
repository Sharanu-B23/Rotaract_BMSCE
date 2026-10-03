/**
 * =========================================================================================
 * ROTARACT CLUB OF BMSCE - ONLINE JOIN US REGISTRATION SCRIPT
 * =========================================================================================
 * 
 * Target Columns in Google Sheet ("Join Us Registrations" Tab):
 * 1. Timestamp
 * 2. Full Name
 * 3. BMSCE USN
 * 4. College Mail ID
 * 5. Personal Mail ID
 * 6. Year of Study
 * 7. Contact - WhatsApp
 * 8. Payee Name (UPI)
 * 9. Blood Group - If willing to donate blood anytime
 * 10. Uploaded Screenshot
 * =========================================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Wait up to 30 seconds for concurrent requests from simultaneous visitors
    lock.waitLock(30000);

    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(
        JSON.stringify({ result: "error", message: "No post data received." })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      data = e.parameter || {};
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getOrCreateSheetTab(ss, "Join Us Registrations", "#850028");

    // 1. Extract the specific applicant fields
    var timestamp = data.registeredAt || data.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    var fullName = (data.fullName || data.name || "N/A").trim();
    var usn = (data.usn || "N/A").trim().toUpperCase();
    var collegeEmail = (data.collegeEmail || data.email || "N/A").trim();
    var personalEmail = (data.personalEmail || "N/A").trim();
    var yearOfStudy = (data.yearOfStudy || data.academicYear || "1st Year").trim();
    var contactWhatsApp = (data.phone || data.contact || data.whatsapp || "N/A").trim();
    var payeeName = (data.payeeName || "N/A").trim();
    
    // Blood Group (If willing to donate blood anytime)
    var bloodGroup = (data.bloodGroup || "").trim();
    if (!bloodGroup || bloodGroup === "Not Specified" || bloodGroup === "") {
      bloodGroup = "Not willing / Not specified";
    }

    // 2. Process and Upload Payment Screenshot to Google Drive
    var driveScreenshotUrl = "No screenshot attached";
    var rawScreenshot = data.screenshotBase64 || data.screenshot || "";

    if (rawScreenshot && typeof rawScreenshot === "string" && rawScreenshot.length > 50) {
      try {
        var folder = getOrCreateFolder("Rotaract BMSCE Payment Screenshots");

        var mimeType = "image/png";
        var base64Data = rawScreenshot;

        if (rawScreenshot.indexOf("base64,") !== -1) {
          var parts = rawScreenshot.split("base64,");
          var metaPart = parts[0];
          base64Data = parts[1];
          var mimeMatch = metaPart.match(/:(.*?);/);
          if (mimeMatch) {
            mimeType = mimeMatch[1];
          }
        }

        var ext = (mimeType.indexOf("pdf") !== -1) ? "pdf" : (mimeType.indexOf("jpeg") !== -1 || mimeType.indexOf("jpg") !== -1) ? "jpg" : "png";
        var cleanName = fullName.replace(/[^a-zA-Z0-9 ]/g, "").trim() || "Member";
        var fileName = cleanName + " - (" + usn + ") - Payment Screenshot." + ext;

        var blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName);
        var file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        driveScreenshotUrl = file.getUrl();
      } catch (fErr) {
        driveScreenshotUrl = "Error saving screenshot: " + fErr.toString();
      }
    }

    // 3. Dynamic header-aware row data builder
    // This safely maps fields into existing sheets (even if columns were in a different order or missing)
    var lastCol = sheet.getLastColumn();
    var existingHeaders = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];

    var rowData = [];
    if (existingHeaders.length > 0) {
      for (var i = 0; i < existingHeaders.length; i++) {
        var h = String(existingHeaders[i]).toLowerCase().trim();
        if (h.indexOf("time") !== -1 || h.indexOf("date") !== -1) {
          rowData.push(timestamp);
        } else if (h.indexOf("usn") !== -1) {
          rowData.push(usn);
        } else if (h.indexOf("full name") !== -1 || h === "name" || h.indexOf("student") !== -1) {
          rowData.push(fullName);
        } else if (h.indexOf("college") !== -1) {
          rowData.push(collegeEmail);
        } else if (h.indexOf("personal") !== -1) {
          rowData.push(personalEmail);
        } else if (h.indexOf("year") !== -1) {
          rowData.push(yearOfStudy);
        } else if (h.indexOf("contact") !== -1 || h.indexOf("whatsapp") !== -1 || h.indexOf("phone") !== -1) {
          rowData.push(contactWhatsApp);
        } else if (h.indexOf("payee") !== -1) {
          rowData.push(payeeName);
        } else if (h.indexOf("blood") !== -1) {
          rowData.push(bloodGroup);
        } else if (h.indexOf("screenshot") !== -1 || h.indexOf("drive") !== -1 || h.indexOf("upload") !== -1) {
          rowData.push(driveScreenshotUrl);
        } else {
          rowData.push("");
        }
      }
    } else {
      // Default standard row structure
      rowData = [
        timestamp,
        fullName,
        usn,
        collegeEmail,
        personalEmail,
        yearOfStudy,
        contactWhatsApp,
        payeeName,
        bloodGroup,
        driveScreenshotUrl
      ];
    }

    sheet.appendRow(rowData);
    SpreadsheetApp.flush(); // Guarantees all row writes are committed to disk before releasing lock

    var responsePayload = {
      result: "success",
      success: true,
      receiptId: data.receiptId || "",
      fileUrl: driveScreenshotUrl,
      driveUrl: driveScreenshotUrl,
      message: "Registration successfully recorded into Google Sheet."
    };

    return ContentService.createTextOutput(JSON.stringify(responsePayload))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ result: "error", success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

/**
 * Helper to get the target sheet tab or create it with customized headers
 */
function getOrCreateSheetTab(ss, tabName, headerColor) {
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
  }

  // If newly created or empty, add the exact standard headers
  if (sheet.getLastRow() === 0) {
    var headers = [
      "Timestamp",
      "Full Name",
      "BMSCE USN",
      "College Mail ID",
      "Personal Mail ID",
      "Year of Study",
      "Contact - WhatsApp",
      "Payee Name (UPI)",
      "Blood Group - If willing to donate blood anytime",
      "Uploaded Screenshot"
    ];
    sheet.appendRow(headers);
    
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground(headerColor || "#850028");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
    
    // Auto-fit columns for clean presentation
    for (var c = 1; c <= headers.length; c++) {
      sheet.autoResizeColumn(c);
    }
  }

  return sheet;
}

/**
 * Helper to get or create Google Drive folder for payment screenshots
 */
function getOrCreateFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}

function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "active", message: "Rotaract BMSCE Join Us Webhook Service is active." })
  ).setMimeType(ContentService.MimeType.JSON);
}
