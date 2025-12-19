import { API_BASE_URL } from "./config";

export const UserAPI = {
  async getAll() {
    const res = await fetch(`${API_BASE_URL}/users`);
    return res.json();
  },

  async updateRole(id, role) {
    const res = await fetch(`${API_BASE_URL}/users/${id}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }),
    });
    return res.json();
  },

  async delete(id) {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
    });
    return res.json();
  },

  async deleteBulk(ids) {
    const res = await fetch(`${API_BASE_URL}/users/bulk-delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids }),
    });
    return res.json();
  }
};