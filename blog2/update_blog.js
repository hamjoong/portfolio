const fs = require('fs');

try {
  // 퍼그 파일
  let pug = fs.readFileSync('D:/Program Files/Developer/portfolioproject/portfolio/blog2/src/pug/blog.pug', 'utf8');

  // defer 속성 추가
  pug = pug.replace(
    "script(src='https://use.fontawesome.com/releases/v6.1.0/js/all.js' crossorigin='anonymous')",
    "script(src='https://use.fontawesome.com/releases/v6.1.0/js/all.js' crossorigin='anonymous' defer)"
  );

  // 주석 제거
  pug = pug.replace("    //script(src='../script/blog.js')\n", "");

  // 지연 로딩
  pug = pug.replace(/img\.img-fluid\((.*?)\)/g, "img.img-fluid($1 loading='lazy')");
  pug = pug.replace(/img\.img-fluid2\((.*?)\)/g, "img.img-fluid2($1 loading='lazy')");

  fs.writeFileSync('D:/Program Files/Developer/portfolioproject/portfolio/blog2/src/pug/blog.pug', pug);

  // HTML 파일
  let html = fs.readFileSync('D:/Program Files/Developer/portfolioproject/portfolio/blog2/build/html/blog.html', 'utf8');

  // defer 속성 추가
  html = html.replace(
    '<script src="https://use.fontawesome.com/releases/v6.1.0/js/all.js" crossorigin="anonymous"></script>',
    '<script src="https://use.fontawesome.com/releases/v6.1.0/js/all.js" crossorigin="anonymous" defer></script>'
  );

  // 주석 제거
  html = html.replace("    <!--script(src='../script/blog.js')-->\n", "");

  // 지연 로딩
  html = html.replace(/<img class="img-fluid" (.*?)>/g, '<img class="img-fluid" $1 loading="lazy">');
  html = html.replace(/<img class="img-fluid2" (.*?)>/g, '<img class="img-fluid2" $1 loading="lazy">');

  fs.writeFileSync('D:/Program Files/Developer/portfolioproject/portfolio/blog2/build/html/blog.html', html);
  console.log("최적화가 성공적으로 적용되었습니다.");
} catch (e) {
  console.error("에러:", e);
}
