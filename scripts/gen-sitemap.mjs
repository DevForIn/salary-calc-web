// 빌드 후 실행: dist/sitemap.xml + robots.txt 생성
import { writeFileSync } from 'node:fs';

const SITE = process.env.SITE_URL || 'https://salary-calc-web.vercel.app';
const today = new Date().toISOString().slice(0, 10);
// 연봉별 랜딩 (SalaryLanding.tsx의 SALARY_LANDINGS와 동기화 유지)
const salaryLandings = [
  2400, 2600, 2800, 3000, 3200, 3400, 3600, 3800,
  4000, 4200, 4500, 4800, 5000, 5500, 6000, 6500,
  7000, 8000, 9000, 10000,
];
const urls = ['/', '/salary-table', ...salaryLandings.map((m) => `/salary/${m}`)];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${SITE}${u}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;

writeFileSync('dist/sitemap.xml', sitemap);
writeFileSync('dist/robots.txt', robots);
console.log(`\u2713 sitemap.xml (${urls.length} URLs) + robots.txt 생성`);
