import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { calculateSalary, reverseSalary, type SalaryResult } from './salaryCalc';
import { won, toKorean } from './utils';

const PRESETS = [3000, 3500, 4000, 5000, 7000, 10000];

export default function App() {
  const [annual, setAnnual] = useState(3500);
  const [weeklyHours, setWeeklyHours] = useState(40);
  const [nonTax, setNonTax] = useState(200000);
  const [dependents, setDependents] = useState(1);
  const [children, setChildren] = useState(0);
  const [result, setResult] = useState<SalaryResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLight, setIsLight] = useState(false);

  // 다크 테마 초기화 (SSR 안전)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.documentElement.classList.add('light');
      setIsLight(true);
    }
  }, []);

  function toggleTheme() {
    if (typeof window === 'undefined') return;
    const next = !isLight;
    setIsLight(next);
    document.documentElement.classList.toggle('light', next);
    localStorage.setItem('theme', next ? 'light' : 'dark');
  }

  function calculate() {
    if (annual <= 0) return;
    setResult(calculateSalary({
      annualManwon: annual,
      weeklyHours,
      nonTaxMonthly: nonTax,
      dependents,
      children,
    }));
    setTimeout(() => {
      if (typeof document !== 'undefined')
        document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  }

  return (
    <div className="wrap">
      <Head>
        <title>월급력 측정기 - 내 연봉 전투력은? | 실수령액 계산기</title>
        <meta name="description" content="연봉을 입력하면 월급 전투력을 측정합니다! 2026년 기준 실수령액, 1초에 버는 돈, 대한민국 상위 몇 %인지 전투력 등급으로 확인하세요." />
        <link rel="canonical" href="https://salary-calc-web.vercel.app/" />
      </Head>
      <header className="hero">
        <button className="theme-toggle" onClick={toggleTheme} aria-label="테마 전환">
          {isLight ? '🌙' : '☀️'}
        </button>
        <div className="badge-top">⚡ 2026년 기준 · 무료</div>
        <h1>월급력 측정기</h1>
        <p className="sub">연봉을 입력하면 너의 <b>월급 전투력</b>을 측정한다.<br/>실수령액, 1초에 버는 돈, 그리고 <b>전투력 등급</b>까지 스캔 완료 📡</p>
      </header>

      <section className="card input-card">
        <label className="fld-label">연봉 (세전)</label>
        <div className="salary-input">
          <input
            className="big-input"
            inputMode="numeric"
            size={Math.max(4, annual.toLocaleString('ko-KR').length)}
            value={annual ? annual.toLocaleString('ko-KR') : ''}
            onChange={(e) => setAnnual(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)}
          />
          <span className="unit">만원</span>
        </div>
        <div className="korean-hint">{annual > 0 ? toKorean(annual * 10000) : ' '}</div>

        <div className="presets">
          {PRESETS.map((p) => (
            <button key={p} className={`preset ${annual === p ? 'on' : ''}`} onClick={() => setAnnual(p)}>
              {p >= 10000 ? '1억' : p.toLocaleString('ko-KR')}
            </button>
          ))}
        </div>

        <button className="adv-toggle" onClick={() => setShowAdvanced((v) => !v)}>
          {showAdvanced ? '▲ 상세 옵션 접기' : '▼ 상세 옵션 (주휴·비과세·부양가족)'}
        </button>

        {showAdvanced && (
          <div className="adv-grid">
            <div className="fld">
              <label>주 근무시간</label>
              <input inputMode="numeric" value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)} />
            </div>
            <div className="fld">
              <label>월 비과세 (식대 등)</label>
              <input inputMode="numeric" value={nonTax ? nonTax.toLocaleString('ko-KR') : ''}
                onChange={(e) => setNonTax(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)} />
            </div>
            <div className="fld">
              <label>부양가족 (본인 포함)</label>
              <input inputMode="numeric" value={dependents}
                onChange={(e) => setDependents(Number(e.target.value.replace(/[^0-9]/g, '')) || 1)} />
            </div>
            <div className="fld">
              <label>20세 이하 자녀</label>
              <input inputMode="numeric" value={children}
                onChange={(e) => setChildren(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)} />
            </div>
          </div>
        )}

        <button className="calc-btn" onClick={calculate}>📡 전투력 측정하기</button>
      </section>

      {result && <ResultView result={result} baseInput={{ weeklyHours, nonTaxMonthly: nonTax, dependents, children }} />}

      <section className="seo-content">
        <h2>연봉 실수령액 계산기란?</h2>
        <p>
          연봉(세전)에서 <b>국민연금·건강보험·장기요양·고용보험(4대보험)</b>과 <b>소득세·지방소득세</b>를
          공제하고 실제로 손에 들어오는 금액이 실수령액입니다. 이 계산기는 2026년 기준 요율로
          연봉을 입력하면 월 실수령액은 물론, 초·분·시간·일 단위로 얼마를 버는지까지 계산해줍니다.
        </p>
        <p style={{ textAlign: 'center', margin: '16px 0' }}>
          <Link to="/salary-table" className="to-calc-btn">📊 연봉별 실수령액 표 한눈에 보기</Link>
        </p>
        <h3>공제 항목 (2026년 기준)</h3>
        <ul>
          <li>국민연금: 기준소득월액의 4.75% (상·하한 있음)</li>
          <li>건강보험: 보수월액의 3.595%</li>
          <li>장기요양보험: 건강보험료의 13.14%</li>
          <li>고용보험: 0.9%</li>
          <li>소득세: 과세표준 누진세율 (근로소득공제·세액공제 반영)</li>
          <li>지방소득세: 소득세의 10%</li>
        </ul>
        <p className="note">
          ※ 본 계산은 간이 추정치입니다. 실제 세액은 부양가족·연말정산·각종 공제에 따라 달라질 수 있습니다.
          상위 % 는 국세청 근로소득 통계를 기반으로 한 추정값이며 정확한 순위가 아닙니다.
        </p>
      </section>

      <footer>
        © 2026 월급력 측정기 (pay-scouter) · 연봉 실수령액 계산기 · by DevForIn
        <br />
        <Link to="/privacy" style={{ color: 'inherit' }}>개인정보처리방침</Link>
      </footer>
    </div>
  );
}

