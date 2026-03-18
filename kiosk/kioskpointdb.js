const mysql = require('mysql');

const con = mysql.createConnection( {
  host: 'localhost',
  user: 'c16st30',
  password: 'Z9U7dffwthoQloDI',
  database: 'c16st30'
});

con.connect ( function (err) {
  if (err) throw err;
  console.log('연결됨!');

  const sql = 'CREATE TABLE kioskpoint (id INT AUTO_INCREMENT PRIMARY KEY, phone_number CHAR(11) NOT NULL, point INT)';
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log('테이블 생성됨');
  });

  /*테이블 변경*/
  /*const sql2 = 'ALTER TABLE kioskpoint ADD COLUMN point int';
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log('테이블 생성됨');
  });*/

  /*레코드 삽입*/
  /*const sql = "INSERT INTO kioskpoint (phone_number, point) VALUES (01073555308, 9000000)";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log('1개의 레코드 삽입됨');
  });*/

});