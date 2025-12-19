import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div className="h-screen w-full bg-gray-900 text-white relative">
      <Navbar />
      <Outlet />
    </div>
  );
}

export default MainLayout;
