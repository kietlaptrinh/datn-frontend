export default function AIGuide() {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col items-center space-y-3 z-10">
      <img
        src="/gui-avatar.jpg"
        alt="AI Guide"
        className="w-14 h-14 rounded-full border-2 border-yellow-300 cursor-pointer hover:scale-105 transition"
      />
      <button className="bg-yellow-400 text-black p-3 rounded-full shadow-lg hover:bg-yellow-500">
        💬
      </button>
    </div>
  );
}
