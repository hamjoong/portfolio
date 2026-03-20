/**
 * 행렬 계산기 클래스
 * 행렬의 데이터 모델링, 연산 및 렌더링을 담당합니다.
 */
class MatrixCalculator {
	/**
	 * @param {number} rows - 행의 개수
	 * @param {number} cols - 열의 개수
	 */
	constructor(rows, cols) {
		this.rows = rows;
		this.cols = cols;
		this.matrixData = [];
		this.htmlContent = '';
	}

	/**
	 * 빈 행렬(모든 값이 0)을 생성하고 HTML 문자열을 반환합니다.
	 * @param {string} idPrefix - 각 input 요소의 ID에 붙을 접두사
	 * @returns {string} 생성된 HTML input 요소들의 문자열
	 */
	createEmptyMatrix(idPrefix) {
		this.matrixData = [];
		let html = '';
		for (let i = 0; i < this.rows; i++) {
			this.matrixData.push([]);
			for (let j = 0; j < this.cols; j++) {
				this.matrixData[i][j] = 0;
				html += `<input id="${idPrefix}${i}_${j}" class="miniBox" type="number" value="0">`;
			}
		}
		this.htmlContent = html;
		return html;
	}

	/**
	 * 랜덤한 값(0~99)으로 채워진 행렬을 생성하고 HTML 문자열을 반환합니다.
	 * @param {string} idPrefix - 각 input 요소의 ID에 붙을 접두사
	 * @returns {string} 생성된 HTML input 요소들의 문자열
	 */
	createRandomMatrix(idPrefix) {
		this.matrixData = [];
		let html = '';
		for (let i = 0; i < this.rows; i++) {
			this.matrixData.push([]);
			for (let j = 0; j < this.cols; j++) {
				const randomVal = Math.floor(Math.random() * 100);
				this.matrixData[i][j] = randomVal;
				html += `<input id="${idPrefix}${i}_${j}" class="miniBox" type="number" value="${randomVal}">`;
			}
		}
		this.htmlContent = html;
		return html;
	}

	/**
	 * 행렬이 표시될 그리드 컨테이너의 스타일을 업데이트합니다.
	 * @param {string} containerId - 대상 컨테이너 요소의 ID
	 */
	updateGridStyle(containerId) {
		const multiplier = 2.9; // 기존 디자인의 너비 배수 유지
		$(`#${containerId}`).css({
			"width": (multiplier * this.cols) + "vw",
			"height": "auto",
			"display": "grid",
			"grid-template-columns": `repeat(${this.cols}, 1fr)`,
			"gap": "0.4vw",
			"justify-items": "center",
			"margin": "0 auto"
		});
	}

	/**
	 * 화면(DOM)에서 현재 입력된 행렬 값들을 읽어와 배열로 반환합니다. (성능 최적화)
	 * @param {string} idPrefix - input 요소의 ID 접두사
	 * @returns {number[][]} 행렬 데이터 배열
	 */
	getMatrixValuesFromDOM(idPrefix) {
		const data = [];
		for (let i = 0; i < this.rows; i++) {
			const row = [];
			for (let j = 0; j < this.cols; j++) {
				const val = parseInt($(`#${idPrefix}${i}_${j}`).val()) || 0;
				row.push(val);
			}
			data.push(row);
		}
		return data;
	}

	/**
	 * 두 행렬의 합을 계산하여 결과 HTML을 생성합니다. (정적 메서드)
	 * @param {number[][]} matrixA - 첫 번째 행렬 데이터
	 * @param {number[][]} matrixB - 두 번째 행렬 데이터
	 * @returns {string} 결과 HTML 문자열
	 */
	static addMatrices(matrixA, matrixB) {
		let html = '';
		const rows = matrixA.length;
		const cols = matrixA[0].length;
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				const sum = matrixA[i][j] + matrixB[i][j];
				html += `<input class="miniBox" type="text" value="${sum}" readonly>`;
			}
		}
		return html;
	}

	/**
	 * 두 행렬의 차를 계산하여 결과 HTML을 생성합니다. (정적 메서드)
	 * @param {number[][]} matrixA - 첫 번째 행렬 데이터
	 * @param {number[][]} matrixB - 두 번째 행렬 데이터
	 * @returns {string} 결과 HTML 문자열
	 */
	static subtractMatrices(matrixA, matrixB) {
		let html = '';
		const rows = matrixA.length;
		const cols = matrixA[0].length;
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				const diff = matrixA[i][j] - matrixB[i][j];
				html += `<input class="miniBox" type="text" value="${diff}" readonly>`;
			}
		}
		return html;
	}

	/**
	 * 두 행렬의 곱을 계산하여 결과 HTML을 생성합니다. (정적 메서드)
	 * @param {number[][]} matrixA - 좌측 행렬 데이터
	 * @param {number[][]} matrixB - 우측 행렬 데이터
	 * @returns {string} 결과 HTML 문자열
	 */
	static multiplyMatrices(matrixA, matrixB) {
		let html = '';
		const rowsA = matrixA.length;
		const colsA = matrixA[0].length;
		const colsB = matrixB[0].length;

		for (let i = 0; i < rowsA; i++) {
			for (let j = 0; j < colsB; j++) {
				let total = 0;
				for (let k = 0; k < colsA; k++) {
					total += matrixA[i][k] * matrixB[k][j];
				}
				html += `<input class="miniBox" type="text" value="${total}" readonly>`;
			}
		}
		return html;
	}
}

