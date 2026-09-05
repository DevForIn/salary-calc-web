import type { RouteRecord } from 'vite-react-ssg';
import App from './App';
import { SalaryTable } from './components/SalaryTable';
import { Privacy } from './components/Privacy';

export const routes: RouteRecord[] = [
  { path: '/', element: <App />, entry: 'src/App.tsx' },
  { path: '/salary-table', element: <SalaryTable />, entry: 'src/components/SalaryTable.tsx' },
  { path: '/privacy', element: <Privacy />, entry: 'src/components/Privacy.tsx' },
];
