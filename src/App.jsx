import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ModeProvider } from "./context/ModeContext";
import MainLayout from "./layouts/MainLayout";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Learning from "./pages/Learning";
import AiGuide from "./pages/AiGuide";
import About from "./pages/About";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminRoute from "./components/AdminRoute";
import Policy from "./pages/Policy";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <ModeProvider>
      <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route element={<AdminRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            <Route index element={<Home />} />
            <Route path="explore" element={<Explore />} />
            <Route path="learning" element={<Learning />} />
            <Route path="ai-guide" element={<AiGuide />} />
            <Route path="about" element={<About />} />
            <Route path="policy" element={<Policy />} />
            <Route path="login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ModeProvider>
  );
}

export default App;
