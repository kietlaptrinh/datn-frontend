import { useState, useEffect } from 'react';
import { UserAPI } from '../api/userApi'; 
import { confirmDelete, notifySuccess, notifyError } from '../utils/alertHelper';
import { FaTrash, FaTimes, FaUserCheck } from "react-icons/fa";

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ id: '', username: '', email: '', role: 'user' });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [selectedUsers, setSelectedUsers] = useState(new Set());

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await UserAPI.getAll();
      setUsers(data);
    } catch (error) {
      console.error("Lỗi tải user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedUsers(new Set()); 
  }, [currentPage, searchTerm]);

  const handleEditClick = (user) => { setEditingUser(user); setFormData({ ...user }); };
  const handleCancelEdit = () => setEditingUser(null);
  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await UserAPI.updateRole(editingUser.id, formData.role);
      setUsers(users.map(u => (u.id === editingUser.id ? { ...u, role: formData.role } : u)));
      notifySuccess("Đã cập nhật vai trò thành công!");
      handleCancelEdit();
    } catch (error) {
      notifyError("Lỗi cập nhật: " + error.message);
    }
  };
  
  const handleDeleteUser = async (userId) => {
    if (editingUser?.id === userId) return notifyError("Vui lòng Hủy bỏ sửa trước khi xóa.");
    if (!await confirmDelete("Bạn có chắc muốn xóa người dùng này?")) return;
    try {
      await UserAPI.delete(userId);
      setUsers((current) => current.filter((user) => user.id !== userId));
      setSelectedUsers(prev => { const next = new Set(prev); next.delete(userId); return next; });
      notifySuccess("Đã xóa thành công!");
    } catch (error) {
      notifyError("Lỗi xóa user: " + error.message);
    }
  };

  const filteredUsers = users.filter(user =>
    (user.username?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  const handleSearchChange = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };
  const handlePrevPage = () => setCurrentPage((p) => (p > 1 ? p - 1 : p));
  const handleNextPage = () => setCurrentPage((p) => (p < totalPages ? p + 1 : p));

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => {
      const next = new Set(prev); 
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleSelectAllOnPage = () => {
    const allOnPage = paginatedUsers.every(u => selectedUsers.has(u.id));
    setSelectedUsers(prev => {
      const next = new Set(prev);
      if (allOnPage) paginatedUsers.forEach(u => next.delete(u.id));
      else paginatedUsers.forEach(u => next.add(u.id));
      return next;
    });
  };

  const handleSelectAllGlobal = () => {
    const allIds = filteredUsers.map(u => u.id);
    setSelectedUsers(new Set(allIds));
    notifySuccess(`Đã chọn toàn bộ ${allIds.length} người dùng.`);
  };

  const handleClearSelection = () => {
    setSelectedUsers(new Set());
  };

  const handleBulkDelete = async () => {
    const idsToDelete = Array.from(selectedUsers);
    if (idsToDelete.length === 0) return;
    if (!await confirmDelete(`CẢNH BÁO: Bạn sắp xóa ${idsToDelete.length} người dùng. Hành động này không thể hoàn tác!`)) return;

    try {
        setLoading(true);
        await UserAPI.deleteBulk(idsToDelete);
        setUsers(prev => prev.filter(u => !selectedUsers.has(u.id)));
        setSelectedUsers(new Set()); 
        notifySuccess(`Đã xóa ${idsToDelete.length} người dùng thành công!`);
    } catch (error) {
        notifyError("Lỗi xóa hàng loạt: " + error.message);
    } finally {
        setLoading(false);
    }
  };
  
  const isAllOnPageSelected = paginatedUsers.length > 0 && paginatedUsers.every(u => selectedUsers.has(u.id));

  return (
    <main style={{ padding: "20px" }}>
      <section style={{...sectionStyle, flex: 1, maxWidth: '1000px', margin: '0 auto'}}>
        
        {loading && <p style={{textAlign: 'center', color: '#6d4c41'}}>⏳ Đang xử lý dữ liệu...</p>}

        {editingUser && (
          <div style={editFormContainerStyle}>
            <h3>✏️ Chỉnh sửa vai trò cho: {editingUser.username}</h3>
            <form onSubmit={handleUpdateUser}>
              <div style={formGroupStyle}><label>Email</label><input type="email" value={formData.email} style={inputStyle} disabled /></div>
              <div style={formGroupStyle}>
                <label>Vai trò</label>
                <select name="role" value={formData.role} onChange={handleFormChange} style={inputStyle}>
                  <option value="user">User</option><option value="admin">Admin</option>
                </select>
              </div>
              <div><button type="submit" style={btnBrown}>Lưu thay đổi</button><button type="button" onClick={handleCancelEdit} style={btnGray}>Hủy bỏ</button></div>
            </form>
          </div>
        )}

        {selectedUsers.size > 0 && (
          <div style={bulkActionBarStyle}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <FaUserCheck size={18} />
                <span>Đã chọn: <strong>{selectedUsers.size}</strong></span>
                
                {selectedUsers.size < filteredUsers.length && (
                    <button onClick={handleSelectAllGlobal} style={linkBtnStyle}>
                       (Chọn tất cả {filteredUsers.length} người dùng)
                    </button>
                )}
            </div>
            
            <div style={{display: 'flex', gap: '10px'}}>
               
                <button onClick={handleClearSelection} style={{...btnWhiteOutline, display: 'flex', alignItems: 'center', gap: '5px'}}>
                    <FaTimes /> Bỏ chọn
                </button>
               
                <button onClick={handleBulkDelete} style={{...btnRed, display: 'flex', alignItems: 'center', gap: '5px'}}>
                    <FaTrash /> Xóa {selectedUsers.size} mục
                </button>
            </div>
          </div>
        )}

        <div style={toolbarStyle}>
          <input 
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={searchInputStyle}
          />
          <div style={totalCountStyle}>
            Tổng: <strong>{filteredUsers.length}</strong> / {users.length} người dùng
          </div>
        </div>

        <h3>👥 Danh sách Người dùng</h3>
        <table style={{ ...tableStyle, fontSize: "14px" }}>
          <thead>
            <tr style={{ background: "#efebe9", color: "#3e2723" }}>
              <th style={checkboxCellStyle}>
                <input 
                    type="checkbox" 
                    checked={isAllOnPageSelected} 
                    onChange={handleSelectAllOnPage} 
                    style={{cursor: 'pointer'}}
                />
              </th>
              <th>Username</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.id} style={{
                  background: selectedUsers.has(user.id) ? '#fff8e1' : 'transparent', 
                  borderBottom: '1px solid #eee',
                  transition: 'background 0.2s'
              }}>
                <td style={checkboxCellStyle}>
                  <input 
                    type="checkbox" 
                    checked={selectedUsers.has(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    style={{cursor: 'pointer'}}
                  />
                </td>
                <td style={{padding: '10px'}}>{user.username}</td>
                <td>{user.email}</td>
                <td style={{fontWeight: user.role === 'admin' ? 'bold' : 'normal', color: user.role==='admin'?'#d84315':'inherit'}}>{user.role}</td>
                <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                <td style={{ textAlign: "center", display: 'flex', justifyContent: 'center', gap: '5px' }}>
                  <button onClick={() => handleEditClick(user)} style={btnEditStyle} disabled={!!editingUser}>✏️</button>
                  <button onClick={() => handleDeleteUser(user.id)} style={deleteBtnStyle} disabled={!!editingUser}>🗑️</button>
                </td>
              </tr>
            ))}
            {!loading && filteredUsers.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', fontStyle: 'italic', color: '#8d6e63' }}>
                Không tìm thấy người dùng nào.
              </td></tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div style={paginationStyle}>
            <button style={pageBtnStyle} onClick={handlePrevPage} disabled={currentPage === 1}>&laquo; Trước</button>
            <span style={{padding: '0 15px', color: '#5d4037', fontWeight: 'bold'}}>Trang {currentPage} / {totalPages}</span>
            <button style={pageBtnStyle} onClick={handleNextPage} disabled={currentPage === totalPages}>Sau &raquo;</button>
          </div>
        )}

      </section>
    </main>
  );
}

