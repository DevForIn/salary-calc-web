import type { RouteRecord } from 'vite-react-ssg';
import App from './App';
import { SalaryTable } from './components/SalaryTable';

export const routes: RouteRecord[] = [
  { path: '/', element: <App />, entry: 'src/App.tsx' },
  { path: '/salary-table', element: <SalaryTable />, entry: 'src/components/SalaryTable.tsx' },
];
