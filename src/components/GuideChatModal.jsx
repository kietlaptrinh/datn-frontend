import { useState, useRef, useEffect } from "react";
import { FaTimes, FaPaperPlane, FaRobot, FaUser, FaExternalLinkAlt, FaImage, FaVolumeUp, FaStop, FaLightbulb } from "react-icons/fa";

export default function GuideChatModal({ guideName, instruction, knowledge, onClose, onViewArtifact }) {
  const [messages, setMessages] = useState([
    { 
      role: "model", 
      text: `Xin chào! Tôi là ${guideName}. Tôi nắm giữ toàn bộ thông tin lịch sử tại khu vực này. Bạn muốn tôi thuyết minh về điều gì?` 
    }
  ]);
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [playingMsgIndex, setPlayingMsgIndex] = useState(null); 
  const scrollRef = useRef(null);

  const suggestions = [
    "Khu vực này có gì nổi bật?",
    "Ý nghĩa lịch sử ở đây là gì?",
    "Có hiện vật nào độc đáo không?"
  ];

  useEffect(() => { 
    scrollRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages, loading]);
  useEffect(() => {
      return () => { 
          window.speechSynthesis.cancel(); 
      };
  }, []);

  const handleSend = async (queryOverride = null) => {
    const queryText = queryOverride || input;
    if (!queryText.trim()) return;
    window.speechSynthesis.cancel();
    setPlayingMsgIndex(null);

    const userMsg = { role: "user", text: queryText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            query: queryText,
            instruction_override: instruction, 
            context_override: knowledge
        })
      });

      if (!res.ok) throw new Error("Lỗi kết nối server");
      const data = await res.json();
      
      const aiMsg = { 
          role: "model", 
          text: data.reply,
          artifact: data.related_artifact 
      };
      setMessages((prev) => [...prev, aiMsg]);

    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "model", text: "Xin lỗi, tôi đang bị mất kết nối với máy chủ." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeakMessage = (text, index) => {
      if (playingMsgIndex === index) {
          window.speechSynthesis.cancel();
          setPlayingMsgIndex(null);
          return;
      }

      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN'; 
      utterance.rate = 1.0;  
      utterance.pitch = 1.0; 

      utterance.onend = () => {
          setPlayingMsgIndex(null);
      };

      utterance.onerror = () => {
          setPlayingMsgIndex(null);
      };

      setPlayingMsgIndex(index);
      window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
    
      <div className="bg-[#1e1e1e] w-full max-w-2xl rounded-xl shadow-2xl flex flex-col h-[650px] max-h-[90vh] overflow-hidden border border-gray-700">
        
        <div className="bg-[#252525] p-4 flex justify-between items-center border-b border-gray-700">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <FaRobot size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-base text-white">{guideName}</h3>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Trợ lý thông minh</p>
                </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-2 transition-colors">
                <FaTimes size={20} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#1e1e1e] custom-scrollbar">
            {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    
                
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                        ${msg.role === 'model' ? 'bg-gray-700 text-white' : 'bg-blue-600 text-white'}`}>
                        {msg.role === 'model' ? <FaRobot size={14}/> : <FaUser size={12}/>}
                    </div>

                    <div className={`max-w-[85%] flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        
                    
                        <div className={`relative px-4 py-3 rounded-lg text-sm leading-6 
                            ${msg.role === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-[#2a2a2a] text-gray-200 border border-gray-700'}`}>
                            
                            {msg.text}

                         
                            {msg.role === 'model' && (
                                <button 
                                    onClick={() => handleSpeakMessage(msg.text, i)}
                                    className={`absolute -right-8 top-2 text-gray-500 hover:text-white transition-colors
                                    ${playingMsgIndex === i ? 'text-green-400 animate-pulse' : ''}`}
                                    title="Đọc"
                                >
                                    {playingMsgIndex === i ? <FaStop size={14}/> : <FaVolumeUp size={14}/>}
                                </button>
                            )}
                        </div>

                     
                        {msg.role === 'model' && msg.artifact && (
                            <div className="bg-[#252525] rounded-lg border border-gray-700 overflow-hidden max-w-xs mt-1 group cursor-pointer" onClick={() => onViewArtifact(msg.artifact)}>
                                <div className="relative h-32 w-full overflow-hidden">
                                    <img 
                                        src={msg.artifact.imageUrl || "https://placehold.co/400x300?text=No+Image"} 
                                        alt={msg.artifact.name} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
                                        <FaImage className="inline mr-1"/> 3D
                                    </div>
                                </div>
                                <div className="p-3">
                                    <h4 className="font-bold text-white text-sm truncate">{msg.artifact.name}</h4>
                                    <button 
                                        className="mt-2 w-full bg-white/5 hover:bg-white/10 text-gray-300 text-xs py-2 rounded border border-gray-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FaExternalLinkAlt size={10} /> Xem chi tiết
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {loading && (
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                        <FaRobot size={14} className="text-white"/>
                    </div>
                    <div className="bg-[#2a2a2a] px-4 py-3 rounded-lg border border-gray-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                </div>
            )}
            <div ref={scrollRef} />
        </div>

     
        <div className="bg-[#252525] border-t border-gray-700 p-4">
            
      
            {!loading && (
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1 custom-scrollbar">
                    {suggestions.map((s, i) => (
                        <button 
                            key={i} 
                            onClick={() => handleSend(s)}
                            className="flex items-center gap-2 whitespace-nowrap bg-white/5 hover:bg-white/10 text-gray-300 border border-gray-600 hover:border-gray-400 px-3 py-1.5 rounded-full text-xs transition-colors"
                        >
                            <FaLightbulb size={10} className="text-yellow-500"/> {s}
                        </button>
                    ))}
                </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2 items-center">
                <input 
                    className="flex-1 bg-[#1e1e1e] border border-gray-600 rounded-lg px-4 py-2.5 focus:border-gray-400 transition-colors outline-none text-sm text-white placeholder-gray-500"
                    placeholder="Đặt câu hỏi..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={loading}
                />
                <button 
                    type="submit" 
                    disabled={loading || !input.trim()}
                    className={`p-3 rounded-lg flex items-center justify-center transition-colors
                        ${loading || !input.trim() ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                >
                    <FaPaperPlane size={14} />
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}