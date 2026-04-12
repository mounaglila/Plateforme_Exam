import axios from "axios";

export const getMyAnnouncements = async () => {
  const res = await axios.get("/api/announcements/me"); // adapte l'URL si besoin
  return res.data;
};