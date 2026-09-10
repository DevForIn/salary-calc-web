import { useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';

// 라우트(pathname) 변경 시 페이지 최상단으로 스크롤.
// SSG 빌드 시 Node 렌더 대비 window 가드.
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return <Outlet />;
}
