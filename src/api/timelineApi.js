import { API_BASE_URL } from "./config";

export const TimelineAPI = {
  async list() {
    const res = await fetch(`${API_BASE_URL}/timeline`);
    return res.json();
  },


  async create(formData) {
    const res = await fetch(`${API_BASE_URL}/timeline`, {
      method: "POST",
      body: formData,
    });
    return res.json();
  },


  async update(id, formData) {
    const res = await fetch(`${API_BASE_URL}/timeline/${id}`, {
      method: "PUT",
      body: formData,
    });
    return res.json();
  },

  async delete(id) {
    const res = await fetch(`${API_BASE_URL}/timeline/${id}`, {
      method: "DELETE",
    });
    return res.json();
  }
};