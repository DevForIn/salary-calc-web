// 포맷 유틸
export function won(n: number): string {
  return Math.round(n).toLocaleString('ko-KR') + '원';
}

// 큰 금액을 한국어로 (예: 3,500만원, 1억 2,000만원)
export function toKorean(n: number): string {
  if (n <= 0) return '';
  const eok = Math.floor(n / 100000000);
  const man = Math.floor((n % 100000000) / 10000);
  const parts: string[] = [];
  if (eok > 0) parts.push(`${eok}억`);
  if (man > 0) parts.push(`${man.toLocaleString('ko-KR')}만`);
  const rest = n % 10000;
  if (rest > 0 && eok === 0) parts.push(`${rest.toLocaleString('ko-KR')}`);
  return parts.join(' ') + '원';
}
