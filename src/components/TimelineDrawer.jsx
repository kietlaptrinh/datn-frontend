import { useState, useEffect, useRef } from "react";
import { FaTimes, FaHistory, FaVolumeUp, FaStop } from "react-icons/fa";
import { TimelineAPI } from "../api/timelineApi";
import TimelineModal from "./TimelineModal";

const FPT_API_KEY = import.meta.env.VITE_FPT_API_KEY;

export default function TimelineDrawer({ onClose }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [readingIndex, setReadingIndex] = useState(-1);
  const [isAutoMode, setIsAutoMode] = useState(true);

  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const scrollContainerRef = useRef(null);
  const itemRefs = useRef([]);
  
  // quản lý Audio FPT
  const audioRef = useRef(null);
  const retryCount = useRef(0);

  const isAutoModeRef = useRef(isAutoMode);

  useEffect(() => {
    isAutoModeRef.current = isAutoMode;
  }, [isAutoMode]);

  useEffect(() => {
    TimelineAPI.list().then(data => {
      const processed = data.map(e => {
          let thumb = null;
          
          if (e.images && Array.isArray(e.images) && e.images.length > 0) {
              thumb = e.images[0];
          } 
          else if (e.image) {
              thumb = e.image;
          }

          if (thumb && !thumb.startsWith('http')) {
               thumb = `http://localhost:4000${thumb.startsWith('/')?'':'/'}${thumb}`;
          }

          return { ...e, thumbnail: thumb };
      });
      
      setEvents(processed);
      setLoading(false);
      if (processed.length > 0) setTimeout(() => setReadingIndex(0), 1000);
    });

    return () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };
  }, []);

  const handleSpeakFPT = async (text) => {
    // Dừng audio cũ nếu có
    if (audioRef.current) {
        audioRef.current.pause();
    }
    
    retryCount.current = 0;

    try {
        const response = await fetch("https://api.fpt.ai/hmi/tts/v5", {
            method: "POST",
            headers: {
                "api-key": FPT_API_KEY,
                "voice": "banmai"
            },
            body: text
        });

        const data = await response.json();
        
        if (data.async) {
            playAudioWithRetry(data.async);
        }
    } catch (error) {
        console.error("Lỗi FPT:", error);
    }
  };

  const playAudioWithRetry = (url) => {
      if (audioRef.current) audioRef.current.pause();

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
          if (isAutoModeRef.current) {
              setReadingIndex(prev => prev + 1);
          }
      };

      audio.onerror = () => {
          if (retryCount.current < 5) {
              retryCount.current++;
              setTimeout(() => playAudioWithRetry(url), 1500);
          }
      };

      audio.play().catch(e => console.log("Chặn tự động phát:", e));
  };
 

  useEffect(() => {
    if (selectedEvent) {
        if (audioRef.current) audioRef.current.pause();
        return;
    }

    if (readingIndex === -1 || readingIndex >= events.length || !isAutoMode) return;

    const currentEvent = events[readingIndex];
    const text = `Năm ${currentEvent.year}. ${currentEvent.title}. ${currentEvent.description}`;
    
    if (itemRefs.current[readingIndex]) {
        itemRefs.current[readingIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    handleSpeakFPT(text);

  }, [readingIndex, isAutoMode, events, selectedEvent]);

  const handleCardClick = (index) => {
      setIsAutoMode(false);
      setReadingIndex(index);

      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
      }
      setSelectedEvent(events[index]);
  };

  const handleClose = () => {
      setIsAutoMode(false);
      if (audioRef.current) audioRef.current.pause();
      onClose();
  };

  const toggleAutoMode = () => {
      if (audioRef.current) audioRef.current.pause();
      setIsAutoMode(!isAutoMode);
  };

  return (
    <>
    <div className="fixed bottom-0 left-0 w-full h-[30vh] z-[90] bg-black/60 backdrop-blur-md border-t border-white/10 animate-slideInUp flex flex-col">
      
  
      <div className="flex justify-between items-center px-6 py-2 border-b border-white/5">
        <div className="flex items-center gap-2 text-yellow-500">
            <FaHistory size={14} />
            <h2 className="text-xs font-bold text-white uppercase tracking-widest">
                Lịch Sử ({readingIndex + 1}/{events.length})
            </h2>
            {isAutoMode && <span className="text-[9px] text-green-400 animate-pulse ml-2">● Đang đọc...</span>}
        </div>
        <div className="flex gap-2">
            <button onClick={toggleAutoMode} className="text-xs text-white/50 hover:text-white">
            
                <FaVolumeUp />
            </button>
            <button onClick={handleClose} className="text-white/50 hover:text-red-500"><FaTimes /></button>
        </div>
      </div>

     
      <div ref={scrollContainerRef} className="flex-1 overflow-x-auto custom-scrollbar p-4 flex items-center gap-6 relative">
        
        {loading ? <div className="text-white/50 text-xs ml-10">Đang tải...</div> : events.map((evt, idx) => {
            const isActive = idx === readingIndex;
            const shortDesc = evt.description?.length > 80 ? evt.description.substring(0, 80) + "..." : evt.description;

            return (
            <div 
                key={evt.id} 
                ref={el => itemRefs.current[idx] = el}
                onClick={() => handleCardClick(idx)}
                className={`relative min-w-[250px] max-w-[250px] cursor-pointer transition-all duration-500 flex flex-col
                ${isActive ? 'opacity-100 scale-105' : 'opacity-40 hover:opacity-80'}`}
            >
                <div className="flex gap-3 items-start">
                  
                    {evt.thumbnail ? (
                        <img 
                            src={evt.thumbnail} 
                            alt={evt.title} 
                            className={`w-20 h-20 object-cover rounded-lg border ...`} 
                        />
                    ) : (
                        <div className="w-20 h-20 bg-white/10 rounded-lg flex items-center justify-center text-xs text-gray-500">No Image</div>
                    )}
                    
                
                    <div className="flex-1">
                        <div className={`text-xs font-black mb-1 ${isActive ? 'text-yellow-500' : 'text-gray-500'}`}>
                            {evt.year}
                        </div>
                        <h3 className="font-bold text-sm text-white mb-1 leading-tight">{evt.title}</h3>
                        <p className="text-[10px] text-gray-300 leading-relaxed">
                            {shortDesc}
                        </p>
                    </div>
                </div>
                
             
                {isActive && <div className="w-full h-[2px] bg-yellow-500/50 mt-3 rounded-full animate-pulse"></div>}
            </div>
            
            )})
        }
        <div className="min-w-[20px]"></div>
        
      </div>

      <style>{`
        @keyframes slideInUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slideInUp { animation: slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      
    </div>
    {selectedEvent && (
        <TimelineModal 
            event={selectedEvent} 
            onClose={() => setSelectedEvent(null)} 
        />
    )}
    </>
  );
}