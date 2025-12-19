import { useEffect, useState, useRef } from "react";
import { confirmDelete, notifySuccess, notifyError } from '../utils/alertHelper';
import { RoomAPI } from "../api/roomApi";
import { PanoramaAPI } from "../api/panoramaApi";
import { HotspotAPI } from "../api/hotspotApi";
import { QuizAPI } from "../api/quizApi";
import { ArtifactAPI } from "../api/artifactApi";
import { TimelineAPI } from "../api/timelineApi";
import { AdminAPI } from "../api/adminApi";
import { AIConfigAPI } from "../api/aiConfigApi";
import * as PANOLENS from "panolens";
import * as THREE from "three";
import UserManager from '../components/UserManager';
import Leaderboard from '../components/Leaderboard';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("museum");
  const [rooms, setRooms] = useState([]);
  const [editingRoom, setEditingRoom] = useState(null);
  const [panoramas, setPanoramas] = useState([]);
  const [allPanoramas, setAllPanoramas] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedPanorama, setSelectedPanorama] = useState(null);
  const [editingArtifact, setEditingArtifact] = useState(null);
  const [knowledgeList, setKnowledgeList] = useState([]);
  const [editingKnowledge, setEditingKnowledge] = useState(null);
  const [form, setForm] = useState({
    roomName: "",
    panoTitle: "",
    panoFile: null,
    hotspotLabel: "",
    hotspotType: "nav",
    toPanoramaId: "",
    artifactId: "",
    artifactName: "",
    artifactDesc: "",
    artifactFile: null,
    instruction: "", // Vai trò AI
    knowledge: ""
  });

  const [formTimeline, setFormTimeline] = useState({
      year: "",
      title: "",
      description: "",
      imageFiles: [],
      order: 0
  });

  const [showViewer, setShowViewer] = useState(false);
  const viewerContainerRef = useRef(null);
  const panoViewerRef = useRef(null);
  const panoObjRef = useRef(null);
  const formRef = useRef(form);

  const [currentPanoData, setCurrentPanoData] = useState(null);
  const [editingPano, setEditingPano] = useState(null);

  const [aiTopic, setAiTopic] = useState("");
  const [aiContent, setAiContent] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  const [questions, setQuestions] = useState([]); 
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [quizForm, setQuizForm] = useState({ 
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
  });

  const [editingHotspot, setEditingHotspot] = useState(null);
  const [artifacts, setArtifacts] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);

 
  useEffect(() => {
    loadRooms();
    loadQuestions();
    loadAllPanoramas();
    loadTimeline();
  }, []);

 useEffect(() => {
    // Mỗi khi 'form' thay đổi, cập nhật 'formRef'
    formRef.current = form;
  }, [form]);

  useEffect(() => {
    if (showViewer && currentPanoData && viewerContainerRef.current) {
      
      // Thêm một độ trễ (50ms) để đảm bảo trình duyệt 
      // đã paint xong div modal trước khi Panolens đo kích thước.
      const timer = setTimeout(() => {
        initPanoramaViewer(currentPanoData.pano, currentPanoData.hotspotData);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [showViewer, currentPanoData]);

  useEffect(() => {
    if (activeTab === "ai_brain") {
      loadKnowledgeList();
    }
  }, [activeTab]);

  const loadKnowledgeList = async () => {
    try {
      const data = await AIConfigAPI.listKnowledge();
      setKnowledgeList(data);
    } catch (e) {
      console.error("Lỗi load knowledge:", e);
    }
  };


  const loadRooms = async () => setRooms(await RoomAPI.list());
  const loadAllPanoramas = async () => setAllPanoramas(await PanoramaAPI.list());
  const loadPanoramas = async (roomId) =>
    setPanoramas(await PanoramaAPI.getByRoom(roomId));
  const loadHotspots = async (panoId) =>
    setHotspots(await HotspotAPI.getByPanorama(panoId));

  const loadQuestions = async () => setQuestions(await QuizAPI.list());
  const loadTimeline = async () => setTimelineEvents(await TimelineAPI.list());

  const handleSyncArtifacts = async () => {
    setIsSyncing(true);
    try {
        const res = await AdminAPI.syncArtifacts();
        notifySuccess(`${res.message} (Đã nạp ${res.details.synced_count} vật phẩm)`);
    } catch (e) {
        notifyError("Lỗi đồng bộ: " + e.message);
    } finally {
        setIsSyncing(false);
    }
  };

  const handleSaveKnowledge = async (e) => {
    e.preventDefault();
    if(!aiTopic || !aiContent) return notifyError("Nhập đủ thông tin!");
    
    try {
        if (editingKnowledge) {
            // Sửa
            await AIConfigAPI.updateKnowledge(editingKnowledge.id, aiTopic, aiContent);
            notifySuccess("Đã cập nhật kiến thức!");
            setEditingKnowledge(null);
        } else {
           
            await AIConfigAPI.addKnowledge(aiTopic, aiContent);
            notifySuccess("Đã nạp kiến thức mới!");
        }
        
        setAiTopic(""); 
        setAiContent("");
        loadKnowledgeList();

    } catch (e) {
        notifyError("Lỗi: " + e.message);
    }
  };

  const handleEditKnowledge = (item) => {
      setEditingKnowledge(item);
      setAiTopic(item.topic);
      setAiContent(item.content);
  };

  const handleCancelEditKnowledge = () => {
      setEditingKnowledge(null);
      setAiTopic("");
      setAiContent("");
  };

  const handleDeleteKnowledge = async (id) => {
      if(!await confirmDelete("Bạn có chắc muốn xóa kiến thức này khỏi bộ não AI?")) return;
      try {
          await AIConfigAPI.deleteKnowledge(id);
          notifySuccess("Đã xóa kiến thức thành công!");
          loadKnowledgeList();
      } catch (e) {
          notifyError("Lỗi xóa: " + e.message);
      }
  };

const handleDeleteRoom = async (roomId) => {
  if (!await confirmDelete("CẢNH BÁO: Xóa phòng sẽ xóa toàn bộ PANORAMAS và HIỆN VẬT bên trong. Bạn chắc chắn chứ?")) return;
  
  try {
    await RoomAPI.delete(roomId);
    
    notifySuccess("Đã xóa phòng thành công!");
    
    loadRooms();
    setSelectedRoom(null);
    setPanoramas([]);
    setHotspots([]);
    setArtifacts([]);
    setEditingRoom(null); 

  } catch (error) {
   
    notifyError("Lỗi: " + error.message);
  }
};



const handleDeleteHotspot = async (hotspotId, panoId) => {
  if (!await confirmDelete("Xóa hotspot này?")) return;
  try {
    await HotspotAPI.delete(hotspotId);
    notifySuccess("Đã xóa Hotspot!");
    
    const updatedList = await HotspotAPI.getByPanorama(panoId);
    setHotspots(updatedList);
    
  } catch (e) {
    notifyError("Lỗi xóa: " + e.message);
  }
};

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    if (!form.roomName) return notifyError("Nhập tên phòng!");

    try {
      if (editingRoom) {
      
        await RoomAPI.update(editingRoom.id, { name: form.roomName });
        notifySuccess("Đã cập nhật tên phòng!");
        setEditingRoom(null);
      } else {
        await RoomAPI.create({ name: form.roomName });
        notifySuccess("Đã thêm phòng mới!");
      }

      setForm({ ...form, roomName: "" }); 
      loadRooms(); 
    } catch (error) {
      notifyError("Lỗi: " + error.message);
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setForm({ ...form, roomName: room.name });
  };

  const handleCancelEditRoom = () => {
    setEditingRoom(null);
    setForm({ ...form, roomName: "" });
  };

  const handleAddPanorama = async (e) => {
  e.preventDefault();
  if (!selectedRoom) return notifyError("Chọn phòng trước!");
  
  const fd = new FormData();
  fd.append("roomId", selectedRoom);
  fd.append("title", form.panoTitle);
  fd.append("image", form.panoFile);

  const newPano = await PanoramaAPI.create(fd);
  notifySuccess("Upload panorama thành công!");

  setForm({ ...form, panoTitle: "", panoFile: null });
  loadPanoramas(selectedRoom);
};


const handleSavePanorama = async (e) => {
    e.preventDefault();
    if (!selectedRoom) return notifyError("Chọn phòng trước!");
    if (!form.panoTitle) return notifyError("Vui lòng nhập tên Panorama!");

    const fd = new FormData();
    fd.append("roomId", selectedRoom);
    fd.append("title", form.panoTitle);
    
    if (form.panoFile) {
        fd.append("image", form.panoFile);
    }

    try {
        if (editingPano) {
          
            await PanoramaAPI.update(editingPano.id, fd);
            notifySuccess("Đã cập nhật Panorama!");
            setEditingPano(null); 
        } else {
         
            if (!form.panoFile) return notifyError("Vui lòng chọn ảnh!");
            await PanoramaAPI.create(fd);
            notifySuccess("Upload panorama thành công!");
        }

    
        setForm({ ...form, panoTitle: "", panoFile: null });
       
        document.getElementById("pano-file-input").value = ""; 
        loadPanoramas(selectedRoom);
        loadAllPanoramas();

    } catch (error) {
        notifyError("Lỗi: " + error.message);
    }
};

const handleEditPanorama = (pano) => {
    setEditingPano(pano);
    setForm({
        ...form,
        panoTitle: pano.title,
        panoFile: null 
    });
   
    document.querySelector('#pano-form-section')?.scrollIntoView({ behavior: 'smooth' });
};

const handleCancelEditPanorama = () => {
    setEditingPano(null);
    setForm({ ...form, panoTitle: "", panoFile: null });
    if(document.getElementById("pano-file-input")) {
        document.getElementById("pano-file-input").value = "";
    }
};
const handleDeletePanorama = async (panoId) => {
    if (!await confirmDelete("Xóa panorama này? Toàn bộ Hotspot trong ảnh cũng sẽ mất.")) return;
    
    try {
        await PanoramaAPI.delete(panoId);
        notifySuccess("Đã xóa Panorama!");
     
        if (selectedRoom) loadPanoramas(selectedRoom);
        loadAllPanoramas();
      
        if (selectedPanorama === panoId) {
            setShowViewer(false);
            setSelectedPanorama(null);
        }
    } catch (error) {
        notifyError("Lỗi xóa: " + error.message);
    }
};


    const handleSetDefaultView = async () => {
  if (!panoViewerRef.current || !selectedPanorama) return;

  // Lấy hướng nhìn hiện tại của Camera
  const camera = panoViewerRef.current.getCamera();
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir); // Lấy vector hướng nhìn (x, y, z)

  try {
    const fd = new FormData();
    fd.append("targetX", dir.x);
    fd.append("targetY", dir.y);
    fd.append("targetZ", dir.z);

    await PanoramaAPI.update(selectedPanorama, fd);
    alert("Đã lưu góc nhìn mặc định cho ảnh này!");
    
    const updateState = (list) => list.map(p => 
      p.id === selectedPanorama ? { ...p, targetX: dir.x, targetY: dir.y, targetZ: dir.z } : p
    );
    setPanoramas(prev => updateState(prev));
    setAllPanoramas(prev => updateState(prev));

  } catch (error) {
    alert("Lỗi lưu góc nhìn: " + error.message);
  }
};

const handleQuizFormChange = (e) => {
    const { name, value } = e.target;
    setQuizForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (
      !quizForm.question ||
      !quizForm.optionA ||
      !quizForm.optionB ||
      !quizForm.optionC ||
      !quizForm.optionD
    ) {
      return notifyError("Vui lòng nhập đầy đủ câu hỏi và 4 đáp án.");
    }

    const questionPayload = {
      question: quizForm.question,
      options: [
        quizForm.optionA,
        quizForm.optionB,
        quizForm.optionC,
        quizForm.optionD,
      ],
      correctAnswer: quizForm.correctAnswer,
    };

    try {
      if (editingQuestion) {
        await QuizAPI.update(editingQuestion.id, questionPayload);
        notifySuccess("Đã cập nhật câu hỏi!");
        setEditingQuestion(null);
      } else {
        await QuizAPI.create(questionPayload);
        notifySuccess("Thêm câu hỏi thành công!");
      }

     
      loadQuestions();
      setQuizForm({
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
      });

    } catch (error) {
      notifyError("Lỗi: " + error.message);
    }
  };

  const handleEditQuestion = (q) => {
    setEditingQuestion(q);
    setQuizForm({
      question: q.question,
      optionA: q.options[0],
      optionB: q.options[1],
      optionC: q.options[2],
      optionD: q.options[3],
      correctAnswer: q.correctAnswer,
    });
  };

  const handleCancelEditQuestion = () => {
    setEditingQuestion(null);
    setQuizForm({
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
    });
  };

  const loadArtifacts = async (roomId) => {
      if(!roomId) return;
      const data = await ArtifactAPI.listByRoom(roomId);
      setArtifacts(data);
  }

  

  const handleSaveArtifact = async (e) => {
      e.preventDefault();
      if(!selectedRoom) return notifyError("Chọn phòng trước!");
      
      const fd = new FormData();
      fd.append("roomId", selectedRoom);
      fd.append("name", form.artifactName);
      fd.append("description", form.artifactDesc);
      
      if (form.artifactFile) {
        fd.append("image", form.artifactFile);
      }
      
      try {
        if (editingArtifact) {
         
           await ArtifactAPI.update(editingArtifact.id, fd);
           notifySuccess("Đã cập nhật vật phẩm!");
           setEditingArtifact(null);
        } else {
           await ArtifactAPI.create(fd);
           notifySuccess("Đã thêm vật phẩm mới!");
        }

        setForm({...form, artifactName: "", artifactDesc: "", artifactFile: null});
        loadArtifacts(selectedRoom);

      } catch (error) {
        notifyError("Lỗi: " + error.message);
      }
  };

  const handleEditArtifact = (artifact) => {
    setEditingArtifact(artifact);
    setForm({
        ...form,
        artifactName: artifact.name,
        artifactDesc: artifact.description || "",
        artifactFile: null
    });
  };

  const handleCancelEditArtifact = () => {
    setEditingArtifact(null);
    setForm({...form, artifactName: "", artifactDesc: "", artifactFile: null});
  };

  const handleSaveTimeline = async (e) => {
    e.preventDefault();
    
    if (!formTimeline.year || !formTimeline.title || !formTimeline.order) {
        return notifyError("Vui lòng nhập đầy đủ Năm, Tiêu đề và Thứ tự hiển thị!");
    }
    const orderInt = parseInt(formTimeline.order);
    const duplicate = timelineEvents.find(evt => 
        evt.order === orderInt &&
        (!editingEvent || evt.id !== editingEvent.id)
    );

    if (duplicate) {
        return notifyError(`Số thứ tự ${orderInt} bị trùng với sự kiện "${duplicate.title}"! Vui lòng chọn số khác.`);
    }

    const fd = new FormData();
    fd.append("year", formTimeline.year);
    fd.append("title", formTimeline.title);
    fd.append("description", formTimeline.description);
    fd.append("order", formTimeline.order);
    
    if (formTimeline.imageFiles && formTimeline.imageFiles.length > 0) {
      for (let i = 0; i < formTimeline.imageFiles.length; i++) {
        fd.append("images", formTimeline.imageFiles[i]);
      }
    }

    try {
      if (editingEvent) {
        await TimelineAPI.update(editingEvent.id, fd);
        notifySuccess("Đã cập nhật sự kiện!");
        setEditingEvent(null); 
      } else {
        await TimelineAPI.create(fd);
        notifySuccess("Đã thêm sự kiện lịch sử!");
      }

      setFormTimeline({ year: "", title: "", description: "", order: 0, imageFiles: [] });
      loadTimeline();

    } catch (error) {
      notifyError("Lỗi: " + error.message);
    }
  };

  const handleEditTimeline = (evt) => {
    setEditingEvent(evt);
    setFormTimeline({
      year: evt.year,
      title: evt.title,
      description: evt.description || "",
      order: evt.order || 0,
      imageFiles: [] 
    });
  };

  const handleCancelEditTimeline = () => {
    setEditingEvent(null);
    setFormTimeline({ year: "", title: "", description: "", order: 0, imageFiles: [] });
  };

  const handleSelectRoom = (roomId) => {
      setSelectedRoom(roomId);
      loadPanoramas(roomId);
      loadArtifacts(roomId);
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!await confirmDelete("Xóa câu hỏi này?")) return;
    await QuizAPI.delete(questionId);
    notifySuccess("Đã xóa câu hỏi!");
    loadQuestions();
  };

  const handleDeleteTimeline = async (id) => { 
      if(await confirmDelete("Xóa sự kiện này?")) { 
          await TimelineAPI.delete(id); 
          loadTimeline(); 
      } 
  };


  // ===== VIEWER =====
  const openViewer = async (pano) => {
    setSelectedPanorama(pano.id);
    if (selectedRoom && artifacts.length === 0) loadArtifacts(selectedRoom);
    const data = await HotspotAPI.getByPanorama(pano.id);
    setHotspots(data);
    let fixedUrl = pano.imageUrl;
    if (fixedUrl.startsWith("blob:") || fixedUrl.startsWith("/uploads")) {
      fixedUrl = `http://localhost:4000${pano.imageUrl.replace("blob:", "").replace(/^\/+/, "/")}`;
    }
    pano.imageUrl = fixedUrl;
    setCurrentPanoData({ pano: pano, hotspotData: data });
    setShowViewer(true); 
  };


const initPanoramaViewer = (pano, hotspotData) => {
    if (!viewerContainerRef.current) {
      return;
    }
    
    viewerContainerRef.current.innerHTML = "";
    viewerContainerRef.current.style.pointerEvents = "auto";

    const viewer = new PANOLENS.Viewer({
      container: viewerContainerRef.current,
      autoRotate: false,
      cameraFov: 80,
    });
    panoViewerRef.current = viewer; 

    const panorama = new PANOLENS.ImagePanorama(pano.imageUrl);
    window._pano = panorama;
    panorama.crossOrigin = "anonymous";
    panoObjRef.current = panorama; 

    //16 điểm gợi ý đều 360 độ
  const suggestionPoints = [];
  const radius = 5000;      // khoảng cách từ tâm
  const height = -500;      // cao thấp của hotspot
  const count = 16;         // số điểm muốn tạo

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2; // chia đều 360°

    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;

    suggestionPoints.push({
      label: `Điểm ${i + 1}`, 
      pos: new THREE.Vector3(x, height, z)
    });
  }


    
    panorama.addEventListener("load", () => {
      const panoInstance = panorama; 
      
      hotspotData.forEach((h) => {
        const icon = h.type === 'info' ? PANOLENS.DataImage.Info : PANOLENS.DataImage.Arrow;
        const spot = new PANOLENS.Infospot(400, icon);
        spot.position.set(h.x, h.y, h.z); 
        const prefix = h.type === 'info' ? '[i] ' : '➜ ';
        spot.addHoverText(prefix + h.label);
        panoInstance.add(spot);
      });

      suggestionPoints.forEach((p) => {
        const suggestionSpot = new PANOLENS.Infospot(300, PANOLENS.DataImage.Add);
        suggestionSpot.position.copy(p.pos);
        suggestionSpot.addHoverText(`Chọn vị trí: ${p.label}`);
        
        suggestionSpot.addEventListener("click", async () => {
          const currentForm = formRef.current;

          if (!currentForm.hotspotLabel) return alert("Vui lòng nhập Tên Hotspot!");
          
          if (currentForm.hotspotType === 'nav' && !currentForm.toPanoramaId) {
             return alert("Loại 'Đi tiếp' cần chọn Phòng đích!");
          }
          if (currentForm.hotspotType === 'info' && !currentForm.artifactId) {
             return alert("Loại 'Vật phẩm' cần chọn Vật phẩm từ danh sách!");
          }
          if (currentForm.hotspotType === 'chat' && !currentForm.instruction) {
              const agree = window.confirm("Bạn chưa nhập vai trò cho AI, sẽ dùng mặc định. Tiếp tục?");
              if (!agree) return;
          }

          const pos = p.pos;
          
          const newHotspot = {
            fromPanoramaId: pano.id,
            x: parseFloat(pos.x.toFixed(3)),
            y: parseFloat(pos.y.toFixed(3)),
            z: parseFloat(pos.z.toFixed(3)),
            label: currentForm.hotspotLabel,
            type: currentForm.hotspotType,
            
            // Gửi dữ liệu tùy loại
            toPanoramaId: currentForm.hotspotType === 'nav' ? currentForm.toPanoramaId : null,
            artifactId: currentForm.hotspotType === 'info' ? currentForm.artifactId : null,

            instruction: currentForm.hotspotType === 'chat' ? currentForm.instruction : "",
            knowledge: currentForm.hotspotType === 'chat' ? currentForm.knowledge : ""
          };

          try {
            await HotspotAPI.create(newHotspot);
            alert(`Tạo hotspot "${newHotspot.label}" thành công!`);

            const newData = await HotspotAPI.getByPanorama(pano.id);
            initPanoramaViewer(pano, newData); 
            
            setForm(prev => ({ ...prev, hotspotLabel: "", toPanoramaId: "", artifactId: "" }));

          } catch (error) {
            console.error(error);
            notifyError(`Lỗi: ${error.message}`);
          }
        }); 

        panoInstance.add(suggestionSpot);
      }); 
    });
    viewer.add(panorama);
  };



  // ===== RENDER UI =====
  return (
    <div
      style={{
        backgroundColor: "#f8f4ec",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        color: "#3e2723",
      }}
    >
      <header
        style={{
          backgroundColor: "#4e342e",
          color: "white",
          padding: "15px 30px",
          fontSize: "22px",
          fontWeight: "bold",
          flexShrink: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
           🏛️ DTU VM — Quản Trị Dữ Liệu
        </div>

        <button
          onClick={() => window.location.href = '/'} 
          style={{
            fontSize: "14px",
            fontWeight: "500",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
             e.target.style.backgroundColor = "white";
             e.target.style.color = "#4e342e";
          }}
          onMouseOut={(e) => {
             e.target.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
             e.target.style.color = "white";
          }}
        >
          🏠 Trang chủ
        </button>
      </header>


        <nav style={{ padding: "10px 20px", backgroundColor: "#c8bcaf",flexShrink: 0 }}>
        <button
          style={activeTab === "museum" ? tabBtnActive : tabBtn}
          onClick={() => setActiveTab("museum")}
        >
          🏛️ Quản lý Bảo tàng
        </button>
        <button style={activeTab==="artifacts" ? tabBtnActive : tabBtn} 
        onClick={()=>setActiveTab("artifacts")}
        >🏺 Quản lý Vật phẩm
        </button>
        <button style={activeTab==="ai_brain" ? tabBtnActive : tabBtn} 
        onClick={()=>setActiveTab("ai_brain")}
        >🧠 Quản lý Thông tin
        </button>
        <button style={activeTab==="timeline"?tabBtnActive:tabBtn} 
        onClick={()=>setActiveTab("timeline")}
        >⏳ Dòng thời gian</button>
        <button
          style={activeTab === "quiz" ? tabBtnActive : tabBtn}
          onClick={() => setActiveTab("quiz")}
        >
          ❓ Quản lý Câu hỏi
        </button>
        <button
          style={activeTab === "users" ? tabBtnActive : tabBtn}
          onClick={() => setActiveTab("users")}
        >
          👥 Quản lý Người dùng
        </button>
        <button
          style={activeTab === "leaderboard" ? tabBtnActive : tabBtn}
          onClick={() => setActiveTab("leaderboard")}
        >
          🏆 Bảng Xếp Hạng
        </button>
      </nav>


        {activeTab === "museum" && (
  <main style={{...scrollableMainStyle, display: "flex", gap: "20px", padding: "20px", height: '100%', overflow: 'hidden' }}>
    {/* ROOM */}
    <section style={{
        ...sectionStyle, 
        display: "flex", 
        flexDirection: "column", 
        overflow: "hidden"}}>
      <h3 style={{ flexShrink: 0 }}>🗂️ Phòng</h3>
      <div style={{ flexShrink: 0 }}>
      <form onSubmit={handleSaveRoom}>
        <input
          type="text"
          placeholder="Tên phòng..."
          value={form.roomName}
          onChange={(e) => setForm({ ...form, roomName: e.target.value })}
          style={inputStyle}
        />
        
        {!editingRoom ? (
          <button type="submit" style={btnBrown}>➕ Thêm phòng</button>
        ) : (
          <>
            <button type="submit" style={{...btnBrown, background: '#FF9800', marginRight: '5px'}}>💾 Lưu</button>
            <button type="button" onClick={handleCancelEditRoom} style={{...btnBrown, background: '#9E9E9E'}}>❌ Hủy</button>
          </>
        )}
      </form>
    </div>

      {/* DANH SÁCH ROOM */}
      <div style={{ flex: 1, overflowY: "auto", marginTop: "10px", paddingRight: "5px" }}>
      <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
        {rooms.map((r) => (
          <li
            key={r.id}
            style={{
              ...listItemStyle,
              background: selectedRoom === r.id ? "#d7ccc8" : "transparent",
              border: editingRoom?.id === r.id ? "2px solid #FF9800" : "1px solid #ccc", // Highlight khi đang sửa
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{ cursor: "pointer", flex: 1, padding: "4px" }}
              onClick={() => {
                if(editingRoom) return; // Đang sửa thì không cho chọn phòng khác để tránh lỗi form
                setSelectedRoom(r.id);
                loadPanoramas(r.id);
                loadArtifacts(r.id);
              }}
            >
              {r.name}
            </span>
            
            <div style={{display: 'flex', gap: '5px'}}>
              <button
                onClick={() => handleEditRoom(r)}
                disabled={!!editingRoom} // Disable các nút sửa khác khi đang sửa 1 cái
                style={{
                  background: "transparent",
                  color: "#1976D2",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  opacity: editingRoom ? 0.3 : 1
                }}
                title="Sửa tên phòng"
              >
                ✏️
              </button>

            
              <button
                onClick={() => handleDeleteRoom(r.id)}
                disabled={!!editingRoom}
                style={{
                  background: "transparent",
                  color: "red",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  opacity: editingRoom ? 0.3 : 1
                }}
                title="Xóa phòng"
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
    </section>

      
       {/* PANORAMA */}
<section style={{...sectionStyle, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden"}} id="pano-form-section">
  <h3 style={{ flexShrink: 0 }}>
      {editingPano ? `✏️ Sửa Panorama: ${editingPano.title}` : "🖼️ Panoramas"}
  </h3>

  {/* Nếu chưa chọn phòng, hiển thị thông báo hướng dẫn */}
  <div style={{ flexShrink: 0 }}>
  {!selectedRoom ? (
    <div
      style={{
        padding: "10px",
        border: "1px dashed #ccc",
        borderRadius: "6px",
        background: "#fff8e1",
        color: "#6d4c41",
        marginBottom: "10px",
        fontStyle: "italic",
      }}
    >
      ⚠️ Vui lòng chọn một <strong>Room</strong> ở cột bên trái để thêm hoặc
      xem danh sách Panorama.
    </div>
  ) : (
    <form onSubmit={handleSavePanorama} encType="multipart/form-data">
      <input
        type="text"
        placeholder="Tên panorama..."
        value={form.panoTitle}
        onChange={(e) => setForm({ ...form, panoTitle: e.target.value })}
        style={inputStyle}
        disabled={!selectedRoom}
      />
      
      {/* Thêm ID để dễ reset value */}
      <input
        id="pano-file-input" 
        type="file"
        onChange={(e) => setForm({ ...form, panoFile: e.target.files[0] })}
        disabled={!selectedRoom}
      />
      {editingPano && <p style={{fontSize: '11px', color: '#666', margin: '5px 0'}}>Note: Để trống nếu giữ nguyên ảnh cũ.</p>}

      <div style={{marginTop: '5px', marginBottom: '10px'}}>
          {!editingPano ? (
            <button
                type="submit"
                style={{ ...btnBrown, opacity: selectedRoom ? 1 : 0.6 }}
                disabled={!selectedRoom}
            >
                🪶 Tải lên
            </button>
          ) : (
            <div style={{display: 'flex', gap: '10px'}}>
                <button type="submit" style={{...btnBrown, background: '#FF9800'}}>
                    💾 Lưu thay đổi
                </button>
                <button 
                    type="button" 
                    onClick={handleCancelEditPanorama} 
                    style={{...btnBrown, background: '#9E9E9E'}}
                >
                    ❌ Hủy
                </button>
            </div>
          )}
      </div>
    </form>
  )}
</div>

  {/* Danh sách panorama */}
  <div style={{ flex: 1, overflowY: "auto", paddingRight: "5px" }}>
  <div style={gridStyle}>
    {panoramas.length === 0 && selectedRoom && (
      <p style={{ gridColumn: "1 / -1", color: "#777" }}>
        (Chưa có panorama trong phòng này)
      </p>
    )}

    {panoramas.map((p) => (
      <div
        key={p.id}
        style={{
          ...cardStyle,
          background: selectedPanorama === p.id ? "#d7ccc8" : (editingPano?.id === p.id ? "#FFF3E0" : "#fafafa"),
          border: editingPano?.id === p.id ? "2px solid #FF9800" : "1px solid #ccc",
          position: "relative"
        }}
      >
        <button
      onClick={async (e) => {
        e.stopPropagation();
        if (p.isStart) return;

        if (!confirm(`Đặt "${p.title}" làm điểm xuất phát mặc định của hệ thống?`)) return;

        try {
          const fd = new FormData();
          fd.append("isStart", "true");
          
          await PanoramaAPI.update(p.id, fd);
          
          if(selectedRoom) loadPanoramas(selectedRoom);
          loadAllPanoramas();
          notifySuccess(`Đã đặt "${p.title}" làm điểm xuất phát!`);
        } catch (err) {
          notifyError("Lỗi: " + err.message);
        }
      }}
      title={p.isStart ? "Đây là điểm xuất phát" : "Đặt làm điểm xuất phát"}
      style={{
        position: 'absolute', 
        top: '5px', 
        left: '5px', 
        background: 'transparent', 
        border: 'none', 
        fontSize: '20px', 
        cursor: 'pointer',
        zIndex: 10
      }}
    >
      {p.isStart ? "⭐" : "☆"} 
    </button>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '5px', marginBottom: '5px'}}>
             <button
                onClick={() => handleEditPanorama(p)}
                disabled={!!editingPano} // Không cho sửa cái khác khi đang sửa
                style={{
                  background: "transparent", border: "none", cursor: "pointer", fontSize: "16px",
                  opacity: editingPano ? 0.3 : 1
                }}
                title="Sửa thông tin ảnh"
             >
                ✏️
             </button>
             <button
                onClick={() => handleDeletePanorama(p.id)}
                disabled={!!editingPano}
                style={{
                  background: "transparent", border: "none", cursor: "pointer", fontSize: "16px", color: "red",
                   opacity: editingPano ? 0.3 : 1
                }}
                title="Xóa Panorama này"
             >
                🗑️
             </button>
        </div>

        <strong>{p.title}</strong>
        <img src={p.imageUrl} alt={p.title} style={imgStyle} />
        
        <button
          onClick={() => openViewer(p)}
          style={{ ...btnBrown, width: "100%", marginTop: "8px" }}
        >
          👁️ Xem & Chỉnh Hotspots
        </button>
      </div>
    ))}
  </div>
</div>
</section>


        {/* HOTSPOTS */}
        
<section style={{...sectionStyle, display: "flex", flexDirection: "column", overflow: "hidden"}}>
  <h3 style={{ flexShrink: 0 }}>⭕ Danh sách Hotspots</h3>
<div style={{ flex: 1, overflowY: "auto", paddingRight: "5px" }}>
  {!selectedPanorama ? (
    <div style={noticeBoxStyle}>
      👈 Chọn một Panorama bên trái để xem danh sách Hotspot.
    </div>
  ) : (
    <>
      <p style={{ marginBottom: '15px', color: '#555', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        Đang xem: <strong>{panoramas.find(p => p.id === selectedPanorama)?.title}</strong>
      </p>

      <table style={tableStyle}>
        <thead>
          <tr style={{ background: "#efebe9" }}>
            <th style={{ width: "30%" }}>Tên điểm</th>
            <th style={{ width: "20%" }}>Loại</th>
            <th style={{ width: "40%" }}>Liên kết / Vật phẩm</th>
            <th style={{ width: "10%" }}>Xóa</th>
          </tr>
        </thead>
        <tbody>
          {hotspots.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#999', fontStyle: 'italic' }}>
                Chưa có hotspot nào trong ảnh này.
              </td>
            </tr>
          ) : (
            hotspots.map((h) => (
              <tr key={h.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ fontWeight: '500' }}>{h.label}</td>
                {/* Loại Hotspot */}
                <td style={{ textAlign: 'center' }}>
                  {h.type === 'nav' && <span style={{ color: 'green', fontWeight: 'bold' }}>➜</span>}
                  {h.type === 'info' && <span style={{ color: 'blue', fontWeight: 'bold' }}>ℹ️</span>}
                  {h.type === 'chat' && <span style={{ color: 'purple', fontWeight: 'bold' }}>🤖</span>}
                </td>

                {/* Chi tiết liên kết */}
                <td>
                  {h.type === 'nav' && (
                    <span style={{ fontSize: '13px', color: '#388E3C' }}>
                      Đến: {allPanoramas.find(p => p.id === h.toPanoramaId)?.title || 'Unknown'}
                    </span>
                  )}
                  {h.type === 'info' && (
                    <span style={{ fontSize: '13px', color: '#1976D2' }}>
                      VP: {artifacts.find(a => a.id === h.artifactId)?.name || 'Unknown'}
                    </span>
                  )}
                  {h.type === 'chat' && (
                    <span style={{ fontSize: '13px', color: '#7B1FA2' }}>AI Chatbot</span>
                  )}
                </td>

                {/* Nút Xóa */}
                <td style={{ textAlign: "center" }}>
                  <button
                    onClick={() => handleDeleteHotspot(h.id, h.fromPanoramaId)}
                    style={deleteBtnStyle}
                    title="Xóa Hotspot này"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  )}
</div>
</section>
      </main>
        )}

        {/* ARTIFACTS */}
        {activeTab === "artifacts" && (
    <main style={{...scrollableMainStyle, padding: "20px" }}>
        {!selectedRoom ? <p>⚠️ Vui lòng quay lại tab "Bảo tàng" và chọn một Phòng trước.</p> : (
            <div style={{display: 'flex', gap: '20px'}}>
                
        
                <section style={sectionStyle}>
                    <h3>
                        {editingArtifact ? `✏️ Sửa vật phẩm: ${editingArtifact.name}` : `➕ Thêm Vật phẩm vào: ${rooms.find(r=>r.id===selectedRoom)?.name}`}
                    </h3>
                    
                    <form onSubmit={handleSaveArtifact}>
                        <input type="text" placeholder="Tên vật phẩm (VD: Trống Đồng)" 
                            style={{...inputStyle, width: '100%', marginBottom: '10px'}}
                            value={form.artifactName}
                            onChange={e => setForm({...form, artifactName: e.target.value})}
                        />
                        <textarea rows="4" placeholder="Mô tả chi tiết / Lịch sử..."
                            style={{...inputStyle, width: '100%', marginBottom: '10px'}}
                            value={form.artifactDesc}
                            onChange={e => setForm({...form, artifactDesc: e.target.value})}
                        />
                        <div style={{marginBottom: '10px'}}>
                            <label>Ảnh cận cảnh (2D): </label>
                            <input type="file" onChange={e => setForm({...form, artifactFile: e.target.files[0]})} />
                            {editingArtifact && <p style={{fontSize: '11px', color: '#666', fontStyle:'italic'}}>Note: Không chọn ảnh nếu muốn giữ ảnh cũ.</p>}
                        </div>

                    
                        {!editingArtifact ? (
                             <button type="submit" style={btnBrown}>➕ Thêm Vật phẩm</button>
                        ) : (
                            <div style={{display: 'flex', gap: '10px'}}>
                                <button type="submit" style={{...btnBrown, background: '#FF9800'}}>💾 Cập nhật</button>
                                <button type="button" onClick={handleCancelEditArtifact} style={{...btnBrown, background: '#757575'}}>❌ Hủy</button>
                            </div>
                        )}
                    </form>
                </section>

                {/* --- DANH SÁCH VẬT PHẨM --- */}
                <section style={{...sectionStyle, flex: 2}}>
                    <h3>Danh sách vật phẩm ({artifacts.length})</h3>
                    <div style={gridStyle}>
                        {artifacts.map(a => (
                            <div key={a.id} style={{
                                ...cardStyle,
                                border: editingArtifact?.id === a.id ? '2px solid #FF9800' : '1px solid #ccc' // Highlight khi đang sửa
                            }}>
                                <img src={a.imageUrl} style={{width: '100%', height: '150px', objectFit: 'contain'}} />
                                <strong>{a.name}</strong>
                                <p style={{fontSize: '12px', color: '#666'}}>{a.description?.slice(0, 50)}...</p>
                                
                                <div style={{display: 'flex', gap: '5px', marginTop: '5px'}}>
                                    <button 
                                        onClick={() => handleEditArtifact(a)}
                                        disabled={!!editingArtifact} // Disable các nút khác khi đang sửa
                                        style={{...btnBrown, background: 'transparent', padding: '4px', fontSize: '16px'}}
                                    >
                                        ✏️
                                    </button>

                                    <button onClick={async () => {
                                        if(editingArtifact) return notifyError("Vui lòng hoàn tất chỉnh sửa trước khi xóa.");
                                        if(await confirmDelete('Xóa vật phẩm này?')) {
                                            await ArtifactAPI.delete(a.id);
                                            loadArtifacts(selectedRoom);
                                        }
                                    }} style={{...btnBrown, background: 'transparent', padding: '4px', fontSize: '16px'}}>
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- Đồng bộ --- */}
                <div style={{ marginTop: 20, padding: 15, background: '#f5f5f5', border: '1px dashed #999', alignSelf: 'flex-start' }}>
                    <h4>🔄 Đồng bộ dữ liệu sang Chatbot</h4>
                    <p style={{fontSize: '13px'}}>Bấm nút này để gửi toàn bộ dữ liệu vật phẩm hiện tại sang Python để AI học.</p>
                    <button 
                        onClick={handleSyncArtifacts} 
                        disabled={isSyncing}
                        style={{ background: '#4CAF50', color: 'white', padding: '10px 20px', border: 'none', cursor: 'pointer', width: '100%' }}
                    >
                        {isSyncing ? "Đang đồng bộ..." : "Bắt đầu Đồng bộ ngay"}
                    </button>
                </div>
            </div>
        )}
    </main>
)}

         {activeTab === "ai_brain" && (
  <main style={{...scrollableMainStyle, padding: "20px", display: "flex", gap: "20px", alignItems: "flex-start" }}>
    
    <section style={{ ...sectionStyle, flex: 1 }}>
      <h3>{editingKnowledge ? "✏️ Chỉnh sửa Kiến thức" : "🧠 Nạp Kiến thức chung"}</h3>
      
      <div style={{ background: '#fff3e0', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '13px', color: '#e65100', border: '1px solid #ffe0b2' }}>
        ℹ️ <strong>Lưu ý:</strong> Đây là kiến thức nền tảng cho AI (Lịch sử trường, tiểu sử nhân vật...). 
        Sau khi Lưu/Xóa, AI sẽ tự động học lại dữ liệu mới.
      </div>

      <form onSubmit={handleSaveKnowledge} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Chủ đề:</label>
          <input
            type="text"
            placeholder="VD: Lịch sử thành lập trường ĐH Duy Tân..."
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            style={{ ...inputStyle, width: '100%' }}
          />
        </div>
        
        <div>
          <label style={{fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>Nội dung chi tiết:</label>
          <textarea
            rows="8"
            placeholder="Nhập văn bản chi tiết để AI học thuộc..."
            value={aiContent}
            onChange={(e) => setAiContent(e.target.value)}
            style={{ ...inputStyle, width: '100%', fontFamily: 'inherit' }}
          />
        </div>

        {!editingKnowledge ? (
            <button type="submit" style={btnBrown}>
              ➕ Nạp vào bộ nhớ AI
            </button>
        ) : (
            <div style={{display: 'flex', gap: '10px'}}>
                <button type="submit" style={{...btnBrown, background: '#FF9800'}}>💾 Cập nhật</button>
                <button type="button" onClick={handleCancelEditKnowledge} style={{...btnBrown, background: '#757575'}}>❌ Hủy</button>
            </div>
        )}
      </form>
    </section>

    <section style={{ ...sectionStyle, flex: 1.5 }}>
      <h3>📚 Danh sách Kiến thức ({knowledgeList.length})</h3>
      
      <div style={{ marginTop: '10px', maxHeight: '70vh', overflowY: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr style={{ background: "#efebe9" }}>
              <th style={{width: '30%'}}>Chủ đề</th>
              <th style={{width: '55%'}}>Nội dung trích dẫn</th>
              <th style={{width: '15%'}}>Hành động</th>
            </tr>
          </thead>
          <tbody>
             {knowledgeList.length === 0 ? (
                 <tr>
                    <td colSpan="3" style={{textAlign: 'center', padding: '20px', color: '#999', fontStyle: 'italic'}}>
                       Chưa có kiến thức nào. Hãy thêm ở cột bên trái.
                    </td>
                 </tr>
             ) : (
                 knowledgeList.map((item) => (
                     <tr key={item.id} style={{borderBottom: '1px solid #eee'}}>
                         <td style={{fontWeight: '500', verticalAlign: 'top'}}>{item.topic}</td>
                         <td style={{fontSize: '13px', color: '#555', verticalAlign: 'top'}}>
                             {item.content.length > 100 ? item.content.substring(0, 100) + "..." : item.content}
                         </td>
                         <td style={{textAlign: 'center', verticalAlign: 'top'}}>
                             <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                                 <button 
                                    onClick={() => handleEditKnowledge(item)}
                                    disabled={!!editingKnowledge}
                                    style={{...btnBrown, background: 'transparent', padding: '4px', fontSize: '16px'}}
                                 >
                                     ✏️
                                 </button>
                                 <button 
                                    onClick={() => handleDeleteKnowledge(item.id)}
                                    disabled={!!editingKnowledge}
                                    style={{...btnBrown, background: 'transparent', padding: '4px', fontSize: '16px'}}
                                 >
                                     🗑️
                                 </button>
                             </div>
                         </td>
                     </tr>
                 ))
             )}
          </tbody>
        </table>
      </div>
    </section>
  </main>
)}

        {activeTab === "timeline" && (
    <main style={{...scrollableMainStyle, padding: "20px", display: "flex", gap: "20px", height: '100%', overflow: 'hidden' }}>
        
        <section style={{...sectionStyle, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
            <h3 style={{flexShrink: 0}}>{editingEvent ? `✏️ Sửa sự kiện: ${editingEvent.year}` : "⏳ Thêm Sự Kiện Lịch Sử"}</h3>
            
            <form onSubmit={handleSaveTimeline} style={{display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden'}}>
              <div style={{flex: 1, overflowY: 'auto', paddingRight: '5px'}}>
                <div style={{marginBottom: '10px'}}>
                   <label style={{fontWeight:'bold', fontSize:'12px'}}>Năm / Giai đoạn:</label>
                   <input type="text" placeholder="VD: 1994, 2010-2015" style={{...inputStyle, width: '100%'}} 
                       value={formTimeline.year} onChange={e => setFormTimeline({...formTimeline, year: e.target.value})} 
                   />
                </div>

                <div style={{marginBottom: '10px'}}>
                   <label style={{fontWeight:'bold', fontSize:'12px'}}>Tiêu đề:</label>
                   <input type="text" placeholder="Tiêu đề sự kiện" style={{...inputStyle, width: '100%'}} 
                       value={formTimeline.title} onChange={e => setFormTimeline({...formTimeline, title: e.target.value})} 
                   />
                </div>

                <div style={{marginBottom: '10px'}}>
                   <label style={{fontWeight:'bold', fontSize:'12px'}}>Thứ tự hiển thị:</label>
                   <input type="number" placeholder="0" style={{...inputStyle, width: '100%'}} 
                       value={formTimeline.order} onChange={e => setFormTimeline({...formTimeline, order: e.target.value})} 
                   />
                </div>

                <div style={{marginBottom: '10px'}}>
                   <label style={{fontWeight:'bold', fontSize:'12px'}}>Mô tả (không bắt buộc):</label>
                   <textarea rows="4" placeholder="Mô tả chi tiết sự kiện..." style={{...inputStyle, width: '100%'}} 
                       value={formTimeline.description} onChange={e => setFormTimeline({...formTimeline, description: e.target.value})} 
                   />
                </div>

                <div style={{marginBottom: '10px'}}>
                    <label style={{fontWeight:'bold', fontSize:'12px'}}>Ảnh minh họa (Chọn nhiều): </label>
                    <input 
                        type="file" 
                        multiple
                        onChange={e => setFormTimeline({...formTimeline, imageFiles: e.target.files})} 
                    />
                    {editingEvent && <p style={{fontSize: '11px', color: '#666', fontStyle:'italic', marginTop:'5px'}}>Lưu ý: Nếu chọn ảnh mới, toàn bộ ảnh cũ của sự kiện này sẽ bị thay thế.</p>}
                </div>
                </div>
                <div style={{marginTop: '10px', flexShrink: 0}}>
                {!editingEvent ? (
                    <button type="submit" style={btnBrown}>➕ Thêm Sự Kiện</button>
                ) : (
                    <div style={{display: 'flex', gap: '10px'}}>
                        <button type="submit" style={{...btnBrown, background: '#FF9800'}}>💾 Cập nhật</button>
                        <button type="button" onClick={handleCancelEditTimeline} style={{...btnBrown, background: '#757575'}}>❌ Hủy</button>
                    </div>
                )}
                </div>
            </form>
        </section>

        {/* DANH SÁCH SỰ KIỆN */}
        <section style={{...sectionStyle, flex: 2, display: 'flex', flexDirection: 'column',overflow: 'hidden'}}>
            <h3 style={{flexShrink: 0}}>Dòng thời gian ({timelineEvents.length})</h3>
            <div style={{flex: 1, overflowY: 'auto', paddingRight: '5px'}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                {timelineEvents.map(evt => (
                    <div key={evt.id} style={{
                        ...cardStyle, 
                        display: 'flex', 
                        gap: '15px', 
                        alignItems: 'center',
                        border: editingEvent?.id === evt.id ? '1px solid #FF9800' : '1px solid #ccc',
                        background: editingEvent?.id === evt.id ? '#fff3e0' : '#fff'
                    }}>
                        {/* Hiển thị ảnh đầu tiên làm thumbnail */}
                        {evt.images && evt.images.length > 0 && (
                            <div style={{position: 'relative'}}>
                                <img 
                                    src={evt.images[0].startsWith('http') ? evt.images[0] : `http://localhost:4000${evt.images[0].startsWith('/')?'':'/'}${evt.images[0]}`} 
                                    style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px'}} 
                                />
                                {evt.images.length > 1 && (
                                    <span style={{position:'absolute', bottom:0, right:0, background:'rgba(0,0,0,0.6)', color:'white', fontSize:'10px', padding:'2px 4px', borderRadius:'2px'}}>+{evt.images.length-1}</span>
                                )}
                            </div>
                        )}
                        
                        <div style={{flex: 1}}>
                            <div style={{fontWeight: 'bold', color: '#d4b76a', fontSize: '1.1em'}}>
                                {evt.year} <span style={{fontSize: '0.8em', color: '#999', fontWeight: 'normal'}}>(Thứ tự: {evt.order})</span>
                            </div>
                            <div style={{fontWeight: 'bold', fontSize: '1.1em'}}>{evt.title}</div>
                            <div style={{fontSize: '13px', color: '#555', marginTop: '4px'}}>
                                {evt.description?.length > 100 ? evt.description.slice(0, 100) + '...' : evt.description}
                            </div>
                        </div>

                        <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                            <button 
                                onClick={() => handleEditTimeline(evt)} 
                                disabled={!!editingEvent}
                                style={{background: 'white', cursor: 'pointer', padding: '8px', fontSize:'16px'}}
                            >
                                ✏️
                            </button>
                            <button 
                                onClick={() => {
                                    if(editingEvent) return notifyError("Hoàn tất sửa trước khi xóa.");
                                    handleDeleteTimeline(evt.id);
                                }} 
                                style={{background: 'white', cursor: 'pointer', padding: '8px', fontSize:'16px'}}
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
                {timelineEvents.length === 0 && <p style={{color: '#999', fontStyle: 'italic', textAlign:'center', marginTop:'20px'}}>Chưa có sự kiện nào.</p>}
            </div>
          </div>
        </section>
    </main>
)}

        {activeTab === "quiz" && (
  <main style={{
    ...scrollableMainStyle, 
    padding: "20px", 
    display: "flex", 
    gap: "20px",
    height: '100%',        
    overflow: 'hidden'    
  }}>
    <section style={{ ...sectionStyle, flex: 1 }}>
      <h3 style={{flexShrink: 0}}>{editingQuestion ? "✏️ Chỉnh sửa câu hỏi" : "📝 Thêm câu hỏi mới"}</h3>
      
      <form onSubmit={handleSaveQuestion} style={{ ...quizFormStyle, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
        <label style={{fontWeight:'bold'}}>Nội dung câu hỏi:</label>
        <textarea
          name="question"
          rows="3"
          placeholder="Nhập nội dung câu hỏi..."
          value={quizForm.question}
          onChange={handleQuizFormChange}
          style={quizInput}
        />

        <label style={{fontWeight:'bold', marginTop:'10px'}}>Các phương án:</label>
        <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
            <span style={{fontWeight:'bold', width:'20px'}}>A.</span>
            <input name="optionA" type="text" placeholder="Đáp án A" value={quizForm.optionA} onChange={handleQuizFormChange} style={quizInput} />
        </div>
        <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
            <span style={{fontWeight:'bold', width:'20px'}}>B.</span>
            <input name="optionB" type="text" placeholder="Đáp án B" value={quizForm.optionB} onChange={handleQuizFormChange} style={quizInput} />
        </div>
        <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
            <span style={{fontWeight:'bold', width:'20px'}}>C.</span>
            <input name="optionC" type="text" placeholder="Đáp án C" value={quizForm.optionC} onChange={handleQuizFormChange} style={quizInput} />
        </div>
        <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
            <span style={{fontWeight:'bold', width:'20px'}}>D.</span>
            <input name="optionD" type="text" placeholder="Đáp án D" value={quizForm.optionD} onChange={handleQuizFormChange} style={quizInput} />
        </div>

        <label style={{fontWeight:'bold', marginTop:'10px'}}>Đáp án đúng:</label>
        <select
          name="correctAnswer"
          value={quizForm.correctAnswer}
          onChange={handleQuizFormChange}
          style={{...quizSelect, width: '100%', padding: '10px', marginBottom: '10px'}}
        >
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
      </div>

      <div style={{ marginTop: '10px', flexShrink: 0, paddingTop: '10px', borderTop: '1px solid #eee' }}>
        {!editingQuestion ? (
            <button type="submit" style={{...btnBrown, marginTop: '15px'}}>➕ Thêm câu hỏi</button>
        ) : (
            <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
                <button type="submit" style={{...btnBrown, background: '#FF9800', flex: 1}}>💾 Cập nhật</button>
                <button type="button" onClick={handleCancelEditQuestion} style={{...btnBrown, background: '#757575', flex: 1}}>❌ Hủy</button>
            </div>
        )}
      </div>
      </form>
    </section>

    {/* DANH SÁCH CÂU HỎI */}
    <section style={{ 
      ...sectionStyle, 
      flex: 2, 
      display: 'flex',        
      flexDirection: 'column',  
      overflow: 'hidden'       
    }}>
      <h3 style={{ flexShrink: 0 }}>📚 Danh sách câu hỏi ({questions.length})</h3>
      <div style={{ 
        flex: 1,              
        overflowY: 'auto',     
        marginTop: '10px',
        border: '1px solid #eee',
        borderRadius: '4px'
      }}>
      <table style={{ ...tableStyle, fontSize: "14px", marginTop: 0 }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
          <tr style={{ background: "#efebe9" }}>
            <th style={{width: '40%'}}>Câu hỏi</th>
            <th style={{width: '35%'}}>Các đáp án</th>
            <th style={{width: '10%'}}>Đúng</th>
            <th style={{width: '15%'}}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q.id} style={{borderBottom: '1px solid #eee', background: editingQuestion?.id === q.id ? '#fff3e0' : 'transparent'}}>
              <td style={{fontWeight: '500'}}>{q.question}</td>
              <td>
                <ul style={{margin: 0, paddingLeft: '20px', listStyleType: 'none'}}>
                  {q.options.map((opt, index) => (
                    <li key={index} style={{
                        color: ['A','B','C','D'][index] === q.correctAnswer ? '#2E7D32' : '#000',
                        fontWeight: ['A','B','C','D'][index] === q.correctAnswer ? 'bold' : 'normal'
                    }}>
                      <span style={{fontWeight:'bold'}}>{['A','B','C','D'][index]}.</span> {opt}
                    </li>
                  ))}
                </ul>
              </td>
              <td style={{textAlign: 'center', fontWeight: 'bold', color: '#d84315', fontSize: '16px'}}>{q.correctAnswer}</td>
              <td style={{textAlign: 'center'}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                    <button 
                        onClick={() => handleEditQuestion(q)}
                        disabled={!!editingQuestion}
                        style={{...btnBrown, background: 'transparent', padding: '4px', fontSize: '16px'}}
                    >
                        ✏️
                    </button>
                    <button 
                        onClick={() => {
                            if(editingQuestion) return notifyError("Hoàn tất sửa trước khi xóa.");
                            handleDeleteQuestion(q.id);
                        }} 
                        style={{...btnBrown, background: 'transparent', padding: '4px', fontSize: '16px'}}
                    >
                        🗑️
                    </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </section>
  </main>
)}

      {activeTab === "users" && (
        <div style={scrollableWrapper}>
            <UserManager />
        </div>
      )}
      {activeTab === "leaderboard" && (
        <div style={scrollableWrapper}>
            <Leaderboard />
        </div>
      )}

     {showViewer && (
        <div style={viewerModal}>
          <div ref={viewerContainerRef} style={viewerBox}></div>

          <div style={{
              position: "absolute", right: "20px", bottom: "20px",
              background: "rgba(255,255,255,0.95)", padding: "15px",
              borderRadius: "8px", boxShadow: "0 0 15px rgba(0,0,0,0.3)", width: "280px",
              maxHeight: "80vh", overflowY: "auto"
          }}>
            <h4 style={{ marginTop: 0, color: "#4e342e", fontSize: "16px", borderBottom: "1px solid #ccc", paddingBottom: "5px" }}>
              ➕ Thêm Hotspot Mới
            </h4>
            
            <div style={{ marginBottom: "10px", display: "flex", gap: "10px", flexDirection: "column" }}>
              <div style={{display: 'flex', gap: '15px'}}>
                <label style={{ cursor: "pointer", fontWeight: form.hotspotType === 'nav' ? 'bold' : 'normal' }}>
                    <input 
                        type="radio" name="htype" value="nav" 
                        checked={form.hotspotType === 'nav'} 
                        onChange={() => setForm({...form, 
                          hotspotType: 'nav',
                          artifactId: "",
                        hotspotLabel: ""})}
                    /> Đi tiếp ➜
                </label>
                <label style={{ cursor: "pointer", fontWeight: form.hotspotType === 'info' ? 'bold' : 'normal' }}>
                    <input 
                        type="radio" name="htype" value="info" 
                        checked={form.hotspotType === 'info'}
                        onChange={() => setForm({...form, hotspotType: 'info'})}
                    /> Vật phẩm ℹ️
                </label>
                </div>
                <label style={{fontWeight: 'bold', color: '#673AB7'}}>
                  <input type="radio" name="htype" value="chat" checked={form.hotspotType === 'chat'} onChange={() => setForm({...form, hotspotType: 'chat'})} /> 
                  🤖 Hướng dẫn viên AI
            </label>
            </div>
            
            <input
              type="text"
              placeholder={
                form.hotspotType === 'nav' 
                  ? "Nhãn (VD: Vào Bếp)" 
                  : form.hotspotType === 'chat'
                    ? "Tên Chatbot (VD: Hướng dẫn viên AI)"
                    : "Tên vật phẩm (VD: Trống Đồng)"
              }
              value={form.hotspotLabel}
              onChange={(e) => setForm({ ...form, hotspotLabel: e.target.value })}
              style={{ ...inputStyle, width: "100%", marginBottom: "8px" }}
            />

            {form.hotspotType === 'nav' && (
                <select
                  value={form.toPanoramaId}
                  onChange={(e) => setForm({ ...form, toPanoramaId: e.target.value })}
                  style={{ ...inputStyle, width: "100%", marginBottom: "8px" }}
                >
                  <option value="">→ Chọn panorama đích</option>
                  {allPanoramas
                    .filter((p) => p.id !== selectedPanorama)
                    .map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                </select>
            )}

          
                    {form.hotspotType === 'info' && (
                        <div style={{marginBottom: '10px'}}>
                            <label style={{fontSize: '12px', fontWeight: 'bold'}}>Chọn vật phẩm gắn vào:</label>
                            <select 
                                value={form.artifactId}
                                onChange={e => {
                                    // Tự động điền label theo tên vật phẩm luôn cho tiện
                                    const art = artifacts.find(a => a.id === e.target.value);
                                    setForm({...form, artifactId: e.target.value, hotspotLabel: art ? art.name : ""});
                                }}
                                style={{...inputStyle, width: '100%'}}
                            >
                                <option value="">-- Chọn vật phẩm --</option>
                                {artifacts.map(a => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                            {artifacts.length === 0 && <p style={{color: 'red', fontSize: '11px'}}>Chưa có vật phẩm nào trong phòng này. Hãy sang tab "Quản lý Vật phẩm" để tạo trước.</p>}
                        </div>
                    )}

                    {form.hotspotType === 'chat' && (
                <div style={{marginTop: '10px', padding: '10px', background: '#EDE7F6', borderRadius: '5px', border: '1px solid #673AB7'}}>
                    <small style={{display:'block', marginBottom:'5px', fontWeight:'bold', color: '#512DA8'}}>🎭 Cấu hình nhân vật:</small>
                    
                    <textarea 
                        rows="2" 
                        placeholder="Vai trò (System Prompt): VD: Bạn là một cựu chiến binh già, giọng điệu tự hào..." 
                        style={{...inputStyle, width: '100%', fontSize: '12px'}}
                        value={form.instruction}
                        onChange={e => setForm({...form, instruction: e.target.value})}
                    />
                    
                    <textarea 
                        rows="3" 
                        placeholder="Kiến thức riêng tại điểm này: VD: Đây là góc trưng bày bằng khen năm 1995..." 
                        style={{...inputStyle, width: '100%', fontSize: '12px', marginTop: '5px'}}
                        value={form.knowledge}
                        onChange={e => setForm({...form, knowledge: e.target.value})}
                    />
                </div>
            )}

            <p style={{ fontSize: "11px", color: "#666", marginTop: "5px", fontStyle: "italic" }}>
              👉 Click vào điểm (+) trên ảnh để đặt vị trí.
            </p>
            <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
              <h4 style={{ fontSize: '14px', margin: '0 0 5px 0', color: '#4e342e' }}>🎯 Cấu hình góc nhìn</h4>
              <p style={{ fontSize: '11px', color: '#666', marginBottom: '5px' }}>
                Xoay ảnh đến góc đẹp nhất rồi bấm nút dưới để lưu làm góc mở đầu.
              </p>
              <button 
                onClick={handleSetDefaultView}
                style={{
                  width: '100%', padding: '8px', 
                  background: '#2196F3', color: 'white', 
                  border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                }}
              >
                Lưu góc nhìn hiện tại
              </button>
            </div>
          </div>

          <button 
            onClick={() => { setShowViewer(false); setCurrentPanoData(null); }} 
            style={btnClose}
          >
            ✖️ Đóng Viewer
          </button>
        </div>
      )}


      <footer style={footerStyle}>
        © 2025 DTU VM — Quản Trị Dữ Liệu
      </footer>
    </div>
  );
}

const scrollableMainStyle = {
    flex: 1, 
    overflowY: "auto",
};

const scrollableWrapper = {
    flex: 1,
    overflowY: "auto",
};
const sectionStyle = {
  flex: 1,
  background: "#fff",
  borderRadius: 8,
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  padding: 20,
};

const listItemStyle = {
  padding: "6px",
  borderRadius: 6,
  border: "1px solid #ccc",
  marginBottom: 5,
  cursor: "pointer",
};

const btnBrown = {
  padding: "8px 12px",
  background: "#6d4c41",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: '14px',
};

const inputStyle = {
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  marginRight: "5px",
  marginBottom: "5px",
};

const cardStyle = {
  border: "1px solid #ccc",
  borderRadius: "6px",
  padding: "8px",
};

const imgStyle = {
  width: "100%",
  height: "120px",
  objectFit: "cover",
  borderRadius: "4px",
  marginTop: "5px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
  marginTop: "10px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "10px",
};

const viewerModal = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.9)",
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
};

const viewerBox = { flex: 1, width: "100%", height: "100%" };

const btnClose = {
  position: "absolute",
  top: 20,
  right: 20,
  background: "#6d4c41",
  color: "white",
  border: "none",
  borderRadius: "4px",
  padding: "6px 12px",
};

const footerStyle = {
  textAlign: "center",
  background: "#4e342e",
  color: "white",
  padding: "10px",
  fontSize: "13px",
  marginTop: 'auto',
};

const tabBtn = {
  padding: "10px 15px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "16px",
  color: "#3e2723",
  fontWeight: "500",
  opacity: 0.7,
  
};

const tabBtnActive = {
  ...tabBtn,
  fontWeight: "bold",
  opacity: 1,
  borderBottom: "3px solid #4e342e",
};

const deleteBtnStyle = {
  background: "transparent",
  color: "#c62828",
  border: "none",
  cursor: "pointer",
  fontSize: "16px",
  padding: '4px'
};

const noticeBoxStyle = {
  padding: "10px",
  border: "1px dashed #ccc",
  borderRadius: "6px",
  background: "#fff8e1",
  color: "#6d4c41",
  marginBottom: "10px",
  fontStyle: "italic",
};

const quizFormStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const quizInput = {
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  width: "100%",
  boxSizing: 'border-box'
};

const quizSelect = {
  ...quizInput,
  width: 'auto',
  alignSelf: 'flex-start'
};
