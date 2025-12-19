import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import LogoCorner from "../components/LogoCorner";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col items-center justify-center relative">
      
      <div className="absolute top-0 left-0">
          <LogoCorner onClick={() => navigate("/")} />
      </div>

      <div className="max-w-md px-6 text-center">
        
        <h1 className="text-8xl font-bold tracking-tighter text-black mb-2">
          404
        </h1>

        <h2 className="text-lg font-medium text-gray-900 mb-3">
          Không tìm thấy trang
        </h2>

        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          Trang bạn tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>

      
        <div className="flex items-center justify-center gap-3">
        
          <button 
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:text-black transition-colors flex items-center gap-2"
          >
            <FaArrowLeft className="text-xs" /> Quay lại
          </button>

       
          <button 
            onClick={() => navigate("/")}
            className="px-5 py-2.5 rounded-md bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Về trang chủ
          </button>
        </div>

      </div>
    </div>
  );
}