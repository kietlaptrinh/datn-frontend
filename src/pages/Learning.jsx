import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api/config";
import { FaCrown, FaHistory, FaUserGraduate, FaRedo, FaHome } from "react-icons/fa";

export default function Learning() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  

  const [history, setHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('quiz'); // 'quiz' | 'history' | 'leaderboard'

  
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    fetch(`${API_BASE_URL}/quiz`).then(res => res.json()).then(setQuestions);
  }, [user, navigate]);

 
  useEffect(() => {
    if (activeTab === 'history') {
      fetch(`${API_BASE_URL}/quiz/history`, { credentials: 'include' })
        .then(res => res.json()).then(setHistory);
    }
    if (activeTab === 'leaderboard') {
      fetch(`${API_BASE_URL}/quiz/leaderboard`)
        .then(res => res.json()).then(setLeaderboard);
    }
  }, [activeTab]);


  const handleAnswer = (optionIndex) => {
    const currentQ = questions[currentIndex];
    const chosenChar = ['A', 'B', 'C', 'D'][optionIndex];
    
    let newScore = score;
    if (chosenChar === currentQ.correctAnswer) {
      newScore = score + 1;
      setScore(newScore);
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentIndex(nextIndex);
    } else {
      finishQuiz(newScore);
    }
  };

  const finishQuiz = async (finalScore) => {
    setShowResult(true);
    await fetch(`${API_BASE_URL}/quiz/result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include', 
      body: JSON.stringify({
        score: finalScore,
        totalQuestions: questions.length
      })
    });
   
    if (activeTab === 'history') {
        fetch(`${API_BASE_URL}/quiz/history`, { credentials: 'include' })
        .then(res => res.json()).then(setHistory);
    }
  };

  const resetQuiz = () => {
    setScore(0);
    setCurrentIndex(0);
    setShowResult(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f8f4ec] text-[#3e2723] font-sans p-6">
    
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 border-b border-[#3e2723] pb-4 gap-4">
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={user.avatar || "https://via.placeholder.com/150"} 
              alt="Avatar" 
              className="w-14 h-14 rounded-full border-2 border-yellow-600 shadow-md object-cover" 
            />
            <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.username}</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <FaUserGraduate /> Học viên tiềm năng
            </p>
          </div>
        </div>

       
        <div className="flex bg-white rounded-lg p-1 shadow-sm items-center gap-2">
             <button 
                onClick={() => navigate("/")} 
                className="px-4 py-2 rounded-md hover:bg-gray-100 transition flex items-center gap-2 text-gray-700 font-medium"
                title="Về trang chủ"
             >
                <FaHome /> Trang chủ
             </button>
             <div className="w-[1px] h-6 bg-gray-300 mx-1"></div> {/* Đường kẻ dọc ngăn cách */}

             <button 
                onClick={() => setActiveTab('quiz')} 
                className={`px-4 py-2 rounded-md transition ${activeTab === 'quiz' ? 'bg-[#4e342e] text-white' : 'hover:bg-gray-100'}`}
             >Làm bài</button>
             <button 
                onClick={() => setActiveTab('history')} 
                className={`px-4 py-2 rounded-md transition ${activeTab === 'history' ? 'bg-[#4e342e] text-white' : 'hover:bg-gray-100'}`}
             >Lịch sử</button>
             <button 
                onClick={() => setActiveTab('leaderboard')} 
                className={`px-4 py-2 rounded-md transition ${activeTab === 'leaderboard' ? 'bg-[#4e342e] text-white' : 'hover:bg-gray-100'}`}
             >Bảng Xếp Hạng</button>
        </div>
        
        <button onClick={logout} className="text-red-600 text-sm underline hover:text-red-800">Đăng xuất</button>
      </div>

      <div className="max-w-3xl mx-auto">
        
     
        {activeTab === 'quiz' && (
            <div className="transition-all animate-fadeIn">
                {showResult ? (
                <div className="text-center bg-white p-10 rounded-2xl shadow-xl border border-yellow-600/20">
                    <h2 className="text-4xl font-bold mb-4 text-[#4e342e]">🎉 Kết Thúc!</h2>
                    <div className="text-6xl font-extrabold text-yellow-600 mb-2">{score}/{questions.length}</div>
                    <p className="text-gray-500 mb-8">Số câu trả lời đúng</p>
                    <button onClick={resetQuiz} className="flex items-center justify-center gap-2 mx-auto bg-[#4e342e] text-white px-8 py-3 rounded-full hover:bg-[#3e2723] transition shadow-lg">
                        <FaRedo /> Làm lại bài thi
                    </button>
                </div>
                ) : questions.length > 0 ? (
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative">
                    <div className="flex justify-between items-center mb-6">
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">Câu hỏi</span>
                        <span className="text-gray-400 font-bold">{currentIndex + 1}/{questions.length}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-8 leading-relaxed">{questions[currentIndex].question}</h3>
                    <div className="space-y-4">
                    {questions[currentIndex].options.map((opt, idx) => (
                        <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        className="w-full text-left p-5 rounded-xl border-2 border-gray-100 hover:border-yellow-500 hover:bg-yellow-50 transition duration-200 font-medium text-lg"
                        >
                        <span className="font-bold mr-3 text-gray-400">{['A', 'B', 'C', 'D'][idx]}</span> {opt}
                        </button>
                    ))}
                    </div>
                </div>
                ) : (
                <div className="text-center py-20 text-gray-500">Đang tải bộ câu hỏi...</div>
                )}
            </div>
        )}

      
        {activeTab === 'history' && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
                <div className="p-6 bg-[#efebe9] border-b border-[#d7ccc8] flex items-center gap-2">
                    <FaHistory className="text-[#4e342e]" />
                    <h3 className="font-bold text-lg">Lịch sử bài làm của bạn</h3>
                </div>
                <ul>
                    {history.map((h, index) => (
                        <li key={h.id} className="flex justify-between items-center p-5 border-b last:border-0 hover:bg-gray-50">
                            <div>
                                <p className="font-bold text-gray-800">Bài thi #{history.length - index}</p>
                                <p className="text-xs text-gray-500">{new Date(h.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <span className="block text-2xl font-bold text-[#4e342e]">{h.score}/{h.totalQuestions}</span>
                                <span className="text-xs text-green-600 font-bold">ĐIỂM SỐ</span>
                            </div>
                        </li>
                    ))}
                    {history.length === 0 && <li className="p-10 text-center text-gray-500">Bạn chưa làm bài thi nào.</li>}
                </ul>
            </div>
        )}

      
        {activeTab === 'leaderboard' && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
                <div className="p-6 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white flex items-center gap-3">
                    <FaCrown className="text-2xl animate-bounce" />
                    <h3 className="font-bold text-xl">Bảng Xếp Hạng</h3>
                </div>
                <div>
                    {leaderboard.map((item, idx) => (
                        <div key={idx} className={`flex items-center p-4 border-b last:border-0 ${idx < 3 ? 'bg-yellow-50/50' : ''}`}>
                           
                            <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold mr-4 
                                ${idx === 0 ? 'bg-yellow-400 text-white shadow-md' : 
                                  idx === 1 ? 'bg-gray-300 text-white' : 
                                  idx === 2 ? 'bg-orange-300 text-white' : 'text-gray-500'}`}>
                                {idx + 1}
                            </div>
                            
                            
                            <img 
                                src={item.user?.avatar || "https://via.placeholder.com/40"} 
                                alt="avt" 
                                className="w-10 h-10 rounded-full object-cover border border-gray-200 mr-3"
                            />
                            <div className="flex-1">
                                <p className="font-bold text-gray-800">{item.user?.username || "Ẩn danh"}</p>
                                <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                            </div>

                           
                            <div className="text-right">
                                <span className="text-xl font-extrabold text-[#4e342e]">{item.score}</span>
                                <span className="text-xs text-gray-400 ml-1">/ {item.totalQuestions}</span>
                            </div>
                        </div>
                    ))}
                    {leaderboard.length === 0 && <div className="p-10 text-center text-gray-500">Chưa có ai lên bảng vàng. Hãy là người đầu tiên!</div>}
                </div>
            </div>
        )}

      </div>
    </div>
  );
}