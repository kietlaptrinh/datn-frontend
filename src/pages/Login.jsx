import { useContext, useEffect } from "react";
import { FaGoogle, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; 

function Login() {
  const navigate = useNavigate();
  const { loginGoogle, user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);

  const handleGoogleLogin = () => {
    loginGoogle(); 
  };

  return (
    <div 
      className="h-screen w-full flex items-center justify-center bg-cover bg-center relative" 
      style={{ backgroundImage: "url('/assets/login.png')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70"></div>

     
      <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 
                      shadow-2xl rounded-3xl p-10 w-96 flex flex-col items-center text-center animate-fadeIn">
        
      
        <h1 className="text-5xl font-extrabold text-yellow-400 drop-shadow-lg mb-6">DTU VM</h1>
        <p className="text-gray-200 mb-8 leading-relaxed">
          Đăng nhập để tham quan bảo tàng ảo 360° và trải nghiệm cùng AI Guide
        </p>

       
        <button 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-200 
                     text-gray-800 font-semibold py-3 rounded-lg shadow-md transition transform hover:scale-105"
        >
          <FaGoogle className="text-red-500 text-xl" />
          <span>Đăng nhập với Google</span>
        </button>
        <button 
            onClick={() => navigate("/")}
            className="mt-6 flex items-center gap-2 text-gray-300 hover:text-white text-sm transition-colors duration-200 hover:underline"
        >
            <FaArrowLeft /> Quay về trang chủ
        </button>
      </div>
    </div>
  );
}

export default Login;