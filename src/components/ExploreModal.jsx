import { useState, useEffect, useRef } from "react";
import { FaTimes, FaCube } from "react-icons/fa";
import { ArtifactAPI } from "../api/artifactApi";

export default function ExploreModal({ onClose }) {
  const [artifacts, setArtifacts] = useState([]);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [loading, setLoading] = useState(true);

  const imgRef = useRef(null);
  const autoRotateRef = useRef(0);
  const animationFrameId = useRef(null);


  useEffect(() => {
    async function fetchAllArtifacts() {
      try {
        const data = await ArtifactAPI.listAll(); 
        
        const processedData = data.map(item => {
             let img = item.imageUrl;
             if (img && !img.startsWith("http")) {
                 img = `http://localhost:4000${img.startsWith("/") ? "" : "/"}${img}`;
             }
             return { ...item, imageUrl: img };
        });

        setArtifacts(processedData);
        if (processedData.length > 0) setSelectedArtifact(processedData[0]);
      } catch (error) {
        console.error("Lỗi tải hiện vật:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAllArtifacts();
  }, []);

  useEffect(() => {
    const animate = () => {
      if (imgRef.current) {
        autoRotateRef.current += 0.15; 
        if (autoRotateRef.current > 360) autoRotateRef.current = 0;
        imgRef.current.style.transform = `perspective(1000px) rotateY(${autoRotateRef.current}deg)`;
      }
      animationFrameId.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [selectedArtifact]); 

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-16">

      <div className="relative w-full h-full max-w-5xl bg-[#141414] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/10">

        <div className="h-28 bg-[#0f0f0f] border-b border-white/5 flex items-center px-4 relative">
         
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-red-500 text-white transition"
            >
                <FaTimes />
            </button>

            <div className="flex gap-3 overflow-x-auto w-full p-2 custom-scrollbar snap-x">
                {loading ? <div className="text-gray-500 text-sm p-4">Đang tải dữ liệu...</div> : artifacts.map((item) => (
                    <div 
                        key={item.id}
                        onClick={() => setSelectedArtifact(item)}
                        className={`flex-shrink-0 w-20 h-20 cursor-pointer transition-all duration-300 rounded-lg overflow-hidden border-2 snap-center relative group
                        ${selectedArtifact?.id === item.id 
                            ? 'border-yellow-500' 
                            : 'border-transparent opacity-50 hover:opacity-100'}`}
                    >
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover bg-black" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-[10px] text-white text-center py-1 px-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.name}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {selectedArtifact ? (
                <>
                   
                    <div className="md:w-[35%] bg-[#111] p-8 border-r border-white/5 flex flex-col overflow-y-auto custom-scrollbar">
                        <div className="mb-4">
                            <h2 className="text-3xl font-serif font-bold text-white leading-tight">
                                {selectedArtifact.name}
                            </h2>
                        </div>
                        
                        <div className="h-1 w-16 bg-yellow-600/50 mb-6"></div>

                       
                        <div className="text-gray-300 text-base leading-7 font-light text-justify flex-1 pr-2">
                            {selectedArtifact.description ? (
                                selectedArtifact.description.split('\n').map((line, idx) => (
                                    <p key={idx} className="mb-4">
                                        {line}
                                    </p>
                                ))
                            ) : "Chưa có mô tả chi tiết cho hiện vật này."}
                        </div>
                    </div>

                    
                    <div className="md:w-[65%] relative bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center overflow-hidden">
                         
                        
                         <img 
                            ref={imgRef}
                            src={selectedArtifact.imageUrl} 
                            alt={selectedArtifact.name}
                            className="max-h-[70%] max-w-[80%] object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)] transition-transform duration-75 ease-linear"
                            style={{ willChange: "transform" }}
                         />
                         
                    
                         
                    </div>
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-600">
                    Chọn một hiện vật từ danh sách trên để xem chi tiết.
                </div>
            )}
        </div>

      </div>
    </div>
  );
}