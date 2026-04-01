/* DOM 로드 후 실행 */
document.addEventListener("DOMContentLoaded", () => {
  const ssnFrontInput = document.getElementById("ssnNumber");
  const ssnBackInput = document.getElementById("ssnNumber2");
  const validateButton = document.getElementById("ssnValidation");
  const resultDisplay = document.querySelector(".ssn_number");

  /* 유효성 검사 상수 */
  /* 가중치 배열: 각 자릿수에 곱해질 가중치 값 */
  const WEIGHTS = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];
  /* 모듈러스: 체크섬 계산 시 사용될 나눗셈 값 */
  const MODULUS = 11;
  /* 체크섬 위치: 주민등록번호 배열에서 체크섬 숫자의 인덱스 */
  const CHECK_INDEX = 12;

  /* 숫자 이외의 문자 제거 함수 */
  const filterNonNumeric = (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
  };

  /* 주민등록번호 검증 로직 */
  const validateSSN = () => {
    const front = ssnFrontInput.value;
    const back = ssnBackInput.value;

    /* 자릿수 체크: 앞 6자리, 뒤 7자리 */
    if (front.length !== 6 || back.length !== 7) {
      resultDisplay.textContent = "주민등록번호 자릿수가 올바르지 않습니다. (앞 6자리, 뒤 7자리)";
      if (front.length !== 6) ssnFrontInput.focus();
      else ssnBackInput.focus();
      return;
    }

    const ssn = front + back;
    const ssnArr = ssn.split("").map(Number);

    /* 체크섬 계산 */
    let sum = 0;
    for (let i = 0; i < WEIGHTS.length; i++) {
      sum += ssnArr[i] * WEIGHTS[i];
    }

    const checkDigit = (MODULUS - (sum % MODULUS)) % 10;

    /* 결과 표시 */
    if (checkDigit !== ssnArr[CHECK_INDEX]) {
      resultDisplay.textContent = "올바른 주민등록번호가 아닙니다.";
    } else {
      resultDisplay.textContent = "올바른 주민등록번호 입니다.";
    }
  };
  
  /* 앞자리 입력 이벤트: 숫자 필터링 및 6자리 입력 시 뒷자리로 포커스 이동 */
  ssnFrontInput.addEventListener("input", (e) => {
    filterNonNumeric(e);
    if (e.target.value.length === 6) {
      ssnBackInput.focus();
    }
  });

  /* 뒷자리 입력 이벤트: 숫자 필터링 */
  ssnBackInput.addEventListener("input", filterNonNumeric);

  /* 엔터키 입력 시 검사 실행 */
  ssnBackInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      validateSSN();
    }
  });

  /* 검사 버튼 클릭 이벤트 */
  if (validateButton) {
    validateButton.addEventListener("click", validateSSN);
  }
});
