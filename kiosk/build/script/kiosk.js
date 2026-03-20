/* 키오스크 메뉴, 포인트 DB JSON 파싱 */
const initialJson = '{"get_kioskmenu": "" , "get_kioskpoint": "" }';
const initialObj = JSON.parse(initialJson);

/* 인트로 이미지 로딩 및 슬라이드 효과 */
$(window).on('load', () => {
  fetch('../nodejs/intro2.json?t=' + Math.random())
    .then(response => response.json())
    .then(introImgData => {
      let counter = 0;
      const changeImg = () => {
        if (counter == introImgData.length) counter = 0;
        const introPage = document.querySelector('.intro_page');
        if (introPage) {
          introPage.style.backgroundImage = `url(${introImgData[counter].url})`;
          introPage.style.backgroundSize = '100% 100%';
        }
        counter++;
        setTimeout(changeImg, 3000);
      };
      changeImg();
    })
    .catch(error => console.error('Intro image loading error:', error));
});

/* 인트로 페이지 클릭 시 메인 화면 표시 */
$('.intro_page').click(() => {
  $('.intro_page').hide();
  $('.main_box').show();
});

/* 네비게이션 메뉴 및 페이지 변경 통합 처리 */
const navItems = [
  { className: '.nav_famousmenu', boxToShow: '.menu_all_box' },
  { className: '.nav_coffee', boxToShow: '.menu_all_box2', additionalShow: '.hot_ice_button, .hot_ice_button2' },
  { className: '.nav_drink', boxToShow: '.menu_all_box4' },
  { className: '.nav_dessert', boxToShow: '.menu_all_box5' }
];

navItems.forEach(item => {
  $(item.className).click(() => {
    /* 네비게이션 배경색 초기화 및 선택된 메뉴 강조 */
    navItems.forEach(i => $(i.className).css('background', '#555'));
    $(item.className).css('background', '#AF4444');

    /* 모든 메뉴 박스 숨기기 및 선택된 박스 표시 */
    $('.menu_all_box, .menu_all_box2, .menu_all_box3, .menu_all_box4, .menu_all_box5').hide();
    $('.hot_ice_button, .hot_ice_button2').hide();
    $(item.boxToShow).show();
    if (item.additionalShow) $(item.additionalShow).show();
  });
});

/* 커피 메뉴 HOT/ICE 전환 버튼 */
$('.hot_ice_button').click(() => { $('.menu_all_box2').hide(); $('.menu_all_box3').show(); });
$('.hot_ice_button2').click(() => { $('.menu_all_box3').hide(); $('.menu_all_box2').show(); });

/* 장바구니 메뉴 클래스 */
class Kioskmenu {
  constructor(name, price, button_number, amount) {
    this.name = name;
    this.price = price;
    this.button_number = button_number;
    this.amount = amount;
  }

  /* 공통 DOM 요소 생성 함수 */
  createDiv(containerSelector, content) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    const div = document.createElement('div');
    div.className = `${this.name}_box`;
    div.innerHTML = content;
    container.appendChild(div);
  }

  /* 장바구니 리스트 출력 */
  sc_obj() {
    this.createDiv('.order_list_data', `
      <span class='menu_name_1_${this.name}'>${this.name}</span>
      <span class='menu_price_1_${this.name}'>${this.price}원</span>
      <button class='plus_menu_button_${this.button_number}'> + </button>
      <span class='menu_number_${this.name}'>${this.amount}</span>
      <button class='minus_menu_button_${this.button_number}'> - </button>
    `);
  }

  /* 결제 확인 리스트 출력 */
  pl_obj() {
    this.createDiv('.pay_list_font', `
      <span class='menu_name_1_${this.name}'>${this.name}</span>
      <span> 수량 </span>
      <span class='menu_number_${this.name}'>${this.amount}</span>
      <span class='menu_price_1_${this.name}'></span>
    `);
  }

  /* 영수증 리스트 출력 */
  rl_obj() {
    this.createDiv('.receipt_list_menuname', `
      <span class='menu_name_1_${this.name}'>${this.name}</span>
      <span class='menu_number_${this.name}'>${this.amount}</span>
    `);
  }

  /* 화면 표시 수량 및 가격 업데이트 */
  updateDisplay() {
    $(`.menu_number_${this.name}`).html(this.amount);
    $(`.menu_price_1_${this.name}`).html((this.price * this.amount).toLocaleString() + '원');
  }

  /* 수량 증가 */
  plus_sum() {
    this.amount++;
    this.updateDisplay();
  }

  /* 수량 감소 */
  minus_sum() {
    this.amount--;
    if (this.amount < 1) {
      this.amount = 0;
      $(`.${this.name}_box`).remove();
    } else {
      this.updateDisplay();
    }
  }

  /* 초기화 */
  remove_value() {
    this.amount = 0;
    $('.order_list_data, .sum_value, .pay_list_font, .pay_list_sum, .receipt_list_price, .receipt_list_menuname').empty();
  }
}

