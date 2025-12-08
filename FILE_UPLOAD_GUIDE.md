# 📤 JSON/CSV File Upload Guide - Lab Report System

## ✅ What's New

Added **batch file upload** capability for lab reports:
- Upload multiple reports at once using **JSON** format
- Upload multiple reports at once using **CSV** format
- Automatic MDR detection for all imported records
- Detailed upload results with error reporting
- Real-time alert generation for each MDR+ case

---

## 🚀 Quick Start

### **1. Access Lab Report Upload Page**
- Login as admin/doctor
- Go to `/admin/lab-upload`
- Click **"📂 Batch Upload (JSON/CSV)"** tab

### **2. Upload File**
- Click file upload area
- Select `sample-lab-reports.json` or `sample-lab-reports.csv`
- Click **"📤 Upload Batch"**

### **3. See Results**
- View upload summary
- Check MDR+ count
- Review any errors

---

## 📋 File Format Specifications

### **JSON Format**

```json
[
  {
    "patient_uid": "P001",
    "patient_name": "John Doe",
    "specimen_type": "Blood",
    "organism": "Staphylococcus aureus",
    "antibiotic_profile": {
      "Ampicillin": "R",
      "Ciprofloxacin": "R",
      "Vancomycin": "S",
      "Gentamicin": "R",
      "Erythromycin": "R"
    }
  },
  {
    "patient_uid": "P002",
    "patient_name": "Jane Smith",
    "specimen_type": "Urine",
    "organism": "E. coli",
    "antibiotic_profile": {
      "Ampicillin": "R",
      "Ciprofloxacin": "S"
    }
  }
]
```

**Field Definitions:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `patient_uid` | string | ✅ Yes | Unique patient ID (P001, P123, etc.) |
| `patient_name` | string | ❌ No | Patient's full name |
| `specimen_type` | string | ❌ No | Blood, Urine, CSF, Sputum, Wound, Stool, etc. |
| `organism` | string | ✅ Yes | Organism name (MRSA, E. coli, etc.) |
| `antibiotic_profile` | object | ❌ No | Antibiotic susceptibilities (see codes below) |

**Antibiotic Codes:**
```
S = Susceptible (drug works)
I = Intermediate (partial resistance)
R = Resistant (drug doesn't work)
U = Unknown (not tested)
```

---

### **CSV Format**

```csv
patient_uid,patient_name,specimen_type,organism,Ampicillin,Ciprofloxacin,Vancomycin,Gentamicin,Erythromycin
P001,John Doe,Blood,Staphylococcus aureus,R,R,S,R,R
P002,Jane Smith,Urine,E. coli,R,S,S,S,S
P003,Robert Johnson,CSF,Neisseria meningitidis,S,S,S,S,S
```

**CSV Headers:**
- First column: `patient_uid` (required)
- Organism column: `organism` (required)
- Optional columns: `patient_name`, `specimen_type`
- Remaining columns: Antibiotic names (mapped as R/S/I/U)

**CSV Rules:**
- Header row required
- Use comma (`,`) as delimiter
- No spaces in header names (use underscores)
- Antibiotic names must match exactly
- Use R/S/I/U for susceptibility

---

## 🔌 API Endpoint

### **POST /api/labreports/upload-file**

Upload JSON or CSV file with multiple lab reports

**Request:**
```bash
curl -X POST http://localhost:5000/api/labreports/upload-file \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "file=@sample-lab-reports.json" \
  -F "hospital=City Hospital" \
  -F "doctor_name=Dr. Smith"
```

**Response:**
```json
{
  "ok": true,
  "file": "sample-lab-reports.json",
  "results": {
    "total": 5,
    "processed": 4,
    "mdr_count": 3,
    "errors": [
      {
        "patient_uid": "P002",
        "error": "Report already exists"
      }
    ],
    "created": [
      {
        "id": 1,
        "patient_uid": "P001",
        "organism": "Staphylococcus aureus",
        "is_mdr": true
      },
      {
        "id": 2,
        "patient_uid": "P003",
        "organism": "Neisseria meningitidis",
        "is_mdr": false
      }
    ]
  }
}
```

---

## 📊 Sample Files

### **sample-lab-reports.json**
Location: `c:\Users\HP\OneDrive\Desktop\Med\sample-lab-reports.json`

Contains 5 test records:
- **P001**: MRSA (MDR+) ✅
- **P002**: E. coli (Non-MDR)
- **P003**: Neisseria meningitidis (Non-MDR)
- **P004**: Acinetobacter baumannii (MDR+) ✅
- **P005**: Pseudomonas aeruginosa (MDR+) ✅

### **sample-lab-reports.csv**
Location: `c:\Users\HP\OneDrive\Desktop\Med\sample-lab-reports.csv`

Contains 10 test records with various organisms and antibiotic profiles

---

## ✨ Features

### **Batch Upload**
- Upload multiple reports in single request
- Bulk MDR detection
- Atomicity: processes all valid records, skips errors

### **Error Handling**
- Missing required fields → Skips record
- Duplicate patient_uid → Skips record
- Invalid format → Returns detailed error
- Shows which records failed and why

