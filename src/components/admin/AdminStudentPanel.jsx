import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

function getCurrentYearMonth() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function AdminStudentPanel({ onSelectStudent }) {
  const [yearMonth, setYearMonth] = useState(getCurrentYearMonth());
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("all");
  const [studentSortType, setStudentSortType] = useState("student_asc");
  const [studentSearchText, setStudentSearchText] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.rpc("get_student_manage_list", {
      input_year_month: yearMonth,
    });

    setLoading(false);

    if (error) {
      console.error(error);
      setMessage("학생 관리 목록을 불러오는 중 오류가 발생했습니다.");
      return;
    }

    setStudents(data || []);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearch = () => {
    fetchStudents();
  };

  const handleResetVerifyCode = async (student) => {
    if (!student.verify_code_set) {
      return;
    }

    const ok = window.confirm(
      `${student.student_id} ${student.name} 학생의 생일 4자리 인증을 초기화할까요?\n\n초기화 후 학생이 다음에 입력한 생일 4자리가 새로 저장됩니다.`
    );

    if (!ok) return;

    const { error } = await supabase.rpc("reset_student_verify_code", {
      input_student_id: student.student_id,
    });

    if (error) {
      console.error(error);
      alert("생일 4자리 초기화 중 오류가 발생했습니다.");
      return;
    }

    alert("생일 4자리 인증이 초기화되었습니다.");
    fetchStudents();
  };

  const filteredStudents = students
    .filter((student) => {
      if (selectedClass === "all") {
        return true;
      }

      return student.student_id.slice(1, 2) === selectedClass;
    })
    .filter((student) => {
      const keyword = studentSearchText.trim();

      if (!keyword) {
        return true;
      }

      return student.student_id.includes(keyword) || student.name.includes(keyword);
    })
    .sort((a, b) => {
      switch (studentSortType) {
        case "student_asc":
          return a.student_id.localeCompare(b.student_id);

        case "pages_desc":
          return Number(b.monthly_pages || 0) - Number(a.monthly_pages || 0);

        case "pages_asc":
          return Number(a.monthly_pages || 0) - Number(b.monthly_pages || 0);

        default:
          return a.student_id.localeCompare(b.student_id);
      }
    });

  const classCounts = {
    all: students.length,
    1: students.filter((student) => student.student_id.slice(1, 2) === "1").length,
    2: students.filter((student) => student.student_id.slice(1, 2) === "2").length,
    3: students.filter((student) => student.student_id.slice(1, 2) === "3").length,
  };

  const registeredCount = filteredStudents.filter(
    (student) => student.verify_code_set
  ).length;

  const unregisteredCount = filteredStudents.filter(
    (student) => !student.verify_code_set
  ).length;

  const selectedMonthlyTotal = filteredStudents.reduce(
    (sum, student) => sum + Number(student.monthly_pages || 0),
    0
  );

  const downloadStudentCsv = () => {
    if (filteredStudents.length === 0) {
      alert("다운로드할 학생 목록이 없습니다.");
      return;
    }

    const headers = ["조회월", "학번", "이름", "생일등록상태", "선택월사용량"];

    const rows = filteredStudents.map((student) => [
      yearMonth,
      student.student_id,
      student.name,
      student.verify_code_set ? "등록됨" : "미등록",
      student.monthly_pages,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")
      )
      .join("\n");

    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const classLabel = selectedClass === "all" ? "전체" : `${selectedClass}반`;

    link.href = url;
    link.download = `students_${yearMonth}_${classLabel}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <section className="adminStudentPanel">
      <div className="panelSectionHeader">
        <div>
          <h2>학생 관리</h2>
          <p>학생별 생일 인증 상태와 선택 월 사용량을 확인합니다.</p>
        </div>
      </div>

      <div className="studentManageHeader studentControls">
        <label>
          <span>조회 월</span>
          <input
            type="month"
            value={yearMonth}
            onChange={(e) => setYearMonth(e.target.value)}
          />
        </label>

        <label>
          <span>학생 검색</span>
          <input
            type="text"
            placeholder="이름 또는 학번"
            value={studentSearchText}
            onChange={(e) => setStudentSearchText(e.target.value.slice(0, 20))}
          />
        </label>

        <label>
          <span>정렬</span>
          <select
            value={studentSortType}
            onChange={(e) => setStudentSortType(e.target.value)}
          >
            <option value="student_asc">학번순</option>
            <option value="pages_desc">월 사용량 많은순</option>
            <option value="pages_asc">월 사용량 적은순</option>
          </select>
        </label>

        <div className="studentControlActions">
          <button type="button" className="searchButton" onClick={handleSearch}>
            조회
          </button>

          <button type="button" className="csvButton" onClick={downloadStudentCsv}>
            CSV 다운로드
          </button>
        </div>
      </div>

      <div className="classTabs studentClassTabs">
        <button
          type="button"
          className={selectedClass === "all" ? "active" : ""}
          onClick={() => setSelectedClass("all")}
        >
          전체 <strong>{classCounts.all}</strong>
        </button>

        <button
          type="button"
          className={selectedClass === "1" ? "active" : ""}
          onClick={() => setSelectedClass("1")}
        >
          1반 <strong>{classCounts[1]}</strong>
        </button>

        <button
          type="button"
          className={selectedClass === "2" ? "active" : ""}
          onClick={() => setSelectedClass("2")}
        >
          2반 <strong>{classCounts[2]}</strong>
        </button>

        <button
          type="button"
          className={selectedClass === "3" ? "active" : ""}
          onClick={() => setSelectedClass("3")}
        >
          3반 <strong>{classCounts[3]}</strong>
        </button>
      </div>

      <div className="studentSummaryCards adminMetricCards">
        <div className="studentSummaryCard adminMetricCard">
          <span>표시 학생 수</span>
          <strong>{filteredStudents.length}명</strong>
        </div>

        <div className="studentSummaryCard adminMetricCard">
          <span>생일 등록</span>
          <strong>{registeredCount}명</strong>
        </div>

        <div className="studentSummaryCard adminMetricCard">
          <span>생일 미등록</span>
          <strong>{unregisteredCount}명</strong>
        </div>

        <div className="studentSummaryCard adminMetricCard">
          <span>선택 월 사용량</span>
          <strong>{selectedMonthlyTotal}장</strong>
        </div>
      </div>

      {message && <p className="adminPanelMessage error">{message}</p>}
      {loading && <p className="adminPanelMessage">불러오는 중...</p>}

      <div className="adminTableSection">
        <div className="tableSectionHeader">
          <h3>학생 목록</h3>
          <span>{filteredStudents.length}명 표시 중</span>
        </div>

        <div className="tableWrap studentTableWrap">
          <table className="studentManageTable">
            <thead>
              <tr>
                <th>학번</th>
                <th>이름</th>
                <th>생일 등록 상태</th>
                <th>선택 월 사용량</th>
                <th>관리</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.student_id}>
                  <td>
                    <button
                      type="button"
                      className="studentLinkButton"
                      onClick={() => {
                        if (onSelectStudent) {
                          onSelectStudent(student.student_id);
                        }
                      }}
                    >
                      {student.student_id}
                    </button>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="studentLinkButton"
                      onClick={() => {
                        if (onSelectStudent) {
                          onSelectStudent(student.student_id);
                        }
                      }}
                    >
                      {student.name}
                    </button>
                  </td>

                  <td>
                    {student.verify_code_set ? (
                      <span className="statusBadge active">등록됨</span>
                    ) : (
                      <span className="statusBadge inactive">미등록</span>
                    )}
                  </td>

                  <td className="pagesCell">
                    <strong>{student.monthly_pages}장</strong>
                  </td>

                  <td>
                    {student.verify_code_set ? (
                      <button
                        type="button"
                        className="resetCodeButton"
                        onClick={() => handleResetVerifyCode(student)}
                      >
                        생일 초기화
                      </button>
                    ) : (
                      <span className="emptyActionText">-</span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="emptyTableCell">
                    조회된 학생이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default AdminStudentPanel;