/* 메뉴 데이터 로딩 및 초기화 */
$(window).on('load', function () {
  fetch('../nodejs/kioskmenu.json?t=' + Math.random())
    .then(response => response.json())
    .then(menuData => {
      const menuListArray = menuData.map((data, i) => new Kioskmenu(data.menu_name, data.menu_price, i, 0));
      let priceArray = [];

      /* 전체 합계 금액 업데이트 함수 */
      const updateTotalPrice = () => {
        const total = priceArray.reduce((acc, curr) => acc + curr[1], 0);
        const formattedTotal = total.toLocaleString() + '원';
        $('.sum_value, .pay_list_sum, .receipt_list_price').html(formattedTotal);
      };

      /* 메뉴 클릭 이벤트 설정 */
      menuListArray.forEach((menu, i) => {
        $(`#coffe_${i}, #coffe_${i}_${i}`).click(() => {
          if (menu.amount < 1) {
            menu.sc_obj();
            menu.pl_obj();
            menu.rl_obj();
          }
          menu.plus_sum();
          priceArray.push([menu.name, Number(menu.price)]);
          updateTotalPrice();
        });

        /* 수량 조절 버튼 이벤트 위임 처리 */
        $(document).on('click', `.plus_menu_button_${i}`, () => {
          menu.plus_sum();
          priceArray.push([menu.name, Number(menu.price)]);
          updateTotalPrice();
        });

        $(document).on('click', `.minus_menu_button_${i}`, () => {
          menu.minus_sum();
          const idx = priceArray.findIndex(p => p[0] === menu.name);
          if (idx > -1) priceArray.splice(idx, 1);
          
          if (priceArray.length === 0) {
            $('.sum_value, .pay_list_sum, .receipt_list_price').html('0원');
          } else {
            updateTotalPrice();
          }
        });

        /* 장바구니 및 옵션 초기화 */
        $('.xi-trash, .receipt_close_button_box, .save_main_button').click(() => {
          menu.remove_value();
          priceArray = [];
          $('.store_box, .packaging_box, .generally_box, .aplenty_box, .shot_box2, .shot_box3, .store_box2, .packaging_box2, .shot_box4, .shot_box5, .store_box3, .packaging_box3, .hotice_box, .hotice_box2, .store_box4, .packaging_box4').css('background', '#555');
        });
      });
    })
    .catch(error => console.error('Menu data loading error:', error));
});

/* 대기 번호 관리 */
$(document).ready(() => {
  const waitingNumber = localStorage.getItem('waitingNumber') || 1;
  $('.receipt_list_number2').html(waitingNumber + '&nbsp;번&nbsp;');
  $('.receipt_close_button_box, .save_main_button').click(() => location.reload());
});

/* 랜덤 포인트 생성 */
$(document).ready(() => {
  const randomNumber = Math.floor(Math.random() * 999) + 1;
  $('.save_font, .point_remaining_font2').html(randomNumber + '&nbsp;P&nbsp;');
});

/* 결제하기 버튼 클릭 시 포인트 페이지 이동 */
$('.buy_button').click(function () {
  if ($('.order_list_data').children().length > 0) {
    $('.main_box').hide();
    $('.point_signup_pay_box').show();
  } else {
    $('.model_box').show();
  }
});

$('.model_close_button').click(() => $('.model_box').hide());

