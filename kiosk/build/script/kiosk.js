/*kiosk menu,point DB json 파싱*/
const json = '{"get_kioskmenu": "" , "get_kioskpoint": "" }'
const obj = JSON.parse(json);

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

$(window).on('load', () => {
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
  intro_json.open('GET', '../nodejs/intro2.json?t=' + Math.random(), true);
  intro_json.send();
});

/*iintro page 넘김 영역*/
$('.intro_page').click( () => {
  $('.intro_page').hide();
  $('.main_box').show();
});

/*nav menu color change 영역*/
$('.nav_famousmenu').click( () => {
  $('.nav_famousmenu').css({'background': '#AF4444'});
  $('.nav_coffee').css({'background': '#555'});
  $('.nav_drink').css({'background': '#555'});
  $('.nav_dessert').css({'background': '#555'});
});
    
$('.nav_coffee').click( () => {
  $('.nav_famousmenu').css({'background': '#555'});
  $('.nav_coffee').css({'background': '#AF4444'});
  $('.nav_drink').css({'background': '#555'});
  $('.nav_dessert').css({'background': '#555'});
});

$('.nav_drink').click( () => {
  $('.nav_famousmenu').css({'background': '#555'});
  $('.nav_coffee').css({'background': '#555'});
  $('.nav_drink').css({'background': '#AF4444'});
  $('.nav_dessert').css({'background': '#555'});
});

$('.nav_dessert').click( () => {
  $('.nav_famousmenu').css({'background': '#555'});
  $('.nav_coffee').css({'background': '#555'});
  $('.nav_drink').css({'background': '#555'});
  $('.nav_dessert').css({'background': '#AF4444'});
});

/*nav menu page change 영역*/
$('.nav_famousmenu').click( () => {
  $('.menu_all_box2').hide();
  $('.menu_all_box3').hide();
  $('.menu_all_box4').hide();
  $('.menu_all_box5').hide();
  $('.menu_all_box').show();
});

$('.nav_coffee').click( () => {
  $('.menu_all_box').hide();
  $('.menu_all_box3').hide();
  $('.menu_all_box4').hide();
  $('.menu_all_box5').hide();
  $('.hot_ice_button').show();
  $('.hot_ice_button2').show();
  $('.menu_all_box2').show();
});

$('.nav_drink').click( () => {
  $('.menu_all_box').hide();
  $('.menu_all_box2').hide();
  $('.menu_all_box3').hide();
  $('.menu_all_box5').hide();
  $('.menu_all_box4').show();
});

$('.nav_dessert').click( () => {
  $('.menu_all_box').hide();
  $('.menu_all_box2').hide();
  $('.menu_all_box3').hide();
  $('.menu_all_box4').hide();
  $('.menu_all_box5').show();
});

$('.hot_ice_button').click( () => {
  $('.menu_all_box2').hide();
  $('.menu_all_box3').show();
});

$('.hot_ice_button2').click( () => {
  $('.menu_all_box3').hide();
  $('.menu_all_box2').show();
});

