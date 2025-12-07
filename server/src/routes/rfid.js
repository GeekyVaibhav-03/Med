const express = require("express");
const router = express.Router();
const axios = require("axios");

// 🔴 PASTE YOUR APPS SCRIPT URL HERE
const GOOGLE_SHEET_API = "https://script.google.com/macros/s/AKfycbySd83jRAJ1Z5geVM79gp5CYZZ41Tq99xaGB9XNevGlT0PKI8ZIBHlYQ68ncgvAedsGZw/exec";

router.get("/rfid-data", async (req, res) => {
  try {
    const response = await axios.get(GOOGLE_SHEET_API);
    res.json({
      ok: true,
      data: response.data
    });
  } catch (err) {
    console.error("RFID Fetch Error:", err.message);
    res.status(500).json({
      ok: false,
      error: "Failed to fetch RFID data"
    });
  }
});

module.exports = router;