/* 추가 메뉴 상세 정보 데이터 */
const extraMenuData = [
  { name: '아메리카노', img: '아메리카노_크기수정.png', ex: '에스프레소와 정수된 물, 얼음을 혼합한 아이스 커피' },
  { name: '바닐라 라떼', img: '아이스-바닐라라떼.png', ex: '고소한 바닐라와 우유에 에스프레소를 혼합한 아이스 커피' },
  { name: '카페라떼', img: '아이스-카페라떼.png', ex: '에스프레소와 우유, 얼음을 혼합한 아이스 커피' },
  { name: '카페모카', img: '아이스-카페모카.png', ex: '달콤한 초콜릿에 우유와 에스프레소를 혼합한 아이스 커피' },
  { name: '헤이오트라떼', img: '아이스-헤이오트라떼.png', ex: '헤이즐넛 향의 풍미, 식물성 귀리음료가 어우러진 달콤 고소한 커피' },
  { name: '시그니처 크림라떼', img: '시그니처-크림-커피.png', ex: '부드럽게 흘러내리는 플랫크림과 커피의 만남' },
  { name: '아메리카노', img: '아메리카노_크기수정.png', ex: '에스프레소와 정수된 물, 얼음을 혼합한 아이스 커피' },
  { name: '바닐라 라떼', img: '아이스-바닐라라떼.png', ex: '고소한 바닐라와 우유에 에스프레소를 혼합한 아이스 커피' },
  { name: '카페라떼', img: '아이스-카페라떼.png', ex: '에스프레소와 우유, 얼음을 혼합한 아이스 커피' },
  { name: '카페모카', img: '아이스-카페모카.png', ex: '달콤한 초콜릿에 우유와 에스프레소를 혼합한 아이스 커피' },
  { name: '헤이오트라떼', img: '아이스-헤이오트라떼.png', ex: '헤이즐넛 향의 풍미, 식물성 귀리음료가 어우러진 달콤 고소한 커피' },
  { name: '시그니처 크림라떼', img: '시그니처-크림-커피.png', ex: '부드럽게 흘러내리는 플랫크림과 커피의 만남' },
  { name: '아메리카노', img: '뜨아메리카노.png', ex: '에스프레소와 정수된 물을 혼합한 커피' },
  { name: '카페모카', img: '뜨카페모카.png', ex: '달콤한 초콜릿에 우유와 에스프레소를 혼합한 커피' },
  { name: '카푸치노', img: '뜨카푸치노.png', ex: '에스프레소와 부드러운 벨벳 밀크폼을 혼합한 커피' },
  { name: '자색 고구마 라떼', img: '자색-고구마-라떼.png', ex: '달콤한 자색 고구마를 활용한 부드러운 라떼' },
  { name: '흑임자 오트 라떼', img: '흑임자-오트-라떼.png', ex: '고소한 흑임자와 식물성 귀리음료로 어우러진 고소한 라떼' },
  { name: '아이스 초코', img: '아이스-초콜릿.png', ex: '달콤한 다크 초콜릿과 우유를 혼합한 아이스 음료' },
  { name: '자몽 스파클링', img: '자몽-스파클링.png', ex: '자몽베이스와 탄산수를 혼합한 스파클링 음료' },
  { name: '레몬 스파클링', img: '레몬-스파클링.png', ex: '레몬 베이스와 탄산수를 혼합한 스파클링 음료' },
  { name: '청포도 스파클링', img: '청포도-스파클링.png', ex: '청포도 베이스와 탄산수를 혼합한 스파클링 음료' },
  { name: '허니 브레드', img: '허니브레드+생크림.png', ex: '버터, 꿀을 품은 바삭한 식빵위에 달콤한 시럽이 어우러진 허니브레드' },
  { name: '플레인 베이글', img: '플레인-베이글.png', ex: '담백한 플레인 베이글과 함께 제공되는 부드러운 크림치즈' },
  { name: '에그 타르트', img: '에그-타르트.png', ex: '달걀의 풍미를 가득 담은 고소하고 환상적인 타르트' },
  { name: '오 마이 초코', img: '오-마이-초코.png', ex: '초코 가나슈 생크림케익 안에 가득한 딸기' },
  { name: '치즈 케이크', img: '수플레-치즈-케이크.png', ex: '촉촉하고 부드러운 풍미의 수플레 치즈 케이크' },
  { name: '더 진한 캐롯', img: '더-진한-캐롯-케이크.png', ex: '당근을 듬뿍 넣은 시트에 진한 크림치즈가 어우러진 케이크' }
];

/* 추가 주문 리스트 아이템 클릭 처리 */
$('.menu_list > section > article').each(function (index) {
  $(this).click(function () {
    const data = extraMenuData[index];
    $('.main_box').hide();
    $('.select_menu_info_box3, .select_menu_info_box4, .select_menu_info_box5').hide();
    $('.extra_order_list_box, .select_menu_info_box2').show();
    $('.select_menu_img').css('background-image', `url("../img/${data.img}")`);
    $('.select_menu_img_name').html(data.name);
    $('.select_menu_info_seolmyeong_font').html(data.ex);
  });
});

