const mysql = require('mysql');

const con = mysql.createConnection( {
  host: 'localhost',
  user: 'c16st30',
  password: 'Z9U7dffwthoQloDI',
  database: 'c16st30'
});

con.connect ( function (err) {
  if (err) throw err;
  console.log('Connected!');

  /*테이블 삽입*/
  /*const sql = 'CREATE TABLE notepad (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, contents VARCHAR(255) NOT NULL)';
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log('Table Created');
  });*/

  /*레코드 삽입*/
  /*const sql = "INSERT INTO notepad (title, contents) VALUES ('제목', '내용')";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log('1 record inserted');
  });*/
});