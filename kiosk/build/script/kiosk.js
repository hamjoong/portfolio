/* UI 및 설정 상수 정의: 유지보수성을 위해 매직 넘버와 색상 코드를 중앙 관리합니다. */
const UI_CONFIG = {
  COLORS: {
    SELECTED: '#AF4444',
    DEFAULT: '#555'
  },
  INTERVALS: {
    INTRO_SLIDE: 3000
  }
};

/* kiosk menu, point DB json 파싱: 초기 데이터 구조 설정을 위한 객체 생성 */
const json = '{"get_kioskmenu": "" , "get_kioskpoint": "" }'
const initialObj = JSON.parse(json);

/*ajax intro_page 이미지 변환*/
/*const introduce_JSON = new XMLHttpRequest();
introduce_JSON.onreadystatechange = function (){
  if(this.readyState == 4 && this.status == 200){
    const introduce_obj = JSON.parse(this.responseText);
    console.log(introduce_obj);
    let key = 0;
    const length_index = introduce_obj.length;
      const introduceSlide = () => {
        if ( key == length_index ) {
          key = 0;
        }
        document.querySelector('#intro_page').src = introduce_obj[key].url;
        key++;
        setTimeout(introduceSlide, 3000);
      }
      introduceSlide();
    }
  };
introduce_JSON.open('GET', 'intro.json?t='+Math.random(), true);
introduce_JSON.send();*/

/*$(window).on('load', () => {
  const intro_json = new XMLHttpRequest();
  intro_json.onreadystatechange = function () {
  if (this.readyState == 4 && this.status == 200) {
    const intro_img = JSON.parse(this.responseText);
    console.log(intro_img);
    let counter = 0;
    const change_img = () => {
    if (counter == intro_img.length) {
      counter = 0;
    }
      document.querySelector('.intro_page').style.backgroundImage = `url(${intro_img[counter].url})`;
      document.querySelector('.intro_page').style.backgroundSize = '100% 100%';
      counter++;
      setTimeout(change_img, 3000);
    };
    change_img();
  }
};
  intro_json.open('GET', '/nodejs/intro.json?t=' + Math.random(), true);
  intro_json.send();
});*/

/* intro_page 이미지 슬라이드: 사용자에게 첫 인상을 주기 위해 배경 이미지를 주기적으로 변경합니다. */
$(window).on('load', () => {
  const introRequest = new XMLHttpRequest();
  introRequest.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      const introImages = JSON.parse(this.responseText);
      console.log(introImages);
      let slideIndex = 0;
      
      const changeIntroImage = () => {
        if (slideIndex == introImages.length) {
          slideIndex = 0;
        }
        const $introPage = document.querySelector('.intro_page');
        $introPage.style.backgroundImage = `url(${introImages[slideIndex].url})`;
        $introPage.style.backgroundSize = '100% 100%';
        slideIndex++;
        setTimeout(changeIntroImage, UI_CONFIG.INTERVALS.INTRO_SLIDE);
      };
      changeIntroImage();
    }
  };
  introRequest.open('GET', '../nodejs/intro2.json?t=' + Math.random(), true);
  introRequest.send();
});

/*iintro page 넘김 영역*/
$('.intro_page').click( () => {
  $('.intro_page').hide();
  $('.main_box').show();
});

/* 메인 메뉴 내비게이션 색상 변경: 선택된 카테고리를 시각적으로 강조하여 사용자 인지력을 향상시킵니다. */
const updateNavColor = (selectedClass) => {
  $('.nav_famousmenu, .nav_coffee, .nav_drink, .nav_dessert').css('background', UI_CONFIG.COLORS.DEFAULT);
  $(selectedClass).css('background', UI_CONFIG.COLORS.SELECTED);
};

$('.nav_famousmenu').click(() => updateNavColor('.nav_famousmenu'));
$('.nav_coffee').click(() => updateNavColor('.nav_coffee'));
$('.nav_drink').click(() => updateNavColor('.nav_drink'));
$('.nav_dessert').click(() => updateNavColor('.nav_dessert'));