/* 추가 주문 카테고리별 상세 화면 전환 */
$('.menu_all_box3').click(() => { $('.select_menu_info_box2').hide(); $('.select_menu_info_box3').show(); });
$('.menu_all_box4').click(() => { $('.select_menu_info_box2').hide(); $('.select_menu_info_box4').show(); });
$('.menu_all_box5').click(() => { $('.select_menu_info_box2').hide(); $('.select_menu_info_box5').show(); });

/* 옵션 선택 시 색상 강조 토글 */
const toggleSelection = (on, off) => {
  $(on).css('background', '#AF4444');
  $(off).css('background', '#555');
};

$('.store_box').click(() => toggleSelection('.store_box', '.packaging_box'));
$('.packaging_box').click(() => toggleSelection('.packaging_box', '.store_box'));
$('.generally_box').click(() => toggleSelection('.generally_box', '.aplenty_box'));
$('.aplenty_box').click(() => toggleSelection('.aplenty_box', '.generally_box'));
$('.shot_box2').click(() => toggleSelection('.shot_box2', '.shot_box3'));
$('.shot_box3').click(() => toggleSelection('.shot_box3', '.shot_box2'));
$('.store_box2').click(() => toggleSelection('.store_box2', '.packaging_box2'));
$('.packaging_box2').click(() => toggleSelection('.packaging_box2', '.store_box2'));
$('.shot_box4').click(() => toggleSelection('.shot_box4', '.shot_box5'));
$('.shot_box5').click(() => toggleSelection('.shot_box5', '.shot_box4'));
$('.store_box3').click(() => toggleSelection('.store_box3', '.packaging_box3'));
$('.packaging_box3').click(() => toggleSelection('.packaging_box3', '.store_box3'));
$('.hotice_box').click(() => toggleSelection('.hotice_box', '.hotice_box2'));
$('.hotice_box2').click(() => toggleSelection('.hotice_box2', '.hotice_box'));
$('.store_box4').click(() => toggleSelection('.store_box4', '.packaging_box4'));
$('.packaging_box4').click(() => toggleSelection('.packaging_box4', '.store_box4'));

/* 옵션 선택 초기화 */
const resetOptions = () => {
  $('.store_box, .packaging_box, .generally_box, .aplenty_box, .shot_box2, .shot_box3, .store_box2, .packaging_box2, .shot_box4, .shot_box5, .store_box3, .packaging_box3, .hotice_box, .hotice_box2, .store_box4, .packaging_box4').css('background', '#555');
};

$('.xi-arrow-left, .xi-arrow-left6').click(resetOptions);

/* 추가 주문 화면에서 다음 단계 진행 */
$('.extra_order_next_box').click(function () {
  const isGray = (selector) => $(selector).css('background-color') === 'rgb(85, 85, 85)';
  
  if ($('.select_menu_info_box2').is(':visible') && isGray('.store_box') && isGray('.packaging_box')) {
    $('.model_font').html('매장 혹은 포장을 선택하세요.');
    $('.model_box').show();
    return;
  }
  if ($('.select_menu_info_box3').is(':visible') && isGray('.store_box2') && isGray('.packaging_box2')) {
    $('.model_font').html('매장 혹은 포장을 선택하세요.');
    $('.model_box').show();
    return;
  }
  if ($('.select_menu_info_box4').is(':visible')) {
    const storeUnselected = isGray('.store_box3') && isGray('.packaging_box3');
    const hotIceUnselected = isGray('.hotice_box') && isGray('.hotice_box2');
    if (storeUnselected && hotIceUnselected) {
      $('.model_font').html('매장/포장 및 HOT/ICE를 선택하세요.');
    } else if (storeUnselected) {
      $('.model_font').html('매장 혹은 포장을 선택하세요.');
    } else if (hotIceUnselected) {
      $('.model_font').html('HOT 혹은 ICE를 선택하세요.');
    } else {
      gotoMain();
      return;
    }
    $('.model_box').show();
    return;
  }
  if ($('.select_menu_info_box5').is(':visible') && isGray('.store_box4') && isGray('.packaging_box4')) {
    $('.model_font').html('매장 혹은 포장을 선택하세요.');
    $('.model_box').show();
    return;
  }
  gotoMain();
});

