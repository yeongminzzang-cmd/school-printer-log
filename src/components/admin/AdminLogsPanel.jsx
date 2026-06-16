import AdminLogControls from "./AdminLogControls";
import AdminLogsTable from "./AdminLogsTable";

function AdminLogsPanel({
  searchText,
  setSearchText,
  periodFilter,
  setPeriodFilter,
  sortType,
  setSortType,
  onReset,
  onDownloadCsv,
  filteredLogs,
  totalPages,
  message,
  studentMap,
  editingId,
  editForm,
  setEditForm,
  startEdit,
  cancelEdit,
  saveEdit,
  handleDelete,
  handleResetVerifyCode,
}) {
  const recordCount = filteredLogs.length;

  const averagePages =
    recordCount === 0 ? 0 : Math.round(totalPages / recordCount);

  const topStudentInLogs = filteredLogs.reduce((acc, log) => {
    const key = log.student_id;

    if (!acc[key]) {
      acc[key] = {
        student_id: key,
        name: studentMap[key] || "-",
        pages: 0,
      };
    }

    acc[key].pages += Number(log.pages || 0);
    return acc;
  }, {});

  const topStudent = Object.values(topStudentInLogs).sort(
    (a, b) => b.pages - a.pages
  )[0];

  return (
    <section className="adminLogsPanel">
      <div className="panelSectionHeader">
        <div>
          <h2>사용 기록</h2>
          <p>학생별 프린터 사용 내역을 검색, 수정, 삭제할 수 있습니다.</p>
        </div>
      </div>

      <AdminLogControls
        searchText={searchText}
        setSearchText={setSearchText}
        periodFilter={periodFilter}
        setPeriodFilter={setPeriodFilter}
        sortType={sortType}
        setSortType={setSortType}
        onReset={onReset}
        onDownloadCsv={onDownloadCsv}
      />

      <div className="logSummaryCards adminMetricCards">
        <div className="logSummaryCard adminMetricCard">
          <span>기록 건수</span>
          <strong>{recordCount}건</strong>
        </div>

        <div className="logSummaryCard adminMetricCard">
          <span>총 사용 장수</span>
          <strong>{totalPages}장</strong>
        </div>

        <div className="logSummaryCard adminMetricCard">
          <span>평균 사용 장수</span>
          <strong>{averagePages}장</strong>
        </div>

        <div className="logSummaryCard adminMetricCard wide">
          <span>최다 사용 학생</span>
          <strong>
            {topStudent
              ? `${topStudent.student_id} ${topStudent.name} / ${topStudent.pages}장`
              : "-"}
          </strong>
        </div>
      </div>

      {message && <p className="adminPanelMessage">{message}</p>}

      <div className="adminTableSection">
        <div className="tableSectionHeader">
          <h3>기록 목록</h3>
          <span>{recordCount}건 표시 중</span>
        </div>

        <AdminLogsTable
          filteredLogs={filteredLogs}
          studentMap={studentMap}
          editingId={editingId}
          editForm={editForm}
          setEditForm={setEditForm}
          startEdit={startEdit}
          cancelEdit={cancelEdit}
          saveEdit={saveEdit}
          handleDelete={handleDelete}
          handleResetVerifyCode={handleResetVerifyCode}
        />
      </div>
    </section>
  );
}

export default AdminLogsPanel;