import { API_BASE_URL } from "./config";

const API_URL = `${API_BASE_URL}/quiz`; 

export const QuizAPI = {
  list: async () => {
    const res = await fetch(API_URL);
    return res.json();
  },

  create: async (questionData) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(questionData),
    });
    return res.json();
  },

  update: async (id, questionData) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(questionData),
    });
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    return res.json();
  },
  getLeaderboard: async () => {
    const res = await fetch(`${API_URL}/leaderboard`);
    if (!res.ok) throw new Error("Lỗi tải bảng xếp hạng");
    return res.json();
  }
};