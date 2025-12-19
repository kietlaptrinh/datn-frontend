import { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaRobot, FaUser, FaSpinner } from "react-icons/fa";
import { AIConfigAPI } from "../api/aiConfigApi";

export default function ArtifactGuideChat({ artifact, onIntroductionLoaded }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const introduce = async () => {
      setLoading(true);
      try {
        const context = `
          Tên vật phẩm: ${artifact.name}.
          Mô tả chi tiết: ${artifact.description}.
          Vị trí: ${artifact.room_name || "Bảo tàng ảo"}.
        `;
        
        const res = await AIConfigAPI.chat(
            "Hãy giới thiệu ngắn gọn và hấp dẫn về vật phẩm này cho khách tham quan.", 
            context,
            "Bạn là một hướng dẫn viên bảo tàng am hiểu, giọng văn kể chuyện, lôi cuốn."
        );

        setMessages([
          { role: "ai", content: res.reply }
        ]);

        if (onIntroductionLoaded) {
            onIntroductionLoaded(res.reply);
        }
      } catch (e) {
        console.error(e);
        setMessages([{ role: "ai", content: "Xin chào, tôi là AI Guide. Bạn muốn biết gì về hiện vật này?" }]);
      } finally {
        setLoading(false);
      }
    };

    if (artifact) introduce();
  }, [artifact]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const context = `
          Tên vật phẩm: ${artifact.name}.
          Mô tả chi tiết: ${artifact.description}.
          Lịch sử chat trước đó: ${messages.map(m => m.content).join(" | ")}
      `;

      const res = await AIConfigAPI.chat(
          userMsg, 
          context, 
          "Bạn là Hướng dẫn viên bảo tàng chuyên nghiệp. Hãy trả lời ngắn gọn, tập trung vào vật phẩm đang xem."
      );

      setMessages(prev => [...prev, { role: "ai", content: res.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "ai", content: "Xin lỗi, tôi đang mất kết nối với máy chủ." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#14161c]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 
              ${msg.role === "ai" ? "bg-yellow-600 text-white" : "bg-gray-600 text-gray-200"}`}>
              {msg.role === "ai" ? <FaRobot size={14} /> : <FaUser size={12} />}
            </div>
            <div className={`p-3 rounded-xl max-w-[80%] text-sm leading-relaxed 
              ${msg.role === "ai" ? "bg-[#1a1d24] text-gray-300 border border-white/5" : "bg-blue-600 text-white"}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
           <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center">
                <FaRobot size={14} />
              </div>
              <div className="bg-[#1a1d24] p-3 rounded-xl flex items-center gap-2">
                <span className="text-gray-400 text-xs italic">Đang suy nghĩ...</span>
                <FaSpinner className="animate-spin text-yellow-500" />
              </div>
           </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 border-t border-white/5 bg-[#1a1d24]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Hỏi gì đó về hiện vật này..."
            className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 transition"
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="bg-yellow-600 hover:bg-yellow-500 text-white p-2.5 rounded-lg transition disabled:opacity-50"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
}