/* 내비게이션 페이지 전환: 선택된 카테고리에 맞는 메뉴 리스트를 화면에 표시합니다. */
const switchMenuSection = (sectionToShow, showHotIce = false) => {
  $('.menu_all_box, .menu_all_box2, .menu_all_box3, .menu_all_box4, .menu_all_box5').hide();
  $('.hot_ice_button, .hot_ice_button2').hide();
  $(sectionToShow).show();
  if (showHotIce) {
    $('.hot_ice_button, .hot_ice_button2').show();
  }
};

$('.nav_famousmenu').click(() => switchMenuSection('.menu_all_box'));
$('.nav_coffee').click(() => switchMenuSection('.menu_all_box2', true));
$('.nav_drink').click(() => switchMenuSection('.menu_all_box4'));
$('.nav_dessert').click(() => switchMenuSection('.menu_all_box5'));

/* 커피 메뉴 전용 아이스/핫 전환 버튼 기능 */
$('.hot_ice_button').click(() => {
  $('.menu_all_box2').hide();
  $('.menu_all_box3').show();
});

$('.hot_ice_button2').click(() => {
  $('.menu_all_box3').hide();
  $('.menu_all_box2').show();
});


/*장바구니 합계 영역*/
/* 
 * Kioskmenu 클래스: 메뉴 데이터 모델 및 관련 UI 조작 로직을 관리합니다.
 * SRP(단일 책임 원칙)에 따라 추후 데이터와 UI 렌더링 로직의 분리를 고려합니다.
 */
class Kioskmenu {
  constructor(name, price, buttonIndex, amount) {
    this.name = name;
    this.price = price;
    this.buttonIndex = buttonIndex;
    this.amount = amount;
  }

  /* 장바구니 리스트에 메뉴 항목 출력: 사용자가 선택한 메뉴를 하단 목록에 동적으로 추가합니다. */
  addCartItemUI() {
    const $cartContainer = document.querySelector('.order_list_data');
    $cartContainer.innerHTML += `
      <div class='${this.name}_box'>
        <span class='menu_name_1_${this.name}'>${this.name}</span>
        <span class='menu_price_1_${this.name}'>${this.price}원</span>
        <button class='plus_menu_button_${this.buttonIndex}'> + </button>
        <span class='menu_number_${this.name}'>${this.amount}</span>
        <button class='minus_menu_button_${this.buttonIndex}'> - </button>
      </div>
    `;
  }

  /* 결제 요약 화면에 메뉴 항목 출력: 최종 결제 전 주문 내역을 요약하여 보여줍니다. */
  addPaymentItemUI() {
    const $paymentContainer = document.querySelector('.pay_list_font');
    $paymentContainer.innerHTML += `
      <div class='${this.name}_box'>
        <span class='menu_name_1_${this.name}'>${this.name}</span>
        <span> 수량 </span>
        <span class='menu_number_${this.name}'>${this.amount}</span>
        <span class='menu_price_1_${this.name}'></span>
      </div>
    `;
  }

  /* 영수증 화면에 메뉴 항목 출력: 주문 완료 후 사용자에게 전달할 영수증 내역을 생성합니다. */
  addReceiptItemUI() {
    const $receiptContainer = document.querySelector('.receipt_list_menuname');
    $receiptContainer.innerHTML += `
      <div class='${this.name}_box'>
        <span class='menu_name_1_${this.name}'>${this.name}</span>
        <span class='menu_number_${this.name}'>${this.amount}</span>
      </div>
    `;
  }

  /* 메뉴 수량 증가 및 관련 UI 업데이트: 실시간 합계 계산의 안정성을 보장합니다. */
  increaseAmount() {
    this.amount++;
    this.updateItemUI();
  }

  /* 메뉴 수량 감소 및 관련 UI 업데이트: 수량이 0 이하로 내려가지 않도록 관리합니다. */
  decreaseAmount() {
    if (this.amount > 0) {
      this.amount--;
    }
    this.updateItemUI();
  }

  /* 개별 메뉴 항목의 가격 및 수량 텍스트 업데이트 */
  updateItemUI() {
    $(`.menu_number_${this.name}`).html(this.amount);
    $(`.menu_price_1_${this.name}`).html((this.price * this.amount).toLocaleString() + '원');
  }

