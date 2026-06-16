import { useState } from "react";
import { validateStudentId } from "../utils/student";
import { supabase } from "../supabase";

const purposes = [
  { value: "수행", label: "수행평가" },
  { value: "수업", label: "수업자료" },
  { value: "개인", label: "개인학습" },
  { value: "동아리", label: "동아리" },
  { value: "기타", label: "기타" },
];

function UserPage() {
  const [studentId, setStudentId] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [pages, setPages] = useState("");
  const [purpose, setPurpose] = useState("수행");
  const [customPurpose, setCustomPurpose] = useState("");
  const [monthlyTotal, setMonthlyTotal] = useState(null);
  const [message, setMessage] = useState("");
  const [limitBlockInfo, setLimitBlockInfo] = useState(null);

  const handleStudentIdChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setStudentId(value);
    setMonthlyTotal(null);
    setMessage("");
    setLimitBlockInfo(null);
  };

  const handleVerifyCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setVerifyCode(value);
    setMonthlyTotal(null);
    setMessage("");
    setLimitBlockInfo(null);
  };

  const handlePagesChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setPages(value);
    setLimitBlockInfo(null);
  };

  const validateVerifyCode = () => {
    if (verifyCode.length !== 4) {
      setMessage("생일 4자리를 입력해주세요. 예: 0315");
      return false;
    }

    return true;
  };

  const handleCheckMonthlyTotal = async () => {
    if (!validateStudentId(studentId)) {
      setMessage("올바른 학번을 입력해주세요. 예: 3105");
      return;
    }

    if (!validateVerifyCode()) {
      return;
    }

    const { data, error } = await supabase.rpc("get_monthly_total_verified", {
      input_student_id: studentId,
      input_verify_code: verifyCode,
    });

    if (error) {
      console.error(error);
      setMonthlyTotal(null);
      setMessage("학번 또는 생일 4자리가 올바르지 않습니다.");
      return;
    }

    setMonthlyTotal(data ?? 0);
    setMessage("이번 달 누적 장수를 조회했습니다.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStudentId(studentId)) {
      setMessage("올바른 학번을 입력해주세요. 예: 3105");
      return;
    }

    if (!validateVerifyCode()) {
      return;
    }

    if (!pages || Number(pages) <= 0) {
      setMessage("프린트 매수는 1장 이상 입력해주세요.");
      return;
    }

    if (purpose === "기타" && customPurpose.trim() === "") {
      setMessage("기타 용도를 입력해주세요.");
      return;
    }

    const { error } = await supabase.rpc("create_print_log_verified", {
      input_student_id: studentId,
      input_verify_code: verifyCode,
      input_pages: Number(pages),
      input_purpose: purpose,
      input_custom_purpose: purpose === "기타" ? customPurpose.trim() : null,
    });

    if (error) {
      console.error(error);

      const errorText = [
        error.message,
        error.details,
        error.hint,
        error.code,
      ]
        .filter(Boolean)
        .join(" ");

      if (errorText.includes("MONTHLY_LIMIT_EXCEEDED")) {
        const match = errorText.match(
          /MONTHLY_LIMIT_EXCEEDED\|([^|]+)\|([^|]+)\|([^|]+)\|([^|\s]+)/
        );

        if (match) {
          const [, limit, current, input, remaining] = match;

          setLimitBlockInfo({
            limit,
            current,
            input,
            remaining,
          });
        } else {
          setLimitBlockInfo({
            limit: "-",
            current: "-",
            input: pages || "-",
            remaining: "0",
          });
        }

        setMessage("");
        return;
      }

      setLimitBlockInfo(null);
      setMessage("등록 중 오류가 발생했습니다.");
      return;
    }

    setMessage("사용 기록이 등록되었습니다.");
    setStudentId("");
    setVerifyCode("");
    setPages("");
    setPurpose("수행");
    setCustomPurpose("");
    setMonthlyTotal(null);
    setLimitBlockInfo(null);
  };

  return (
    <main className="page userPage">
      <section className="card userCard">
        <div className="userHeader">
          <p className="userEyebrow">Printer Log</p>
          <h1>학교 프린터 사용일지</h1>
          <p className="subText">
            학번과 생일 4자리로 본인 확인 후 사용 기록을 등록합니다.
          </p>
        </div>

        {limitBlockInfo && (
          <div className="limitBlockedBox">
            <div className="limitBlockedTitle">
              <span>등록 불가</span>
              <h2>월 사용 제한 초과</h2>
            </div>

            <p>
              이번 달 프린터 사용 가능 장수를 초과하여 등록할 수 없습니다.
            </p>

            <div className="limitBlockedInfo">
              <div>
                <span>월 제한</span>
                <strong>{limitBlockInfo.limit}장</strong>
              </div>

              <div>
                <span>현재 사용량</span>
                <strong>{limitBlockInfo.current}장</strong>
              </div>

              <div>
                <span>입력 장수</span>
                <strong>{limitBlockInfo.input}장</strong>
              </div>

              <div>
                <span>남은 가능 장수</span>
                <strong>{limitBlockInfo.remaining}장</strong>
              </div>
            </div>

            <p className="limitBlockedGuide">
              사용이 필요한 경우 관리자에게 확인해 주세요.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form userForm">
          <div className="formSection">
            <label>
              <span className="fieldText">학번</span>
              <div className="row checkRow">
                <input
                  type="text"
                  value={studentId}
                  onChange={handleStudentIdChange}
                  placeholder="예: 3105"
                  inputMode="numeric"
                />
                <button
                  type="button"
                  className="checkButton"
                  onClick={handleCheckMonthlyTotal}
                >
                  이번 달 조회
                </button>
              </div>
            </label>

            <label>
              <span className="fieldText">생일 4자리</span>
              <input
                type="text"
                value={verifyCode}
                onChange={handleVerifyCodeChange}
                placeholder="예: 0315"
                inputMode="numeric"
              />
            </label>
          </div>

          {monthlyTotal !== null && (
            <div className="monthlyBox">
              <span>이번 달 누적 사용량</span>
              <strong>{monthlyTotal}장</strong>
            </div>
          )}

          <div className="formSection">
            <label>
              <span className="fieldText">프린트 매수</span>
              <input
                type="text"
                value={pages}
                onChange={handlePagesChange}
                placeholder="예: 5"
                inputMode="numeric"
              />
            </label>

            <label>
              <span className="fieldText">용도</span>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              >
                {purposes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            {purpose === "기타" && (
              <label>
                <span className="fieldText">기타 용도</span>
                <input
                  type="text"
                  value={customPurpose}
                  onChange={(e) => setCustomPurpose(e.target.value)}
                  placeholder="용도를 입력하세요"
                />
              </label>
            )}
          </div>

          <button type="submit" className="submitButton">
            등록하기
          </button>
        </form>

        {message && <p className="message">{message}</p>}
      </section>
    </main>
  );
}

export default UserPage;