function gotoMain() {
  $('.extra_order_list_box').hide();
  $('.main_box').show();
  resetOptions();
}

/* 각 단계별 뒤로가기 버튼 처리 */
$('#xi-arrow-left').click(() => { $('.point_signup_pay_box').hide(); $('.main_box').show(); });
$('#xi-arrow-left2').click(() => { $('.point_signup_number_box').hide(); $('.point_signup_pay_box').show(); });
$('#xi-arrow-left3').click(() => { $('.point_inquire_number_box').hide(); $('.point_signup_pay_box').show(); });
$('#xi-arrow-left4').click(() => { $('.point_remaining_box').hide(); $('.point_signup_pay_box').show(); });
$('#xi-arrow-left5').click(() => { $('.pay_screen_box').hide(); $('.point_signup_pay_box').show(); });
$('#xi-arrow-left6').click(() => { $('.extra_order_list_box').hide(); $('.main_box').show(); });

/* 포인트 및 결제 단계 진입 */
$('.signup_box').click(() => { $('.point_signup_pay_box').hide(); $('.point_signup_number_box').show(); });
$('.use_box').click(() => { $('.point_signup_pay_box').hide(); $('.point_inquire_number_box').show(); });
$('.pay_img, .pay').click(() => { $('.point_signup_pay_box').hide(); $('.pay_screen_box').show(); });

/* 휴대폰 번호 유효성 검사 */
const validatePhoneNumber = (selector) => {
  const val = $(selector).val();
  if (val == "" || val.length < 11) {
    $('.model_font').html('번호를 11자리 입력하세요.');
    $('.model_box').show();
    return false;
  }
  return true;
};

$('.confirm_button').click(() => { if (validatePhoneNumber('.number_input_box > input')) { $('.point_signup_number_box').hide(); $('.pay_screen_box').show(); } });
$('.inquire_button').click(() => { if (validatePhoneNumber('.number_inquire_input_box > input')) { $('.point_inquire_number_box').hide(); $('.point_remaining_box').show(); } });

/* 포인트 사용 처리 */
$('.pointuse_button').click(() => {
  const val = $('.point_remaining_input_box > input').val();
  const remainingPointsText = $('.point_remaining_font2').text().replace(/[^0-9]/g, '');
  const remainingPoints = parseInt(remainingPointsText);
  const usePoints = parseInt(val);
  if (val == "" || isNaN(usePoints) || usePoints <= 0) {
    $('.model_font').html('사용할 포인트를 입력하세요.');
    $('.model_box').show();
  } else if (usePoints > remainingPoints) {
    $('.model_font').html('잔여 포인트 이상 선택할 수 없습니다.');
    $('.model_box').show();
  } else {
    $('.point_remaining_box').hide();
    $('.pay_screen_box').show();
  }
});

/* 결제 및 영수증 출력 */
$('.pay2').click(() => {
  $('.pay_screen_box').hide();
  $('.receipt_box').show();
  const current = parseInt(localStorage.getItem('waitingNumber') || 1);
  localStorage.setItem('waitingNumber', current + 1);
});

$('.receipt_list_button').click(() => window.print());
$('.receipt_list_button2').click(() => { $('.receipt_box').hide(); $('.point_save_box').show(); });

$('.pointsave_button').click(() => {
  if (validatePhoneNumber('.point_save_input_box > input')) {
    $('.point_save_box').hide();
    $('.point_save_complete_box').show();
  }
});

/* 키패드 공통 로직 적용 */
const setupKeypad = (container, inputSelector, maxLength = 11) => {
  $(`${container} > article`).click(function () {
    const input = $(inputSelector);
    const index = $(this).index();
    switch (index) {
      case 9: input.val(''); break;
      case 11: input.val(input.val().substring(0, input.val().length - 1)); break;
      default:
        if (input.val().length < maxLength) {
          const val = $(this).find('p').html();
          if (val !== undefined) input.val(input.val() + val);
        }
        break;
    }
  });
};

setupKeypad('.point_keypad_box', '.number_input_box > input');
setupKeypad('.point_keypad_box2', '.number_inquire_input_box > input');
setupKeypad('.point_keypad_box3', '.point_remaining_input_box > input', 3);
setupKeypad('.point_keypad_box4', '.point_save_input_box > input');
