// 움직임 줄이기 설정 여부
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================================================
   [효과 1] 스크롤 시 제목·문장·이미지가 아래에서 위로 페이드인
   - IntersectionObserver로 요소가 화면에 들어오는 순간을 감지
   - 같은 섹션 안의 요소들은 순서대로 조금씩 늦게 등장(시차)
   ========================================================= */
const fadeItems = document.querySelectorAll('.fade-up');

// 섹션별로 순서를 매겨 transition-delay 지정 (제목 → 문장 → 이미지)
document.querySelectorAll('section').forEach((section) => {
  section.querySelectorAll('.fade-up').forEach((el, index) => {
    el.style.transitionDelay = `${index * 0.15}s`;
  });
});

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible'); // 화면에 들어오면 나타나게
        fadeObserver.unobserve(entry.target);     // 한 번 나타나면 더 이상 감시하지 않음
      }
    });
  },
  {
    threshold: 0.15,                 // 요소가 15% 보이면 실행
    rootMargin: '0px 0px -40px 0px', // 화면 하단보다 살짝 위에서 실행
  }
);

fadeItems.forEach((el) => fadeObserver.observe(el));

/* =========================================================
   [효과 2] 히어로 배경 패럴랙스
   - 스크롤 양의 일부(30%)만큼만 배경을 아래로 이동
   - 콘텐츠보다 느리게 움직여 깊이감이 생김
   [효과 3] 상단 프로그래스 바
   - (현재 스크롤 위치 / 스크롤 가능한 전체 길이) 비율로 바 길이 조절
   ========================================================= */
const heroBg = document.getElementById('heroBg');
const progressBar = document.getElementById('progressBar');
const topAppBar = document.getElementById('topAppBar');
const PARALLAX_SPEED = 0.3; // 숫자가 작을수록 배경이 더 느리게 움직임

let ticking = false;

function updateOnScroll() {
  const scrollY = window.scrollY;
  const viewportHeight = window.innerHeight;

  // [효과 3] 진행률 계산 (0 ~ 1)
  const maxScroll = document.documentElement.scrollHeight - viewportHeight;
  const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
  progressBar.style.transform = `scaleX(${progress})`;
  progressBar.setAttribute('aria-valuenow', Math.round(progress * 100));

  // M3 Top app bar: 히어로를 거의 지나면 surface 컬러 + 그림자로 전환
  topAppBar.classList.toggle('is-scrolled', scrollY > viewportHeight - 80);

  // [효과 2] 히어로가 화면에 보이는 동안만 배경 이동
  if (!reduceMotion && scrollY <= viewportHeight) {
    heroBg.style.transform = `translate3d(0, ${scrollY * PARALLAX_SPEED}px, 0)`;
  }

  ticking = false;
}

// 스크롤 이벤트는 requestAnimationFrame으로 묶어 프레임당 한 번만 계산 (성능 최적화)
window.addEventListener(
  'scroll',
  () => {
    if (!ticking) {
      requestAnimationFrame(updateOnScroll);
      ticking = true;
    }
  },
  { passive: true }
);

window.addEventListener('resize', updateOnScroll);
updateOnScroll(); // 처음 로드 시 한 번 실행
