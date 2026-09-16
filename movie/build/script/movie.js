/* 무비 메뉴바 슬라이드 영역 */
$('header nav > ul').mouseenter(function() {
  $('ul.sub_nav').stop().slideDown(500);
});

$('header nav > ul').mouseleave(function() {
  $('ul.sub_nav').stop().slideUp(300);
});

// 재생 중인 모든 유튜브 iframe 영상 일시 정지/초기화 함수
function stopAllTrailers() {
  $('.movie_trailer_box iframe').each(function() {
    const src = $(this).attr('src');
    $(this).attr('src', src);
  });
}

/* 무비 무비차트, 상영예정 클릭 시 리스트 변경 영역 */
$('.movie_font, .movie_font2').click(function() {
  const isChart2 = $(this).hasClass('movie_font2');
  
  $('.movie_img_box').toggle(!isChart2);
  $('.movie_img_box2').toggle(isChart2);
  
  $('.movie_font').css({
    'background-color': isChart2 ? '#FFF' : 'rgb(230,230,230)',
    'color': isChart2 ? 'rgb(80,80,80)' : '#555'
  });
  
  $('.movie_font2').css({
    'background-color': isChart2 ? 'rgb(230,230,230)' : '#FFF',
    'color': isChart2 ? '#555' : 'rgb(80,80,80)'
  });

  if (isChart2) {
    $('.movie_img_box2').css('background-color', 'rgb(230,230,230)');
  } else {
    $('.movie_img_box').css('background-color', 'rgb(230,230,230)');
  }

  // 탭 전환 시 기존 재생 중이던 예고편 정지 및 기본 예고편으로 리셋
  stopAllTrailers();
  $('.movie_trailer_box article').hide();
  if (isChart2) {
    $('.trailer_box7').show(); // 상영예정작 첫 번째 영상
  } else {
    $('.trailer_box').show();  // 무비차트 첫 번째 영상
  }
});

/* 무비 이미지 클릭 시 영상 변경 영역 */
$('.img_box article, .img_box2 article').click(function(e) {
  e.stopPropagation();
  const className = $(this).attr('class');
  // 정규표현식: 클래스명 내의 movie_img 숫자를 추출
  const match = className.match(/movie_img(\d+)/);
  const num = match ? match[1] : "";
  
  stopAllTrailers();
  $('.movie_trailer_box article').hide();
  // num이 비어있거나 1이면 첫 번째 trailer_box 표시
  if (num === "" || parseInt(num) <= 1) {
    $('.trailer_box').show();
  } else {
    $(`.trailer_box${num}`).show();
  }
});

/* 무비 페이지 변경 영역 */
$('.nav1').click(() => {
  $('main').hide();
  $('.mini_box').show();
  $('.movie_chaert_expected_box2').hide();
});

$('.header_font2').click(() => {
  $('.mini_box').hide();
  $('main').show();
});

/* 무비 미니 헤더 폰트 영역 클릭 시 색상 및 리스트 변경 영역 */
$('.mini_header_font, .mini_header_font2').click(function() {
  const isExpected = $(this).hasClass('mini_header_font2');
  
  $('.mini_header_font').css({
    'background-color': isExpected ? '#555' : 'rgb(255,192,203)',
    'color': isExpected ? '#FFF' : '#555'
  });
  
  $('.mini_header_font2').css({
    'background-color': isExpected ? 'rgb(255,192,203)' : '#555',
    'color': isExpected ? '#555' : '#FFF'
  });
  
  $('.movie_chaert_expected_box').toggle(!isExpected);
  $('.movie_chaert_expected_box2').toggle(isExpected);
});
