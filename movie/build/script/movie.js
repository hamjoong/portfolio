/*Movie Nav slide 무비 메뉴바 슬라이드 영역*/
$('header nav > ul').mouseenter(function() {
  $('ul.sub_nav').stop().slideDown(500)
})

$('header nav > ul').mouseleave(function() {
  $('ul.sub_nav').stop().slideUp(300)
})

/*Movie Font 무비 무비차트,상영예정 클릭시 리스트 변경영역*/
$('.movie_font').click( () => {
  $('.movie_img_box2').hide();
  $('.movie_img_box').show();
  $('.movie_font').css('background-color', 'rgb(230,230,230)');
  $('.movie_font').css('color', '#555'); 
  $('.movie_img_box').css('background-color', 'rgb(230,230,230)');
  $('.movie_font2').css('background-color', '#FFF');
  $('.movie_font2').css('color', 'rgb(80,80,80)');  
})

$('.movie_font2').click( () => {
  $('.movie_img_box').hide();
  $('.movie_img_box2').show();
  $('.movie_font2').css('background-color', 'rgb(230,230,230)');
  $('.movie_font2').css('color', '#555'); 
  $('.movie_img_box2').css('background-color', 'rgb(230,230,230)');
  $('.movie_font').css('background-color', '#FFF');
  $('.movie_font').css('color', 'rgb(80,80,80)');  
})

/*Movie Img Click 무비 이미지 클릭시 영상 변경 영역*/
$('.movie_img').click( () => {
  $('.trailer_box2').hide();
  $('.trailer_box3').hide();
  $('.trailer_box4').hide();
  $('.trailer_box5').hide();
  $('.trailer_box6').hide();
  $('.trailer_box7').hide();
  $('.trailer_box8').hide();
  $('.trailer_box9').hide();
  $('.trailer_box10').hide();
  $('.trailer_box11').hide();
  $('.trailer_box12').hide();
  $('.trailer_box').show();
})

$('.movie_img2').click( () => {
  $('.trailer_box').hide();
  $('.trailer_box3').hide();
  $('.trailer_box4').hide();
  $('.trailer_box5').hide();
  $('.trailer_box6').hide();
  $('.trailer_box7').hide();
  $('.trailer_box8').hide();
  $('.trailer_box9').hide();
  $('.trailer_box10').hide();
  $('.trailer_box11').hide();
  $('.trailer_box12').hide();
  $('.trailer_box2').show();
})

$('.movie_img3').click( () => {
  $('.trailer_box').hide();
  $('.trailer_box2').hide();
  $('.trailer_box4').hide();
  $('.trailer_box5').hide();
  $('.trailer_box6').hide();
  $('.trailer_box7').hide();
  $('.trailer_box8').hide();
  $('.trailer_box9').hide();
  $('.trailer_box10').hide();
  $('.trailer_box11').hide();
  $('.trailer_box12').hide();
  $('.trailer_box3').show();
})

$('.movie_img4').click( () => {
  $('.trailer_box').hide();
  $('.trailer_box2').hide();
  $('.trailer_box3').hide();
  $('.trailer_box5').hide();
  $('.trailer_box6').hide();
  $('.trailer_box7').hide();
  $('.trailer_box8').hide();
  $('.trailer_box9').hide();
  $('.trailer_box10').hide();
  $('.trailer_box11').hide();
  $('.trailer_box12').hide();
  $('.trailer_box4').show();
})

$('.movie_img5').click( () => {
  $('.trailer_box').hide();
  $('.trailer_box2').hide();
  $('.trailer_box3').hide();
  $('.trailer_box4').hide();
  $('.trailer_box6').hide();
  $('.trailer_box7').hide();
  $('.trailer_box8').hide();
  $('.trailer_box9').hide();
  $('.trailer_box10').hide();
  $('.trailer_box11').hide();
  $('.trailer_box12').hide();
  $('.trailer_box5').show();
})

$('.movie_img6').click( () => {
  $('.trailer_box').hide();
  $('.trailer_box2').hide();
  $('.trailer_box3').hide();
  $('.trailer_box4').hide();
  $('.trailer_box5').hide();
  $('.trailer_box7').hide();
  $('.trailer_box8').hide();
  $('.trailer_box9').hide();
  $('.trailer_box10').hide();
  $('.trailer_box11').hide();
  $('.trailer_box12').hide();
  $('.trailer_box6').show();
})

