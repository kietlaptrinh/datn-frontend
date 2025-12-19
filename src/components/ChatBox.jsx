import { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaTimes, FaUsers, FaSignOutAlt } from "react-icons/fa";

export default function ChatBox({ roomId, messages, sendMessage, onClose, onLeave }) {
  const [input, setInput] = useState("");
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="absolute bottom-20 left-4 w-80 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden flex flex-col z-50 animate-fadeIn">
      <div className="bg-[#4e342e] p-3 flex justify-between items-center text-white border-b border-white/10">
        <div className="flex items-center gap-2">
          <FaUsers className="text-yellow-400" />
          <span className="font-bold text-sm">Phòng: {roomId.slice(0, 8)}...</span>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={onLeave} 
                title="Kết thúc & Rời phòng"
                className="text-red-400 hover:text-red-600 transition"
            >
                <FaSignOutAlt />
            </button>
            
           
            <button onClick={onClose} className="text-gray-300 hover:text-white transition">
                <FaTimes />
            </button>
        </div>
      </div>

    
      <div className="h-64 overflow-y-auto p-3 space-y-3 custom-scrollbar bg-black/20">
        {messages.map((msg, idx) => {
        
          const isMe = msg.isMe; 
          const isSystem = msg.isSystem;

          if (isSystem) return (
            <div key={idx} className="text-center text-[10px] text-yellow-500/80 italic my-2">
              {msg.text}
            </div>
          );

          return (
            <div key={idx} className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}>
              {!msg.isMe && <span className="text-[10px] text-gray-400 mb-1 ml-1">{msg.user}</span>}
              <div 
                className={`px-3 py-2 rounded-lg max-w-[85%] text-sm break-words shadow-sm
                ${msg.isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-[#333] text-gray-200 rounded-bl-none"}`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

     
      <form onSubmit={handleSend} className="p-2 bg-black/60 flex gap-2 border-t border-white/10">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 bg-white/10 text-white text-sm px-3 py-2 border border-transparent rounded-full focus:outline-none focus:border-yellow-500 focus:bg-black transition"
        />
        <button type="submit" className="bg-yellow-600 text-white p-2 rounded-full hover:bg-yellow-500 transition shadow-lg">
          <FaPaperPlane size={12} />
        </button>
      </form>
    </div>
  );
}