  /* 장바구니 및 모든 결제 관련 UI 초기화: 새로운 주문을 시작할 때 상태를 리셋합니다. */
  clearAllOrderUI() {
    this.amount = 0;
    $('.order_list_data, .sum_value, .pay_list_font, .pay_list_sum, .receipt_list_price, .receipt_list_menuname').empty();
  }
}


/* 메뉴 데이터를 JSON 파일에서 읽어와 동적으로 메뉴 리스트를 생성합니다. */
$(window).on('load', function() {
  const menuXhr = new XMLHttpRequest();
  menuXhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      const menuData = JSON.parse(this.responseText);
      let kioskMenuItems = [];
      let priceCounter = 0;
      
      // 메뉴 데이터 기반 객체 생성
      for (let i = 0; i < menuData.length; i++) {
        const menuItem = new Kioskmenu(menuData[i].menu_name, menuData[i].menu_price, i, 0);
        kioskMenuItems.push(menuItem);
      }

      // 합계 UI 캐싱: 반복적인 DOM 접근을 방지하여 성능을 최적화합니다.
      const $totalSumElements = $('.sum_value, .pay_list_sum, .receipt_list_price');

      /* 하단 장바구니 및 결제 창의 총 합계를 실시간으로 업데이트합니다. */
      const updateTotalSum = () => {
        priceCounter = 0;
        for (let i = 0; i < kioskMenuItems.length; i++) {
          priceCounter += kioskMenuItems[i].price * kioskMenuItems[i].amount;
        }
        $totalSumElements.html(priceCounter.toLocaleString() + '원');
      };

      /* 메뉴 항목별 클릭 이벤트 바인딩: 각 메뉴 이미지 클릭 시 장바구니에 추가하거나 수량을 늘립니다. */
      for (let i = 0; i < kioskMenuItems.length; i++) {
        // 일반 메뉴 및 커피 상세 메뉴 클릭 처리
        $(`#coffe_${i}, #coffe_${i}_${i}`).click(() => {
          if (kioskMenuItems[i].amount < 1) {
            kioskMenuItems[i].addCartItemUI();
            kioskMenuItems[i].addPaymentItemUI();
            kioskMenuItems[i].addReceiptItemUI();
          }
          kioskMenuItems[i].increaseAmount();
          updateTotalSum();
        });

        /* 장바구니 내부의 수량 조절 버튼 (+, -) 이벤트 위임 처리 준비 */
        $(document).on('click', `.plus_menu_button_${i}`, () => {
          kioskMenuItems[i].increaseAmount();
          updateTotalSum();
        });

        $(document).on('click', `.minus_menu_button_${i}`, () => {
          kioskMenuItems[i].decreaseAmount();
          if (kioskMenuItems[i].amount === 0) {
            $(`.${kioskMenuItems[i].name}_box`).remove();
          }
          updateTotalSum();
        });

        /* 장바구니 전체 삭제 및 주문 완료 후 초기화 로직 */
        $('.xi-trash, .receipt_close_button_box, .save_main_button').click(() => {
          kioskMenuItems[i].clearAllOrderUI();
          priceCounter = 0;
        });
      }
    }
  };

  menuXhr.open('GET', '../nodejs/kioskmenu.json?t=' + Math.random(), true);
  menuXhr.send();
});


/*kiosk point global variable 포인트 전역 변수*/
let availablePoints = 0;

/* 주문 대기번호 관리: 로컬 스토리지를 사용하여 페이지 새로고침 시에도 대기번호를 순차적으로 유지합니다. */
$(document).ready( () => {
  let orderCount = localStorage.getItem('orderCount');
  if(!orderCount) {
    orderCount = 1;
    localStorage.setItem('orderCount', orderCount);
  }
  
  const $receiptNumberElement = document.querySelector('.receipt_list_number2');
  $receiptNumberElement.innerHTML = orderCount + '&nbsp;번&nbsp;';
  
  $('.receipt_close_button_box, .save_main_button').click(function() {
    location.reload();
  });
});


