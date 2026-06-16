import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";
import { parseStudentId, validateStudentId } from "../utils/student";
import AdminTopBar from "../components/admin/AdminTopBar";
import AdminTabs from "../components/admin/AdminTabs";
import AdminInsightsPanel from "../components/admin/AdminInsightsPanel";
import AdminLogsPanel from "../components/admin/AdminLogsPanel";
import AdminStudentPanel from "../components/admin/AdminStudentPanel";

const purposes = ["수행평가", "수업자료", "개인학습", "동아리", "기타"];
const LARGE_PRINT_THRESHOLD = 20;
const DAILY_PRINT_THRESHOLD = 30;

function getDateKey(dateValue) {
  const d = new Date(dateValue);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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

export default function AdminPage() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin";
    };  
  const [logs, setLogs] = useState([]);
  const [studentMap, setStudentMap] = useState({});
  const [adminEmail, setAdminEmail] = useState("");
  const [activeTab, setActiveTab] = useState("logs");
  const [monthlyLimit, setMonthlyLimit] = useState(50);
  const [limitInput, setLimitInput] = useState("50");
  const [message, setMessage] = useState("불러오는 중...");
  const [searchText, setSearchText] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [sortType, setSortType] = useState("date_desc");

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    student_id: "",
    pages: "",
    purpose: "수행평가",
    custom_purpose: "",
  });

  useEffect(() => {
    fetchAdminUser();
    fetchSettings();
    fetchLogs();
  }, []);

  const fetchAdminUser = async () => {
    const { data } = await supabase.auth.getUser();

    if (data.user?.email) {
      setAdminEmail(data.user.email);
    }
  };

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("app_settings")
      .select("setting_value")
      .eq("setting_key", "monthly_limit")
      .single();

    if (error) {
      console.error(error);
      return;
    }

    const value = Number(data.setting_value);

    if (!Number.isNaN(value) && value > 0) {
      setMonthlyLimit(value);
      setLimitInput(String(value));
    }
  };

  const handleSaveMonthlyLimit = async () => {
    const value = Number(limitInput);

    if (!limitInput || Number.isNaN(value) || value <= 0) {
      alert("기준 장수는 1 이상 숫자로 입력해주세요.");
      return;
    }

    const { error } = await supabase
      .from("app_settings")
      .update({
        setting_value: String(value),
        updated_at: new Date().toISOString(),
      })
      .eq("setting_key", "monthly_limit");

    if (error) {
      console.error(error);
      alert("기준 장수 저장 중 오류가 발생했습니다.");
      return;
    }

    setMonthlyLimit(value);
    alert("초과 기준 장수가 저장되었습니다.");
  };

  const fetchLogs = async () => {
    const { data: logData, error: logError } = await supabase
        .from("print_logs")
        .select("*")
        .order("created_at", { ascending: false });

    if (logError) {
        console.error(logError);
        setMessage("기록을 불러오는 중 오류가 발생했습니다.");
        return;
    }

    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("student_id, name");

    if (studentError) {
        console.error(studentError);
        setMessage("학생 명단을 불러오는 중 오류가 발생했습니다.");
        return;
    }

    const map = {};

    (studentData || []).forEach((student) => {
        map[student.student_id] = student.name;
    });

    setLogs(logData || []);
    setStudentMap(map);
    setMessage("");
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("이 기록을 삭제할까요?");
    if (!ok) return;

    const { error } = await supabase.from("print_logs").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert("삭제 중 오류가 발생했습니다.");
      return;
    }

    setLogs((prev) => prev.filter((log) => log.id !== id));
  };

  const handleResetVerifyCode = async (studentId) => {
    const ok = window.confirm(
      `${studentId} 학생의 생일 4자리 인증을 초기화할까요?\n\n초기화 후 학생이 다음에 입력한 생일 4자리가 새로 저장됩니다.`
    );

    if (!ok) return;

    const { error } = await supabase.rpc("reset_student_verify_code", {
      input_student_id: studentId,
    });

    if (error) {
      console.error(error);
      alert("생일 4자리 초기화 중 오류가 발생했습니다.");
      return;
    }

    alert("생일 4자리 인증이 초기화되었습니다.");
  };

  const startEdit = (log) => {
    setEditingId(log.id);
    setEditForm({
      student_id: log.student_id,
      pages: String(log.pages),
      purpose: log.purpose,
      custom_purpose: log.custom_purpose || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      student_id: "",
      pages: "",
      purpose: "수행평가",
      custom_purpose: "",
    });
  };

  const saveEdit = async (id) => {
    if (!validateStudentId(editForm.student_id)) {
      alert("올바른 학번을 입력해주세요. 예: 3105");
      return;
    }

    if (!editForm.pages || Number(editForm.pages) <= 0) {
      alert("프린트 매수는 1장 이상 입력해주세요.");
      return;
    }

    if (editForm.purpose === "기타" && editForm.custom_purpose.trim() === "") {
      alert("기타 용도를 입력해주세요.");
      return;
    }

    const updateData = {
      student_id: editForm.student_id,
      pages: Number(editForm.pages),
      purpose: editForm.purpose,
      custom_purpose:
        editForm.purpose === "기타" ? editForm.custom_purpose.trim() : null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("print_logs")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("수정 중 오류가 발생했습니다.");
      return;
    }

    setLogs((prev) => prev.map((log) => (log.id === id ? data : log)));
    cancelEdit();
  };

  const filteredLogs = useMemo(() => {
    let result = [...logs];

    if (searchText.trim()) {
      const keyword = searchText.trim();

      result = result.filter((log) => {
        const studentName = studentMap[log.student_id] || "";

        return (
            log.student_id.includes(keyword) ||
            studentName.includes(keyword)
        );
      });
    }

    if (periodFilter) {
      result = result.filter((log) =>
        getDateKey(log.created_at).startsWith(periodFilter)
      );
    }

    result.sort((a, b) => {
      const aStudent = parseStudentId(a.student_id);
      const bStudent = parseStudentId(b.student_id);

      switch (sortType) {
        case "date_asc":
          return new Date(a.created_at) - new Date(b.created_at);

        case "date_desc":
          return new Date(b.created_at) - new Date(a.created_at);

        case "student_asc":
          return a.student_id.localeCompare(b.student_id);

        case "student_desc":
          return b.student_id.localeCompare(a.student_id);

        case "class_asc":
          return (
            aStudent.classNo - bStudent.classNo ||
            aStudent.studentNo - bStudent.studentNo
          );

        case "pages_desc":
          return b.pages - a.pages;

        case "pages_asc":
          return a.pages - b.pages;

        default:
          return 0;
      }
    });

    return result;
  }, [logs, searchText, periodFilter, sortType, studentMap]);

  const totalPages = filteredLogs.reduce(
    (sum, log) => sum + Number(log.pages || 0),
    0
  );

  const topStudent = useMemo(() => {
    const map = {};

    filteredLogs.forEach((log) => {
      if (!map[log.student_id]) {
        map[log.student_id] = {
          student_id: log.student_id,
          name: studentMap[log.student_id] || "미등록",
          pages: 0,
        };
      }

      map[log.student_id].pages += Number(log.pages || 0);
    });

    const sorted = Object.values(map).sort((a, b) => b.pages - a.pages);

    return sorted[0] || null;
  }, [filteredLogs, studentMap]);

  const topStudents = useMemo(() => {
    const map = {};

    filteredLogs.forEach((log) => {
      if (!map[log.student_id]) {
        map[log.student_id] = {
          student_id: log.student_id,
          name: studentMap[log.student_id] || "미등록",
          pages: 0,
        };
      }

      map[log.student_id].pages += Number(log.pages || 0);
    });

    return Object.values(map)
      .sort((a, b) => b.pages - a.pages)
      .slice(0, 5);
  }, [filteredLogs, studentMap]);

  const classUsage = useMemo(() => {
    const map = {
      1: 0,
      2: 0,
      3: 0,
    };

    filteredLogs.forEach((log) => {
      const classNo = Number(log.student_id.slice(1, 2));

      if (map[classNo] !== undefined) {
        map[classNo] += Number(log.pages || 0);
      }
    });

    return Object.entries(map).map(([classNo, pages]) => ({
      classNo,
      pages,
    }));
  }, [filteredLogs]);

  const purposeUsage = useMemo(() => {
    const map = {
      수행평가: 0,
      수업자료: 0,
      개인학습: 0,
      동아리: 0,
      기타: 0,
    };

    filteredLogs.forEach((log) => {
      const purpose = log.purpose || "기타";

      if (map[purpose] !== undefined) {
        map[purpose] += Number(log.pages || 0);
      }
    });

    return Object.entries(map)
      .map(([purpose, pages]) => ({
        purpose,
        pages,
      }))
      .sort((a, b) => b.pages - a.pages);
  }, [filteredLogs]);

  const monthlyUsage = useMemo(() => {
    const map = {};

    filteredLogs.forEach((log) => {
      const d = new Date(log.created_at);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const key = `${year}-${month}`;

      if (!map[key]) {
        map[key] = 0;
      }

      map[key] += Number(log.pages || 0);
    });

    return Object.entries(map)
      .map(([month, pages]) => ({
        month,
        pages,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredLogs]);

  const warningRecords = useMemo(() => {
    const warnings = [];

    filteredLogs.forEach((log) => {
      if (Number(log.pages || 0) >= LARGE_PRINT_THRESHOLD) {
        warnings.push({
          type: "large",
          key: `large-${log.id}`,
          student_id: log.student_id,
          name: studentMap[log.student_id] || "미등록",
          message: `한 번에 ${log.pages}장 등록`,
        });
      }
    });

    const dailyMap = {};

    filteredLogs.forEach((log) => {
      const dateKey = getDateKey(log.created_at);
      const key = `${log.student_id}-${dateKey}`;

      if (!dailyMap[key]) {
        dailyMap[key] = {
          student_id: log.student_id,
          name: studentMap[log.student_id] || "미등록",
          date: dateKey,
          pages: 0,
        };
      }

      dailyMap[key].pages += Number(log.pages || 0);
    });

    Object.values(dailyMap).forEach((item) => {
      if (item.pages >= DAILY_PRINT_THRESHOLD) {
        warnings.push({
          type: "daily",
          key: `daily-${item.student_id}-${item.date}`,
          student_id: item.student_id,
          name: item.name,
          message: `${item.date} 하루 ${item.pages}장 사용`,
        });
      }
    });

    return warnings.slice(0, 10);
  }, [filteredLogs, studentMap]);
    

  const topPurpose = useMemo(() => {
    const map = {};

    filteredLogs.forEach((log) => {
      const key = log.purpose || "미입력";

      if (!map[key]) {
        map[key] = {
          purpose: key,
          pages: 0,
        };
      }

      map[key].pages += Number(log.pages || 0);
    });

    const sorted = Object.values(map).sort((a, b) => b.pages - a.pages);

    return sorted[0] || null;
  }, [filteredLogs]);

  const overLimitStudents = useMemo(() => {
    const map = {};

    filteredLogs.forEach((log) => {
      if (!map[log.student_id]) {
        map[log.student_id] = {
          student_id: log.student_id,
          name: studentMap[log.student_id] || "미등록",
          pages: 0,
        };
      }

      map[log.student_id].pages += Number(log.pages || 0);
    });

    return Object.values(map)
      .filter((student) => student.pages >= monthlyLimit)
      .sort((a, b) => b.pages - a.pages);
  }, [filteredLogs, studentMap, monthlyLimit]);

  const downloadCsv = () => {
    if (filteredLogs.length === 0) {
        alert("다운로드할 기록이 없습니다.");
        return;
    }

    const headers = [
        "날짜/시간",
        "학번",
        "이름",
        "매수",
        "용도",
        "기타용도",
    ];

    const rows = filteredLogs.map((log) => {
        const student = parseStudentId(log.student_id);
        const date = new Date(log.created_at).toLocaleString("ko-KR");

        return [
        date,
        log.student_id,
        studentMap[log.student_id] || "미등록",
        log.pages,
        log.purpose,
        log.custom_purpose || "",
        ];
    });

    const csvContent = [headers, ...rows]
        .map((row) =>
        row
            .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
            .join(",")
        )
        .join("\n");

    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], {
        type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const today = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `printer_logs_${today}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleSelectStudent = (studentId) => {
    setSearchText(studentId);
    setActiveTab("logs");
  };

  return (
    <main className="adminPage adminShell">
      <AdminTopBar adminEmail={adminEmail} onLogout={handleLogout} />

      <section className="adminCard adminMainCard">
        <div className="adminHeader">
          <div>
            <p className="adminEyebrow">Admin Dashboard</p>
            <h1>프린터 사용 기록 관리</h1>
            <p className="adminSubtitle">
              학생별 프린터 사용량, 월 제한, 사용 기록을 관리합니다.
            </p>
          </div>
        </div>

        <AdminTabs activeTab={activeTab} onChangeTab={setActiveTab} />

        <div className="adminContent">
          {activeTab === "logs" && (
            <AdminLogsPanel
              searchText={searchText}
              setSearchText={setSearchText}
              periodFilter={periodFilter}
              setPeriodFilter={setPeriodFilter}
              sortType={sortType}
              setSortType={setSortType}
              onReset={() => {
                setSearchText("");
                setPeriodFilter("");
                setSortType("date_desc");
              }}
              onDownloadCsv={downloadCsv}
              filteredLogs={filteredLogs}
              totalPages={totalPages}
              message={message}
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
          )}

          {activeTab === "insights" && (
            <AdminInsightsPanel
              monthlyLimit={monthlyLimit}
              limitInput={limitInput}
              setLimitInput={setLimitInput}
              onSaveMonthlyLimit={handleSaveMonthlyLimit}
              totalPages={totalPages}
              topStudent={topStudent}
              topPurpose={topPurpose}
              topStudents={topStudents}
              classUsage={classUsage}
              purposeUsage={purposeUsage}
              monthlyUsage={monthlyUsage}
              overLimitStudents={overLimitStudents}
              warningRecords={warningRecords}
              searchText={searchText}
              periodFilter={periodFilter}
              onResetFilters={() => {
                setSearchText("");
                setPeriodFilter("");
                setSortType("date_desc");
              }}
              onSelectStudent={handleSelectStudent}
            />
          )}

          {activeTab === "students" && (
            <AdminStudentPanel onSelectStudent={handleSelectStudent} />
          )}
        </div>
      </section>
    </main>
  );
}