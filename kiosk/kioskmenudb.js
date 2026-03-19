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

  const sql = 'CREATE TABLE kioskmenu (id INT AUTO_INCREMENT PRIMARY KEY, menu_name CHAR(20), menu_price INT, menu_description VARCHAR(255))';
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log('Table Created');
  });

  /*테이블 변경*/
  /*const sql = 'ALTER TABLE kioskmenu ADD COLUMN menu_description VARCHAR(255)';
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log('Table created');
  });*/

  /*레코드 삽입*/
  /*const sql = "INSERT INTO kioskmenu (menu_name, menu_price, menu_description) VALUES ('커피', 5600, '커피')";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log('1 record inserted');
  });*/

  //레코드 다중 삽입
  /*const sql = "insert into kioskmenu (menu_name, menu_price, menu_description) values ?";
  const values = [
    ['아메리카노', 5500, '에스프레소와 정수된 물,얼음을 혼합한 아이스 커피'],
    ['바닐라라떼', 5800, '고소한 바닐라와 우유에 에스프레소를 혼합한 아이스 커피'],
    ['카페라떼', 5000, '농도 짙은 에스프레소와 우유, 얼음을 혼합한 아이스 커피'],
    ['카페모카', 5500, '달콤한 초콜릿과 우유에 에스프레소를 혼합 한 후, 생크림을 얹은 아이스 커피'],
    ['헤이오트라떼', 5800, '골든색 원두와 헤이즐넛 향의 풍미가 식물성 귀리음료와 어우러져 달콤 고소한 파스쿠찌만의 ...'],
    ['시그니처크림커피', 5800, '부드럽게 흘러내리는 플랫크림과 커피와의 만남'],
    ['아메리카노HOT', 4500, '뜨거운물에 에스프레소를 희석, 한층 부드럽고 깊은 아로마를 느낄 수 있는 레귤러 커피'],
    ['카페모카HOT', 5800, '달콤한 다크 초콜릿과 에스프레소에 부드러운 스팀 밀크를 혼합 한 후,생크림을 얹은 베리...'],
    ['카푸치노HOT', 5000, '에스프레소와 부드러운 벨벳 밀크폼을 혼합하여커피와 우유거품의 절묘한 풍미를 느낄 수 있...'],
    ['자색고구마라떼', 5500, '달콤한 자색 고구마를 활용한 부드러운 라떼'],
    ['흑임자오트라떼', 5800, '고소한 흑임자와 식물성 귀리음료로 어우러진 고소한 라떼'],
    ['아이스초코', 5800, '달콤한 다크 초콜릿과 우유를 혼합한 아이스 초콜릿 음료'],
    ['자몽스파클링', 5500, '자몽베이스와 탄산수를 혼합한 스파클링 음료'],
    ['레몬스파클링', 5800, '상큼한 레몬베이스와 탄산수를 혼합한 스파클링 음료'],
    ['청포도스파클링', 5000, '청포도의 상큼한 맛과 탄산수가 조화를 이루는 스파클링 음료'],
    ['허니브레드', 6200, '고소한 버터, 달달한 꿀을 품은 바삭한 식빵위에 달콤한 메이플 시럽이 잘 어우러진 허니브...'],
    ['플레인베이글', 6200, '담백한 플레인 베이글과 함께 제공되는 부드러운 크림치즈'],
    ['에그타르트', 1500, '달걀의 풍미를 가득 담은 고소하고 환상적인 타르트'],
    ['오마이초코', 6500, '가득한 딸기와 초코 시트 속 베리 콤포트가 어우러진 초코 가나슈 생크림 케이크'],
    ['치즈케이크', 5500, '촉촉하고 부드러운 식감과 진한 풍미의 치즈 맛을느낄 수 있는 수플레 타입 치즈 케이크'],
    ['더진한캐롯', 6300, '담백한 당근을 듬뿍 넣은 캐롯시트와 더 진한 크림치즈가 어우러진 파스쿠찌 캐롯케이크']
  ];
  con.query(sql, [values], function (err,result){
    if (err) throw err;
    console.log("Number of recorde inserted: " + result.affectedRows);
  });*/
});