/*장바구니 합계 영역*/
class Kioskmenu {
  constructor(name, price, button_number, amount) {
    this.name = name;
    this.price = price;
    this.button_number = button_number;
    this.amount = amount;
};

/*shopping_cart data order_list 장바구니 data 장바구니 출력 영역*/
/*sc_obj() {
const order_list_data = document.querySelector('.order_list_data');
order_list_data.innerHTML += `
  <div class='${this.name}_box'>
    <span class='menu_name_1_${this.name}'>${this.name}</span>
    <span class='menu_price_1_${this.name}'>${this.price}원</span>
    <button class='plus_menu_button_${this.button_number}'> + </button>
    <span class='menu_number_${this.name}'>${this.amount}</span>
    <button class='minus_menu_button_${this.button_number}'> - </button>
    <button id='delete_menu_button' class='delete_menu_button${this.button_number}'> x </button>
  </div>
  `;
console.log($('.menu_name_1').text());
console.log($(`.menu_price_1_${this.name}`).text());
};*/

sc_obj() {
const order_list_data = document.querySelector('.order_list_data');
order_list_data.innerHTML += `
  <div class='${this.name}_box'>
    <span class='menu_name_1_${this.name}'>${this.name}</span>
    <span class='menu_price_1_${this.name}'>${this.price}원</span>
    <button class='plus_menu_button_${this.button_number}'> + </button>
    <span class='menu_number_${this.name}'>${this.amount}</span>
    <button class='minus_menu_button_${this.button_number}'> - </button>
  </div>
  `;
console.log($('.menu_name_1').text());
console.log($(`.menu_price_1_${this.name}`).text());
};

/*shopping_cart data pay_list 장바구니 data 카드결제 출력 영역*/
pl_obj() {
const pay_list_font = document.querySelector('.pay_list_font');
pay_list_font.innerHTML += `
  <div class='${this.name}_box'>
    <span class='menu_name_1_${this.name}'>${this.name}</span>
    <span> 수량 </span>
    <span class='menu_number_${this.name}'>${this.amount}</span>
    <span class='menu_price_1_${this.name}'></span>
  </div>
  `;
};

/*shopping_cart data receipt_list 장바구니 data 영수증 출력 영역*/
rl_obj() {
const receipt_list_menuname  = document.querySelector('.receipt_list_menuname');
receipt_list_menuname.innerHTML += `
  <div class='${this.name}_box'>
    <span class='menu_name_1_${this.name}'>${this.name}</span>
    <span class='menu_number_${this.name}'>${this.amount}</span>
  </div>
  `;
};

/*shopping_cart plus sum 장바구니 더하기버튼 합계 영역*/
plus_sum() {
  this.amount++;
  $(`.menu_number_${this.name}`).html(this.amount);
  $(`.menu_price_1_${this.name}`).html((this.price * this.amount).toLocaleString() + '원');
};

/*shopping_cart minus sum 장바구니 빼기버튼 합계 영역*/
minus_sum() {
  this.amount--;
  if (this.amount < 1) {
    this.amount = 1;
  }
  $(`.menu_number_${this.name}`).html(this.amount);
  $(`.menu_price_1_${this.name}`).html((this.price * this.amount).toLocaleString() + '원');
}

/*shopping_cart keyvalue remove 장바구니 키값 제거 영역*/
remove_value() {
  this.amount = 0;
    $('.order_list_data').empty();
    $('.sum_value').empty();
    $('.pay_list_font').empty();
    $('.pay_list_sum').empty();
    $('.receipt_list_price').empty();
    $('.receipt_list_menuname').empty();
  };
};

