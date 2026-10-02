/**
 * =========================================================================================
 * ROTARACT CLUB OF BMSCE - ONLINE JOIN US REGISTRATION SCRIPT
 * =========================================================================================
 * 
 * Target Columns in Google Sheet:
 * 1. Timestamp
 * 2. Full Name
 * 3. College Mail ID
 * 4. Personal Mail ID
 * 5. Year of Study
 * 6. Contact - WhatsApp
 * 7. Blood Group (If willing to donate blood anytime)
 * 8. Uploaded Screenshot
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

    // 1. Extract the specific requested fields
    var timestamp = data.registeredAt || data.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    var fullName = (data.fullName || data.name || "N/A").trim();
    var collegeEmail = (data.collegeEmail || data.email || "N/A").trim();
    var personalEmail = (data.personalEmail || "N/A").trim();
    var yearOfStudy = (data.yearOfStudy || data.academicYear || "1st Year").trim();
    var contactWhatsApp = (data.phone || data.contact || data.whatsapp || "N/A").trim();
    
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
        var fileName = cleanName + " - (" + (data.usn || "USN") + ") - Payment Screenshot." + ext;

        var blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName);
        var file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        driveScreenshotUrl = file.getUrl();
      } catch (fErr) {
        driveScreenshotUrl = "Error saving screenshot: " + fErr.toString();
      }
    }

    // 3. Prepare row data with ONLY the requested columns
    var rowData = [
      timestamp,
      fullName,
      collegeEmail,
      personalEmail,
      yearOfStudy,
      contactWhatsApp,
      bloodGroup,
      driveScreenshotUrl
    ];

    sheet.appendRow(rowData);

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

  // If newly created or empty, add the exact requested headers
  if (sheet.getLastRow() === 0) {
    var headers = [
      "Timestamp",
      "Full Name",
      "College Mail ID",
      "Personal Mail ID",
      "Year of Study",
      "Contact - WhatsApp",
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
