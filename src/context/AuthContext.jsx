import { createContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../api/config";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check xem có đang đăng nhập không dựa vào cookie session
  useEffect(() => {
    const checkLogin = async () => {
      try {
        // credentials: 'include' để gửi cookie session lên server
        const res = await fetch(`${API_BASE_URL}/auth/current_user`, {
            credentials: 'include' 
        });
        
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkLogin();
  }, []);

  const loginGoogle = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const logout = () => {
    window.location.href = `${API_BASE_URL}/auth/logout`;
  };

  return (
    <AuthContext.Provider value={{ user, loginGoogle, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};