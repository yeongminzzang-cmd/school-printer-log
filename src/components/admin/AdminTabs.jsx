function AdminTabs({ activeTab, onChangeTab }) {
  return (
    <div className="adminTabs" role="tablist" aria-label="관리자 메뉴">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "logs"}
        className={`adminTabButton ${activeTab === "logs" ? "active" : ""}`}
        onClick={() => onChangeTab("logs")}
      >
        사용 기록
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "insights"}
        className={`adminTabButton ${activeTab === "insights" ? "active" : ""}`}
        onClick={() => onChangeTab("insights")}
      >
        인사이트
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "students"}
        className={`adminTabButton ${activeTab === "students" ? "active" : ""}`}
        onClick={() => onChangeTab("students")}
      >
        학생 관리
      </button>
    </div>
  );
}

export default AdminTabs;