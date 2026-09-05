// 연봉 실수령액 계산 로직 (2026년 기준, 간이 추정)
// ⚠️ 실제 세액은 연말정산·공제항목에 따라 달라짐. 참고용 추정치.
// 세율/상수는 이 파일 한 곳에 격리 → 매년 업데이트 용이

export const RATES_2026 = {
  // 4대보험 근로자 부담분 (2026년 기준)
  nationalPension: 0.0475,     // 국민연금 4.75% (연금개혁 반영)
  healthInsurance: 0.03595,    // 건강보험 3.595%
  longTermCare: 0.1314,        // 장기요양 = 건강보험료의 13.14%
  employment: 0.009,           // 고용보험 0.9%

  // 국민연금 기준소득월액 상·하한 (2026, 월 기준)
  pensionMonthlyMax: 6590000,
  pensionMonthlyMin: 410000,
};

// 근로소득공제 (총급여 구간별) — 연 기준, 최대 2,000만원 한도
function earnedIncomeDeduction(gross: number): number {
  let d: number;
  if (gross <= 5000000) d = gross * 0.7;
  else if (gross <= 15000000) d = 3500000 + (gross - 5000000) * 0.4;
  else if (gross <= 45000000) d = 7500000 + (gross - 15000000) * 0.15;
  else if (gross <= 100000000) d = 12000000 + (gross - 45000000) * 0.05;
  else d = 14750000 + (gross - 100000000) * 0.02;
  return Math.min(d, 20000000);
}

// 종합소득세 (2026, 과세표준 × 세율 − 누진공제액)
function incomeTax(taxBase: number): number {
  if (taxBase <= 0) return 0;
  if (taxBase <= 14000000) return taxBase * 0.06;
  if (taxBase <= 50000000) return taxBase * 0.15 - 1260000;
  if (taxBase <= 88000000) return taxBase * 0.24 - 5760000;
  if (taxBase <= 150000000) return taxBase * 0.35 - 15440000;
  if (taxBase <= 300000000) return taxBase * 0.38 - 19940000;
  if (taxBase <= 500000000) return taxBase * 0.40 - 25940000;
  if (taxBase <= 1000000000) return taxBase * 0.42 - 35940000;
  return taxBase * 0.45 - 65940000;
}

// 근로소득세액공제 (산출세액 기준 공제액 + 총급여별 한도)
function laborTaxCredit(calculatedTax: number, grossSalary: number): number {
  // 공제액
  let credit: number;
  if (calculatedTax <= 1300000) credit = calculatedTax * 0.55;
  else credit = 715000 + (calculatedTax - 1300000) * 0.30;
  // 총급여별 한도
  let limit: number;
  if (grossSalary <= 33000000) limit = 740000;
  else if (grossSalary <= 70000000) limit = Math.max(660000, 740000 - (grossSalary - 33000000) * 0.008);
  else if (grossSalary <= 120000000) limit = Math.max(500000, 660000 - (grossSalary - 70000000) * 0.005);
  else limit = Math.max(200000, 500000 - (grossSalary - 120000000) * 0.005);
  return Math.min(credit, limit);
}

// 자녀세액공제 (2026 개정, 8세 이상 기준): 1명25 / 2명55 / 3명95 / 이후 +40만
function childTaxCredit(children: number): number {
  if (children <= 0) return 0;
  if (children === 1) return 250000;
  if (children === 2) return 550000;
  return 550000 + (children - 2) * 400000;
}

export interface SalaryInput {
  annualManwon: number;   // 연봉 (만원)
  weeklyHours: number;    // 주 근무시간
  nonTaxMonthly: number;  // 월 비과세액 (원, 식대 등)
  dependents: number;     // 본인 포함 부양가족 수
  children: number;       // 20세 이하 자녀 수
}

export interface Metric {
  perSecond: number; perMinute: number; perHour: number;
  perDay: number; perWeek: number; perMonth: number; perYear: number;
}

export interface SalaryResult {
  gross: number;              // 연봉(원)
  netAnnual: number;          // 실수령 연액
  netMonthly: number;         // 실수령 월액
  deductions: {
    pension: number; health: number; care: number; employment: number;
    incomeTax: number; localTax: number; total: number;
  };
  beforeTax: Metric;
  afterTax: Metric;
  topPercent: number;
  effectiveRate: number;      // 실효 공제율
  rank: PowerRank;            // 월급력 전투력 등급
}

function makeMetric(annual: number, workHoursPerWeek: number): Metric {
  const weekEarnHours = workHoursPerWeek + 8; // 주휴 8시간 포함
  const month = annual / 12;
  const week = annual / 52.14;
  const hour = week / weekEarnHours;
  const day = hour * 8;
  const minute = hour / 60;
  const second = minute / 60;
  return {
    perYear: Math.round(annual),
    perMonth: Math.round(month),
    perWeek: Math.round(week),
    perDay: Math.round(day),
    perHour: Math.round(hour),
    perMinute: Math.round(minute),
    perSecond: Math.round(second * 100) / 100,
  };
}

