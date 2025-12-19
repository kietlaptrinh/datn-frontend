import React from "react";
import { FaShieldAlt, FaRobot, FaDatabase, FaExclamationCircle, FaUserShield, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import LogoCorner from "../components/LogoCorner";

export default function Policy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 font-sans selection:bg-neutral-700 selection:text-white">
      
      <div className="sticky top-0 z-20 backdrop-blur-md bg-neutral-950/80 border-b border-neutral-800/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-5xl">
          <div className="flex items-center gap-3">
            <FaShieldAlt className="text-neutral-400 text-xl" />
            <h1 className="text-sm md:text-base font-semibold text-neutral-200 uppercase tracking-widest">
              Chính sách & Tuyên bố miễn trừ
            </h1>
          </div>
          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-200 transition-colors duration-200"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
            <span>Quay lại</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="mb-16 border-l-2 border-neutral-700 pl-6">
            <p className="text-xs font-mono text-neutral-500 mb-2 uppercase tracking-wider">
                Cập nhật: 12/2025
            </p>
            <p className="text-xl md:text-2xl text-neutral-200 font-light leading-relaxed">
                Chào mừng đến với <strong>DTU VM</strong>. Tài liệu này cung cấp thông tin minh bạch về nguồn dữ liệu và phạm vi trách nhiệm của hệ thống AI trong dự án.
            </p>
        </div>
        <section className="mb-12 group">
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-3 pb-2 border-b border-neutral-800">
                <FaDatabase className="text-neutral-500 text-sm" /> 
                1. Tính xác thực của dữ liệu
            </h2>
            <div className="text-neutral-400 text-sm md:text-base leading-8 text-justify">
                <p className="mb-4">
                    Toàn bộ dữ liệu hình ảnh 360°, thông tin mô tả hiện vật và các tư liệu lịch sử được hiển thị trên hệ thống đều được nhóm phát triển <strong>thu thập trực tiếp và đối chiếu</strong> với tài liệu lưu trữ chính thức tại Phòng Truyền thống Đại học Duy Tân.
                </p>
                <p>
                    Chúng tôi cam kết giữ nguyên tính nguyên bản của thông tin nhằm phục vụ tốt nhất cho mục đích tham quan, học tập và nghiên cứu.
                </p>
            </div>
        </section>
        <section className="mb-12">
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-3 pb-2 border-b border-neutral-800">
                <FaRobot className="text-neutral-500 text-sm" /> 
                2. Giới hạn trách nhiệm của AI Tour
            </h2>
            <div className="text-neutral-400 text-sm md:text-base leading-8 text-justify">
                <p className="mb-6">
                    Hệ thống sử dụng mô hình ngôn ngữ lớn (LLM) để đóng vai trò Hướng dẫn viên ảo. Mặc dù đã được tinh chỉnh (fine-tuning) dựa trên dữ liệu nhà trường, công nghệ này vẫn tồn tại những hạn chế nhất định.
                </p>
                
          
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-sm p-5 mb-6">
                    <h4 className="font-medium text-neutral-300 flex items-center gap-2 mb-2 text-sm uppercase tracking-wide">
                        <FaExclamationCircle className="text-neutral-500" /> Lưu ý quan trọng
                    </h4>
                    <p className="text-neutral-400 text-sm">
                        Thông tin do AI tạo ra chỉ mang tính chất <strong>tham khảo bổ trợ</strong>. AI có thể phát sinh "ảo giác" (hallucination) trong các ngữ cảnh phức tạp. Người dùng vui lòng không sử dụng các câu trả lời này làm nguồn trích dẫn duy nhất cho các văn bản hành chính hoặc quyết định quan trọng.
                    </p>
                </div>
            </div>
        </section>

     
        <section className="mb-12">
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-3 pb-2 border-b border-neutral-800">
                <FaUserShield className="text-neutral-500 text-sm" /> 
                3. Bảo mật & Riêng tư
            </h2>
            <div className="text-neutral-400 text-sm md:text-base leading-8 text-justify">
                <p className="mb-4">
                    Chúng tôi tôn trọng tuyệt đối quyền riêng tư của người dùng với các nguyên tắc:
                </p>
                <ul className="grid gap-3 pl-4 border-l border-neutral-800 ml-1">
                    <li className="pl-4">
                        <span className="text-neutral-300 block font-medium text-sm">Không định danh:</span> 
                        Nội dung hội thoại với AI không được lưu trữ gắn liền với danh tính cá nhân.
                    </li>
                    <li className="pl-4">
                        <span className="text-neutral-300 block font-medium text-sm">Lưu trữ cục bộ:</span> 
                        Dữ liệu lịch sử tham quan chỉ được lưu tại trình duyệt (Local Storage) của thiết bị người dùng.
                    </li>
                    <li className="pl-4">
                        <span className="text-neutral-300 block font-medium text-sm">Xử lý ảnh chụp:</span> 
                        Chức năng chụp màn hình được xử lý phía Client, không tải lên máy chủ.
                    </li>
                </ul>
            </div>
        </section>

      </div>

      <footer className="py-12 text-center border-t border-neutral-900 bg-neutral-950">
        <p className="text-xs text-neutral-600 font-mono">
          &copy; 2025 DTU Capstone Project. Developed by Group 3.
        </p>
      </footer>
    </div>
  );
}