/*shopping_cart menu db 장바구니 메뉴 db 파싱*/
$(window).on('load', function() {
  const app = new XMLHttpRequest();
  app.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    const obj = JSON.parse(this.responseText);
    let menu_list_arr = [];
    let price_arr = [];
    let price_counter = 0;
    console.log(obj);
    for (let i = 0; i < obj.length; i++) {
      const kioskmenu = new Kioskmenu(obj[i].menu_name, obj[i].menu_price, i, 0)
      menu_list_arr.push(kioskmenu);
    };

    /*shopping_cart menu img click data famousmenu send  장바구니 메뉴 이미지 클릭 데이터 인기메뉴 전송 영역*/
    for (let i = 0; i < menu_list_arr.length; i++) {
      $(`#coffe_${i}`).click( () => {
        if (menu_list_arr[i].amount < 1) {
          menu_list_arr[i].sc_obj();
          menu_list_arr[i].pl_obj();
          menu_list_arr[i].rl_obj();
          menu_list_arr[i].plus_sum();
        } else {
          menu_list_arr[i].plus_sum();
        };
        price_arr.push([menu_list_arr[i].name, Number(menu_list_arr[i].price)]);
        console.log(price_arr);
        console.log(menu_list_arr);
      });

      /*shopping_cart menu img click data coffe send 장바구니 메뉴 이미지 클릭 데이터 커피 전송 영역*/
      $(`#coffe_${i}_${i}`).click( () => {
        if (menu_list_arr[i].amount < 1) {
          menu_list_arr[i].sc_obj();
          menu_list_arr[i].pl_obj();
          menu_list_arr[i].rl_obj();
          menu_list_arr[i].plus_sum();
        } else {
          menu_list_arr[i].plus_sum();
        };
        price_arr.push([menu_list_arr[i].name, Number(menu_list_arr[i].price)]);
        console.log(price_arr);
        console.log(menu_list_arr);
      });

      /*shopping_cart menu img click data receipt send 장바구니 메뉴 이미지 클릭 데이터 영수증 전송 영역*/
      $('[id*="coffe_"]').click( () => {
        for (let i = 0; i < price_arr.length; i++) {
          price_counter += price_arr[i][1];
          $('.sum_value').html((price_counter).toLocaleString() + '원');
          $('.pay_list_sum').html((price_counter).toLocaleString() + '원');
          $('.receipt_list_price').html((price_counter).toLocaleString() + '원')
          console.log(price_counter);
        };
        price_counter = 0;
      });

      /*shopping_cart plus_menu_button 장바구니 플러스 버튼 영역*/
      $(document).on('click', `.plus_menu_button_${i}`, () => {
      console.log(price_arr);
      menu_list_arr[i].plus_sum();
      price_arr.push([menu_list_arr[i].name, Number(menu_list_arr[i].price)]);
        for (let i = 0; i < price_arr.length; i++) {
          price_counter += price_arr[i][1];
          $('.sum_value').html((price_counter).toLocaleString() + '원');
          $('.pay_list_sum').html((price_counter).toLocaleString() + '원');
          $('.receipt_list_price').html((price_counter).toLocaleString() + '원');
          console.log(price_counter);
        };
        price_counter = 0;
      });

      /*shopping_cart minus_menu_button 장바구니 빼기 버튼 영역*/
      $(document).on('click', `.minus_menu_button_${i}`, () => {
      console.log(price_arr);
      menu_list_arr[i].minus_sum();
      price_arr.pop([menu_list_arr[i].name, Number(menu_list_arr[i].price)]);
        for (let i = 0; i < price_arr.length; i++) {
          price_counter += price_arr[i][1];
          $('.sum_value').html((price_counter).toLocaleString() + '원');
          $('.pay_list_sum').html((price_counter).toLocaleString() + '원');
          $('.receipt_list_price').html((price_counter).toLocaleString() + '원');
          console.log(price_counter);
        };
        price_counter = 0;
      });

      /*shopping_cart xeicon keyvalue delete 장바구니 아이콘 키값 제거 영역*/
      $('.xi-trash, .receipt_close_button_box, .save_main_button').click( () => {
        menu_list_arr[i].remove_value();
        price_arr.length = 0;
        price_counter = 0;
        console.log(price_counter);
      });
    };
  };

  /*shopping_cart delete menu button keyvalue delete 장바구니 data 제거버튼 영역*/
  /*$(document).on('click', `.delete_menu_button_${i}`, () => {
    if (menu_list_arr[i].name == price_arr[i][0]) {
    console.log(price_arr);
    }
  });*/

  /*$(document).on('click', '#delete_menu_button', (e) => {
    e.target.id
    //console.log(price_arr); 
    price_arr[i].splice(i, 1);
  });*/

};

app.open('GET', '../nodejs/kioskmenu.json?t=' + Math.random(), true);
app.send();
});

/*kiosk receipt box 키오스크 영수증 박스 영역 대기번호*/
$(document).ready( () => {
  const randomNumber = Math.random() * 150
  const randomNumberFloor = Math.floor(randomNumber + 1)
  console.log(randomNumberFloor) 
  document.querySelector('.receipt_list_number2').innerHTML = randomNumberFloor + '&nbsp;번&nbsp;';
  $('.receipt_close_button_box, .save_main_button').click(function() {
  location.reload();
  });
});

