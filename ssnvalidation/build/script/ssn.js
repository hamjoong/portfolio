/*주민등록번호 유효성 검사 함수*/
function ssnvalidation() {
  const ssnNumber = document.getElementById("ssnNumber");
  const ssnNumber2 = document.getElementById("ssnNumber2");

  const v1 = ssnNumber.value;
  const v2 = ssnNumber2.value;

  /*자릿수 체크: 앞 6자리, 뒤 7자리*/
  if (v1.length !== 6 || v2.length !== 7) {
    alert("주민등록번호 자릿수가 올바르지 않습니다. (앞 6자리, 뒤 7자리)");
    if (v1.length !== 6) ssnNumber.focus();
    else ssnNumber2.focus();
    return false;
  }

  /*주민등록번호 검증 로직*/
  const ssn = v1 + v2;
  const ssnArr = ssn.split("").map(Number);
  
  /*검증용 가중치 상수화*/
  const WEIGHTS = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];
  const MODULUS = 11;
  const CHECK_INDEX = 12; // 13번째 자리 (인덱스 12)
  
  let tempSum = 0;
  for (let i = 0; i < WEIGHTS.length; i++) {
    tempSum += ssnArr[i] * WEIGHTS[i];
  }

  const checkDigit = (MODULUS - (tempSum % MODULUS)) % 10;

  /*검사후 결과값에 대해 알려주는 영역*/
  if (checkDigit !== ssnArr[CHECK_INDEX]) {
    alert("올바른 주민등록번호가 아닙니다.");
    ssnNumber.focus();
    return false;
  } else {
    alert("올바른 주민등록번호 입니다.");
  }
}

/*입력 제한 및 자동 포커스 이벤트 설정*/
document.addEventListener("DOMContentLoaded", function() {
  const ssn1 = document.getElementById("ssnNumber");
  const ssn2 = document.getElementById("ssnNumber2");

  /*숫자 이외의 문자 제거 함수*/
  const filterNonNumeric = (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
  };

  /*앞자리 입력 이벤트: 숫자 필터링 및 6자리 입력 시 뒷자리로 포커스 이동*/
  ssn1.addEventListener("input", (e) => {
    filterNonNumeric(e);
    if (e.target.value.length === 6) {
      ssn2.focus();
    }
  });

  /*뒷자리 입력 이벤트: 숫자 필터링*/
  ssn2.addEventListener("input", filterNonNumeric);
});
