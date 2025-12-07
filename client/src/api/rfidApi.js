import axios from "axios";

const API_URL = "http://localhost:5000/api/rfid-data";

export const fetchRFIDData = async () => {
  const res = await axios.get(API_URL);
  return res.data.data; // only returning sheet rows
};
