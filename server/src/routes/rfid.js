const express = require("express");
const router = express.Router();
const axios = require("axios");

// 🔴 PASTE YOUR APPS SCRIPT URL HERE
const GOOGLE_SHEET_API = "https://script.google.com/macros/s/AKfycbySd83jRAJ1Z5geVM79gp5CYZZ41Tq99xaGB9XNevGlT0PKI8ZIBHlYQ68ncgvAedsGZw/exec";

router.get("/rfid-data", async (req, res) => {
  try {
    const response = await axios.get(GOOGLE_SHEET_API);
    
    // Ensure response data is valid
    const data = Array.isArray(response.data) ? response.data : [];
    
    res.json({
      ok: true,
      data: data
    });
  } catch (err) {
    console.error("RFID Fetch Error:", err.message);
    res.json({
      ok: true,
      data: []
    });
  }
});

module.exports = router;
