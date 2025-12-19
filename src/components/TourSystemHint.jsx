import React, { useState, useEffect, useRef } from 'react';

const HINT_MSG = "Gợi ý. Khu vực này có Hướng dẫn viên AI hỗ trợ tham quan. Hãy tìm điểm thông tin AI màu tím hoặc nhấn vào đây để gọi hướng dẫn viên ngay.";
const FPT_API_KEY = import.meta.env.VITE_FPT_API_KEY;

const TourSystemHint = ({ onOpenAiChat, hasAiHotspot }) => {
  const [isVisible, setIsVisible] = useState(true);
  const timerRef = useRef(null);
  
  const audioRef = useRef(null);
  const retryCount = useRef(0);

  const handleSpeakFPT = async (text) => {
    if (audioRef.current) {
        audioRef.current.pause();
    }
    retryCount.current = 0;

    try {
        const response = await fetch("https://api.fpt.ai/hmi/tts/v5", {
            method: "POST",
            headers: {
                "api-key": FPT_API_KEY,
                "voice": "banmai",
                "speed": "0"
            },
            body: text
        });

        const data = await response.json();
        if (data.async) {
            playAudioWithRetry(data.async);
        }
    } catch (error) {
        console.error("Lỗi FPT AI:", error);
    }
  };

  const playAudioWithRetry = (url) => {
      if (audioRef.current) audioRef.current.pause();

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onerror = () => {
          if (retryCount.current < 5) {
              retryCount.current++;
              setTimeout(() => playAudioWithRetry(url), 1500);
          }
      };

      audio.play().catch(e => console.log("Auto-play blocked:", e));
  };

  useEffect(() => {
 
    const styleId = 'tour-hint-styles';
    if (!document.getElementById(styleId)) {
      const styleSheet = document.createElement("style");
      styleSheet.id = styleId;
      styleSheet.innerText = `
        @keyframes marquee { 0% { transform: translate(0, 0); } 100% { transform: translate(-100%, 0); } }
        @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `;
      document.head.appendChild(styleSheet);
    }

    // vòng lặp hiển thị & đọc
    if (hasAiHotspot && isVisible) {
      handleSpeakFPT(HINT_MSG);
    } 
    else if (hasAiHotspot && !isVisible) {
      // Nếu đang ẩn, đếm ngược 10s rồi hiện lại
      timerRef.current = setTimeout(() => {
        setIsVisible(true);
      }, 10000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (audioRef.current) audioRef.current.pause();
    };
  }, [isVisible, hasAiHotspot]);

  const handleBannerClick = () => {
    if (audioRef.current) audioRef.current.pause();
    setIsVisible(false);
    if (onOpenAiChat) onOpenAiChat();
  };

  const handleClose = (e) => {
    e.stopPropagation(); 
    if (audioRef.current) audioRef.current.pause();
    setIsVisible(false);
  };

  // QUAN TRỌNG: Nếu không có hotspot AI thì không render gì cả
  if (!hasAiHotspot || !isVisible) return null;

  return (
    <div style={styles.container} onClick={handleBannerClick} title="Nhấn để kích hoạt AI Tour">
      <div style={styles.header}>
        <span style={styles.title}>🔔 Thông tin tham quan</span>
        <button onClick={handleClose} style={styles.closeBtn}>&times;</button>
      </div>
      <div style={styles.contentBox}>
        <div style={styles.marqueeContainer}>
          <p style={styles.marqueeText}>{HINT_MSG}</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed', bottom: '20px', right: '20px', width: '350px',
    backgroundColor: 'rgba(0, 0, 0, 0.9)', color: '#00e5ff',
    borderRadius: '4px', border: '1px solid #00e5ff',
    boxShadow: '0 0 15px rgba(0, 229, 255, 0.3)', zIndex: 9999,
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    cursor: 'pointer', overflow: 'hidden', animation: 'slideIn 0.5s ease-out',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '5px 10px', backgroundColor: 'rgba(0, 229, 255, 0.1)', borderBottom: '1px solid #00e5ff',
  },
  title: { fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' },
  closeBtn: { background: 'none', border: 'none', color: '#00e5ff', fontSize: '18px', cursor: 'pointer', padding: '0 5px' },
  contentBox: { padding: '10px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', position: 'relative', fontSize: '14px' },
  marqueeContainer: { overflow: 'hidden' },
  marqueeText: { display: 'inline-block', paddingLeft: '100%', animation: 'marquee 12s linear infinite', margin: 0 },
};

export default TourSystemHint;