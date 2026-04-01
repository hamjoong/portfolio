$(document).ready(function() {
  // 왜: 사용자가 메인 네비게이션 메뉴를 클릭했을 때, 해당 메뉴의 하위 메뉴를 표시하거나 숨기기 위함입니다.
  // 이는 사용자에게 더 많은 옵션을 제공하고 인터페이스를 깔끔하게 유지하는 데 도움이 됩니다.
  $('.main_nav > p').on('click', function(e) {
    e.stopPropagation(); // 이벤트 전파를 막아 불필요한 동작을 방지합니다.
    $(this).siblings('.sub_nav').slideToggle(); // 현재 클릭된 요소의 형제인 .sub_nav를 부드럽게 열거나 닫습니다.
  });

  // 왜: 사용자가 메인 네비게이션의 하위 메뉴 외 다른 곳을 클릭했을 때, 열려 있는 하위 메뉴를 닫기 위함입니다.
  // 이는 UI의 일관성을 유지하고 사용자가 의도치 않게 메뉴가 계속 열려있는 것을 방지합니다.
  $(document).on('click', function(e) {
    if (!$(e.target).closest('.main_nav').length) {
      $('.sub_nav').slideUp(); // .sub_nav가 열려 있다면 모두 닫습니다.
    }
  });

  // 왜: '무비차트'와 '상영예정작' 탭 간의 전환 기능을 구현하여 사용자에게 두 섹션의 콘텐츠를 명확히 구분하여 보여주기 위함입니다.
  // 이는 README에 명시된 '핵심 트러블 슈팅' 중 하나인 탭 전환 로직 충돌 문제를 해결하고,
  // 사용자가 원하는 정보를 더 쉽게 탐색할 수 있도록 돕습니다.
  $('.movie_box2 .movie_font').on('click', function() {
    // 왜: '무비차트'를 선택했을 때, '상영예정작' 섹션을 숨기고 '무비차트' 섹션을 표시하기 위함입니다.
    $('.movie_img_box').show(); // 무비 차트 이미지를 표시합니다.
    $('.movie_img_box2').hide(); // 상영 예정작 이미지를 숨깁니다.
    $('.movie_trailer_box article').hide(); // 모든 트레일러를 숨깁니다. (기본 상태로 돌아감)
    $('.movie_trailer_box .trailer_box').show(); // 첫 번째 트레일러를 표시합니다 (무비 차트와 연관된 첫 번째 트레일러).
    // 선택된 탭에 대한 시각적 피드백을 강화합니다.
    $('.movie_font').css({'cursor': 'pointer', 'border': '0.2vw solid pink'});
    $('.movie_font2').css({'cursor': 'pointer', 'border': 'none'});
  });

  $('.movie_box2 .movie_font2').on('click', function() {
    // 왜: '상영예정작'을 선택했을 때, '무비차트' 섹션을 숨기고 '상영예정작' 섹션을 표시하기 위함입니다.
    $('.movie_img_box').hide(); // 무비 차트 이미지를 숨깁니다.
    $('.movie_img_box2').show(); // 상영 예정작 이미지를 표시합니다.
    $('.movie_trailer_box article').hide(); // 모든 트레일러를 숨깁니다. (선택된 섹션과 연관된 트레일러를 나중에 표시할 수 있음)
    // 선택된 탭에 대한 시각적 피드백을 강화합니다.
    $('.movie_font2').css({'cursor': 'pointer', 'border': '0.2vw solid pink'});
    $('.movie_font').css({'cursor': 'pointer', 'border': 'none'});
  });

  // 초기 로딩 시 '무비차트'가 기본으로 보이도록 설정합니다.
  // 이는 사용자가 페이지에 처음 접속했을 때 일관된 초기 상태를 제공하기 위함입니다.
  $('.movie_box2 .movie_font').trigger('click');
  // 초기 트레일러 표시 (첫 번째 트레일러)
  $('.movie_trailer_box .trailer_box').show();

  // 왜: 모바일 뷰에서 헤더의 '무비차트' 또는 '상영예정작' 텍스트를 클릭했을 때,
  // 해당 섹션으로 스크롤하거나 콘텐츠를 전환하기 위함입니다.
  // 현재 구현에서는 탭 전환이 SCSS 미디어 쿼리에 의해 기본적으로 처리되므로,
  // 여기서는 초기 로딩 시 기본 탭 (무비차트)을 활성화하는 역할을 합니다.
  $('.mini_box .mini_header_font').on('click', function() {
    $('.movie_chaert_expected_box').show(); // 무비 차트 리스트 박스를 표시
    $('.movie_chaert_expected_box2').hide(); // 상영 예정작 리스트 박스를 숨김
    $(this).css({'background-color': 'pink', 'color': '#555'});
    $('.mini_header_font2').css({'background-color': 'transparent', 'color': '#FFF'});
  });

  $('.mini_box .mini_header_font2').on('click', function() {
    $('.movie_chaert_expected_box').hide(); // 무비 차트 리스트 박스를 숨김
    $('.movie_chaert_expected_box2').show(); // 상영 예정작 리스트 박스를 표시
    $(this).css({'background-color': 'pink', 'color': '#555'});
    $('.mini_header_font').css({'background-color': 'transparent', 'color': '#FFF'});
  });

  // 페이지 로드 시 모바일 뷰의 초기 탭 상태 설정
  if ($(window).width() <= 768) {
    $('.mini_box .mini_header_font').trigger('click');
  }

  // 왜: 영화 포스터 이미지를 클릭했을 때, 해당 영화의 트레일러를 재생 목록에서 표시하기 위함입니다.
  // README의 '핵심 트러블 슈팅'에서 언급된 '트레일러 영상 제어' 기능을 일부 구현합니다.
  // 현재는 각 이미지 클릭 시 모든 트레일러를 숨기고 첫 번째 트레일러를 보여주는 기본적인 동작만 구현합니다.
  // 추후 각 이미지와 특정 트레일러를 매핑하는 로직이 필요할 수 있습니다.
  $('.img_box article, .img_box2 article').on('click', function() {
    // 모든 트레일러를 숨깁니다.
    $('.movie_trailer_box article').hide();
    // 첫 번째 트레일러를 표시합니다.
    $('.movie_trailer_box .trailer_box').show();
    // 왜: 사용자가 특정 영화에 관심을 보였으므로, 관련 트레일러를 보여주어 몰입도를 높이기 위함입니다.
    // 이 부분은 실제 영화-트레일러 매핑 로직으로 확장될 수 있습니다.
  });
});
