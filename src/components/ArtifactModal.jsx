import { FaTimes, FaVolumeUp, FaStop, FaArrowRight, FaPlay, FaPause, FaInfoCircle, FaSpinner } from "react-icons/fa";
import { useRef, useState, useEffect } from "react";
import ArtifactGuideChat from "./ArtifactGuideChat";

const FPT_API_KEY = import.meta.env.VITE_FPT_API_KEY;

export default function ArtifactModal({ artifact, onClose }) {
  const imgRef = useRef(null);
  
  const [isPressed, setIsPressed] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  
  const [showInfo, setShowInfo] = useState(true);
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  
  const autoRotateRef = useRef(0);
  const animationFrameId = useRef(null);
  const previousTouchX = useRef(0);
  
  const audioRef = useRef(null);
  const retryCount = useRef(0);
  const retryTimeoutRef = useRef(null);
  const shouldPlayRef = useRef(false);

  if (!artifact) return null;

  

  useEffect(() => {
    const animate = () => {
      if (isAutoRotating && !isPressed && imgRef.current) {
        autoRotateRef.current += 0.2; 
        if (autoRotateRef.current > 360) autoRotateRef.current = 0;
        imgRef.current.style.transform = `perspective(1000px) rotateY(${autoRotateRef.current}deg)`;
      }
      animationFrameId.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [isAutoRotating, isPressed]);

  const handleMouseDown = (e) => { e.preventDefault(); setIsPressed(true); setIsAutoRotating(false); };
  const handleMouseUp = () => { setIsPressed(false); };
  const handleMouseMove = (e) => {
    if (!isPressed || !imgRef.current) return;
    const { width } = imgRef.current.getBoundingClientRect();
    const x = (e.movementX / width) * 100 * 0.5; 
    autoRotateRef.current += x;
    imgRef.current.style.transform = `perspective(1000px) rotateY(${autoRotateRef.current}deg)`;
  };
  const handleTouchStart = (e) => { setIsPressed(true); setIsAutoRotating(false); previousTouchX.current = e.touches[0].clientX; };
  const handleTouchEnd = () => { setIsPressed(false); };
  const handleTouchMove = (e) => {
      if (!isPressed || !imgRef.current) return;
      const currentTouchX = e.touches[0].clientX;
      const deltaX = currentTouchX - previousTouchX.current;
      autoRotateRef.current += deltaX * 0.5; 
      imgRef.current.style.transform = `perspective(1000px) rotateY(${autoRotateRef.current}deg)`;
      previousTouchX.current = currentTouchX;
  };

  const stopAudio = () => {
      shouldPlayRef.current = false;
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      if (retryTimeoutRef.current) { clearTimeout(retryTimeoutRef.current); retryTimeoutRef.current = null; }
      setIsSpeaking(false); setIsLoadingAudio(false);
  };

  const handleSpeak = async () => {
    if (isSpeaking || isLoadingAudio) { stopAudio(); return; }
    setIsLoadingAudio(true); shouldPlayRef.current = true; retryCount.current = 0;
    try {
        let textToRead = artifact.description || artifact.name;
        if (textToRead.length > 500) textToRead = textToRead.substring(0, 500) + "...";
        const response = await fetch("https://api.fpt.ai/hmi/tts/v5", {
            method: "POST",
            headers: { "api-key": FPT_API_KEY, "voice": "banmai", "speed": "" },
            body: textToRead
        });
        if (!shouldPlayRef.current) { setIsLoadingAudio(false); return; }
        const data = await response.json();
        if (data.async) playAudioWithRetry(data.async);
        else { setIsLoadingAudio(false); }
    } catch (error) { setIsLoadingAudio(false); }
  };

  const playAudioWithRetry = (url) => {
      if (!shouldPlayRef.current) return;
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setIsSpeaking(false);
      audio.oncanplaythrough = () => { if (shouldPlayRef.current) { setIsLoadingAudio(false); setIsSpeaking(true); } };
      audio.onerror = () => {
          if (retryCount.current < 5) {
              if (shouldPlayRef.current) {
                  retryCount.current++;
                  retryTimeoutRef.current = setTimeout(() => playAudioWithRetry(url), 1500); 
              }
          } else { setIsLoadingAudio(false); setIsSpeaking(false); }
      };
      audio.play().catch(e => {});
  };

  useEffect(() => { return () => stopAudio(); }, []);


  return (
    <div className="fixed inset-0 z-[70] overflow-hidden">
      
      <div 
        className={`absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing transition-all duration-500 ease-in-out
        ${showInfo ? 'md:mr-[400px] md:scale-90' : ''}`}
        onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onTouchMove={handleTouchMove}
      >
         <img 
            ref={imgRef}
            src={artifact.imageUrl} 
            alt={artifact.name} 
            draggable="false"
            className="max-w-[85%] max-h-[85%] object-contain select-none transition-transform duration-75 ease-linear"
            style={{ willChange: "transform" }}
         />
      </div>

      <div className={`absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-4 z-50 transition-all duration-500 ease-in-out ${showInfo ? 'md:-translate-x-[calc(50%+200px)]' : ''}`}>
          <button onClick={() => setIsAutoRotating(!isAutoRotating)} className="w-12 h-12 flex items-center justify-center rounded-full border border-white/20 text-white/80 hover:bg-white hover:text-black transition-all backdrop-blur-sm">
             {isAutoRotating ? <FaPause size={14} /> : <FaPlay size={14} className="ml-0.5"/>}
          </button>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-full border border-white/20 text-white/80 hover:bg-red-600 transition-all backdrop-blur-sm">
             <FaTimes size={18} />
          </button>
      </div>

      <div className={`absolute top-6 right-6 z-50 transition-all duration-300 transform 
          ${showInfo ? 'opacity-0 translate-x-10 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
        <button 
            onClick={() => setShowInfo(true)}
            className="flex items-center gap-3 bg-gradient-to-r border px-5 py-2.5 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all group animate-bounce-slow"
        >
            <span className="text-xs font-bold tracking-widest uppercase">Thông Tin</span>
            
        </button>
      </div>

      <div 
        className={`absolute top-0 right-0 h-full w-full md:w-[450px] bg-[#14161c] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] transform transition-transform duration-500 ease-in-out z-[80] flex flex-col border-l border-white/5
        ${showInfo ? "translate-x-0" : "translate-x-full"}`}
      >
         
          <div className="p-6 flex justify-between items-center border-b border-white/5 bg-[#1a1d24]">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-600 flex items-center justify-center shadow-lg">
                      <span className="text-xl">🤖</span>
                  </div>
                  <div>
                      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Trợ lý thông minh</h2>
                      <h1 className="text-lg font-bold text-white leading-none truncate max-w-[200px]">{artifact.name}</h1>
                  </div>
              </div>
              
         
              <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setShowInfo(false); 
                }} 
                className="text-gray-500 hover:text-white transition p-2 hover:bg-white/10 rounded-full cursor-pointer active:scale-95 z-50"
              >
                  <FaArrowRight size={20} />
              </button>
          </div>

          <div className="flex-1 overflow-hidden relative">
              <ArtifactGuideChat artifact={artifact} />
          </div>

          <div className="p-8 border-t border-white/5 bg-[#1a1d24]">
             <button onClick={handleSpeak} className={`w-full flex items-center justify-center gap-3 py-4 rounded-lg text-xs font-bold uppercase tracking-[0.2em] transition-all border ${isSpeaking || isLoadingAudio ? "bg-white text-black border-white hover:bg-gray-200" : "bg-transparent border-white/20 text-gray-300 hover:text-white"}`}>
                {isLoadingAudio ? <FaSpinner className="animate-spin" size={14} /> : (isSpeaking ? <FaStop size={14} /> : <FaVolumeUp size={14} />)}
                {isLoadingAudio ? "Đang tải giọng..." : (isSpeaking ? "Dừng đọc" : "Nghe thuyết minh")}
            </button>
          </div>
      </div>

    </div>
  );
}