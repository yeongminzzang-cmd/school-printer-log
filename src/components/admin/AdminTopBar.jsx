function AdminTopBar({ adminEmail, onLogout }) {
  return (
    <div className="adminTopBar">
      <div className="adminAccountInfo">
        <span className="adminAccountLabel">관리자</span>
        <strong>{adminEmail || "관리자 계정"}</strong>
      </div>

      <button type="button" className="logoutButton" onClick={onLogout}>
        로그아웃
      </button>
    </div>
  );
}

export default AdminTopBar;