// 연봉 상위 % (국세청 근로소득 통계 기반 추정, 2024 귀속 자료 참고)
// 구간 사이는 선형보간으로 촘촘하게 (표에서 자연스럽게 이어지도록)
export function topPercentile(annualManwon: number): number {
  // [연봉만원, 상위%] 앵커 포인트 (자료 기반)
  const pts: [number, number][] = [
    [2000, 82], [2500, 68], [3000, 57], [3500, 48], [4000, 40],
    [5000, 27], [7000, 14], [10000, 7], [20000, 1.4], [30000, 0.5],
  ];
  if (annualManwon <= pts[0][0]) return pts[0][1];
  if (annualManwon >= pts[pts.length - 1][0]) return pts[pts.length - 1][1];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    if (annualManwon >= x1 && annualManwon <= x2) {
      const ratio = (annualManwon - x1) / (x2 - x1);
      const v = y1 + (y2 - y1) * ratio;
      return Math.round(v * 10) / 10;
    }
  }
  return 50;
}

// 월급력 전투력 등급 (드래곤볼 스카우터 컨셉)
// ⚠️ 등급 경계는 topPercentile()가 반환하는 값과 정확히 정렬되어야 함 (모순 방지)
//    topPercentile 반환값: 0.5 / 1.4 / 7 / 14 / 27 / 40 / 48 / 57 / 68 / 80
export interface PowerRank {
  grade: string;
  emoji: string;
  comment: string;
}

export function powerRank(_annualManwon: number, topPercent: number): PowerRank {
  if (topPercent <= 1.4) return { grade: '우주 최강 전사', emoji: '🌌', comment: '스카우터가 고장났나? 측정 불가급!' };
  if (topPercent <= 7) return { grade: '엘리트 전사', emoji: '💥', comment: '상위 포식자. 이 구역의 강자다.' };
  if (topPercent <= 14) return { grade: '정예 전사', emoji: '⚡', comment: '웬만한 적은 상대도 안 됨.' };
  if (topPercent <= 27) return { grade: '숙련 전사', emoji: '🗡️', comment: '실력파. 성장 중인 강자.' };
  if (topPercent <= 48) return { grade: '일반 전사', emoji: '🛡️', comment: '평균의 힘. 꾸준함이 무기.' };
  return { grade: '수련생', emoji: '🌱', comment: '지금부터 떡상 구간. 잠재력 만렙.' };
}

// 목표 월 실수령액 → 필요한 연봉(만원) 역산 (이진탐색)
export function reverseSalary(
  targetNetMonthly: number,
  base: Omit<SalaryInput, 'annualManwon'>,
): number {
  let lo = 0;
  let hi = 1000000; // 연봉 상한 100억(만원) 가정
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const net = calculateSalary({ ...base, annualManwon: mid }).netMonthly;
    if (net < targetNetMonthly) lo = mid;
    else hi = mid;
  }
  return Math.round((lo + hi) / 2);
}

export function calculateSalary(input: SalaryInput): SalaryResult {
  const R = RATES_2026;
  const gross = input.annualManwon * 10000;
  const nonTaxAnnual = Math.max(0, input.nonTaxMonthly) * 12;
  const taxableAnnual = Math.max(0, gross - nonTaxAnnual);
  const taxableMonthly = taxableAnnual / 12;

  // 4대보험 (월 기준으로 계산 후 연간) — 국민연금 상·하한 반영
  const pensionBase = Math.min(Math.max(taxableMonthly, R.pensionMonthlyMin), R.pensionMonthlyMax);
  const pension = Math.round(pensionBase * R.nationalPension) * 12;
  const health = Math.round(taxableMonthly * R.healthInsurance) * 12;
  const care = Math.round(taxableMonthly * R.healthInsurance * R.longTermCare) * 12;
  const employment = Math.round(taxableMonthly * R.employment) * 12;

  // 소득세 (근로소득공제 → 인적공제 → 과세표준 → 누진세율 → 세액공제)
  const eiDeduction = earnedIncomeDeduction(taxableAnnual);
  const personalDeduction = (Math.max(1, input.dependents)) * 1500000; // 인적공제 1인당 150만
  // 4대보험료 소득공제 (국민연금 전액 + 건강·고용보험료도 공제 대상)
  const insuranceDeduction = pension + health + employment;
  const taxBase = Math.max(0, taxableAnnual - eiDeduction - personalDeduction - insuranceDeduction);
  const calcTax = incomeTax(taxBase);
  const afterCredit = Math.max(0, calcTax - laborTaxCredit(calcTax, taxableAnnual) - childTaxCredit(input.children));
  const incomeTaxAnnual = Math.round(afterCredit);
  const localTaxAnnual = Math.round(incomeTaxAnnual * 0.1);

  const total = pension + health + care + employment + incomeTaxAnnual + localTaxAnnual;
  const netAnnual = gross - total;

  return {
    gross,
    netAnnual,
    netMonthly: Math.round(netAnnual / 12),
    deductions: {
      pension, health, care, employment,
      incomeTax: incomeTaxAnnual, localTax: localTaxAnnual, total,
    },
    beforeTax: makeMetric(gross, input.weeklyHours),
    afterTax: makeMetric(netAnnual, input.weeklyHours),
    topPercent: topPercentile(input.annualManwon),
    effectiveRate: gross > 0 ? total / gross : 0,
    rank: powerRank(input.annualManwon, topPercentile(input.annualManwon)),
  };
}
