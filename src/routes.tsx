import type { RouteRecord } from 'vite-react-ssg';
import App from './App';
import { SalaryTable } from './components/SalaryTable';
import { Privacy } from './components/Privacy';
import { SalaryLanding, SALARY_LANDINGS } from './components/SalaryLanding';

export const routes: RouteRecord[] = [
  { path: '/', element: <App />, entry: 'src/App.tsx' },
  { path: '/salary-table', element: <SalaryTable />, entry: 'src/components/SalaryTable.tsx' },
  { path: '/privacy', element: <Privacy />, entry: 'src/components/Privacy.tsx' },
  ...SALARY_LANDINGS.map((annual) => ({
    path: `/salary/${annual}`,
    element: <SalaryLanding annual={annual} />,
    entry: 'src/components/SalaryLanding.tsx',
  })),
];
