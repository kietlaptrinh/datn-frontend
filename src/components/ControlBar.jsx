import {
  FaPlus, FaMinus, FaArrowsAlt, FaVrCardboard
} from "react-icons/fa";
import { notifyError } from '../utils/alertHelper';

export default function ControlBar({ onZoomIn, onZoomOut,onToggleVR  }) {
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        notifyError(`Không thể mở toàn màn hình: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleVRClick = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      onToggleVR();
    } else {
      notifyError("Chức năng VR Cardboard chỉ hỗ trợ trải nghiệm trên điện thoại!");
    }
  };
  return (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center space-x-3 
                    bg-black/50 px-4 py-2 rounded-lg text-white text-lg z-10">
      <button 
        onClick={handleToggleFullscreen}
        className="hover:text-yellow-300 transition transform hover:scale-110"
        title="Toàn màn hình"
      >
        <FaArrowsAlt />
      </button>
      <button 
        onClick={handleVRClick}
        className="hover:text-yellow-300 transition transform hover:scale-110"
        title="Bật chế độ VR"
      >
        <FaVrCardboard />
      </button>
      <button onClick={onZoomOut} className="hover:text-yellow-300"><FaMinus /></button>
      <button onClick={onZoomIn} className="hover:text-yellow-300"><FaPlus /></button>
    </div>
  );
}
