import { FaTimes, FaHistory, FaMapMarkerAlt, FaArrowRight, FaTrashAlt } from "react-icons/fa";

export default function HistoryModal({ history, onSelect, onClose, onClear }) { 
  return (
   
    <div className="fixed inset-0 z-[60] flex justify-end">
   
      <div 
        className="absolute inset-0 bg-transparent transition-opacity duration-300 cursor-pointer" 
        onClick={onClose}
      ></div>

      <div className="relative w-80 h-full bg-[#151923] border-l border-yellow-600/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col animate-slideInRight">
        
        <div className="p-5 border-b border-white/5 bg-gradient-to-r from-[#3e2723] to-[#271c19] flex justify-between items-center shadow-md relative z-10">
          <div className="flex items-center gap-3 text-yellow-500">
            <FaHistory className="text-xl drop-shadow-md" />
            <div>
              <h3 className="font-bold text-white text-lg tracking-wide">Hành Trình</h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Lịch sử tham quan</p>
            </div>
          </div>
          
          <div className="flex gap-2">
       
            {history.length > 0 && (
                <button 
                    onClick={() => {
                        if(window.confirm('Xóa toàn bộ lịch sử?')) onClear();
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition"
                    title="Xóa lịch sử"
                >
                    <FaTrashAlt size={12} />
                </button>
            )}

          
            <button 
                onClick={onClose} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition"
            >
                <FaTimes />
            </button>
          </div>
        </div>

      
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-[#0b0f1a]">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600 opacity-80">
              <div className="p-4 rounded-full bg-white/5 mb-3">
                 <FaMapMarkerAlt size={30} />
              </div>
              <p className="text-sm font-medium">Chưa có dữ liệu hành trình.</p>
              <p className="text-xs mt-1">Hãy bắt đầu khám phá bảo tàng!</p>
            </div>
          ) : (
            history.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => onSelect(item.id)}
                className="group relative flex items-center gap-3 p-3 rounded-xl bg-[#1e2330] border border-white/5 hover:border-yellow-500/50 hover:bg-[#252b3b] cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
              >
              
                <span className="absolute -left-1 -top-1 w-5 h-5 bg-yellow-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm border border-[#1a1f2d] z-20">
                  {idx + 1}
                </span>

              
                <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-700 group-hover:border-yellow-500/50 transition-colors relative">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      loading="lazy" 
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                </div>
                
            
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="text-gray-200 text-sm font-bold truncate group-hover:text-yellow-400 transition-colors">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 bg-black/30 px-2 py-0.5 rounded flex items-center gap-1">
                        <FaHistory size={8} /> 
                        {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                  </div>
                </div>

               
                <FaArrowRight className="text-yellow-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-xs" />
              </div>
            ))
          )}
        </div>

     
        <div className="p-3 border-t border-white/5 bg-[#0f1218] text-center">
          <p className="text-[10px] text-gray-600 font-mono">
            localStorage
          </p>
        </div>
      </div>

    
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideInRight {
          animation: slideInRight 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0b0f1a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}