### **Real-Time Alerts**
- Each MDR+ record triggers notification
- Alerts sent to Infection Control, Doctors, Admins
- Socket.io broadcast for real-time display

### **Upload Summary**
- Total records processed
- MDR+ count highlighted
- Error count and details
- List of successfully created records

---

## 🎯 Workflow

```
1. Admin selects "Batch Upload" tab
   ↓
2. Uploads JSON/CSV file
   ↓
3. Backend processes each record:
   - Validates fields
   - Checks for duplicates
   - Saves to database
   - Detects MDR
   - Sends alerts if MDR+
   ↓
4. Returns upload summary:
   - Processed count
   - MDR+ count
   - Errors list
   ↓
5. Frontend displays results
   - Success toast
   - Upload summary card
   - Recent reports refresh
```

---

## 🧪 Testing

### **Test Case 1: Upload JSON File**
```bash
# Using sample file
# 1. Open /admin/lab-upload
# 2. Click "Batch Upload" tab
# 3. Select sample-lab-reports.json
# 4. Click Upload

# Expected:
# - Processed: 5
# - MDR+: 3 (P001, P004, P005)
# - Errors: 0
```

### **Test Case 2: Upload CSV File**
```bash
# 1. Open /admin/lab-upload
# 2. Click "Batch Upload" tab
# 3. Select sample-lab-reports.csv
# 4. Click Upload

# Expected:
# - Processed: 10
# - MDR+: 6 (records with 3+ resistant drugs)
# - Errors: 0
```

### **Test Case 3: Duplicate Records**
```bash
# 1. Upload sample-lab-reports.json
# 2. Upload same file again

# Expected:
# - First upload: Processed 5, Errors 0
# - Second upload: Processed 0, Errors 5 (all duplicates)
```

---

## 📋 Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "No file uploaded" | File not selected | Select a file and try again |
| "File size must be < 5MB" | File too large | Compress or split file |
| "Only JSON and CSV files allowed" | Wrong file type | Use .json or .csv extension |
| "Invalid JSON format" | Malformed JSON | Check JSON syntax |
| "Missing patient_uid or organism" | Required field empty | Ensure all required fields |
| "Report already exists" | Duplicate patient_uid | Use unique patient UIDs |
| "CSV must have header row" | No header | Add column names first row |

---

## 🔐 Security

✅ File upload restricted to authenticated users  
✅ Doctor/Admin role required  
✅ File size limited to 5MB  
✅ Only JSON/CSV allowed  
✅ Hospital data isolation  
✅ Duplicate detection  

---

## 📱 Frontend UI Components

### **Mode Selector**
Two tabs:
- **📝 Single Report**: Form for individual record
- **📂 Batch Upload**: File upload for multiple records

### **File Upload Area**
- Drag & drop support (visual indicator)
- Click to browse files
- Shows selected file info
- Size validation

### **Upload Results Card**
Shows:
- Total records processed
- MDR+ cases count
- Error count
- Error details list

### **Format Examples**
Built-in examples for:
- JSON format with sample record
- CSV format with sample records

---

## 🚀 Production Deployment

### **File Storage Options**

**Current (Memory Storage):**
```javascript
storage: multer.memoryStorage()
```
- Good for: Single server, low volume
- Limit: 5MB per file

**For Production (Disk Storage):**
```javascript
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
```

**For Cloud (AWS S3, Azure Blob):**
```javascript
const s3 = new AWS.S3();
const multerS3 = require('multer-s3');
const upload = multerS3({
  s3: s3,
  bucket: 'medwatch-uploads',
  acl: 'private'
});
```

---

## 📞 Support

### **Common Issues**

**Q: Upload failed with no error message**  
A: Check browser console (F12) for network error, check server logs

**Q: File selected but upload doesn't start**  
A: Ensure file is JSON or CSV, size < 5MB

**Q: Records not appearing after upload**  
A: Check if patient_uid already exists (duplicate), refresh page

**Q: No MDR alerts even for MRSA**  
A: Ensure antibiotic profile has ≥3 resistant drugs

---

## 📊 Data Mapping Reference

### **Common Antibiotic Names (Case-Sensitive)**

```
Beta-lactams:
- Ampicillin, Amoxicillin, Penicillin
- Cephalexin, Ceftriaxone, Cefepime, Ceftazidime

Fluoroquinolones:
- Ciprofloxacin, Levofloxacin, Moxifloxacin

Macrolides:
- Erythromycin, Azithromycin

Aminoglycosides:
- Gentamicin, Tobramycin, Streptomycin

Carbapenems:
- Imipenem, Meropenem, Ertapenem

Glycopeptides:
- Vancomycin, Teicoplanin
```

---

## ✅ Checklist

- [ ] Files uploaded successfully
- [ ] MDR+ records flagged correctly
- [ ] Alerts sent for MDR+ cases
- [ ] Recent reports list updated
- [ ] Upload summary displayed
- [ ] Error handling working
- [ ] Duplicate detection working
- [ ] Real-time alerts visible
- [ ] Sample files accessible

---

**Batch upload is production-ready! 🎉**