/*kiosk point save complete box 키오스크 포인트 적립완료 박스 영역 포인트넘버*/
$(document).ready( () => {
  const randomNumber = Math.random() * 999
  const randomNumberFloor = Math.floor(randomNumber + 1)
  console.log(randomNumberFloor) 
  document.querySelector('.save_font').innerHTML = randomNumberFloor + '&nbsp;P&nbsp;';
  document.querySelector('.point_remaining_font2').innerHTML = randomNumberFloor + '&nbsp;P&nbsp;';
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

/*extra order list menu select 추가주문 오더 리스트 메뉴 선택 영역*/
$('.store_box').click( () => {
  $('.store_box').css({'background':'#AF4444'});
  $('.packaging_box').css({'background':'#555'});
});

$('.packaging_box').click( () => {
  $('.packaging_box').css({'background':'#AF4444'});
  $('.store_box').css({'background':'#555'});
});

$('.generally_box').click( () => {
  $('.generally_box').css({'background':'#AF4444'});
  $('.aplenty_box').css({'background':'#555'});
});

$('.aplenty_box').click( () => {
  $('.aplenty_box').css({'background':'#AF4444'});
  $('.generally_box').css({'background':'#555'});
});

$('.shot_box2').click( () => {
  $('.shot_box2').css({'background':'#AF4444'});
  $('.shot_box3').css({'background':'#555'});
});

$('.shot_box3').click( () => {
  $('.shot_box3').css({'background':'#AF4444'});
  $('.shot_box2').css({'background':'#555'});
});

$('.store_box2').click( () => {
  $('.store_box2').css({'background':'#AF4444'});
  $('.packaging_box2').css({'background':'#555'});
});

$('.packaging_box2').click( () => {
  $('.packaging_box2').css({'background':'#AF4444'});
  $('.store_box2').css({'background':'#555'});
});

$('.shot_box4').click( () => {
  $('.shot_box4').css({'background':'#AF4444'});
  $('.shot_box5').css({'background':'#555'});
});

$('.shot_box5').click( () => {
  $('.shot_box5').css({'background':'#AF4444'});
  $('.shot_box4').css({'background':'#555'});
});

$('.store_box3').click( () => {
  $('.store_box3').css({'background':'#AF4444'});
  $('.packaging_box3').css({'background':'#555'});
});

$('.packaging_box3').click( () => {
  $('.packaging_box3').css({'background':'#AF4444'});
  $('.store_box3').css({'background':'#555'});
});

$('.hotice_box').click( () => {
  $('.hotice_box').css({'background':'#AF4444'});
  $('.hotice_box2').css({'background':'#555'});
});

$('.hotice_box2').click( () => {
  $('.hotice_box2').css({'background':'#AF4444'});
  $('.hotice_box').css({'background':'#555'});
});

$('.store_box4').click( () => {
  $('.store_box4').css({'background':'#AF4444'});
  $('.packaging_box4').css({'background':'#555'});
});

$('.packaging_box4').click( () => {
  $('.packaging_box4').css({'background':'#AF4444'});
  $('.store_box4').css({'background':'#555'});
});

/*extra order list menu select back 추가주문 오더 리스트 메뉴 선택 원상복귀 영역*/
$('.extra_order_next_box, .xi-arrow-left').click( () => {
  $('.store_box').css({'background':'#555'});
  $('.packaging_box').css({'background':'#555'});
  $('.generally_box').css({'background':'#555'});
  $('.aplenty_box').css({'background':'#555'});
  $('.shot_box2').css({'background':'#555'});
  $('.shot_box3').css({'background':'#555'});
  $('.store_box2').css({'background':'#555'});
  $('.packaging_box2').css({'background':'#555'});
  $('.shot_box4').css({'background':'#555'});
  $('.shot_box5').css({'background':'#555'});
  $('.store_box3').css({'background':'#555'});
  $('.packaging_box3').css({'background':'#555'});
  $('.hotice_box').css({'background':'#555'});
  $('.hotice_box2').css({'background':'#555'});
  $('.store_box4').css({'background':'#555'});
  $('.packaging_box4').css({'background':'#555'});  
});

/*kiosk menu extra orders list 키오스크 추가메뉴 리스트 페이지에서 다음버튼 영역*/
$('.extra_order_next_box').click(function() {
  $('.extra_order_list_box').hide();
  $('.main_box').show();
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
  $('.point_signup_number_box').hide();
  $('.pay_screen_box').show();
});

/*kiosk point inquire next button 키오스크 포인트 조회하기 버튼 영역*/
$('.inquire_button').click(function() {
  $('.point_inquire_number_box').hide();
  $('.point_remaining_box').show();
});

/*kiosk point remaining next button 키오스크 잔여포인트 버튼 영역*/
$('.pointuse_button').click(function() {
  $('.point_remaining_box').hide();
  $('.pay_screen_box').show();
});

/*kiosk pay 키오스크 결제하기 영역*/
$('.pay2').click(function() {
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
  $('.point_save_box').hide();
  $('.point_save_complete_box').show();
})

/*kiosk point signup number 키오스크 포인트 간단가입 넘버 박스 영역*/
$('.point_keypad_box > article').each(function(index) {
  $(this).click(function(){
    console.log('point_keypad_box');
    switch(index){
      case 9:
        $('.number_input_box > input')[0].value = '';
        break;

      case 11:
        let member_number = $('.number_input_box > input').val();
        let delete_number = member_number.substring(0, member_number.length-1);
        $('.number_input_box > input').val(delete_number);
        break;

      default:
        if($('.number_input_box > input').val().length < 11){
          $('.number_input_box > input')[0].value += $(this).find('p').html();
        }
        break;
    };
  });
});

/*kiosk point inquire number box 키오스크 포인트 조회하기 넘버 박스 영역*/
$('.point_keypad_box2 > article').each(function(index) {
  $(this).click(function(){
    console.log('point_keypad_box2');
    switch(index){
      case 9:
        $('.number_inquire_input_box > input')[0].value = '';
      break;

      case 11:
        let member_number = $('.number_inquire_input_box > input').val();
        let delete_number = member_number.substring(0, member_number.length-1);
        $('.number_inquire_input_box > input').val(delete_number);
      break;

      default:
        if($('.number_inquire_input_box > input').val().length < 11){
          $('.number_inquire_input_box > input')[0].value += $(this).find('p').html();
        }
      break;
    };
  });
});

/*kiosk point remaining box 키오스크 잔여포인트 박스 영역*/
$('.point_keypad_box3 > article').each(function(index) {
  $(this).click(function(){
    console.log('point_keypad_box3');
    switch(index){
      case 9:
        $('.point_remaining_input_box > input')[0].value = '';
      break;

      case 11:
        let member_number = $('.point_remaining_input_box > input').val();
        let delete_number = member_number.substring(0, member_number.length-1);
        $('.point_remaining_input_box > input').val(delete_number);
      break;

      default:
        if($('.point_remaining_input_box > input').val().length < 3){
          $('.point_remaining_input_box > input')[0].value += $(this).find('p').html();
        }
      break;
    };
  });
});

/*kiosk point save box 키오스트 포인트 적립 박스 영역*/
$('.point_keypad_box4 > article').each(function(index) {
  $(this).click(function(){
    console.log('point_keypad_box4');
    switch(index){
      case 9:
        $('.point_save_input_box > input')[0].value = '';
      break;

      case 11:
        let member_number = $('.point_save_input_box > input').val();
        let delete_number = member_number.substring(0, member_number.length-1);
        $('.point_save_input_box > input').val(delete_number);
      break;

      default:
        if($('.point_save_input_box > input').val().length < 11){
          $('.point_save_input_box > input')[0].value += $(this).find('p').html();
        }
      break;
    };
  });
});