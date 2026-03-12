const express = require ('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const path = require('path');
const fs = require('fs');
const { join } = require('path');

const client = mysql.createConnection({
  host: "localhost",
  user: "c16st30",
  password: "Z9U7dffwthoQloDI",
	database: "c16st30"
});

app.use(bodyParser.urlencoded({
  extended : false
}));

/*화면 engine을 ejs로 설정*/
/*app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);*/

/*view html 경로 설정*/
/*app.set('view engine', 'html');
app.set('views', './build/html');*/

/*view pug 경로 설정*/
app.set('view engine', 'pug');
app.set('views', './build/html');

/*스테틱 경로 설정*/
app.use(express.static('build'));

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