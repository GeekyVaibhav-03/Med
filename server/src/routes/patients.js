const express = require("express");
const axios = require("axios");
const router = express.Router();

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbyxMnuv_NV2l3PAL-eeak0BUhBTr848J-UfavJ4ltJv6D1Dlz119gWUHwXZcZ9QiyC-/exec";

// GET /api/patients - Fetch all patients from Google Sheets
router.get("/", async (req, res) => {
  try {
    const { data } = await axios.get(GOOGLE_SHEET_URL);

    // Check if data is valid array
    if (!data || !Array.isArray(data)) {
      console.error("Patient API Error: Response is not an array", data);
      return res.json({ ok: true, patients: [], count: 0 });
    }

    const formatted = data.map((p, index) => ({
      id: p.uid || `P${index + 1}`,         // UID → id
      uid: p.uid || `P${index + 1}`,        // Keep UID for compatibility
      name: p.name || "Unknown",            // PROFILE → name
      room: p.room || "-",                  // ROOM
      status: p.status || "green",          // STATUS → red/green/yellow
      mdrStatus: p.status === "red" ? "MDR+" : "Safe",
      lastContact: p.exitTime || p.entryTime || null,
      entryTime: p.entryTime || null,
      exitTime: p.exitTime || null,
      age: p.age || "-",
      profile: p.name || "Unknown",         // Keep profile for backward compatibility
      riskLevel: p.status === "red" ? "high" : p.status === "yellow" ? "medium" : "low"
    }));

    res.json({ ok: true, patients: formatted, count: formatted.length });
  } catch (err) {
    console.error("Patient API Error:", err.message);
    res.json({ ok: true, patients: [], count: 0 });
  }
});

// GET /api/patients/:id - Get single patient by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = await axios.get(GOOGLE_SHEET_URL);

    const patient = data.find(p => p.uid === id);
    
    if (!patient) {
      return res.status(404).json({ ok: false, error: "Patient not found" });
    }

    const formatted = {
      id: patient.uid || id,
      uid: patient.uid || id,
      name: patient.name || "Unknown",
      room: patient.room || "-",
      status: patient.status || "green",
      mdrStatus: patient.status === "red" ? "MDR+" : "Safe",
      lastContact: patient.exitTime || patient.entryTime || null,
      entryTime: patient.entryTime || null,
      exitTime: patient.exitTime || null,
      age: patient.age || "-",
      profile: patient.name || "Unknown",
      riskLevel: patient.status === "red" ? "high" : patient.status === "yellow" ? "medium" : "low"
    };

    res.json({ ok: true, patient: formatted });
  } catch (err) {
    console.error("Patient API Error:", err.message);
    res.status(500).json({ ok: false, error: "Failed to fetch patient" });
  }
});

module.exports = router;