/*kiosk point save complete box 키오스크 포인트 적립완료 박스 영역 포인트넘버*/
$(document).ready( () => {
  const randomNumber = Math.random() * 999
  availablePoints = Math.floor(randomNumber + 1)
  console.log(availablePoints) 
  document.querySelector('.save_font').innerHTML = availablePoints + '&nbsp;P&nbsp;';
  document.querySelector('.point_remaining_font2').innerHTML = availablePoints + '&nbsp;P&nbsp;';
  $('.receipt_close_button_box, .save_main_button').click(function() {
  location.reload();
  })
})

/*kiosk menu choice page model 키오스크 메뉴 선택 페이지 결제하기 모달 영역*/
$('.buy_button').click(function() {
  if($('.order_list_data').children().is("div")) {
    $('.main_box').hide();
    $('.point_signup_pay_box').show();
  } else {
    $('.model_box').show();
  };
});

$('.model_close_button').click(function() {
  $('.model_box').hide();
})

/*kiosk menu extra orders list box 키오스크 추가메뉴 리스트 박스 영역*/
/*extra order list img*/
const extra_menu_img = [
  'url("/img/아메리카노_크기수정.png")',
  'url("/img/아이스-바닐라라떼.png")',
  'url("/img/아이스-카페라떼.png")',
  'url("/img/아이스-카페모카.png")',
  'url("/img/아이스-헤이오트라떼.png")',
  'url("/img/시그니처-크림-커피.png")',
  'url("/img/아메리카노_크기수정.png")',
  'url("/img/아이스-바닐라라떼.png")',
  'url("/img/아이스-카페라떼.png")',
  'url("/img/아이스-카페모카.png")',
  'url("/img/아이스-헤이오트라떼.png")',
  'url("/img/시그니처-크림-커피.png")',
  'url("/img/뜨아메리카노.png")',
  'url("/img/뜨카페모카.png")',
  'url("/img/뜨카푸치노.png")',
  'url("/img/자색-고구마-라떼.png")',
  'url("/img/흑임자-오트-라떼.png")',
  'url("/img/아이스-초콜릿.png")',
  'url("/img/자몽-스파클링.png")',
  'url("/img/레몬-스파클링.png")',
  'url("/img/청포도-스파클링.png")',
  'url("/img/허니브레드+생크림.png")',
  'url("/img/플레인-베이글.png")',
  'url("/img/에그-타르트.png")',
  'url("/img/오-마이-초코.png")',
  'url("/img/수플레-치즈-케이크.png")',
  'url("/img/더-진한-캐롯-케이크.png")'
];

const extra_menu_img2 = [
  'url("../img/아메리카노_크기수정.png")',
  'url("../img/아이스-바닐라라떼.png")',
  'url("../img/아이스-카페라떼.png")',
  'url("../img/아이스-카페모카.png")',
  'url("../img/아이스-헤이오트라떼.png")',
  'url("../img/시그니처-크림-커피.png")',
  'url("../img/아메리카노_크기수정.png")',
  'url("../img/아이스-바닐라라떼.png")',
  'url("../img/아이스-카페라떼.png")',
  'url("../img/아이스-카페모카.png")',
  'url("../img/아이스-헤이오트라떼.png")',
  'url("../img/시그니처-크림-커피.png")',
  'url("../img/뜨아메리카노.png")',
  'url("../img/뜨카페모카.png")',
  'url("../img/뜨카푸치노.png")',
  'url("../img/자색-고구마-라떼.png")',
  'url("../img/흑임자-오트-라떼.png")',
  'url("../img/아이스-초콜릿.png")',
  'url("../img/자몽-스파클링.png")',
  'url("../img/레몬-스파클링.png")',
  'url("../img/청포도-스파클링.png")',
  'url("../img/허니브레드+생크림.png")',
  'url("../img/플레인-베이글.png")',
  'url("../img/에그-타르트.png")',
  'url("../img/오-마이-초코.png")',
  'url("../img/수플레-치즈-케이크.png")',
  'url("../img/더-진한-캐롯-케이크.png")'
];

