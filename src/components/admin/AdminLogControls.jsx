function formatPeriodInput(value) {
  const numbers = value.replace(/\D/g, "").slice(0, 8);

  if (numbers.length <= 4) {
    return numbers;
  }

  if (numbers.length <= 6) {
    return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
  }

  return `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(6)}`;
}

const getTodayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
};

const getCurrentMonthKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

function AdminLogControls({
  searchText,
  setSearchText,
  periodFilter,
  setPeriodFilter,
  sortType,
  setSortType,
  onReset,
  onDownloadCsv,
}) {
  return (
    <div className="adminControls logControls">
      <div className="controlField">
        <span>학생 검색</span>
        <input
          type="text"
          placeholder="이름 또는 학번"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value.slice(0, 20))}
        />
      </div>

      <div className="controlField">
        <span>기간 검색</span>
        <input
          type="text"
          placeholder="2026 / 2026-06 / 2026-06-02"
          value={periodFilter}
          onChange={(e) => setPeriodFilter(formatPeriodInput(e.target.value))}
          inputMode="numeric"
        />
      </div>

      <div className="controlField quickField">
        <span>빠른 기간</span>
        <div className="periodQuickButtons">
          <button type="button" onClick={() => setPeriodFilter(getTodayKey())}>
            오늘
          </button>

          <button
            type="button"
            onClick={() => setPeriodFilter(getCurrentMonthKey())}
          >
            이번 달
          </button>

          <button type="button" onClick={() => setPeriodFilter("")}>
            전체
          </button>
        </div>
      </div>

      <div className="controlField">
        <span>정렬</span>
        <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
          <option value="date_desc">날짜 최신순</option>
          <option value="date_asc">날짜 오래된순</option>
          <option value="student_asc">학번 오름차순</option>
          <option value="student_desc">학번 내림차순</option>
          <option value="class_asc">학반순</option>
          <option value="pages_desc">장수 많은순</option>
          <option value="pages_asc">장수 적은순</option>
        </select>
      </div>

      <div className="controlActions">
        <button type="button" className="resetButton" onClick={onReset}>
          초기화
        </button>

        <button type="button" className="csvButton" onClick={onDownloadCsv}>
          CSV 다운로드
        </button>
      </div>
    </div>
  );
}

export default AdminLogControls;