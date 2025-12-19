import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const SOCKET_URL = "http://localhost:4000";

export const useChat = (roomId, username) => {
  const [messages, setMessages] = useState([]);
  const socketRef = useRef();

  useEffect(() => {
    if (!roomId) return;
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit("join_room", { roomId, username });
    socketRef.current.on("receive_message", (data) => {
      setMessages((prev) => [
        ...prev, 
        { ...data, isMe: data.user === username } 
      ]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId]); 

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const messageData = {
      roomId,
      user: username,
      text: text,
      time: new Date().toLocaleTimeString(),
    };
    socketRef.current.emit("send_message", messageData);
  };

  
  const clearMessages = () => setMessages([]);

  return { messages, sendMessage, clearMessages };
};