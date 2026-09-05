import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';

export function Privacy() {
  return (
    <div className="wrap">
      <Head>
        <title>개인정보처리방침 | 월급력 측정기</title>
        <meta name="description" content="월급력 측정기(pay-scouter) 개인정보처리방침 및 쿠키·광고 안내." />
        <meta name="robots" content="noindex" />
      </Head>
      <header className="hero" style={{ paddingBottom: 8 }}>
        <h1 style={{ fontSize: 24 }}>개인정보처리방침</h1>
      </header>
      <section className="seo-content">
        <p>월급력 측정기(이하 “서비스”)는 이용자의 개인정보를 소중히 다루며, 아래와 같이 처리방침을 안내합니다.</p>

        <h3>1. 수집하는 정보</h3>
        <p>본 서비스는 회원가입이 없으며, 이름·연락처 등 개인을 식별할 수 있는 정보를 서버에 저장하지 않습니다. 연봉 등 계산 입력값은 이용자의 브라우저 안에서만 처리되며 서버로 전송되지 않습니다.</p>

        <h3>2. 쿠키 및 분석 도구</h3>
        <p>본 서비스는 방문 통계 분석을 위해 Google Analytics를 사용할 수 있으며, 이 과정에서 쿠키가 사용될 수 있습니다. 쿠키는 브라우저 설정에서 거부할 수 있습니다.</p>

        <h3>3. 광고</h3>
        <p>본 서비스는 Google AdSense 등 제3자 광고를 게재할 수 있습니다. 광고 제공업체는 이용자의 관심 기반 광고 제공을 위해 쿠키를 사용할 수 있습니다. 이용자는 Google 광고 설정에서 맞춤 광고를 관리할 수 있습니다.</p>

        <h3>4. 테마 설정 저장</h3>
        <p>다크/라이트 테마 설정은 이용자 편의를 위해 브라우저의 로컬 저장소(localStorage)에만 저장되며, 외부로 전송되지 않습니다.</p>

        <h3>5. 문의</h3>
        <p>개인정보 관련 문의는 사이트 운영자에게 연락할 수 있습니다.</p>

        <p className="note">본 방침은 2026년 기준이며, 변경 시 본 페이지를 통해 안내합니다.</p>

        <p style={{ marginTop: 20 }}><Link to="/" className="to-calc-btn">← 계산기로 돌아가기</Link></p>
      </section>
      <footer>© 2026 월급력 측정기 (pay-scouter) · by DevForIn</footer>
    </div>
  );
}
