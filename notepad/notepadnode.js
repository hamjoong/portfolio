const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();

const client = mysql.createConnection({
  host: "localhost",
  user: "c16st30",
  password: "Z9U7dffwthoQloDI",
  database: "c16st30"
});

app.use(bodyParser.urlencoded({
  extended: false
}));

/*view pug 경로 설정*/
app.set('view engine', 'pug');
app.set('views', './src/pug');

/*스테틱 경로 설정*/
app.use(express.static('build'));

/*json notepad 파싱 pug*/
app.get('/', (req, res) => {
  res.render('notepad');
});

/* 메모 데이터 조회 API */
app.get('/notes', (req, res) => {
  client.query('SELECT * FROM notepad', (error, result) => {
    if (error) {
      console.error(error);
      res.status(500).send('Database Error');
    } else {
      res.json(result);
    }
  });
});

/*DB서버 전송*/
app.post('/', (req, res) => {
  const body = req.body;
  client.query('INSERT INTO notepad (title, contents) VALUES (?,?)', [
    body.Title, body.Contents,
  ], (error, result) => {
    if (error) {
      console.error(error);
      res.status(500).send('Database Error');
    } else {
      res.json({ id: result.insertId });
    }
  });
});

/* 메모 삭제 API */
app.delete('/notes/:id', (req, res) => {
  const id = req.params.id;
  client.query('DELETE FROM notepad WHERE id = ?', [id], (error, result) => {
    if (error) {
      console.error(error);
      res.status(500).send('Database Error');
    } else {
      res.send();
    }
  });
});

app.listen(3030, () => {
  console.log('Server Running 3030...');
});