const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const users = [
  {
    user_id: "test",
    user_password: "1234",
    user_name: "테스트 유저",
    user_info: "테스트 유저입니다",
  },
];

const app = express();

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5501",
      "http://localhost:5501",
    ],
    methods: ["OPTIONS", "POST", "GET", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

const secretKey = "ozcodingschool";

// 클라이언트에서 POST 요청을 받은 경우
app.post("/", (req, res) => {
  const { userId, userPassword } = req.body;
  const userInfo = users.find(
    (el) => el.user_id === userId && el.user_password === userPassword
  );
  
  // 유저 정보가 없는 경우
  if (!userInfo) {
    return res.status(401).send("로그인 실패");
  }
  
  // 1. 유저 정보가 있는 경우 accessToken을 발급하는 로직을 작성합니다. (sign)
  const accessToken = jwt.sign({ userId: userInfo.user_id }, secretKey, { expiresIn: '1h' });

  // 2. 응답으로 accessToken을 클라이언트로 전송합니다. (res.send 사용)
  res.send({ accessToken });
});

// 클라이언트에서 GET 요청을 받은 경우
app.get("/", (req, res) => {
  const authorization = req.headers.authorization;

  // 3. req headers에 담겨있는 accessToken을 검증하는 로직을 작성합니다. (verify)
  if (!authorization) {
    return res.status(401).send("토큰이 누락되었습니다");
  }

  // "Bearer " 문자열을 분리하여 토큰만 추출합니다.
  const token = authorization.startsWith("Bearer ") ? authorization.split(" ")[1] : null;

  if (!token) {
    return res.status(401).send("유효하지 않은 토큰 형식입니다");
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).send("유효하지 않은 토큰입니다");
    }
    
    const userInfo = users.find(el => el.user_id === decoded.userId);

    // 4. 검증이 완료되면 유저 정보를 클라이언트로 전송합니다. (res.send 사용)
    if (userInfo) {
      res.send(userInfo);
    } else {
      res.status(404).send("사용자를 찾을 수 없습니다");
    }
  });
});

app.listen(3000, () => console.log("서버 실행!"));
