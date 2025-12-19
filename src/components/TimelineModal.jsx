import { FaTimes, FaVolumeUp, FaStop, FaChevronLeft, FaChevronRight, FaSpinner } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import {notifyError } from '../utils/alertHelper';
const FPT_API_KEY = import.meta.env.VITE_FPT_API_KEY;

export default function TimelineModal({ event, onClose }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioRef = useRef(null); 
  
  const retryCount = useRef(0);
  const retryTimeoutRef = useRef(null); 
  const shouldPlayRef = useRef(false);

  const images = event.images && Array.isArray(event.images) && event.images.length > 0 
      ? event.images 
      : (event.image ? [event.image] : []);
      
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  if (!event) return null;

  const nextImage = () => {
      if (images.length > 1) {
          setCurrentImgIndex((prev) => (prev + 1) % images.length);
      }
  };

  const prevImage = () => {
      if (images.length > 1) {
          setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
      }
  };

  
  const stopAudio = () => {
      shouldPlayRef.current = false; 
      
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
      }
      if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
      }
      setIsSpeaking(false);
      setIsLoadingAudio(false);
  };

  const handleSpeak = async () => {
    if (isSpeaking || isLoadingAudio) {
        stopAudio();
        return;
    }
    setIsLoadingAudio(true);
    shouldPlayRef.current = true;
    retryCount.current = 0;

    try {
        const text = `Năm ${event.year}. ${event.title}. ${event.description}`;
        
        const headers = {
            "api-key": FPT_API_KEY,
            "voice": "banmai"
        };
        
        const response = await fetch("https://api.fpt.ai/hmi/tts/v5", {
            method: "POST",
            headers: headers,
            body: text
        });

    
        if (!shouldPlayRef.current) return;

        const data = await response.json();

        if (data.async) {
            playAudioWithRetry(data.async);
        } else {
            notifyError("API FPT không trả về link audio.");
            setIsLoadingAudio(false);
        }

    } catch (error) {
        setIsLoadingAudio(false);
    }
  };

  const playAudioWithRetry = (url) => {
      if (!shouldPlayRef.current) return;

      if (audioRef.current) audioRef.current.pause();
      
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => setIsSpeaking(false);
      
      audio.oncanplaythrough = () => {
          if (shouldPlayRef.current) {
             setIsLoadingAudio(false); 
             setIsSpeaking(true);
          }
      };
      
      audio.onerror = () => {
          if (retryCount.current < 5) {
              if (shouldPlayRef.current) {
                  retryCount.current += 1;
                
                  retryTimeoutRef.current = setTimeout(() => {
                      playAudioWithRetry(url); 
                  }, 1500); 
              }
          } else {
              setIsLoadingAudio(false);
              setIsSpeaking(false);
              notifyError("Server FPT đang bận (File chưa tạo xong).");
          }
      };

      audio.play().catch(e => console.log("Chờ tải file..."));
  };

  useEffect(() => {
      return () => {
          stopAudio(); 
      };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
        <div className="relative w-full max-w-5xl bg-[#111] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/10 h-[80vh]">
            <button onClick={onClose} className="absolute top-4 right-4 z-50 text-white/50 hover:text-red-500 p-2 bg-black/50 rounded-full transition">
                <FaTimes size={20} />
            </button>

            <div className="md:w-3/5 h-1/2 md:h-full relative bg-black group">
                {images.length > 0 ? (
                    <img src={images[currentImgIndex]} alt={event.title} className="w-full h-full object-contain transition-opacity duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">Không có hình ảnh</div>
                )}
                
                {images.length > 1 && (
                    <>
                        <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-white hover:text-black transition opacity-0 group-hover:opacity-100"><FaChevronLeft /></button>
                        <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-white hover:text-black transition opacity-0 group-hover:opacity-100"><FaChevronRight /></button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {images.map((_, idx) => (
                                <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === currentImgIndex ? 'bg-yellow-500 w-4' : 'bg-white/50'}`}></div>
                            ))}
                        </div>
                    </>
                )}
                <div className="absolute top-4 left-4 pointer-events-none">
                    <span className="text-6xl font-black text-yellow-500 select-none drop-shadow-lg">{event.year}</span>
                </div>
            </div>

            <div className="md:w-2/5 p-8 flex flex-col bg-[#141414] border-l border-white/10">
                <div className="mb-6">
                    <span className="text-yellow-500 font-bold text-xl block mb-2 border-b border-yellow-500/30 pb-2 inline-block">Sự kiện lịch sử</span>
                    <h2 className="text-2xl font-serif font-bold text-white leading-snug">{event.title}</h2>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    <p className={`text-base leading-7 text-justify transition-colors duration-500 font-light ${isSpeaking ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'text-gray-400'}`}>
                        {event.description}
                    </p>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                    <button 
                        onClick={handleSpeak}
                        className={`w-full py-3 rounded flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest border transition-all
                        ${isSpeaking || isLoadingAudio
                            ? 'bg-red-500/10 text-red-400 border-red-500 hover:bg-red-500 hover:text-white' 
                            : 'bg-white text-black border-white hover:bg-gray-200'}`}
                    >
                        {isLoadingAudio ? <FaSpinner className="animate-spin" /> : (isSpeaking ? <FaStop /> : <FaVolumeUp />)}
                        {isLoadingAudio ? "Đang xử lý (Bấm để hủy)..." : (isSpeaking ? "Dừng đọc" : "Thuyết Minh")}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}