import { API_BASE_URL } from "./config";

export const PanoramaAPI = {
  async list() {
    const res = await fetch(`${API_BASE_URL}/panoramas`);
    return res.json();
  },

  async getByRoom(roomId) {
    const res = await fetch(`${API_BASE_URL}/panoramas/room/${roomId}`);
    return res.json();
  },

  async getById(panoId) {
    const res = await fetch(`${API_BASE_URL}/panoramas/${panoId}`);
    return res.json();
  },

  async create(formData) {
    const res = await fetch(`${API_BASE_URL}/panoramas`, {
      method: "POST",
      body: formData,
    });
    return res.json();
  },

  async update(panoId, formData) {
    const res = await fetch(`${API_BASE_URL}/panoramas/${panoId}`, {
      method: "PUT",
      body: formData,
    });
    return res.json();
  },

  async delete(panoId) {
    const res = await fetch(`${API_BASE_URL}/panoramas/${panoId}`, {
      method: "DELETE",
    });
    return res.json();
  },
};
