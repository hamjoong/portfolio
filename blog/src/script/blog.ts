/*scroll 태그 영역*/
$('.blog_nav_home').click(function() {
  $('html,body').animate({
    scrollTop : $('.blog_intro_box').offset().top
  }, 500);
});

$('.blog_nav_aboutme').click(function() {
  $('html,body').animate({
    scrollTop : $('.blog_aboutme_box').offset().top
  }, 500);
});

$('.blog_nav_skill').click(function() {
  $('html,body').animate({
    scrollTop : $('.blog_aboutme_skill_box').offset().top
  }, 500);
});

$('.blog_nav_portfolio').click(function() {
  $('html,body').animate({
    scrollTop : $('.blog_portfolio_box').offset().top
  }, 500);
});

/*nav color 영역*/
$('.blog_nav_home').click(function() {
  $('nav').css('background-color','rgba(135,206,235,0.1)');
})

$('.blog_nav_aboutme').click(function() {
  $('nav').css('background-color','rgba(255,193,69,0.7)');
})

$('.blog_nav_skill').click(function() {
  $('nav').css('background-color','rgba(148,180,255,0.7)');
})

$('.blog_nav_portfolio').click(function() {
  $('nav').css('background-color','rgb(212,184,182,0.7)');
})

/*bar 차트 영역*/
$(window).ready(function() {
	draw(90, '.blog_skill_bar_html', 'rgb(148,180,255)');
	draw(60, '.blog_skill_bar_script', 'rgb(148,180,255)');
  draw(90, '.blog_skill_bar_css', 'rgb(148,180,255)');
  draw(60, '.blog_skill_bar_nodejs', 'rgb(148,180,255)');
  draw(90, '.blog_skill_bar_sass', 'rgb(148,180,255)');
  draw(60, '.blog_skill_bar_ajax', 'rgb(148,180,255)');
  draw(90, '.blog_skill_bar_pug', 'rgb(148,180,255)');
  draw(50, '.blog_skill_bar_jquery', 'rgb(148,180,255)');
  draw(60, '.blog_skill_bar_mysql', 'rgb(148,180,255)');
  draw(40, '.blog_skill_bar_typescript', 'rgb(148,180,255)');
  draw(40, '.blog_skill_bar_java', 'rgb(148,180,255)');
  draw(60, '.blog_skill_bar_json', 'rgb(148,180,255)');
});

function draw(max, classname, colorname) {
  let i = 0;
  const func = setInterval(function() {
    if( i < max ){
        color(i, classname, colorname);
        i++;
    } else {
      clearInterval(func);
    }
  }, 5);
}

function color(i, classname, colorname) {
  $(classname).css( {
    'background' : 'linear-gradient(to right,' + colorname + '0%' + i + '% , rgb(255,255,255)' + i + '%100%)'
  });
}

/*skill 클릭 영역*/
$('[class^="blog_skill_"][class$="_img"]').click(function() {
  const clickedClass = $(this).attr('class');
  const skill = clickedClass.split('_')[2];

  $('[class^="blog_skill_bar_"]').hide();
  $('[class^="blog_skill_bar_"][class$="_font2"]').hide();

  $('.blog_skill_bar_' + skill).toggle();
  $('.blog_skill_bar_' + skill + '_font2').toggle();
});

/*portfolio 클릭 영역*/
$('[class^="portfolio_list"]').click(function() {
  const clickedClass = $(this).attr('class');
  const listIndex = parseInt(clickedClass.replace('portfolio_list', ''), 10);

  // 모든 포트폴리오 요소 숨기기
  $('[class^="blog_portfolio_img"]').hide();
  $('[class^="blog_portfolio_contents"]').hide();
  $('[class^="blog_portfolio_link"]').hide();

  // 대상 인덱스 결정
  let targetIndex;
  if (listIndex === 2) {
    targetIndex = '';
  } else if (listIndex > 2) {
    targetIndex = (listIndex - 1).toString();
  }

  // 올바른 요소 토글
  if (targetIndex !== undefined) {
    $('.blog_portfolio_img' + targetIndex).toggle();
    $('.blog_portfolio_contents' + targetIndex).toggle();
    $('.blog_portfolio_link' + targetIndex).toggle();
    $('.blog_portfolio_link_' + (targetIndex === '' ? '1' : targetIndex)).toggle();
  }
});