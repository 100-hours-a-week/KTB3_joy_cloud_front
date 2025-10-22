const form = document.getElementById('loginForm');

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
