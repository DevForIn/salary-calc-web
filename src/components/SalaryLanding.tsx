import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { calculateSalary } from '../salaryCalc';
import { won } from '../utils';

// 랜딩으로 만들 연봉 목록 (만원) — 검색량 큰 라운드 넘버 위주
export const SALARY_LANDINGS: number[] = [
  2400, 2600, 2800, 3000, 3200, 3400, 3600, 3800,
  4000, 4200, 4500, 4800, 5000, 5500, 6000, 6500,
  7000, 8000, 9000, 10000,
];

const BASE = { weeklyHours: 40, nonTaxMonthly: 200000, dependents: 1, children: 0 };

function label(manwon: number): string {
  if (manwon >= 10000) {
    const eok = Math.floor(manwon / 10000);
    const rest = manwon % 10000;
    return rest > 0 ? `${eok}억 ${rest.toLocaleString('ko-KR')}만원` : `${eok}억원`;
  }
  return `${manwon.toLocaleString('ko-KR')}만원`;
}

export function SalaryLanding({ annual }: { annual: number }) {
  const r = calculateSalary({ ...BASE, annualManwon: annual });
  const name = label(annual);

  // 주변 연봉 비교 (±)
  const neighbors = [annual - 500, annual - 200, annual, annual + 200, annual + 500]
    .filter((m) => m >= 2000 && m <= 15000);

  const title = `연봉 ${name} 실수령액 (2026년 기준) | 월급력 측정기`;
  const desc = `연봉 ${name}의 2026년 실수령액은 월 ${won(r.netMonthly)}, 연 ${won(r.netAnnual)}입니다. 4대보험·세금 공제 내역과 전투력 등급(${r.rank.grade})까지 확인하세요.`;

  return (
    <div className="wrap">
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`https://salary-calc-web.vercel.app/salary/${annual}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: `연봉 ${name}의 실수령액은 얼마인가요?`,
                acceptedAnswer: { '@type': 'Answer', text: `2026년 기준(비과세 월 20만원, 부양가족 1인) 연봉 ${name}의 월 실수령액은 약 ${won(r.netMonthly)}, 연 실수령액은 약 ${won(r.netAnnual)}입니다.` },
              },
              {
                '@type': 'Question',
                name: `연봉 ${name}은 상위 몇 %인가요?`,
                acceptedAnswer: { '@type': 'Answer', text: `국세청 통계 기반 추정으로 연봉 ${name}은 대한민국 근로자 상위 약 ${r.topPercent}% 수준입니다.` },
              },
            ],
          })}
        </script>
      </Head>

      <header className="hero">
        <div className="badge-top">⚡ 2026년 기준</div>
        <h1>연봉 {name} 실수령액</h1>
        <p className="sub">연봉 {name}이면 실제로 손에 얼마 들어올까? 2026년 기준으로 계산했어요.</p>
      </header>

      {/* 핵심 실수령 */}
      <div className="net-headline">
        <div className="net-col">
          <div className="net-label">월 실수령</div>
          <div className="net-val">{won(r.netMonthly)}</div>
        </div>
        <div className="net-divider" />
        <div className="net-col">
          <div className="net-label">연 실수령</div>
          <div className="net-val accent">{won(r.netAnnual)}</div>
        </div>
      </div>

      {/* 전투력 등급 */}
      <div className="power-card">
        <div className="power-scan">전투력 측정 완료 📡</div>
        <div className="power-grade"><span className="pg-emoji">{r.rank.emoji}</span>{r.rank.grade}</div>
        <div className="power-rank-line">대한민국 근로자 <b>상위 {r.topPercent}%</b> 추정</div>
      </div>

      {/* 공제 내역 */}
      <div className="card">
        <h3 className="block-title">연봉 {name} 공제 내역 (월 기준)</h3>
        <ul className="deduction-list">
          <li><span>국민연금</span><span>{won(r.deductions.pension / 12)}</span></li>
          <li><span>건강보험</span><span>{won(r.deductions.health / 12)}</span></li>
          <li><span>장기요양</span><span>{won(r.deductions.care / 12)}</span></li>
          <li><span>고용보험</span><span>{won(r.deductions.employment / 12)}</span></li>
          <li><span>소득세</span><span>{won(r.deductions.incomeTax / 12)}</span></li>
          <li><span>지방소득세</span><span>{won(r.deductions.localTax / 12)}</span></li>
        </ul>
        <div className="ded-total"><span>월 공제 합계</span><b>{won(r.deductions.total / 12)}</b></div>
        <div className="eff-rate">실효 공제율 {(r.effectiveRate * 100).toFixed(1)}%</div>
      </div>

      {/* 주변 연봉 비교 */}
      <div className="card">
        <h3 className="block-title">주변 연봉 실수령액 비교</h3>
        <table className="salary-tbl">
          <thead><tr><th>연봉</th><th>월 실수령</th><th>연 실수령</th></tr></thead>
          <tbody>
            {neighbors.map((m) => {
              const nr = calculateSalary({ ...BASE, annualManwon: m });
              return (
                <tr key={m} style={m === annual ? { fontWeight: 800 } : undefined}>
                  <td>{label(m)}{m === annual ? ' ←' : ''}</td>
                  <td>{won(nr.netMonthly)}</td>
                  <td className="muted-cell">{won(nr.netAnnual)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="seo-content">
        <h2>연봉 {name} 실수령액, 왜 이만큼일까?</h2>
        <p>
          연봉 {name}(세전)에서 국민연금·건강보험·장기요양·고용보험(4대보험)과 소득세·지방소득세가 공제되어
          실제 손에 들어오는 금액은 월 약 {won(r.netMonthly)}입니다. 비과세 식대 월 20만원, 부양가족 1인 기준이며,
          부양가족·자녀·비과세액에 따라 실수령액은 달라집니다.
        </p>
        <p className="note">
          ※ 2026년 기준 추정치입니다. 정확한 금액은 개인 조건에 따라 다르므로 계산기를 이용하세요.
        </p>
        <Link to="/" className="to-calc-btn">📡 내 조건으로 정확히 측정하기</Link>
        <p style={{ textAlign: 'center', marginTop: 12 }}>
          <Link to="/salary-table" style={{ color: 'var(--accent2)' }}>📊 연봉별 실수령액 표 전체 보기</Link>
        </p>
      </section>

      <footer>
        © 2026 월급력 측정기 (pay-scouter) · 연봉 실수령액 계산기 · by DevForIn
        <br /><Link to="/privacy" style={{ color: 'inherit' }}>개인정보처리방침</Link>
      </footer>
    </div>
  );
}
