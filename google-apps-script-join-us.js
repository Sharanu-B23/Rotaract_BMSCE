/**
 * =========================================================================================
 * ROTARACT CLUB OF BMSCE - COMPREHENSIVE ONLINE JOIN US REGISTRATION SCRIPT
 * =========================================================================================
 * 
 * This Google Apps Script automatically records EVERY PIECE of information submitted
 * from the Join Us page (/join-the-club) into your Google Sheet.
 * 
 * KEY FEATURES:
 * 1. Self-Healing Column Creation: If your Google Sheet is missing the "BMSCE USN" column
 *    or ANY other column, this script AUTOMATICALLY creates the column header in Row 1
 *    with Rotaract branding so NO DATA IS EVER LOST OR DROPPED.
 * 2. Smart Tab Detection: Automatically finds your "Online Registrations", "Join Us Registrations",
 *    or active registrations tab. If only 1 sheet exists, it uses it immediately.
 * 3. Drive Screenshot Storage: Decodes and stores the UPI payment screenshot in Google Drive
 *    under "Rotaract BMSCE Payment Screenshots", tagged with the student's name and USN.
 * 
 * ALL 16 RECORDED FIELDS:
 * 1.  Timestamp
 * 2.  Receipt ID (e.g. RTR-2026-RM-XXXXXX)
 * 3.  Full Name
 * 4.  BMSCE USN (e.g. 1BM24CS001) - GUARANTEED IN ALL ROWS
 * 5.  College Mail ID
 * 6.  Personal Mail ID
 * 7.  Contact - WhatsApp (10 digits)
 * 8.  Year of Study (1st Year, 2nd Year, 3rd Year, 4th Year, PG / Other)
 * 9.  Blood Group (If willing to donate blood anytime)
 * 10. Why Join Rotaract? (Aspirations & Motivations)
 * 11. Skills & Talents (Prior Experience / Hobbies)
 * 12. Membership Type (Club Membership (RM))
 * 13. Membership Fee (₹320)
 * 14. Payee Name (UPI Account Holder Name from screenshot)
 * 15. UPI Transaction Ref / UTR
 * 16. Uploaded Screenshot (Google Drive link)
 * =========================================================================================
 */

