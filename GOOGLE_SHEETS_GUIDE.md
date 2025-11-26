# คู่มือการเชื่อมต่อฐานข้อมูล Google Sheets (Google Apps Script)

เอกสารนี้อธิบายขั้นตอนการสร้าง Backend ด้วย Google Sheets เพื่อเก็บข้อมูลจากระบบประเมินทักษะชีวิต โดยระบบจะสร้างชีตแยกตามห้องเรียนและจัดการหัวตารางให้อัตโนมัติ

---

## ขั้นตอนที่ 1: เตรียม Google Sheet

1. ไปที่ [Google Sheets](https://sheets.google.com) และสร้างสเปรดชีตใหม่
2. ตั้งชื่อไฟล์ตามต้องการ เช่น "LifeSkills_Database"
3. ที่เมนูด้านบน คลิก **Extensions (ส่วนขยาย)** > **Apps Script**

## ขั้นตอนที่ 2: ติดตั้งโค้ด (Google Apps Script)

ลบโค้ดเดิมในไฟล์ `Code.gs` ทั้งหมด และวางโค้ดด้านล่างนี้ลงไป:

```javascript
// --- CONFIGURATION ---
const SCRIPT_PROP = PropertiesService.getScriptProperties();

// สร้างหัวตาราง (Headers)
function getHeaders() {
  const fixedHeaders = [
    'Student_ID', 'No', 'Prefix', 'Firstname', 'Lastname', 'Room', 
    'Total_Score', 'Percentage', 'Strength', 'Development', 'Teacher', 'Timestamp'
  ];
  // สร้าง Q1 - Q30 อัตโนมัติ
  const questionHeaders = Array.from({length: 30}, (_, i) => `Q${i + 1}`);
  return [...fixedHeaders, ...questionHeaders];
}

function setup() {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  SCRIPT_PROP.setProperty("key", doc.getId());
}

// --- API HANDLERS ---

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const action = e.parameter.action;
    
    // 1. กรณีบันทึกข้อมูล (Save/Update)
    if (action === 'save') {
      const body = JSON.parse(e.postData.contents);
      const student = body.student;
      const assessment = body.assessment;
      const room = student.room; // ใช้ชื่อห้องเป็นชื่อชีต (เช่น m1a)
      
      // ตรวจสอบและสร้างชีตอัตโนมัติ
      let sheet = doc.getSheetByName(room);
      const headers = getHeaders();
      
      if (!sheet) {
        sheet = doc.insertSheet(room);
        sheet.appendRow(headers); // สร้างหัวตารางทันที
        // จัดรูปแบบหัวตารางให้สวยงาม
        sheet.getRange(1, 1, 1, headers.length)
             .setFontWeight("bold")
             .setBackground("#f0f4f8") // สี Navy-50
             .setBorder(true, true, true, true, true, true);
      }
      
      // เตรียมข้อมูลที่จะบันทึก
      const timestamp = new Date().toLocaleString('th-TH');
      const scores = assessment.scores || {};
      
      // คำนวณคะแนน
      let totalScore = 0;
      const questionValues = Array.from({length: 30}, (_, i) => {
        const val = scores[i + 1] || 0;
        totalScore += val;
        return val;
      });
      const percent = (totalScore / 90) * 100;

      const rowData = [
        student.id,
        student.no,
        student.prefix,
        student.firstName,
        student.lastName,
        room,
        totalScore,
        percent.toFixed(2),
        assessment.comments.strength,
        assessment.comments.development,
        assessment.teacherName,
        timestamp,
        ...questionValues
      ];

      // ค้นหาแถวเดิมเพื่ออัปเดต (ดูจาก Student ID)
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      let rowIndex = -1;

      // เริ่มค้นหาจากแถวที่ 2 (ข้าม Header)
      for (let i = 1; i < values.length; i++) {
        if (values[i][0] == student.id) {
          rowIndex = i + 1;
          break;
        }
      }

      if (rowIndex > 0) {
        // อัปเดตแถวเดิม
        sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
      } else {
        // เพิ่มแถวใหม่
        sheet.appendRow(rowData);
      }

      return ContentService.createTextOutput(JSON.stringify({ status: 'success', action: 'saved' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 2. กรณีดึงข้อมูลทั้งหมด (Get All Data)
    else if (action === 'getAll') {
      const sheets = doc.getSheets();
      let allAssessments = {};

      sheets.forEach(sheet => {
        const rows = sheet.getDataRange().getValues();
        const headers = rows[0]; // แถวแรกคือ Header
        
        // เริ่มอ่านจากแถวที่ 2
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const studentId = row[0];
          
          // แปลงข้อมูลกลับเป็น Format ของ App
          const scores = {};
          // Q1 เริ่มที่ index 12 (0-11 คือข้อมูลทั่วไป)
          for (let q = 1; q <= 30; q++) {
            scores[q] = Number(row[11 + q]); 
          }

          allAssessments[studentId] = {
            studentId: Number(studentId),
            scores: scores,
            comments: {
              strength: row[8],
              development: row[9]
            },
            teacherName: row[10],
            date: row[11] // Timestamp string format is OK
          };
        }
      });

      return ContentService.createTextOutput(JSON.stringify(allAssessments))
        .setMimeType(ContentService.MimeType.JSON);
    }

  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', error: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```

## ขั้นตอนที่ 3: Deploy (เผยแพร่)

1. คลิกปุ่ม **Deploy (การทำให้ใช้งานได้)** > **New deployment (การทำให้ใช้งานได้รายการใหม่)**
2. คลิกไอคอนฟันเฟือง เลือก **Web app (เว็บแอป)**
3. ตั้งค่าดังนี้:
   - **Description**: Life Skills API
   - **Execute as (ดำเนินการในฐานะ)**: **Me (ฉัน)** (อีเมลของคุณ)
   - **Who has access (ผู้มีสิทธิ์เข้าถึง)**: **Anyone (ทุกคน)** *สำคัญมาก*
4. คลิก **Deploy**
5. คัดลอก **Web App URL** (ลิงก์จะลงท้ายด้วย `/exec`) เก็บไว้

---

## ขั้นตอนที่ 4: การนำไปใช้ใน App

1. เปิดไฟล์ `services/sheetService.ts` ในโปรเจกต์
2. นำ **Web App URL** ที่ได้จากขั้นตอนที่ 3 มาใส่ในตัวแปร `API_URL`

```typescript
const API_URL = "วาง_URL_ของคุณที่นี่";
```

3. แก้ไขไฟล์ `App.tsx` เพื่อเรียกใช้ Service แทน LocalStorage (ทางเลือก)
   * *หมายเหตุ: ในโค้ดปัจจุบันยังใช้ LocalStorage เป็นหลัก หากต้องการเปลี่ยนระบบถาวร ต้องแก้ App.tsx ให้เรียกใช้ `loadFromGoogleSheets` และ `saveToGoogleSheets`*
