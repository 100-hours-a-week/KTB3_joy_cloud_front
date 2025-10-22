const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const pwInput = document.getElementById('password');
const btn = document.getElementById('submitBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const resp = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (resp.ok) {
      alert('로그인 성공! 게시판으로 이동합니다.');
      window.location.href = '/posts';
    } else {
      // 로그인 실패 시
      const passwordError = document.getElementById('passwordError');
      passwordError.textContent = '*아이디 또는 비밀번호를 확인해주세요';
      passwordError.style.display = 'block';
    }
  } catch (err) {
    alert('서버 오류가 발생했습니다.');
    console.error(err);
  }
});

// 🔹 이메일/비밀번호 유효성 검사 + 버튼 색상 변경
function validate() {
  const emailValid = emailInput.validity.valid;  // HTML5 이메일 형식 검사
  const pwValid = pwInput.value.length >= 8;     // 비밀번호 8자 이상

  if (emailValid && pwValid) {
    btn.classList.add('active');
    btn.disabled = false;
  } else {
    btn.classList.remove('active');
    btn.disabled = true;
  }
}

// 입력이 바뀔 때마다 검사 실행
emailInput.addEventListener('input', validate);
pwInput.addEventListener('input', validate);

// 🔹 로그인 요청 처리
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = pwInput.value;

  try {
    const resp = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (resp.ok) {
      const data = await resp.json();
      alert('로그인 성공! 게시판으로 이동합니다.');
      window.location.href = '/posts.html';
    } else {
      alert('로그인 실패: 이메일 또는 비밀번호를 확인하세요.');
    }
  } catch (err) {
    alert('서버 오류가 발생했습니다.');
    console.error(err);
  }
});
