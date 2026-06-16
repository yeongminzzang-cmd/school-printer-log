function MonthlyUsageLineChart({ monthlyUsage = [] }) {
  if (monthlyUsage.length === 0) {
    return <p className="chartEmptyText">조회된 기록이 없습니다.</p>;
  }

  const width = 640;
  const height = 240;
  const paddingX = 44;
  const paddingY = 36;

  const maxPages = Math.max(...monthlyUsage.map((item) => item.pages), 1);
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = monthlyUsage.map((item, index) => {
    const x =
      monthlyUsage.length === 1
        ? width / 2
        : paddingX + (chartWidth / (monthlyUsage.length - 1)) * index;

    const y = paddingY + chartHeight * (1 - item.pages / maxPages);

    return {
      ...item,
      x,
      y,
    };
  });

  const polylinePoints = points
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  return (
    <div className="monthlyLineChart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        <title>월별 프린터 사용량 추이</title>

        <line
          x1={paddingX}
          y1={height - paddingY}
          x2={width - paddingX}
          y2={height - paddingY}
          className="chartAxis"
        />

        <line
          x1={paddingX}
          y1={paddingY}
          x2={paddingX}
          y2={height - paddingY}
          className="chartAxis"
        />

        <text x={paddingX - 8} y={paddingY + 4} className="chartMaxLabel">
          {maxPages}장
        </text>

        {points.length >= 2 && (
          <polyline
            points={polylinePoints}
            fill="none"
            className="chartLine"
          />
        )}

        {points.map((point) => (
          <g key={point.month}>
            <circle cx={point.x} cy={point.y} r="5" className="chartDot" />

            <text x={point.x} y={point.y - 12} className="chartValueLabel">
              {point.pages}장
            </text>

            <text
              x={point.x}
              y={height - paddingY + 24}
              className="chartMonthLabel"
            >
              {point.month}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default MonthlyUsageLineChart;