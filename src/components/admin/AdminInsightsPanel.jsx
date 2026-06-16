import MonthlyUsageLineChart from "./MonthlyUsageLineChart";

function AdminInsightsPanel({
  monthlyLimit,
  limitInput,
  setLimitInput,
  onSaveMonthlyLimit,
  totalPages,
  topStudent,
  topPurpose,
  topStudents,
  classUsage,
  purposeUsage,
  monthlyUsage,
  overLimitStudents,
  warningRecords,
  searchText,
  periodFilter,
  onResetFilters,
  onSelectStudent,
}) {
  return (
    <section className="adminInsightsPanel">
      <div className="panelSectionHeader">
        <div>
          <h2>인사이트</h2>
          <p>현재 조회 기준에 따른 사용량, 초과 학생, 주의 기록을 확인합니다.</p>
        </div>
      </div>

      <div className="insightFilterInfo insightInfoBox">
        <div>
          <strong>현재 인사이트 기준</strong>
          <p>
            검색어: {searchText ? searchText : "전체"} / 기간:{" "}
            {periodFilter ? periodFilter : "전체"}
          </p>
        </div>

        <button type="button" onClick={onResetFilters}>
          전체 기준으로 보기
        </button>
      </div>

      <div className="limitSettingBox insightLimitSetting">
        <label>
          <span>월 사용 초과 기준</span>
          <input
            type="text"
            value={limitInput}
            onChange={(e) =>
              setLimitInput(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            inputMode="numeric"
          />
        </label>

        <button type="button" onClick={onSaveMonthlyLimit}>
          기준 저장
        </button>
      </div>

      <div className="insightCards adminMetricCards">
        <div className="insightCard adminMetricCard">
          <span>조회 기준 총 사용량</span>
          <strong>{totalPages}장</strong>
        </div>

        <div className="insightCard adminMetricCard wide">
          <span>가장 많이 사용한 학생</span>
          <strong>
            {topStudent
              ? `${topStudent.student_id} ${topStudent.name} / ${topStudent.pages}장`
              : "기록 없음"}
          </strong>
        </div>

        <div className="insightCard adminMetricCard">
          <span>가장 많이 사용한 용도</span>
          <strong>
            {topPurpose
              ? `${topPurpose.purpose} / ${topPurpose.pages}장`
              : "기록 없음"}
          </strong>
        </div>
      </div>

      <div className="insightGrid">
        <div className="rankingBox insightPanelBox">
          <strong>많이 사용한 학생 TOP 5</strong>

          {topStudents.length > 0 ? (
            <ol className="rankingList">
              {topStudents.map((student) => (
                <li key={student.student_id}>
                  <button
                    type="button"
                    className="rankingStudentButton"
                    onClick={() => onSelectStudent(student.student_id)}
                  >
                    {student.student_id} {student.name}
                  </button>

                  <strong>{student.pages}장</strong>
                </li>
              ))}
            </ol>
          ) : (
            <p className="emptyPanelText">조회된 기록이 없습니다.</p>
          )}
        </div>

        <div className="rankingBox insightPanelBox">
          <strong>반별 사용량</strong>

          <div className="classUsageList">
            {classUsage.map((item) => (
              <div key={item.classNo} className="classUsageItem">
                <span>{item.classNo}반</span>

                <div className="classUsageBarWrap">
                  <div
                    className="classUsageBar"
                    style={{
                      width: `${
                        totalPages > 0 ? (item.pages / totalPages) * 100 : 0
                      }%`,
                    }}
                  />
                </div>

                <strong>{item.pages}장</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="rankingBox insightPanelBox">
          <strong>용도별 사용량</strong>

          <div className="classUsageList">
            {purposeUsage.map((item) => (
              <div
                key={item.purpose}
                className="classUsageItem purposeUsageItem"
              >
                <span>{item.purpose}</span>

                <div className="classUsageBarWrap">
                  <div
                    className="classUsageBar"
                    style={{
                      width: `${
                        totalPages > 0 ? (item.pages / totalPages) * 100 : 0
                      }%`,
                    }}
                  />
                </div>

                <strong>{item.pages}장</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="rankingBox insightPanelBox">
          <strong>월별 사용량 추이</strong>
          <MonthlyUsageLineChart monthlyUsage={monthlyUsage} />
        </div>
      </div>

      <div className="warningBox insightWarningBox">
        <strong>주의 기록</strong>

        {warningRecords.length > 0 ? (
          <div className="warningList">
            {warningRecords.map((item) => (
              <button
                key={item.key}
                type="button"
                className="warningItem"
                onClick={() => {
                  if (onSelectStudent) {
                    onSelectStudent(item.student_id);
                  }
                }}
              >
                <span>
                  {item.student_id} {item.name}
                </span>
                <strong>{item.message}</strong>
              </button>
            ))}
          </div>
        ) : (
          <p className="emptyPanelText">주의할 기록이 없습니다.</p>
        )}
      </div>

      {overLimitStudents.length > 0 ? (
        <div className="limitBox insightLimitBox">
          <strong>{monthlyLimit}장 이상 사용 학생</strong>

          <div className="limitList">
            {overLimitStudents.map((student) => (
              <button
                key={student.student_id}
                type="button"
                className="limitItem"
                onClick={() => onSelectStudent(student.student_id)}
              >
                {student.student_id} {student.name} {student.pages}장
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="summaryBox insightEmptyLimitBox">
          {monthlyLimit}장 이상 사용한 학생이 없습니다.
        </div>
      )}
    </section>
  );
}

export default AdminInsightsPanel;