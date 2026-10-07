/* DOM 로드 후 실행 */
document.addEventListener("DOMContentLoaded", () => {
  const ssnFrontInput = document.getElementById("ssnNumber");
  const ssnBackInput = document.getElementById("ssnNumber2");
  const validateButton = document.getElementById("ssnValidation");
  const resultDisplay = document.querySelector(".ssn_number");
  const ssnForm = document.getElementById("ssnCheck");
  const DEFAULT_MESSAGE = resultDisplay.textContent;

  /* 유효성 검사 상수 */
  const WEIGHTS = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];
  const MODULUS = 11;
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
      alert("주민등록번호 자릿수가 올바르지 않습니다. (앞 6자리, 뒤 7자리)");
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

  /* 엔터키 입력 시 검사 실행 (앞자리/뒷자리 공통) */
  const validateOnEnter = (e) => {
    if (e.key === "Enter") {
      validateSSN();
    }
  };
  ssnFrontInput.addEventListener("keydown", validateOnEnter);
  ssnBackInput.addEventListener("keydown", validateOnEnter);

  /* 뒷자리가 비어 있을 때 Backspace: 앞자리로 되돌아가 계속 지울 수 있게 함 */
  ssnBackInput.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && ssnBackInput.value === "") {
      ssnFrontInput.focus();
    }
  });

  /* 붙여넣기: 하이픈 등 비숫자를 제거하고, 13자리가 한 번에 들어오면 앞/뒷자리로 나눠 채움.
     maxlength가 필터링보다 먼저 값을 자르므로 paste 단계에서 직접 처리해야 함 */
  ssnFrontInput.addEventListener("paste", (e) => {
    const digits = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    if (digits.length <= 6) return; /* 기존 동작(input 이벤트 필터링)에 맡김 */
    e.preventDefault();
    ssnFrontInput.value = digits.slice(0, 6);
    ssnBackInput.value = digits.slice(6, 13);
    ssnBackInput.focus();
  });

  ssnBackInput.addEventListener("paste", (e) => {
    const digits = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    e.preventDefault();
    ssnBackInput.setRangeText(digits, ssnBackInput.selectionStart, ssnBackInput.selectionEnd, "end");
    ssnBackInput.value = ssnBackInput.value.slice(0, 7);
  });

  /* Reset 버튼: 입력값과 함께 이전 검사 결과 문구도 초기화하고 앞자리로 포커스 */
  ssnForm.addEventListener("reset", () => {
    resultDisplay.textContent = DEFAULT_MESSAGE;
    ssnFrontInput.focus();
  });

  /* 검사 버튼 클릭 이벤트 */
  if (validateButton) {
    validateButton.addEventListener("click", validateSSN);
  }
});