/*extra order list name*/
const extra_menu_name = [
  '아메리카노',
  '바닐라 라떼',
  '카페라떼',
  '카페모카',
  '헤이오트라떼',
  '시그니처 크림라떼',
  '아메리카노',
  '바닐라 라떼',
  '카페라떼',
  '카페모카',
  '헤이오트라떼',
  '시그니처 크림라떼',
  '아메리카노',
  '카페모카',
  '카푸치노',
  '자색 고구마 라떼',
  '흑임자 오트 라떼',
  '아이스 초코',
  '자몽 스파클링',
  '레몬 스파클링',
  '청포도 스파클링',
  '허니 브레드',
  '플레인 베이글',
  '에그 타르트',
  '오 마이 초코',
  '치즈 케이크',
  '더 진한 캐롯'
];

/*extra order list menu_description*/
const extra_menu_ex = [
  '에스프레소와 정수된 물, 얼음을 혼합한 아이스 커피',
  '고소한 바닐라와 우유에 에스프레소를 혼합한 아이스 커피',
  '에스프레소와 우유, 얼음을 혼합한 아이스 커피',
  '달콤한 초콜릿에 우유와 에스프레소를 혼합한 아이스 커피',
  '헤이즐넛 향의 풍미, 식물성 귀리음료가 어우러진 달콤 고소한 커피',
  '부드럽게 흘러내리는 플랫크림과 커피의 만남',
  '에스프레소와 정수된 물, 얼음을 혼합한 아이스 커피',
  '고소한 바닐라와 우유에 에스프레소를 혼합한 아이스 커피',
  '에스프레소와 우유, 얼음을 혼합한 아이스 커피',
  '달콤한 초콜릿에 우유와 에스프레소를 혼합한 아이스 커피',
  '헤이즐넛 향의 풍미, 식물성 귀리음료가 어우러진 달콤 고소한 커피',
  '부드럽게 흘러내리는 플랫크림과 커피의 만남',
  '에스프레소와 정수된 물을 혼합한 커피',
  '달콤한 초콜릿에 우유와 에스프레소를 혼합한 커피',
  '에스프레소와 부드러운 벨벳 밀크폼을 혼합한 커피',
  '달콤한 자색 고구마를 활용한 부드러운 라떼',
  '고소한 흑임자와 식물성 귀리음료로 어우러진 고소한 라떼',
  '달콤한 다크 초콜릿과 우유를 혼합한 아이스 음료',
  '자몽베이스와 탄산수를 혼합한 스파클링 음료',
  '레몬 베이스와 탄산수를 혼합한 스파클링 음료',
  '청포도 베이스와 탄산수를 혼합한 스파클링 음료',
  '버터, 꿀을 품은 바삭한 식빵위에 달콤한 시럽이 어우러진 허니브레드',
  '담백한 플레인 베이글과 함께 제공되는 부드러운 크림치즈',
  '달걀의 풍미를 가득 담은 고소하고 환상적인 타르트',
  '초코 가나슈 생크림케익 안에 가득한 딸기',
  '촉촉하고 부드러운 풍미의 수플레 치즈 케이크',
  '당근을 듬뿍 넣은 시트에 진한 크림치즈가 어우러진 케이크'
];

/*extra order list click 추가주문 선택 영역 */
$('.menu_list > section > article').each(function(index) {
  $(this).click(function() {
  $('.main_box').hide();
  $('.select_menu_info_box3').hide();
  $('.select_menu_info_box4').hide();
  $('.select_menu_info_box5').hide();
  $('.extra_order_list_box').show();
  $('.select_menu_info_box2').show();
  $('.select_menu_img').css('background-image', extra_menu_img[index]);
  $('.select_menu_img').css('background-image', extra_menu_img2[index]);
  $('.select_menu_img_name').html(extra_menu_name[index]);
  $('.select_menu_info_seolmyeong_font').html(extra_menu_ex[index]);
  });
});

/*extra order list hot click 추가주문 hot 선택 영역 */
$('.menu_all_box3').each(function(index) {
  $(this).click(function() {
    $('.select_menu_info_box2').hide();
    $('.select_menu_info_box3').show();
  });
});

/*extra order list drink click 추가주문 음료 선택 영역 */
$('.menu_all_box4').each(function(index) {
  $(this).click(function() {
  $('.select_menu_info_box2').hide();
  $('.select_menu_info_box4').show();
  });
});