function ResultView({ result, baseInput }: {
  result: SalaryResult;
  baseInput: { weeklyHours: number; nonTaxMonthly: number; dependents: number; children: number };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(0);
  const [targetManwon, setTargetManwon] = useState(500); // 목표 월 실수령 (만원)
  const [goal, setGoal] = useState<null | {
    neededAnnual: number; gap: number; pct: number;
  }>(null);

  function calcGoal() {
    const target = targetManwon * 10000;
    if (target <= 0) return;
    const neededAnnual = reverseSalary(target, baseInput); // 만원
    const currentAnnual = result.gross / 10000;
    const gap = neededAnnual - currentAnnual;
    const pct = currentAnnual > 0 ? (gap / currentAnnual) * 100 : 0;
    setGoal({ neededAnnual, gap, pct });
  }

  // 초당 돈 실시간 카운터 (세후 초당 × 경과초) — 페이지 머문 동안 쌓임
  const perSecond = result.afterTax.perSecond;
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setLive(0);
    const start = Date.now();
    const timer = setInterval(() => {
      setLive(((Date.now() - start) / 1000) * perSecond);
    }, 50);
    return () => clearInterval(timer);
  }, [perSecond]);

  return (
    <div id="result" ref={ref}>
      {/* 전투력 등급 (스카우터 컨셉) */}
      <div className="power-card">
        <div className="power-scan">전투력 측정 완료 📡</div>
        <div className="power-grade">
          <span className="pg-emoji">{result.rank.emoji}</span>
          {result.rank.grade}
        </div>
        <div className="power-rank-line">대한민국 근로자 <b>상위 {result.topPercent}%</b> 추정</div>
        <div className="power-comment">"{result.rank.comment}"</div>
      </div>

      {/* 실시간 카운터 */}
      <div className="live-card">
        <div className="live-label">이 페이지 보는 동안 번 돈 (세후)</div>
        <div className="live-money">{won(live)}</div>
        <div className="live-sub">1초에 {won(perSecond)}씩 들어오는 중 💰</div>
      </div>

      {/* 실수령 핵심 */}
      <div className="net-headline">
        <div className="net-col">
          <div className="net-label">월 실수령</div>
          <div className="net-val">{won(result.netMonthly)}</div>
        </div>
        <div className="net-divider" />
        <div className="net-col">
          <div className="net-label">연 실수령</div>
          <div className="net-val accent">{won(result.netAnnual)}</div>
        </div>
      </div>

      {/* 시간 단위 환산 */}
      <div className="card">
        <h3 className="block-title">세후 기준, 이만큼 벌어요</h3>
        <div className="metric-grid">
          <Metric label="1시간" value={won(result.afterTax.perHour)} />
          <Metric label="하루 (8h)" value={won(result.afterTax.perDay)} />
          <Metric label="1주" value={won(result.afterTax.perWeek)} />
          <Metric label="1달" value={won(result.afterTax.perMonth)} />
        </div>
      </div>

      {/* 공제 내역 */}
      <div className="card">
        <h3 className="block-title">한 달에 이만큼 떼여요 (공제 내역)</h3>
        <ul className="deduction-list">
          <DedRow label="국민연금" v={result.deductions.pension / 12} />
          <DedRow label="건강보험" v={result.deductions.health / 12} />
          <DedRow label="장기요양" v={result.deductions.care / 12} />
          <DedRow label="고용보험" v={result.deductions.employment / 12} />
          <DedRow label="소득세" v={result.deductions.incomeTax / 12} />
          <DedRow label="지방소득세" v={result.deductions.localTax / 12} />
        </ul>
        <div className="ded-total">
          <span>월 공제 합계</span>
          <b>{won(result.deductions.total / 12)}</b>
        </div>
        <div className="eff-rate">실효 공제율 {(result.effectiveRate * 100).toFixed(1)}%</div>
      </div>

      {/* 목표 실수령 역산 */}
      <div className="card goal-card">
        <h3 className="block-title">🎯 목표 실수령액, 연봉 얼마 받아야 할까?</h3>
        <div className="goal-input-row">
          <span className="goal-pre">세후 월</span>
          <input className="goal-input" inputMode="numeric"
            value={targetManwon ? targetManwon.toLocaleString('ko-KR') : ''}
            onChange={(e) => setTargetManwon(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)} />
          <span className="goal-post">만원 받으려면?</span>
        </div>
        <button className="goal-btn" onClick={calcGoal}>계산</button>

        {goal && (
          <div className="goal-result">
            <div className="goal-main">
              필요 연봉 <b>{toKorean(goal.neededAnnual * 10000)}</b>
            </div>
            {goal.gap > 0 ? (
              <div className="goal-gap up">
                지금보다 <b>{toKorean(goal.gap * 10000)}</b> 더!
                <span className="goal-pct">(+{goal.pct.toFixed(1)}% 인상)</span>
              </div>
            ) : goal.gap < 0 ? (
              <div className="goal-gap down">
                이미 목표를 넘었어요! (현재가 {toKorean(-goal.gap * 10000)} 더 높음)
              </div>
            ) : (
              <div className="goal-gap">딱 지금 연봉이에요!</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <div className="m-label">{label}</div>
      <div className="m-value">{value}</div>
    </div>
  );
}

function DedRow({ label, v }: { label: string; v: number }) {
  return (
    <li>
      <span>{label}</span>
      <span>{won(v)}</span>
    </li>
  );
}
