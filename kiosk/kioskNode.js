const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const path = require('path');
const fs = require('fs');

/* MySQL 데이터베이스 연결 설정 */
const client = mysql.createConnection({
  host: "localhost",
  user: "c16st30",
  password: "Z9U7dffwthoQloDI",
  database: "c16st30"
});

app.use(bodyParser.urlencoded({
  extended: false
}));

/* 뷰 엔진 설정 (Pug) */
app.set('view engine', 'pug');
app.set('views', './build/html');

/* 정적 파일 경로 설정 */
app.use(express.static('build'));

/* 메인 페이지 라우트: 포인트 데이터를 JSON 파일로 저장 후 렌더링 */
app.get('/', (req, res) => {
  client.query('SELECT * FROM kioskpoint', (error, result) => {
    if (error) {
      console.error('DB Query Error:', error);
      return res.status(500).send('Internal Server Error');
    }
    fs.writeFile('./build/nodejs/kioskpoint.json', 'get_kioskpoint=' + JSON.stringify(result), (err) => {
      if (err) console.error('File Write Error:', err);
      res.render('kiosk');
    });
  });
});

/* 서버 실행 (포트 3030) */
app.listen(3030, () => {
  console.log('Server Running on http://localhost:3030...');
});

/*json kiosk menu,point 파싱 html*/
/*app.get('/', (req, res) => {
  client.query('SELECT * FROM kioskpoint', (error, result) => {
    fs.writeFileSync('./build/nodejs/kioskpoint.json', 'get_kioskpoint=' + JSON.stringify(result));
    res.render('kiosk.html');
  });
});*/

/*json kiosk menu,point 파싱 pug*/
app.get('/', (req, res) => {
  client.query('SELECT * FROM kioskpoint', (error, result) => {
    fs.writeFileSync('./build/nodejs/kioskpoint.json', 'get_kioskpoint=' + JSON.stringify(result));
    res.render('kiosk');
  });
});

/*DB서버 전송*/
/*app.post('/', (req, res) => {
  console.log(req.body);
  const join_num = req.body.join_num;
  client.query('INSERT INTO kioskpoint (phone_number) VALUES (?)', [
    join_num
  ], () => {
    res.redirect('/');
  });
});

app.listen(3030, () => {
  console.log('Server Running 3030...');
});*/