// Canonical definitions for all 16 fields collected on the Join Us page
var FIELD_DEFINITIONS = [
  {
    id: "timestamp",
    header: "Timestamp",
    aliases: ["timestamp", "time", "date", "submitted", "registered", "date & time"],
    getValue: function(d) {
      return d.registeredAt || d.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    }
  },
  {
    id: "receiptId",
    header: "Receipt ID",
    aliases: ["receipt", "reg id", "token", "receipt no", "receipt number", "order id", "ref no"],
    getValue: function(d) {
      return (d.receiptId || "N/A").trim();
    }
  },
  {
    id: "fullName",
    header: "Full Name",
    aliases: ["full name", "applicant name", "student name", "member name", "name"],
    getValue: function(d) {
      return (d.fullName || d.name || d.studentName || "N/A").trim();
    }
  },
  {
    id: "usn",
    header: "BMSCE USN",
    aliases: [
      "usn",
      "bmsce usn",
      "seat number",
      "seat no",
      "roll number",
      "roll no",
      "university seat",
      "university seat number",
      "college id",
      "student id",
      "reg no",
      "registration number",
      "seat"
    ],
    getValue: function(d) {
      return (d.usn || d.USN || d.bmsceUsn || d.studentUsn || "N/A").trim().toUpperCase();
    }
  },
  {
    id: "collegeEmail",
    header: "College Mail ID",
    aliases: ["college mail", "college email", "bmsce email", "campus email", "official email", "college mail id"],
    getValue: function(d) {
      return (d.collegeEmail || d.bmsceEmail || d.email || "N/A").trim();
    }
  },
  {
    id: "personalEmail",
    header: "Personal Mail ID",
    aliases: ["personal mail", "personal email", "personal", "gmail", "alternate email", "personal mail id"],
    getValue: function(d) {
      return (d.personalEmail || "N/A").trim();
    }
  },
  {
    id: "contactWhatsApp",
    header: "Contact - WhatsApp",
    aliases: ["contact", "whatsapp", "phone", "mobile", "ph no", "phone number", "contact number", "contact - whatsapp"],
    getValue: function(d) {
      return (d.phone || d.contact || d.whatsapp || d.contactWhatsApp || "N/A").trim();
    }
  },
  {
    id: "yearOfStudy",
    header: "Year of Study",
    aliases: ["year of study", "year", "academic year", "semester", "sem", "class"],
    getValue: function(d) {
      return (d.yearOfStudy || d.academicYear || "1st Year").trim();
    }
  },
  {
    id: "bloodGroup",
    header: "Blood Group - If willing to donate blood anytime",
    aliases: ["blood group", "blood", "blood donate", "blood donation"],
    getValue: function(d) {
      var bg = (d.bloodGroup || "").trim();
      return (!bg || bg === "Not Specified" || bg === "Unknown / Prefer not to say")
        ? "Not willing / Not specified"
        : bg;
    }
  },
  {
    id: "whyJoin",
    header: "Why Join Rotaract? (Interests & Motivations)",
    aliases: ["why join", "why would you like", "motivation", "interests", "reason", "aspiration", "why"],
    getValue: function(d) {
      return (d.whyJoin || d.motivation || "N/A").trim();
    }
  },
  {
    id: "priorExperience",
    header: "Skills & Talents",
    aliases: ["skills", "talents", "prior experience", "experience", "interests & skills", "skill", "talent"],
    getValue: function(d) {
      return (d.priorExperience || d.skills || "N/A").trim();
    }
  },
  {
    id: "membershipType",
    header: "Membership Type",
    aliases: ["membership type", "membership", "type", "plan", "member type"],
    getValue: function(d) {
      return (d.membershipType || "Club Membership (RM)").trim();
    }
  },
  {
    id: "amount",
    header: "Membership Fee (₹)",
    aliases: ["membership fee", "fee", "fees", "amount", "paid", "amount paid", "cost", "inr", "price"],
    getValue: function(d) {
      return (d.amount || "320").toString().trim();
    }
  },
  {
    id: "payeeName",
    header: "Payee Name (UPI)",
    aliases: ["payee name", "payee", "payer name", "payer", "upi account holder", "account holder", "paid by"],
    getValue: function(d) {
      return (d.payeeName || d.fullName || "N/A").trim();
    }
  },
  {
    id: "transactionId",
    header: "UPI Transaction Ref / UTR",
    aliases: ["transaction id", "transaction", "utr", "txn id", "upi ref", "reference id", "ref id"],
    getValue: function(d) {
      return (d.transactionId || "UPI-Screenshot-Verified").trim();
    }
  },
  {
    id: "screenshotUrl",
    header: "Uploaded Screenshot",
    aliases: ["uploaded screenshot", "screenshot", "payment screenshot", "drive link", "screenshot url", "proof", "drive url", "image"],
    getValue: function(d, driveUrl) {
      return driveUrl || "No screenshot attached";
    }
  }
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Wait up to 30 seconds for concurrent requests from simultaneous visitors
    lock.waitLock(30000);

    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(
        JSON.stringify({ result: "error", success: false, message: "No post data received." })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      data = e.parameter || {};
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getTargetRegistrationSheet(ss);

    // Extract student's name and USN for Google Drive naming
    var fullName = (data.fullName || data.name || data.studentName || "Student").trim();
    var usn = (data.usn || data.USN || data.bmsceUsn || data.studentUsn || "USN_NOT_PROVIDED").trim().toUpperCase();

    // 1. Process and Upload Payment Screenshot to Google Drive
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

    // 2. SELF-HEALING COLUMN DETECTION AND CREATION
    var lastCol = sheet.getLastColumn();
    var lastRow = sheet.getLastRow();

    // Case A: Completely empty sheet -> Create full 16 canonical headers
    if (lastRow === 0 || lastCol === 0) {
      var initialHeaders = [];
      for (var f = 0; f < FIELD_DEFINITIONS.length; f++) {
        initialHeaders.push(FIELD_DEFINITIONS[f].header);
      }
      sheet.appendRow(initialHeaders);
      styleHeaderCells(sheet, 1, 1, initialHeaders.length);
      lastCol = initialHeaders.length;
    }

    // Read current existing headers in Row 1
    var existingHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

    // Map existing columns to field definitions
    var columnFieldMap = {};   // colIdx (0-based) -> fieldId
    var matchedFieldIds = {};  // fieldId -> true

    for (var colIdx = 0; colIdx < existingHeaders.length; colIdx++) {
      var headerText = String(existingHeaders[colIdx] || "").trim().toLowerCase();
      if (!headerText) continue;

      for (var fdIdx = 0; fdIdx < FIELD_DEFINITIONS.length; fdIdx++) {
        var def = FIELD_DEFINITIONS[fdIdx];
        if (matchedFieldIds[def.id]) continue; // Already mapped to a column

        var matched = false;
        for (var a = 0; a < def.aliases.length; a++) {
          var alias = def.aliases[a].toLowerCase();
          if (headerText === alias || headerText.indexOf(alias) !== -1) {
            matched = true;
            break;
          }
        }

        if (matched) {
          columnFieldMap[colIdx] = def.id;
          matchedFieldIds[def.id] = true;
          break;
        }
      }
    }

    // CRITICAL: Identify any fields NOT yet in the sheet (especially BMSCE USN!)
    var missingFields = [];
    for (var mfIdx = 0; mfIdx < FIELD_DEFINITIONS.length; mfIdx++) {
      var requiredDef = FIELD_DEFINITIONS[mfIdx];
      if (!matchedFieldIds[requiredDef.id]) {
        missingFields.push(requiredDef);
      }
    }

    // Automatically append any missing columns to Row 1
    if (missingFields.length > 0) {
      for (var m = 0; m < missingFields.length; m++) {
        var newColIdx = lastCol;          // 0-based
        var newColNumber = lastCol + 1;   // 1-based in Sheet
        var missingDef = missingFields[m];

        var headerCell = sheet.getRange(1, newColNumber);
        headerCell.setValue(missingDef.header);
        headerCell.setBackground("#850028");
        headerCell.setFontColor("#FFFFFF");
        headerCell.setFontWeight("bold");

        columnFieldMap[newColIdx] = missingDef.id;
        matchedFieldIds[missingDef.id] = true;
        lastCol++;
      }
    }

    // 3. Assemble row data matching EVERY column index in Row 1
    var rowValues = [];
    for (var c = 0; c < lastCol; c++) {
      var mappedFieldId = columnFieldMap[c];
      if (mappedFieldId) {
        var targetDef = null;
        for (var t = 0; t < FIELD_DEFINITIONS.length; t++) {
          if (FIELD_DEFINITIONS[t].id === mappedFieldId) {
            targetDef = FIELD_DEFINITIONS[t];
            break;
          }
        }
        if (targetDef) {
          rowValues.push(targetDef.getValue(data, driveScreenshotUrl));
        } else {
          rowValues.push("");
        }
      } else {
        // Unknown or custom existing column header
        rowValues.push("");
      }
    }

    // 4. Append row and commit to disk
    sheet.appendRow(rowValues);
    SpreadsheetApp.flush();

    var responsePayload = {
      result: "success",
      success: true,
      usn: usn,
      fullName: fullName,
      sheetTab: sheet.getName(),
      columnsRecorded: lastCol,
      receiptId: data.receiptId || "",
      fileUrl: driveScreenshotUrl,
      driveUrl: driveScreenshotUrl,
      message: "Registration for " + fullName + " (" + usn + ") successfully recorded in tab '" + sheet.getName() + "' with all " + lastCol + " columns."
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
 * Intelligent tab locator: Finds the user's intended registration tab
 * (e.g. "Online Registrations", "Join Us Registrations", "Registrations", or the only sheet in the file).
 */
function getTargetRegistrationSheet(ss) {
  var sheets = ss.getSheets();

  // 1. If there's only 1 sheet in the workbook (e.g. "Sheet1" or renamed), use it directly
  if (sheets.length === 1) {
    return sheets[0];
  }

  // 2. Exact match check
  var priorityNames = [
    "online registrations",
    "online registration",
    "join us registrations",
    "join the club",
    "join us",
    "registrations",
    "registration",
    "form responses 1",
    "sheet1"
  ];

  for (var p = 0; p < priorityNames.length; p++) {
    for (var s = 0; s < sheets.length; s++) {
      var sheetName = sheets[s].getName().trim().toLowerCase();
      if (sheetName === priorityNames[p]) {
        return sheets[s];
      }
    }
  }

  // 3. Partial keyword match (contains "registration" or "online" or "join")
  for (var s2 = 0; s2 < sheets.length; s2++) {
    var sNameLower = sheets[s2].getName().trim().toLowerCase();
    if (sNameLower.indexOf("registration") !== -1 || sNameLower.indexOf("online") !== -1 || sNameLower.indexOf("join") !== -1) {
      return sheets[s2];
    }
  }

  // 4. Default: Find or insert "Online Registrations"
  var target = ss.getSheetByName("Online Registrations");
  if (!target) {
    target = ss.getSheetByName("Join Us Registrations");
  }
  if (!target) {
    target = ss.insertSheet("Online Registrations");
  }
  return target;
}

/**
 * Styles a header range with Rotaract Cranberry branding
 */
function styleHeaderCells(sheet, startRow, startCol, numCols) {
  var range = sheet.getRange(startRow, startCol, 1, numCols);
  range.setBackground("#850028");
  range.setFontColor("#FFFFFF");
  range.setFontWeight("bold");
  sheet.setFrozenRows(1);
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

/**
 * GET Webhook endpoint - Returns status and diagnostic inspection of the active sheet
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getTargetRegistrationSheet(ss);
    var lastCol = sheet.getLastColumn();
    var lastRow = sheet.getLastRow();
    var headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];

    return ContentService.createTextOutput(
      JSON.stringify({
        status: "active",
        spreadsheetName: ss.getName(),
        activeTab: sheet.getName(),
        totalRows: lastRow,
        totalColumns: lastCol,
        currentHeaders: headers,
        message: "Rotaract BMSCE Join Us Webhook Service is active and ready."
      }, null, 2)
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "active",
        message: "Rotaract BMSCE Join Us Webhook Service is active.",
        error: err.toString()
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
