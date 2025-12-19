import { FaLandmark } from "react-icons/fa";

export default function LogoCorner({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="absolute top-4 left-4 flex items-center space-x-2 bg-black/40 px-3 py-2 rounded-lg 
                 text-white cursor-pointer hover:bg-black/60 transition z-10"
    >
      <FaLandmark className="text-yellow-400 text-xl" />
      <div>
        <h1 className="text-lg font-bold">DTU VM</h1>
        <p className="text-xs text-gray-300">Virtual Museum</p>
      </div>
    </div>
  );
}
