const express = require('express');
const app = express();
const port = 3000; // 서버 포트 번호
const path = require('path');


// 클라이언트에서 HTTP 요청 메소드 중 GET을 이용해서 'host:port'로 요청을 보내면 실행되는 라우트
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// app.listen() 함수를 사용해서 서버를 실행해준다.
// 클라이언트는 'host:port'로 노드 서버에 요청을 보낼 수 있다.
app.listen(port, () => {
    console.log('서버가 실행됩니다. http://localhost:${port}');
});

app.use(express.static(path.join(__dirname, "public")));
                              // express-ejs-layouts 사용하기 설정
// /login 경로 요청 시 login.html 반환
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// /postList 경로 요청 시 postList.html 반환
app.get('/post-list', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'postList.html'));
});

// /signup 경로 요청 시 signup.html 반환
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});