/*extra order list dessert click 추가주문 디저트 선택 영역 */
$('.menu_all_box5').each(function(index) {
  $(this).click(function() {
  $('.select_menu_info_box2').hide();
  $('.select_menu_info_box5').show();
  });
});

/* 메뉴 옵션 선택 처리: 매장/포장, 얼음양, 샷 추가 등 상호 배타적인 옵션 선택 시 시각적 피드백을 제공합니다. */
const toggleOptionHighlight = (selectedSelector, otherSelectors) => {
  $(otherSelectors).css('background', UI_CONFIG.COLORS.DEFAULT);
  $(selectedSelector).css('background', UI_CONFIG.COLORS.SELECTED);
};

// 매장/포장 (기본)
$('.store_box').click(() => toggleOptionHighlight('.store_box', '.packaging_box'));
$('.packaging_box').click(() => toggleOptionHighlight('.packaging_box', '.store_box'));

// 얼음양
$('.generally_box').click(() => toggleOptionHighlight('.generally_box', '.aplenty_box'));
$('.aplenty_box').click(() => toggleOptionHighlight('.aplenty_box', '.generally_box'));

// 샷 추가 (기본)
$('.shot_box2').click(() => toggleOptionHighlight('.shot_box2', '.shot_box3'));
$('.shot_box3').click(() => toggleOptionHighlight('.shot_box3', '.shot_box2'));

// 매장/포장 (커피 HOT)
$('.store_box2').click(() => toggleOptionHighlight('.store_box2', '.packaging_box2'));
$('.packaging_box2').click(() => toggleOptionHighlight('.packaging_box2', '.store_box2'));

// 샷 추가 (커피 HOT)
$('.shot_box4').click(() => toggleOptionHighlight('.shot_box4', '.shot_box5'));
$('.shot_box5').click(() => toggleOptionHighlight('.shot_box5', '.shot_box4'));

// 매장/포장 (음료)
$('.store_box3').click(() => toggleOptionHighlight('.store_box3', '.packaging_box3'));
$('.packaging_box3').click(() => toggleOptionHighlight('.packaging_box3', '.store_box3'));

// 음료 온도 (HOT/ICE)
$('.hotice_box').click(() => toggleOptionHighlight('.hotice_box', '.hotice_box2'));
$('.hotice_box2').click(() => toggleOptionHighlight('.hotice_box2', '.hotice_box'));

// 매장/포장 (디저트)
$('.store_box4').click(() => toggleOptionHighlight('.store_box4', '.packaging_box4'));
$('.packaging_box4').click(() => toggleOptionHighlight('.packaging_box4', '.store_box4'));


/* 상세 메뉴 옵션 초기화: 뒤로 가기 시 기존 선택된 옵션들을 초기화하여 다음 선택 시 혼란을 방지합니다. */
const resetAllOptions = () => {
  $('.store_box, .packaging_box, .generally_box, .aplenty_box, .shot_box2, .shot_box3, .store_box2, .packaging_box2, .shot_box4, .shot_box5, .store_box3, .packaging_box3, .hotice_box, .hotice_box2, .store_box4, .packaging_box4').css('background', UI_CONFIG.COLORS.DEFAULT);
};

$('.xi-arrow-left').click(() => resetAllOptions());