/**
 * 알림 메시지 팝업을 표시합니다.
 * @param {HTMLElement|string|null} selectors - 값을 초기화할 대상 요소
 * @param {string} message - 표시할 메시지 내용
 */
const showAlert = (selectors, message) => {
	const $alertEventBox = $(".alert_event_box");
	$alertEventBox.css("display", "block");
	$("#alert_box").html(message);
	
	if (selectors) {
		$(selectors).val("");
	}
	
	// 알림창 클릭 시 닫기
	$alertEventBox.off("click").on("click", function () {
		$(this).css("display", "none");        
	});
};

/**
 * 행렬 크기 입력 필드에 대한 실시간 유효성 검사
 */
$(document).on("keyup", "input[type='number']", function () {
	const val = $(this).val();
	const invalidPattern = /^[-0]|[\.]/g; // 0, 음수, 소수점 방지
	if (invalidPattern.test(val)) {
		showAlert(this, "1~9까지의 양의 정수만 입력해 주세요.");
		$("#xprint_Array, #yprint_Array, #print_Array").empty();
	}
});

/**
 * 모든 계산기 버튼에 대한 통합 클릭 이벤트 핸들러
 */
$(document).on("click", "button, input[type='button']", function (e) {
	const x1 = Number($("#xinputArray").val());
	const y1 = Number($("#yinputArray").val());
	const x2 = Number($("#xinputArray2").val());
	const y2 = Number($("#yinputArray2").val());
	
	// 유효한 행렬 크기인지 확인 (1~9)
	const isInvalid = (num) => num < 1 || num > 9 || isNaN(num);
	const anyInvalid = [x1, y1, x2, y2].some(isInvalid);

	const calc1 = new MatrixCalculator(x1, y1);
	const calc2 = new MatrixCalculator(x2, y2);
	const targetId = e.currentTarget.id;

	switch (targetId) {
		case 'button_box_print': // '직접입력' 버튼
			if (anyInvalid) {
				showAlert("#xinputArray, #xinputArray2, #yinputArray, #yinputArray2", "1~9까지의 숫자를 입력해 주세요.");
				$("#xprint_Array, #yprint_Array, #print_Array").empty();
			} else {
				$("#xprint_Array").html(calc1.createEmptyMatrix("inputA"));
				calc1.updateGridStyle("xprint_Array");
				$("#yprint_Array").html(calc2.createEmptyMatrix("inputB"));
				calc2.updateGridStyle("yprint_Array");
				$("#print_Array").empty();
			}
			break;

		case 'button_box_random': // '자동완성' 버튼
			if (anyInvalid) {
				showAlert("#xinputArray, #xinputArray2, #yinputArray, #yinputArray2", "1~9까지의 숫자를 입력해 주세요.");
				$("#xprint_Array, #yprint_Array, #print_Array").empty();
			} else {
				$("#xprint_Array").html(calc1.createRandomMatrix("inputA"));
				calc1.updateGridStyle("xprint_Array");
				$("#yprint_Array").html(calc2.createRandomMatrix("inputB"));
				calc2.updateGridStyle("yprint_Array");
				$("#print_Array").empty();
			}
			break;

		case 'button_box_reset': // '리셋' 버튼
			$("#xprint_Array, #yprint_Array, #print_Array").empty();
			$("#xinputArray, #xinputArray2, #yinputArray, #yinputArray2").val("");
			break;

		case 'button_box_plus': // '+' 버튼
		case 'button_box_minus': // '-' 버튼
		case 'button_box_multi': // '×' 버튼
			// 행렬이 생성되었는지 확인
			if ($("#xprint_Array").is(':empty') || $("#yprint_Array").is(':empty')) {
				showAlert(null, "먼저 행렬을 생성(자동완성 또는 직접입력)해 주세요.");
				return;
			}

			if (targetId === 'button_box_plus' || targetId === 'button_box_minus') {
				// 덧셈과 뺄셈은 두 행렬의 크기가 같아야 함
				if (x1 === x2 && y1 === y2) {
					const dataA = calc1.getMatrixValuesFromDOM("inputA");
					const dataB = calc2.getMatrixValuesFromDOM("inputB");
					let resultHtml = '';
					
					if (targetId === 'button_box_plus') {
						resultHtml = MatrixCalculator.addMatrices(dataA, dataB);
					} else {
						resultHtml = MatrixCalculator.subtractMatrices(dataA, dataB);
					}
					
					const resCalc = new MatrixCalculator(x1, y1);
					resCalc.updateGridStyle("print_Array");
					$("#print_Array").html(resultHtml);
				} else {
					showAlert(null, "덧셈/뺄셈을 위해서는 좌우 행렬의 크기(행, 열)가 동일해야 합니다.");
					$("#print_Array").empty();
				}
			} else if (targetId === 'button_box_multi') {
				// 행렬 곱셈 조건: 좌측 행렬의 열 개수 == 우측 행렬의 행 개수
				if (y1 === x2) {
					const dataA = calc1.getMatrixValuesFromDOM("inputA");
					const dataB = calc2.getMatrixValuesFromDOM("inputB");
					const resultHtml = MatrixCalculator.multiplyMatrices(dataA, dataB);
					
					const resCalc = new MatrixCalculator(x1, y2);
					resCalc.updateGridStyle("print_Array");
					$("#print_Array").html(resultHtml);
				} else {
					showAlert(null, "행렬 곱셈을 위해 좌측 행렬의 열과 우측 행렬의 행 크기가 일치해야 합니다.");
					$("#print_Array").empty();
				}
			}
			break;
	}
});
