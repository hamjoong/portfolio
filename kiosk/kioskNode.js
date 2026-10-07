const express = require('express');
const app = express();

/* view pug 경로 설정 */
app.set('view engine', 'pug');
app.set('views', './src/pug');

/* 스테틱 경로 설정: 메뉴 데이터(JSON)·이미지·CSS·JS 모두 build/ 에서 정적으로 제공합니다. */
app.use(express.static('build'));

app.get('/', (req, res) => {
  res.render('kiosk');
});

app.listen(3030, () => {
  console.log('Server Running 3030...');
});
