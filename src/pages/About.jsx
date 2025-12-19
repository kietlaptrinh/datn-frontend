import React from "react";
import { FaUniversity, FaQuoteLeft, FaBullseye, FaHeart, FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import LogoCorner from "../components/LogoCorner";
import AIGuide from "../components/AIGuide";

export default function About() {
  const navigate = useNavigate();
  const instructor = {
    name: "ThS. Trịnh Sử Trường Thi",
    title: "Giảng viên Hướng dẫn",
    department: "Khoa Công nghệ Thông tin",
    image: "https://scontent.fdad1-4.fna.fbcdn.net/v/t1.6435-9/40432644_10212263522412740_2735231664551624704_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=127cfc&_nc_ohc=YcvVmLc1rywQ7kNvwH-bpHO&_nc_oc=AdlIXFf8vWqE9pD3rRECHvHbkl6LPHlFcbqcsGxpWMUAWPHGy5MaKvJqEZiXpNXK54QRMUarERiJ0i67GiGSbDZn&_nc_zt=23&_nc_ht=scontent.fdad1-4.fna&_nc_gid=85EyJ8C6k_wIAnfPI0VhKQ&oh=00_AfgdGPTjh7Y0tSTZ8ztnuBwbig5VueJcFCkZv-IT9F6x4g&oe=69485A8D"
  };

  const teamMembers = [
    { id: 1, name: "Dương Tuấn Kiệt", role: "Trưởng nhóm", image: "/assets/kiet.jpg" },
    { id: 2, name: "Đào Hoàng Việt Anh", role: "Thành viên", image: "/assets/anh.jpg" },
    { id: 3, name: "Lê Quang Vinh", role: "Thành viên", image: "/assets/vinh.png" },
    { id: 4, name: "Đinh Văn Trọng Đạt", role: "Thành viên", image: "/assets/dat.jpg" },
    { id: 5, name: "Nguyễn Thành Nhân", role: "Thành viên", image: "/assets/nhan.jpg" },
  ];

  return (
    <div className="min-h-screen bg-[#121212] text-gray-300 font-sans">
     
      <LogoCorner onClick={() => navigate("/")} />
     
      
      <div className="bg-[#1a1a1a] border-b border-gray-800">
        <div className="container mx-auto px-6 py-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaUniversity className="text-[#b81c22] text-3xl" /> 
            <span className="uppercase tracking-widest text-sm font-semibold text-gray-400">Đại học Duy Tân</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">DTU VIRTUAL MUSEUM</h1>
          <p className="text-gray-500 italic">Đồ án Tốt nghiệp - Khoa Công nghệ Thông tin</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-[#1e1e1e] p-8 rounded-lg border-l-4 border-[#b81c22]">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaQuoteLeft className="text-gray-600" /> Giới thiệu
            </h3>
            <p className="text-sm leading-relaxed text-gray-400 text-justify">
              DTU Virtual Museum là nền tảng tham quan bảo tàng trực tuyến sử dụng công nghệ thực tế ảo 360°. Dự án cho phép người dùng trải nghiệm không gian văn hóa lịch sử chân thực ngay trên thiết bị cá nhân mà không bị giới hạn bởi khoảng cách địa lý.
            </p>
          </div>
          <div className="bg-[#1e1e1e] p-8 rounded-lg border-l-4 border-blue-600">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaBullseye className="text-gray-600" /> Mục tiêu
            </h3>
            <p className="text-sm leading-relaxed text-gray-400 text-justify">
              Xây dựng một hệ thống hoàn chỉnh hỗ trợ số hóa di sản. Cung cấp công cụ học tập trực quan cho sinh viên và khách tham quan. Ứng dụng các công nghệ web hiện đại (React, NodeJS, 3D) để tạo ra trải nghiệm mượt mà và tương tác cao.
            </p>
          </div>

          <div className="bg-[#1e1e1e] p-8 rounded-lg border-l-4 border-green-600">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaHeart className="text-gray-600" /> Ý nghĩa
            </h3>
            <p className="text-sm leading-relaxed text-gray-400 text-justify">
              Góp phần bảo tồn và lan tỏa các giá trị văn hóa truyền thống. Thể hiện năng lực nghiên cứu và áp dụng kiến thức vào thực tế của sinh viên Đại học Duy Tân trước khi tốt nghiệp ra trường.
            </p>
          </div>
        </div>

        
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center text-white mb-10 uppercase tracking-wider">Giảng viên Hướng dẫn</h2>
          
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8 shadow-lg">
            <img 
              src={instructor.image} 
              alt={instructor.name} 
              className="w-32 h-32 rounded-full object-cover border-4 border-[#2a2a2a]"
            />
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-white">{instructor.name}</h3>
              <p className="text-[#b81c22] font-semibold mt-1">{instructor.title}</p>
              <p className="text-gray-500 text-sm mt-1">{instructor.department}</p>
              <p className="text-gray-400 mt-4 text-sm italic border-t border-gray-800 pt-4">
                "Xin chân thành cảm ơn Thầy đã tận tình chỉ dẫn, định hướng và khắt khe trong chuyên môn để nhóm có thể hoàn thiện đồ án này một cách tốt nhất."
              </p>
            </div>
          </div>
        </div>

      
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center text-white mb-10 uppercase tracking-wider">Thành viên thực hiện</h2>
          
          <div className="flex flex-wrap justify-center gap-6">
            {teamMembers.map((member) => (
              <div key={member.id} className="w-48 bg-[#1a1a1a] rounded-lg p-5 text-center border border-gray-800 hover:border-gray-600 transition-colors">
                <div className="w-20 h-20 mx-auto mb-4 overflow-hidden rounded-full bg-gray-800">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover opacity-90 hover:opacity-100 transition" />
                </div>
                <h4 className="text-white font-bold text-sm mb-1">{member.name}</h4>
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <FaUserGraduate size={10} /> {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center border-t border-gray-800 pt-12">
          <div className="max-w-2xl mx-auto">
            <FaUniversity className="text-4xl text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">LỜI CẢM ƠN</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Chúng em xin gửi lời tri ân sâu sắc đến Ban Giám hiệu và Quý Thầy Cô trường <strong>Đại học Duy Tân</strong>. 
              Môi trường học tập tại DTU không chỉ cung cấp kiến thức chuyên môn mà còn rèn luyện cho chúng em tư duy sáng tạo và kỹ năng làm việc thực tế. 
              Đồ án này là kết quả của 4 năm rèn luyện dưới mái trường Duy Tân.
            </p>
          </div>
        </div>

      </div>

    
      <footer className="bg-black py-6 text-center text-xs text-gray-600">
        &copy; 2025 DTU Capstone Project. All rights reserved.
      </footer>
    </div>
  );
}