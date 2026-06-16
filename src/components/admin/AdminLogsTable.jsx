const purposes = ["수행평가", "수업자료", "개인학습", "동아리", "기타"];

function formatDateTime(dateValue) {
  const d = new Date(dateValue);

  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function AdminLogsTable({
  filteredLogs,
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
  return (
    <div className="tableWrap adminLogsTableWrap">
      <table className="adminLogsTable">
        <thead>
          <tr>
            <th>날짜/시간</th>
            <th>학번</th>
            <th>이름</th>
            <th>매수</th>
            <th>용도</th>
            <th>관리</th>
          </tr>
        </thead>

        <tbody>
          {filteredLogs.map((log) => {
            const date = formatDateTime(log.created_at);
            const isEditing = editingId === log.id;

            return (
              <tr key={log.id} className={isEditing ? "editingRow" : ""}>
                <td className="dateCell">{date}</td>

                <td className="studentIdCell">
                  {isEditing ? (
                    <input
                      className="editInput"
                      value={editForm.student_id}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          student_id: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 4),
                        }))
                      }
                    />
                  ) : (
                    <strong>{log.student_id}</strong>
                  )}
                </td>

                <td className="nameCell">
                  {studentMap[log.student_id] || "미등록"}
                </td>

                <td className="pagesCell">
                  {isEditing ? (
                    <input
                      className="editInput small"
                      value={editForm.pages}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          pages: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                    />
                  ) : (
                    <strong>{log.pages}장</strong>
                  )}
                </td>

                <td className="purposeCell">
                  {isEditing ? (
                    <div className="editPurposeBox">
                      <select
                        className="editSelect"
                        value={editForm.purpose}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            purpose: e.target.value,
                            custom_purpose:
                              e.target.value === "기타"
                                ? prev.custom_purpose
                                : "",
                          }))
                        }
                      >
                        {purposes.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>

                      {editForm.purpose === "기타" && (
                        <input
                          className="editInput purposeInput"
                          value={editForm.custom_purpose}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              custom_purpose: e.target.value,
                            }))
                          }
                          placeholder="기타 용도"
                        />
                      )}
                    </div>
                  ) : (
                    <span className="purposeBadge">
                      {log.purpose}
                      {log.custom_purpose ? ` - ${log.custom_purpose}` : ""}
                    </span>
                  )}
                </td>

                <td className="manageCell">
                  {isEditing ? (
                    <div className="actionButtons">
                      <button
                        type="button"
                        className="saveButton"
                        onClick={() => saveEdit(log.id)}
                      >
                        저장
                      </button>

                      <button
                        type="button"
                        className="cancelButton"
                        onClick={cancelEdit}
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <div className="actionButtons">
                      <button
                        type="button"
                        className="editButton"
                        onClick={() => startEdit(log)}
                      >
                        수정
                      </button>

                      <button
                        type="button"
                        className="deleteButton"
                        onClick={() => handleDelete(log.id)}
                      >
                        삭제
                      </button>

                      <button
                        type="button"
                        className="resetCodeButton"
                        onClick={() => handleResetVerifyCode(log.student_id)}
                      >
                        생일 초기화
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}

          {filteredLogs.length === 0 && (
            <tr>
              <td colSpan="6" className="emptyTableCell">
                조회된 기록이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminLogsTable;