import { useState, useEffect, useRef } from "react";
import { FaChevronLeft, FaChevronRight, FaChevronDown } from "react-icons/fa";

function HotspotBar({ hotspots, onSelect, currentId }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeThumbRef = useRef(null);

  const currentIndex = hotspots.findIndex(h => h.id === currentId);
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const currentSpot = hotspots[safeIndex];

  useEffect(() => {
    if (isExpanded && activeThumbRef.current) {
        activeThumbRef.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  }, [isExpanded, currentId]);

  const handlePrev = () => {
    const newIndex = (safeIndex - 1 + hotspots.length) % hotspots.length;
    onSelect(hotspots[newIndex]);
  };

  const handleNext = () => {
    const newIndex = (safeIndex + 1) % hotspots.length;
    onSelect(hotspots[newIndex]);
  };

  if (isExpanded) {
    return (
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-black/90 backdrop-blur-md border-t border-white/10 p-4 animate-slideUp">
        <div className="container mx-auto max-w-5xl">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-bold">Danh sách điểm</h3>
                <button 
                    onClick={() => setIsExpanded(false)}
                    className="flex items-center gap-1 text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded transition"
                >
                    <FaChevronDown size={12} /> Thu gọn
                </button>
            </div>

         
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
                {hotspots.map((spot) => {
                    const isActive = currentId === spot.id;
                    return (
                        <div 
                            key={spot.id}
                            ref={isActive ? activeThumbRef : null}
                            onClick={() => onSelect(spot)}
                            className={`
                                relative aspect-video rounded cursor-pointer overflow-hidden group transition-all
                                ${isActive ? 'ring-2 ring-yellow-500 opacity-100' : 'opacity-60 hover:opacity-100'}
                            `}
                        >
                            <img 
                                src={spot.image} 
                                alt={spot.name} 
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                         
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1">
                                <p className={`text-[10px] truncate text-center ${isActive ? 'text-yellow-400 font-bold' : 'text-white'}`}>
                                    {spot.name}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 md:gap-4">
        
       
        <button 
            onClick={handlePrev}
            className="p-3 rounded-full bg-black/40 text-white hover:bg-black/80 hover:text-yellow-400 transition"
        >
            <FaChevronLeft size={16} />
        </button>

      
        <div 
            className="relative group cursor-pointer rounded-lg overflow-hidden border border-white/20 shadow-lg w-40 h-24 md:w-52 md:h-28" 
            onClick={() => setIsExpanded(true)}
        >
            {currentSpot ? (
                <>
                    <img 
                        src={currentSpot.image} 
                        alt={currentSpot.name} 
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                    />
                   
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5 text-center backdrop-blur-[2px]">
                         <p className="text-white text-xs font-bold truncate">
                            {currentSpot.name}
                        </p>
                    </div>
                    
                  
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <span className="text-white text-xs font-bold border border-white px-2 py-1 rounded">Xem tất cả</span>
                    </div>
                </>
            ) : (
                <div className="w-full h-full bg-black flex items-center justify-center text-white text-xs">...</div>
            )}
        </div>

       
        <button 
            onClick={handleNext}
            className="p-3 rounded-full bg-black/40 text-white hover:bg-black/80 hover:text-yellow-400 transition"
        >
            <FaChevronRight size={16} />
        </button>

       

        <style>{`
            @keyframes slideUp {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .animate-slideUp {
                animation: slideUp 0.25s ease-out forwards;
            }
            .custom-scrollbar::-webkit-scrollbar {
                width: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
            }
        `}</style>
    </div>
  );
}

export default HotspotBar;