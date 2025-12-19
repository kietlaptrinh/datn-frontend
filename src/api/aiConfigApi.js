const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL || "http://localhost:8000";

export const AIConfigAPI = {

  async listKnowledge() {
    const res = await fetch(`${AI_BASE_URL}/knowledge`);
    return res.json();
  },


  async addKnowledge(topic, content) {
    const res = await fetch(`${AI_BASE_URL}/knowledge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, content }),
    });
    return res.json();
  },
  async updateKnowledge(id, topic, content) {
    const res = await fetch(`${AI_BASE_URL}/knowledge/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, content }),
    });
    return res.json();
  },

  async deleteKnowledge(id) {
    const res = await fetch(`${AI_BASE_URL}/knowledge/${id}`, {
      method: "DELETE",
    });
    return res.json();
  },
  // Chat thử nghiệm
  async chat(query,context = null, instruction = null) {
    const res = await fetch(`${AI_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query,
          context_override: context,
          instruction_override: instruction
         })
    });
    return res.json();
  }
};
