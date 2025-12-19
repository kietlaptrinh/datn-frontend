import React from "react";

function GlassButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="glass-button flex flex-col items-center justify-center w-32 h-32 rounded-2xl text-white font-semibold bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/20 transition duration-300 ease-in-out"
    >
      <Icon size={32} className="mb-2" />
      {label}
    </button>
  );
}

export default GlassButton;
