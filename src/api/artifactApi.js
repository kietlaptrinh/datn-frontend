import { API_BASE_URL } from "./config";

export const ArtifactAPI = {
  async listAll() {
    const res = await fetch(`${API_BASE_URL}/artifacts`);
    return res.json();
  },
  async listByRoom(roomId) {
    const res = await fetch(`${API_BASE_URL}/artifacts/room/${roomId}`);
    return res.json();
  },

  async getById(id) {
    const res = await fetch(`${API_BASE_URL}/artifacts/${id}`);
    return res.json();
  },

  async create(formData) {
    const res = await fetch(`${API_BASE_URL}/artifacts`, {
      method: "POST",
      body: formData,
    });
    return res.json();
  },

  async update(id, formData) {
    const res = await fetch(`${API_BASE_URL}/artifacts/${id}`, {
      method: "PUT",
      body: formData,
    });
    return res.json();
  },
  
  async delete(id) {
      await fetch(`${API_BASE_URL}/artifacts/${id}`, { method: 'DELETE' });
  }
};