# Setup Guide: Connecting RSVPs to Google Sheets

We have built a built-in integration option that submits RSVP responses directly to your Google Sheet in real-time. Follow these simple steps to link your invitation page to a Google Sheet.

---

## 📅 Step 1: Create Your Google Sheet
1. Open [Google Sheets](https://sheets.google.com) and create a **Blank Spreadsheet**.
2. Rename the spreadsheet to something like `Chamod & Sisara Wedding RSVPs`.
3. In the first row, create the column headers:
   - **Column A**: Date Added
   - **Column B**: Guest Name
   - **Column C**: Contact Info
   - **Column D**: Attending?
   - **Column E**: Number of Guests
   - **Column F**: Dietary Preference
   - **Column G**: Congratulatory Wishes

---

## 💻 Step 2: Add Google Apps Script
1. In the Google Sheet top menu, go to **Extensions** > **Apps Script**.
2. Delete any code in the editor (`myFunction()`) and paste the following script:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Add row: Timestamp, Name, Contact, Attending, Count, Diet, Message
    sheet.appendRow([
      new Date(),
      data.guestName,
      data.guestContact,
      data.attending,
      data.guestCount,
      data.diet,
      data.guestMessage
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  }
}

// Handles CORS preflight pre-requests
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
```

---

## 🚀 Step 3: Deploy the Web App
1. In the upper-right of the Apps Script page, click **Deploy** > **New deployment**.
2. Click the gear icon (**Select type**) next to "Configuration" and select **Web app**.
3. Fill in the deployment details:
   - **Description**: `Wedding RSVP API`
   - **Execute as**: `Me (your-email@gmail.com)`
   - **Who has access**: Change to **`Anyone`** (This is crucial, otherwise guests cannot submit).
4. Click **Deploy**.
5. Google will prompt you to "Authorize access". Click **Authorize access**, choose your Google account, click **Advanced** (at the bottom), click **Go to Untitled project (unsafe)**, and click **Allow**.
6. Copy the **Web App URL** provided (it looks like `https://script.google.com/macros/s/XXXXX/exec`).

---

## 🔗 Step 4: Add to the Admin Panel
1. Open the wedding website.
2. Open the **Admin Dashboard** (Double click the initials logo or click 'Admin Login' in footer, enter passcode `1234`).
3. Click the **Customize Text** tab.
4. Paste the copied URL into the **Google Sheets Web App URL** input field.
5. Click **Save Live Changes**.

🎉 **All done!** Any new RSVPs submitted by guests will now automatically append to your Google Sheet rows in real-time!