/*kiosk menu extra orders list 키오스크 추가메뉴 리스트 페이지에서 다음버튼 영역*/
$('.extra_order_next_box').click(function() {
  const isGroupSelected = (selectors) => {
    let result = false;
    $(selectors).each(function() {
      const bg = $(this).css('background-color');
      // More robust check for the selected color #AF4444 (175, 68, 68)
      if (bg && (bg.indexOf('175') !== -1 || bg.indexOf('af4444') !== -1 || bg.indexOf('AF4444') !== -1)) {
        result = true;
      }
    });
    return result;
  };

  let isValid = true;

  if ($('.select_menu_info_box2').is(':visible')) {
    // Ice Coffee: Store/Takeout is mandatory
    if (!isGroupSelected('.store_box, .packaging_box')) isValid = false;
  } else if ($('.select_menu_info_box3').is(':visible')) {
    // Hot Coffee: Store/Takeout is mandatory
    if (!isGroupSelected('.store_box2, .packaging_box2')) isValid = false;
  } else if ($('.select_menu_info_box4').is(':visible')) {
    // Drink: Store/Takeout AND Hot/Ice are mandatory
    if (!isGroupSelected('.store_box3, .packaging_box3')) isValid = false;
    if (!isGroupSelected('.hotice_box, .hotice_box2')) isValid = false;
  } else if ($('.select_menu_info_box5').is(':visible')) {
    // Dessert: Store/Takeout is mandatory
    if (!isGroupSelected('.store_box4, .packaging_box4')) isValid = false;
  }

  if (isValid) {
    /* 성공 시 상태 초기화 및 페이지 이동: 선택한 옵션을 초기화하고 메인 화면으로 돌아갑니다. */
    resetAllOptions();
    $('.extra_order_list_box').hide();
    $('.main_box').show();
  } else {
    /*범주별 필수 선택 항목 모달 팝업 메시지 설정*/
    let errorMessage = '필수 항목을 선택해주세요.';
    if ($('.select_menu_info_box2').is(':visible') || $('.select_menu_info_box3').is(':visible')) {
      errorMessage = '매장 / 포장 중<br>선택해주세요.';
    } else if ($('.select_menu_info_box4').is(':visible')) {
      errorMessage = '매장 / 포장<br>HOT / ICE<br>중 선택해주세요.';
    } else if ($('.select_menu_info_box5').is(':visible')) {
      errorMessage = '매장 / 포장 중<br>선택해주세요.';
    }
    $('.model_font').html(errorMessage);
    $('.model_box').show();
  }
});

/*kiosk point back button 키오스크 포인트 뒤로가기 영역*/
$('#xi-arrow-left').click(function() {
  $('.point_signup_pay_box').hide();
  $('.main_box').show();
});

/*kiosk point number back button 키오스크 포인트 넘버 뒤로가기 영역*/
$('#xi-arrow-left2').click(function() {
  $('.point_signup_number_box').hide();
  $('.point_signup_pay_box').show();
});

/*kiosk point remaining back button 키오스크 포인트 잔여포인트 뒤로가기  영역*/
$('#xi-arrow-left3').click(function() {
  $('.point_inquire_number_box').hide();
  $('.point_signup_pay_box').show();
});

/*kiosk point remaining back xeicon 키오스크 포인트 잔여포인트 아이콘 빽 영빽*/
$('#xi-arrow-left4').click(function() {
  $('.point_remaining_box').hide();
  $('.point_signup_pay_box').show();
});

/*kiosk pay card box back button 키오스크 결제하기 카드 박스 뒤로가기 영역*/
$('#xi-arrow-left5').click(function() {
  $('.pay_screen_box').hide();
  $('.point_signup_pay_box').show();
});

/*kiosk menu extra orders choice xeicon back 키오스크 추가메뉴 리스트 선택 아이콘 백 영역*/
$('#xi-arrow-left6').click(function() {
  $('.extra_order_list_box').hide();
  $('.main_box').show();
});

/*kiosk point signup 키오스크 포인트 간단가입 영역*/
$('.signup_box').click(function() {
  $('.point_signup_pay_box').hide();
  $('.point_signup_number_box').show();
});

/*kiosk point use 키오스크 포인트 사용하기 영역*/
$('.use_box').click(function() {
  $('.point_signup_pay_box').hide();
  $('.point_inquire_number_box').show();
});

/*kiosk point pay 키오스크 포인트 결제하기 영역*/
$('.pay_img, .pay').click(function() {
  $('.point_signup_pay_box').hide();
  $('.pay_screen_box').show();
});

/*kiosk point next button 키오스크 포인트 확인 버튼 영역*/
$('.confirm_button').click(function() {
  if ($('.number_input_box > input').val().length === 11) {
    $('.point_signup_number_box').hide();
    $('.pay_screen_box').show();
  } else {
    $('.model_font').html('휴대폰 번호 11자리를<br>입력해주세요.');
    $('.model_box').show();
  }
});

