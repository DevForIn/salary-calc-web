import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { calculateSalary } from '../salaryCalc';
import { won } from '../utils';

// 표에 넣을 연봉 목록 (만원): 2000~15000, 100만원 단위
const SALARIES: number[] = (() => {
  const arr: number[] = [];
  for (let m = 2000; m <= 10000; m += 100) arr.push(m);
  // 1억 초과는 간격 넓게
  [11000, 12000, 13000, 15000, 20000].forEach((m) => arr.push(m));
  return arr;
})();

const BASE = { weeklyHours: 40, nonTaxMonthly: 200000, dependents: 1, children: 0 };

interface Row {
  annual: number;
  netMonthly: number;
  netAnnual: number;
  topPercent: number;
  grade: string;
  emoji: string;
}

function buildRows(): Row[] {
  return SALARIES.map((annual) => {
    const r = calculateSalary({ ...BASE, annualManwon: annual });
    return {
      annual,
      netMonthly: r.netMonthly,
      netAnnual: r.netAnnual,
      topPercent: r.topPercent,
      grade: r.rank.grade,
      emoji: r.rank.emoji,
    };
  });
}

// 등급 그룹의 상위% 라벨
// isTop(최상위 등급): "상위 N% 이내", isBottom(최하위): "상위 N% 이하", 중간: 범위
function topRangeLabel(rows: Row[], isTop: boolean, isBottom: boolean): string {
  const percents = rows.map((r) => r.topPercent);
  const min = Math.min(...percents);
  const max = Math.max(...percents);
  if (isBottom) return `상위 ${min}% 이하`;
  if (isTop) return `상위 ${max}% 이내`;
  if (min === max) return `상위 ${max}%`;
  return `상위 ${min}~${max}%`;
}

function label(manwon: number): string {
  if (manwon >= 10000) {
    const eok = Math.floor(manwon / 10000);
    const rest = manwon % 10000;
    return rest > 0 ? `${eok}억 ${rest.toLocaleString('ko-KR')}만` : `${eok}억`;
  }
  return `${manwon.toLocaleString('ko-KR')}만원`;
}

export function SalaryTable() {
  const [view, setView] = useState<'grade' | 'all'>('grade');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const rows = buildRows();
  const rowsDesc = [...rows].reverse(); // 높은 연봉부터

  // 등급별 그룹핑 (높은 연봉 순)
  const groups: { grade: string; emoji: string; rows: Row[] }[] = [];
  for (const row of rowsDesc) {
    const last = groups[groups.length - 1];
    if (last && last.grade === row.grade) last.rows.push(row);
    else groups.push({ grade: row.grade, emoji: row.emoji, rows: [row] });
  }

  function toggle(grade: string) {
    setCollapsed((c) => ({ ...c, [grade]: !c[grade] }));
  }

  return (
    <div className="wrap">
      <Head>
        <title>2026 연봉별 실수령액 표 - 월급 전투력 등급별 정리 | 월급력 측정기</title>
        <meta name="description" content="2026년 기준 연봉별 실수령액을 한눈에! 연봉 2000만원부터 1억5000만원까지 월/연 실수령액과 4대보험·세금 공제 반영. 전투력 등급별로 정리." />
        <link rel="canonical" href="https://pay-scouter.com/salary-table" />
      </Head>

      <header className="hero">
        <div className="badge-top">⚡ 2026년 기준</div>
        <h1>연봉별 실수령액 표</h1>
        <p className="sub">내 연봉은 어느 등급? 연봉별 실수령액을 <b>전투력 등급</b>으로 정리했어요.</p>
      </header>

      <div className="table-toggle">
        <button className={view === 'grade' ? 'on' : ''} onClick={() => setView('grade')}>⚔️ 등급별 보기</button>
        <button className={view === 'all' ? 'on' : ''} onClick={() => setView('all')}>📋 한번에 보기</button>
      </div>

      {view === 'grade' ? (
        <div className="grade-groups">
          {groups.map((g, gi) => {
            const isCollapsed = collapsed[g.grade];
            return (
              <div key={g.grade} className="grade-group">
                <button className="grade-head" onClick={() => toggle(g.grade)}>
                  <span className="gg-emoji">{g.emoji}</span>
                  <span className="gg-name">{g.grade}</span>
                  <span className="gg-top">{topRangeLabel(g.rows, gi === 0, gi === groups.length - 1)}</span>
                  <span className="gg-arrow">{isCollapsed ? '▼' : '▲'}</span>
                </button>
                {!isCollapsed && (
                  <table className="salary-tbl">
                    <thead><tr><th>연봉</th><th>월 실수령</th><th>연 실수령</th></tr></thead>
                    <tbody>
                      {g.rows.map((r) => (
                        <tr key={r.annual}>
                          <td>{label(r.annual)}</td>
                          <td>{won(r.netMonthly)}</td>
                          <td className="muted-cell">{won(r.netAnnual)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <table className="salary-tbl full">
          <thead><tr><th>연봉</th><th>월 실수령</th><th>연 실수령</th><th>등급</th></tr></thead>
          <tbody>
            {rowsDesc.map((r) => (
              <tr key={r.annual}>
                <td>{label(r.annual)}</td>
                <td>{won(r.netMonthly)}</td>
                <td className="muted-cell">{won(r.netAnnual)}</td>
                <td>{r.emoji}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <section className="seo-content">
        <p className="note">
          ※ 비과세 식대 월 20만원, 부양가족 1인(본인), 자녀 0명 기준입니다.
          부양가족·자녀·비과세액에 따라 실수령액은 달라지므로 정확한 금액은 계산기를 이용하세요.
          상위 %는 국세청 통계 기반 추정치입니다.
        </p>
        <Link to="/" className="to-calc-btn">📡 내 연봉으로 정확히 측정하기</Link>
      </section>

      <footer>© 2026 월급력 측정기 (pay-scouter) · 연봉 실수령액 계산기 · by DevForIn</footer>
    </div>
  );
}
