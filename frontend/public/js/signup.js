document.addEventListener('DOMContentLoaded', () => {
  // 요소 조회
  const form = document.getElementById('signupForm');
  const email = document.getElementById('email');
  const passwordEl = document.getElementById('password');
  const nickname = document.getElementById('nickname');
  const image = document.getElementById('profileImage'); // ← 프로필 업로드 input
  const preview = document.getElementById('profilePreview'); // ← 미리보기 영역

  if (!form || !email || !passwordEl || !nickname) {
    console.error('필수 요소를 찾지 못했습니다.', {
      form: !!form, email: !!email, password: !!passwordEl, nickname: !!nickname
    });
    return;
  }

  // ==== 비밀번호 유효성 검사 ====
  const passwordConfirm = document.getElementById('passwordConfirm');
  const passwordError = document.getElementById('passwordError');
  const passwordConfirmError = document.getElementById('passwordConfirmError');

  // 정규식: 8~20자, 대문자/소문자/숫자/특수문자 최소 1개씩
  const pwRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,20}$/;

  passwordEl.addEventListener('blur', () => {
    const pw = passwordEl.value.trim();
    const confirmPw = passwordConfirm.value.trim();

    if (!pw) {
      passwordError.textContent = '*비밀번호를 입력해주세요.';
      passwordError.style.display = 'block';
    } else if (!pwRule.test(pw)) {
      passwordError.textContent = '*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
      passwordError.style.display = 'block';
    } else {
      passwordError.style.display = 'none';
    }

    // 비밀번호 확인 값이 존재할 때 일치 여부도 체크
    if (confirmPw && pw !== confirmPw) {
      passwordConfirmError.textContent = '*비밀번호가 다릅니다.';
      passwordConfirmError.style.display = 'block';
    } else if (confirmPw && pw === confirmPw) {
      passwordConfirmError.style.display = 'none';
    }
  });

  passwordConfirm.addEventListener('blur', () => {
    const pw = passwordEl.value.trim();
    const confirmPw = passwordConfirm.value.trim();

    if (!confirmPw) {
      passwordConfirmError.textContent = '*비밀번호를 한번더 입력해주세요.';
      passwordConfirmError.style.display = 'block';
    } else if (pw !== confirmPw) {
      passwordConfirmError.textContent = '*비밀번호가 다릅니다.';
      passwordConfirmError.style.display = 'block';
    } else {
      passwordConfirmError.style.display = 'none';
    }
  });

  // ==== 닉네임 유효성 검사 ====
  const nicknameError = document.getElementById('nicknameError');
  nickname.addEventListener('blur', async () => {
    const value = nickname.value.trim();

    // 1. 입력 안 했을 시
    if (!value) {
      nicknameError.textContent = '*닉네임을 입력해주세요.';
      nicknameError.style.display = 'block';
      return;
    }

    // 2. 띄어쓰기 있을 시
    if (/\s/.test(value)) {
      nicknameError.textContent = '*띄어쓰기를 없애주세요.';
      nicknameError.style.display = 'block';
      return;
    }

    // 3. 11자 이상일 시
    if (value.length > 10) {
      nicknameError.textContent = '*닉네임은 최대 10자 까지 작성 가능합니다.';
      nicknameError.style.display = 'block';
      return;
    }

    // 4. 중복 확인
    try {
      const resp = await fetch(`/api/v1/auth/check-nickname?nickname=${encodeURIComponent(value)}`);
      const data = await resp.json();

      if (resp.ok && data.available === false) {
        nicknameError.textContent = '*중복된 닉네임 입니다.';
        nicknameError.style.display = 'block';
      } else {
        nicknameError.style.display = 'none';
      }
    } catch (err) {
      console.error('닉네임 중복 확인 오류:', err);
      nicknameError.textContent = '*닉네임 확인 중 오류가 발생했습니다.';
      nicknameError.style.display = 'block';
    }
  });

  // ==== 이메일 검증 (포커스아웃 시) ====
  const emailError = document.getElementById('emailError'); // helper text 영역 (HTML에 추가 필요)

  email.addEventListener('blur', async () => {
    const value = email.value.trim();

    // 1. 비어 있는 경우
    if (!value) {
      emailError.textContent = '*이메일을 입력해주세요.';
      emailError.style.color = '#e53935';
      emailError.style.display = 'block';
      return;
    }

    // 2. 이메일 형식 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value) || value.length < 6) {
      emailError.textContent = '*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)';
      emailError.style.color = '#e53935';
      emailError.style.display = 'block';
      return;
    }

    // 3. 중복된 이메일인지 서버로 확인
    try {
      const resp = await fetch(`/api/v1/auth/check-email?email=${encodeURIComponent(value)}`);
      const data = await resp.json();

      if (resp.ok && data.available === false) {
        emailError.textContent = '*중복된 이메일 입니다.';
        emailError.style.color = '#e53935';
        emailError.style.display = 'block';
      } else {
        emailError.style.display = 'none';
      }
    } catch (err) {
      console.error('이메일 중복 확인 중 오류:', err);
      emailError.textContent = '*이메일 확인 중 오류가 발생했습니다.';
      emailError.style.color = '#e53935';
      emailError.style.display = 'block';
    }
  });

 // ==== 프로필 사진 업로드 / 삭제 ====
 let uploaded = false;
 const helper = document.getElementById('profileHelper'); // ← 추가된 helper 텍스트

 preview.addEventListener('click', () => {
   if (uploaded) {
     const confirmDelete = confirm('등록한 프로필 사진을 삭제하시겠습니까?');
     if (confirmDelete) {
       preview.innerHTML = '<span class="plus-icon">+</span>';
       preview.style.backgroundImage = '';
       uploaded = false;
       image.value = '';
       if (helper) helper.style.visibility = 'visible'; // 다시 표시
     }
   } else {
     image.click();
   }
 });

image.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert('이미지 크기는 5MB 이하로 제한됩니다.');
    image.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    preview.innerHTML = '';
    const img = document.createElement('img');
    img.src = e.target.result;
    preview.appendChild(img);
    uploaded = true;
    if (helper) helper.style.visibility = 'hidden'; // 업로드 시 숨김
  };
  reader.readAsDataURL(file);
});

  // ==== 폼 제출 ====
  const submitBtn = document.querySelector('.btn');
  const submitMsg = document.getElementById('submitMsg');

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    let valid = true;
    if (!email.checkValidity()) {
      emailError.style.display = 'block';
      valid = false;
    }
    if (passwordEl.value.length < 8) {
      passwordError.style.display = 'block';
      valid = false;
    }
    if (!nickname.value.trim()) {
      nicknameError.style.display = 'block';
      valid = false;
    }

    if (!valid) return;

    submitBtn.disabled = true;
    if (submitMsg) {
      submitMsg.style.display = 'block';
      submitMsg.style.color = 'black';
      submitMsg.textContent = '회원가입 요청 중입니다...';
    }

    try {
      const fd = new FormData();
      fd.append('email', email.value.trim());
      fd.append('password', passwordEl.value);
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
      submitMsg.textContent = '네트워크 오류가 발생했습니다.';
      console.error(err);
    } finally {
      submitBtn.disabled = false;
    }
  });
});
