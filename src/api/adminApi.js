import { API_BASE_URL } from "./config";

export const AdminAPI = {
    async syncArtifacts() {
        const res = await fetch(`${API_BASE_URL}/sync`, { method: "POST" });
        return res.json();
    }
}