document.addEventListener('DOMContentLoaded', () => {
 // 요소 조회
  const form = document.getElementById('signupForm');
  const email = document.getElementById('email');
  const passwordEl = document.getElementById('password'); // ← 변수명 변경
  const nickname = document.getElementById('nickname');
  const image = document.getElementById('image');

  // 필수 요소 존재 확인 (없으면 콘솔에 원인 표시 후 중단)
  if (!form || !email || !passwordEl || !nickname) {
    console.error('필수 요소를 찾지 못했습니다.', {
      form: !!form, email: !!email, password: !!passwordEl, nickname: !!nickname
    });
    return;
  }

  // 이후 코드에서 password 대신 passwordEl 사용
  function passwordStrength(pw){
    let score = 0;
    if (pw.length >= 8) score += 1;
    if (/[A-Z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;
    return score;
  }

  const pwBar = document.getElementById('pwBar');
  const passwordError = document.getElementById('passwordError');

  passwordEl.addEventListener('input', () => {
    const s = passwordStrength(passwordEl.value);
    if (pwBar) pwBar.style.width = (s / 4 * 100) + '%';
    if (passwordError) {
      passwordError.style.display = (passwordEl.value.length >= 8 ? 'none' : 'block');
    }
  });

  // ==== 이메일 검증 ====
  email.addEventListener('input', () => {
    const ok = email.checkValidity();
    emailError.style.display = ok ? 'none' : 'block';
  });

  // ==== 닉네임 입력 및 중복 검사 ====
  nickname.addEventListener('input', async () => {
    const value = nickname.value.trim();

    if (!value) {
      nicknameError.style.display = 'block';
      nickHint.textContent = '닉네임을 입력해주세요.';
      nickHint.style.color = '#6b7280';
      return;
    } else {
      nicknameError.style.display = 'none';
    }

    // 디바운싱 (입력 멈춘 뒤 400ms 후 요청)
    clearTimeout(nickname._timer);
    nickname._timer = setTimeout(async () => {
      try {
        const resp = await fetch(`/api/v1/auth/check-nickname?nickname=${encodeURIComponent(value)}`);
        const data = await resp.json();

        if (resp.ok && data.available === true) {
          nickHint.textContent = '사용 가능한 닉네임입니다.';
          nickHint.style.color = 'green';
        } else {
          nickHint.textContent = data.message || '이미 사용 중인 닉네임입니다.';
          nickHint.style.color = '#dc2626';
        }
      } catch (err) {
        console.error(err);
        nickHint.textContent = '닉네임 확인 중 오류가 발생했습니다.';
        nickHint.style.color = '#dc2626';
      }
    }, 400);
  });

  // ==== 이미지 미리보기 ====
  image.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      imgPreview.style.display = 'none';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 크기는 5MB 이하로 권장합니다.');
      return;
    }

    const url = URL.createObjectURL(file);
    previewImage.src = url;
    imgInfo.textContent = `${file.name} · ${(file.size / 1024 | 0)} KB`;
    imgPreview.style.display = 'flex';
  });

  // ==== 이미지 제거 ====
  removeImageBtn.addEventListener('click', () => {
    image.value = '';
    imgPreview.style.display = 'none';
    previewImage.src = '';
  });

  // ==== 폼 제출 ====
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    let valid = true;
    if (!email.checkValidity()) {
      emailError.style.display = 'block';
      valid = false;
    }
    if (password.value.length < 8) {
      passwordError.style.display = 'block';
      valid = false;
    }
    if (!nickname.value.trim()) {
      nicknameError.style.display = 'block';
      valid = false;
    }

    if (!valid) return;

    submitBtn.disabled = true;
    submitMsg.style.display = 'block';
    submitMsg.style.color = 'black';
    submitMsg.textContent = '회원가입 요청 중입니다...';

    try {
      const fd = new FormData();
      fd.append('email', email.value.trim());
      fd.append('password', password.value);
      fd.append('nickname', nickname.value.trim());
      if (image.files[0]) fd.append('image', image.files[0]);

      const resp = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        body: fd
      });

      if (resp.ok) {
        const data = await resp.json();
        submitMsg.style.color = 'green';
        submitMsg.textContent = '회원가입 완료되었습니다. 로그인 페이지로 이동합니다.';
        // location.href = '/login';
      } else {
        let text;
        try {
          text = await resp.json();
          text = text.message || JSON.stringify(text);
        } catch (e) {
          text = await resp.text();
        }
        submitMsg.style.color = '#dc2626';
        submitMsg.textContent = '오류: ' + (text || resp.statusText);
      }
    } catch (err) {
      submitMsg.style.color = '#dc2626';
      submitMsg.textContent = '네트워크 오류가 발생했습니다. 콘솔을 확인하세요.';
      console.error(err);
    } finally {
      submitBtn.disabled = false;
    }
  });
});