/*kiosk point inquire next button 키오스크 포인트 조회하기 버튼 영역*/
$('.inquire_button').click(function() {
  if ($('.number_inquire_input_box > input').val().length === 11) {
    $('.point_inquire_number_box').hide();
    $('.point_remaining_box').show();
  } else {
    $('.model_font').html('휴대폰 번호 11자리를<br>입력해주세요.');
    $('.model_box').show();
  }
});

/*kiosk point remaining next button 키오스크 잔여포인트 버튼 영역*/
$('.pointuse_button').click(function() {
  const usageInput = Number($('.point_remaining_input_box > input').val());
  if (usageInput > availablePoints) {
    $('.model_font').html('보유하신 포인트보다<br>많이 입력하실 수 없습니다.');
    $('.model_box').show();
  } else if ($('.point_remaining_input_box > input').val().length === 0) {
    $('.model_font').html('사용할 포인트를<br>입력해주세요.');
    $('.model_box').show();
  } else {
    $('.point_remaining_box').hide();
    $('.pay_screen_box').show();
  }
});

/*kiosk pay 키오스크 결제하기 영역*/
$('.pay2').click(function() {
  /* 결제 성공 시 다음 주문을 위해 번호 증가 */
  let orderCount = Number(localStorage.getItem('orderCount')) || 1;
  localStorage.setItem('orderCount', orderCount + 1);

  $('.pay_screen_box').hide();
  $('.receipt_box').show();
});

/*영수증 인쇄*/
$('.receipt_list_button').click(function() {
  window.print();
});

/*kiosk point save number 키오스크 포인트 적립 넘버 영역*/
$('.receipt_list_button2').click( () => {
  $('.receipt_box').hide();
  $('.point_save_box').show();
})

/*kiosk save point 키오스크 적립 포인트 영역*/
$('.pointsave_button').click( () => {
  if ($('.point_save_input_box > input').val().length === 11) {
    $('.point_save_box').hide();
    $('.point_save_complete_box').show();
  } else {
    $('.model_font').html('휴대폰 번호 11자리를<br>입력해주세요.');
    $('.model_box').show();
  }
})

/* 
 * 공통 키패드 입력 처리기: 중복되는 키패드 로직을 하나로 통합하여 유지보수성을 높입니다.
 * @param {string} inputSelector - 값을 입력할 input 요소의 선택자
 * @param {number} index - 클릭된 버튼의 인덱스 (0-9: 숫자, 9: 초기화, 11: 삭제, 12: 확인)
 * @param {number} maxLength - 최대 입력 가능 자릿수
 * @param {jQuery} $clickedElement - 클릭된 버튼 요소
 */
const processKeypadInput = (inputSelector, index, maxLength, $clickedElement) => {
  const $input = $(inputSelector);
  if (index === 12) return; /* 확인/조회 버튼은 별도 핸들러에서 처리하므로 제외합니다. */

  switch(index) {
    case 9:
      $input.val('');
      break;
    case 11:
      const currentVal = $input.val();
      $input.val(currentVal.substring(0, currentVal.length - 1));
      break;
    default:
      const char = $clickedElement.find('p').html();
      if (char !== undefined && $input.val().length < maxLength) {
        $input.val($input.val() + char);
      }
      break;
  }
};

/* 간단가입 키패드 */
$('.point_keypad_box > article').each(function(index) {
  $(this).click(function() {
    processKeypadInput('.number_input_box > input', index, 11, $(this));
  });
});

/* 포인트 조회 키패드 */
$('.point_keypad_box2 > article').each(function(index) {
  $(this).click(function() {
    processKeypadInput('.number_inquire_input_box > input', index, 11, $(this));
  });
});

/* 포인트 사용(잔여 포인트) 키패드 */
$('.point_keypad_box3 > article').each(function(index) {
  $(this).click(function() {
    processKeypadInput('.point_remaining_input_box > input', index, 5, $(this));
  });
});

/* 포인트 적립 키패드 */
$('.point_keypad_box4 > article').each(function(index) {
  $(this).click(function() {
    processKeypadInput('.point_save_input_box > input', index, 11, $(this));
  });
});