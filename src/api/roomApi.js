import { API_BASE_URL } from "./config";

export const RoomAPI = {
  async list() {
    const res = await fetch(`${API_BASE_URL}/rooms`);
    return res.json();
  },

  async create(data) {
    const res = await fetch(`${API_BASE_URL}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getById(id) {
    const res = await fetch(`${API_BASE_URL}/rooms/${id}`);
    return res.json();
  },

  async update(id, data) {
    const res = await fetch(`${API_BASE_URL}/rooms/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async delete(id) {
    const res = await fetch(`${API_BASE_URL}/rooms/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Lỗi khi xóa phòng");
    }
    return data;
  },

  async getGraph(roomId) {
    const res = await fetch(`${API_BASE_URL}/rooms/${roomId}/graph`);
    return res.json();
  },
};
