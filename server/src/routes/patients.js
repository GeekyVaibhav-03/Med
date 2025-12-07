const express = require("express");
const axios = require("axios");
const router = express.Router();

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbyxMnuv_NV2l3PAL-eeak0BUhBTr848J-UfavJ4ltJv6D1Dlz119gWUHwXZcZ9QiyC-/exec";

router.get("/", async (req, res) => {
  try {
    const { data } = await axios.get(GOOGLE_SHEET_URL);

    const formatted = data.map((p, index) => ({
      id: p.uid || `P${index + 1}`,         // UID → id
      name: p.name || "Unknown",            // PROFILE → name
      room: p.room || "-",                  // ROOM
      status: p.status || "green",          // STATUS → red/green/yellow
      mdrStatus: p.status === "red" ? "MDR+" : "Safe",
      lastContact: p.exitTime || p.entryTime || null,
      age: "-"
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Patient API Error:", err.message);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

module.exports = router;