$('.movie_img7').click( () => {
  $('.trailer_box').hide();
  $('.trailer_box2').hide();
  $('.trailer_box3').hide();
  $('.trailer_box4').hide();
  $('.trailer_box5').hide();
  $('.trailer_box6').hide();
  $('.trailer_box8').hide();
  $('.trailer_box9').hide();
  $('.trailer_box10').hide();
  $('.trailer_box11').hide();
  $('.trailer_box12').hide();
  $('.trailer_box7').show();
})


$('.movie_img8').click( () => {
  $('.trailer_box').hide();
  $('.trailer_box2').hide();
  $('.trailer_box3').hide();
  $('.trailer_box4').hide();
  $('.trailer_box5').hide();
  $('.trailer_box6').hide();
  $('.trailer_box7').hide();
  $('.trailer_box9').hide();
  $('.trailer_box10').hide();
  $('.trailer_box11').hide();
  $('.trailer_box12').hide();
  $('.trailer_box8').show();
})

$('.movie_img9').click( () => {
  $('.trailer_box').hide();
  $('.trailer_box2').hide();
  $('.trailer_box3').hide();
  $('.trailer_box4').hide();
  $('.trailer_box5').hide();
  $('.trailer_box6').hide();
  $('.trailer_box7').hide();
  $('.trailer_box8').hide();
  $('.trailer_box10').hide();
  $('.trailer_box11').hide();
  $('.trailer_box12').hide();
  $('.trailer_box9').show();
})

$('.movie_img10').click( () => {
  $('.trailer_box').hide();
  $('.trailer_box2').hide();
  $('.trailer_box3').hide();
  $('.trailer_box4').hide();
  $('.trailer_box5').hide();
  $('.trailer_box6').hide();
  $('.trailer_box7').hide();
  $('.trailer_box8').hide();
  $('.trailer_box9').hide();
  $('.trailer_box11').hide();
  $('.trailer_box12').hide();
  $('.trailer_box10').show();
})

$('.movie_img11').click( () => {
  $('.trailer_box').hide();
  $('.trailer_box2').hide();
  $('.trailer_box3').hide();
  $('.trailer_box4').hide();
  $('.trailer_box5').hide();
  $('.trailer_box6').hide();
  $('.trailer_box7').hide();
  $('.trailer_box8').hide();
  $('.trailer_box9').hide();
  $('.trailer_box10').hide();
  $('.trailer_box12').hide();
  $('.trailer_box11').show();
})

$('.movie_img12').click( () => {
  $('.trailer_box').hide();
  $('.trailer_box2').hide();
  $('.trailer_box3').hide();
  $('.trailer_box4').hide();
  $('.trailer_box5').hide();
  $('.trailer_box6').hide();
  $('.trailer_box7').hide();
  $('.trailer_box8').hide();
  $('.trailer_box9').hide();
  $('.trailer_box10').hide();
  $('.trailer_box11').hide();
  $('.trailer_box12').show();
})

/*Movie Main Mini Click 무비 페이지 변경 영역*/
$('.nav1').click( () => {
  $('main').hide();
  $('.mini_box').show();
  $('.movie_chaert_expected_box2').hide();
})

$('.header_font2').click( () => {
  $('.mini_box').hide();
  $('main').show();
})

/*Movie Mini Header Font 무비 미니 헤더 폰트 영역 클릭시 색상 변경 영역*/
$('.mini_header_font').click( () => {
  $('.mini_header_font').css('background-color', 'rgb(255,192,203)')
  $('.mini_header_font').css('color', '#555')
  $('.mini_header_font2').css('background-color', '#555')
  $('.mini_header_font2').css('color', '#FFF') 
})

$('.mini_header_font2').click( () => {
  $('.mini_header_font2').css('background-color', 'rgb(255,192,203)')
  $('.mini_header_font2').css('color', '#555')
  $('.mini_header_font').css('background-color', '#555')
  $('.mini_header_font').css('color', '#FFF') 
})

/*Movie Mini Heade Font 무비 미니 헤더 폰트 클릭시 LIST 바뀌는 영역*/
$('.mini_header_font').click( () => {
  $('.movie_chaert_expected_box2').hide();
  $('.movie_chaert_expected_box').show();
})

$('.mini_header_font2').click( () => {
  $('.movie_chaert_expected_box').hide();
  $('.movie_chaert_expected_box2').show();
})