const sectionStyle = { flex: 1, background: "#fff", borderRadius: 8, boxShadow: "0 2px 5px rgba(0,0,0,0.1)", padding: 20, alignSelf: 'flex-start' };
const tableStyle = { width: "100%", borderCollapse: "collapse", marginTop: "10px", color: '#3e2723' };

const btnBrown = { padding: "8px 12px", background: "#6d4c41", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: '14px', marginRight: '10px', transition: 'background 0.2s' };
const btnGray = { ...btnBrown, background: "#757575" };
const btnRed = { ...btnBrown, background: "#c62828", marginRight: 0 }; // Đỏ đậm hơn cho hợp theme nâu
const btnWhiteOutline = { ...btnBrown, background: "white", color: "#6d4c41", border: "1px solid #6d4c41", marginRight: 0 };

const deleteBtnStyle = {cursor: "pointer", fontSize: "16px", padding: '8px', border:'none', background:'transparent', color:'#c62828'};
const btnEditStyle = {cursor: "pointer", fontSize: "16px", padding: '8px', border:'none', background:'transparent', color: '#1976D2' };

const editFormContainerStyle = { background: '#fafafa', border: '1px solid #d7ccc8', borderRadius: '8px', padding: '20px', marginBottom: '20px' };
const formGroupStyle = { marginBottom: '15px' };
const inputStyle = { width: '100%', padding: '8px', border: '1px solid #d7ccc8', borderRadius: '4px', boxSizing: 'border-box', marginTop: '5px' };

const toolbarStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', gap: '20px' };
const searchInputStyle = { flex: 1, padding: '10px', border: '1px solid #d7ccc8', borderRadius: '4px', fontSize: '14px' };
const totalCountStyle = { fontSize: '14px', color: '#5d4037', whiteSpace: 'nowrap' };

const paginationStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' };
const pageBtnStyle = { padding: '8px 12px', background: '#8d6e63', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', margin: '0 5px' };
const checkboxCellStyle = { width: '40px', textAlign: 'center' };
const linkBtnStyle = { background: 'none', border: 'none', color: '#6d4c41', textDecoration: 'underline', cursor: 'pointer', fontSize: '14px', fontStyle: 'italic' };

const bulkActionBarStyle = { 
    background: '#fff3e0',
    border: '1px solid #ffe0b2', 
    borderRadius: '8px', 
    padding: '10px 20px', 
    marginBottom: '20px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    color: '#5d4037',
    fontWeight: '500',
    animation: 'fadeIn 0.3s ease-in-out',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
};

btnEditStyle[':disabled'] = { opacity: 0.5, cursor: 'not-allowed' };
pageBtnStyle[':disabled'] = { background: '#d7ccc8', cursor: 'not-allowed' };