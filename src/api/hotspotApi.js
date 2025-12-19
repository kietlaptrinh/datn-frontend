import { API_BASE_URL } from "./config";

export const HotspotAPI = {
  async list() {
    const res = await fetch(`${API_BASE_URL}/hotspots`);
    return res.json();
  },

  async getByPanorama(panoId) {
    const res = await fetch(`${API_BASE_URL}/hotspots/from/${panoId}`);
    return res.json();
  },

  async create(data) {
    const res = await fetch(`${API_BASE_URL}/hotspots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

   
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Lỗi không xác định từ server");
    }
    return res.json();
  },

  async update(id, data) {
    const res = await fetch(`${API_BASE_URL}/hotspots/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async delete(id) {
    const res = await fetch(`${API_BASE_URL}/hotspots/${id}`, {
      method: "DELETE",
    });
    return res.json();
  },
};
