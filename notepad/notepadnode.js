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

/*view pug 경로 설정*/
app.set('view engine', 'pug');
app.set('views', './build/html');

/*스테틱 경로 설정*/
app.use(express.static('build'));

/*json notepad 파싱 pug*/
/*app.get('/', (req, res) => {
    res.render('notepad');
});*/

/*DB서버 전송*/
/*app.post('/', async (req, res, next) => {
  console.log(req.body);
  const body = req.body;
  client.query('INSERT INTO notepad (title, contents) VALUES (?,?)', [
    body.Title, body.Contents,
  ], (error, result) => {
      client.query('SELECT * FROM notepad', (error, result) => {
        console.log(result);
        
        fs.writeFileSync('./build/nodejs/notepad.json', 'get_notepad=' + JSON.stringify(result));
        fs.writeFileSync('./build/nodejs/notepad.json', JSON.stringify(result));
      });
      res.send();
  });
});

app.listen(3030, () => {
  console.log('Server Running 3030...');
});*/