/**
 * 확장에 유연하고 모듈화된 설계를 유지하기 위해 행렬 클래스를 정의.
 * 계산기 인스턴스를 격리함으로써 전역 상태 오염을 방지하고 각 행렬 데이터를 독립적으로 관리함.
 */
class MatrixCalculator {
	constructor(rowCount, columnCount) {
		this.rowCount = rowCount;
		this.columnCount = columnCount;
		this.matrixData = [];
		this.htmlContent = '';
	}

	/**
	 * 사용자가 직접 입력값을 넣기 편한 빈 공간을 시각적으로 빠르게 제공하기 위함.
	 */
	createEmptyMatrix(identifierPrefix) {
		this.matrixData = [];
		let generatedHtmlString = '';
		for (let rowIndex = 0; rowIndex < this.rowCount; rowIndex++) {
			this.matrixData.push([]);
			for (let columnIndex = 0; columnIndex < this.columnCount; columnIndex++) {
				this.matrixData[rowIndex][columnIndex] = 0;
				generatedHtmlString += `<input id="${identifierPrefix}${rowIndex}_${columnIndex}" class="miniBox" type="number" value="0">`;
			}
		}
		this.htmlContent = generatedHtmlString;
		return generatedHtmlString;
	}

	/**
	 * 테스트 목적 또는 사용자의 입력 수고를 덜어주어 사용성을 극대화하기 위함.
	 */
	createRandomMatrix(identifierPrefix) {
		this.matrixData = [];
		let generatedHtmlString = '';
		for (let rowIndex = 0; rowIndex < this.rowCount; rowIndex++) {
			this.matrixData.push([]);
			for (let columnIndex = 0; columnIndex < this.columnCount; columnIndex++) {
				const randomIntegerValue = Math.floor(Math.random() * 100);
				this.matrixData[rowIndex][columnIndex] = randomIntegerValue;
				generatedHtmlString += `<input id="${identifierPrefix}${rowIndex}_${columnIndex}" class="miniBox" type="number" value="${randomIntegerValue}">`;
			}
		}
		this.htmlContent = generatedHtmlString;
		return generatedHtmlString;
	}

	/**
	 * 동적으로 생성되는 그리드의 넓이/높이를 유지하여 CSS 구조의 붕괴를 막고 기존 UI/UX를 보존하기 위함.
	 */
	updateGridStyle(containerIdentifier) {
		$(`#${containerIdentifier}`).css({
			"width": "max-content",
			"height": "auto",
			"display": "grid",
			"grid-template-columns": `repeat(${this.columnCount}, max-content)`,
			"gap": "0.1vw",
			"justify-items": "center",
			"margin": "0 auto"
		});
	}

	/**
	 * 성능 최적화: 이중 루프 내에서 매번 DOM 접근($)을 수행할 경우 병목이 발생할 수 있음.
	 * 따라서 관련된 NodeList 전체를 한 번에 조회하여 DOM 레이아웃 스래싱을 최소화함.
	 */
	getMatrixValuesFromDOM(identifierPrefix) {
		const inputElementsList = $(`[id^='${identifierPrefix}']`);
		const extractedMatrixData = [];
		for (let rowIndex = 0; rowIndex < this.rowCount; rowIndex++) {
			const currentRowData = [];
			for (let columnIndex = 0; columnIndex < this.columnCount; columnIndex++) {
				const elementIndex = (rowIndex * this.columnCount) + columnIndex;
				const parsedValue = parseInt($(inputElementsList[elementIndex]).val(), 10) || 0;
				currentRowData.push(parsedValue);
			}
			extractedMatrixData.push(currentRowData);
		}
		return extractedMatrixData;
	}

	/**
	 * 객체의 상태를 변화시키지 않고 데이터만 다루는 유틸리티 기능이므로 메모리 효율을 위해 정적(Static)으로 정의함.
	 */
	static addMatrices(matrixDataA, matrixDataB) {
		let resultHtmlString = '';
		const totalRows = matrixDataA.length;
		const totalColumns = matrixDataA[0].length;
		for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
			for (let columnIndex = 0; columnIndex < totalColumns; columnIndex++) {
				const sumResult = matrixDataA[rowIndex][columnIndex] + matrixDataB[rowIndex][columnIndex];
				resultHtmlString += `<input class="miniBox" type="text" value="${sumResult}" readonly>`;
			}
		}
		return resultHtmlString;
	}

	static subtractMatrices(matrixDataA, matrixDataB) {
		let resultHtmlString = '';
		const totalRows = matrixDataA.length;
		const totalColumns = matrixDataA[0].length;
		for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
			for (let columnIndex = 0; columnIndex < totalColumns; columnIndex++) {
				const differenceResult = matrixDataA[rowIndex][columnIndex] - matrixDataB[rowIndex][columnIndex];
				resultHtmlString += `<input class="miniBox" type="text" value="${differenceResult}" readonly>`;
			}
		}
		return resultHtmlString;
	}

	static multiplyMatrices(matrixDataA, matrixDataB) {
		let resultHtmlString = '';
		const rowsMatrixA = matrixDataA.length;
		const columnsMatrixA = matrixDataA[0].length;
		const columnsMatrixB = matrixDataB[0].length;

		for (let rowIndex = 0; rowIndex < rowsMatrixA; rowIndex++) {
			for (let columnIndex = 0; columnIndex < columnsMatrixB; columnIndex++) {
				let totalAccumulatedValue = 0;
				for (let sharedIndex = 0; sharedIndex < columnsMatrixA; sharedIndex++) {
					totalAccumulatedValue += matrixDataA[rowIndex][sharedIndex] * matrixDataB[sharedIndex][columnIndex];
				}
				resultHtmlString += `<input class="miniBox" type="text" value="${totalAccumulatedValue}" readonly>`;
			}
		}
		return resultHtmlString;
	}
}

/**
 * 전역적인 피드백 창을 일관된 형태로 보여주어 사용자가 프로그램의 현재 상태나 오류 원인을 인지할 수 있게 하기 위함.
 */
const showApplicationAlert = (targetSelectorsList, alertMessageText) => {
	const currentAlertBoxInstance = $(".alert_event_box");
	currentAlertBoxInstance.css("display", "block");
	$("#alert_box").html(alertMessageText);
	
	if (targetSelectorsList) {
		$(targetSelectorsList).val("");
	}
	
	currentAlertBoxInstance.off("click").on("click", function () {
		$(this).css("display", "none");        
	});
};

/**
 * 사용자가 유효하지 않은 값(소수점, 음수 등)을 입력하여 이후 로직이 오작동하는 것을 원천 차단하기 위함.
 */
$(document).on("keyup", "input[type='number']", function () {
	const currentInputValue = $(this).val();
	const invalidCharactersPattern = /^[-0]|[\.]/g;
	if (invalidCharactersPattern.test(currentInputValue)) {
		showApplicationAlert(this, "1~9까지의 양의 정수만 입력해 주세요.");
		$("#xprint_Array, #yprint_Array, #print_Array").empty();
	}
});

/**
 * 단일 책임 원칙(SRP) 준수를 위해 방대한 클릭 이벤트를 역할별로 분할한 헬퍼 메서드들.
 */

// 그리드 크기를 유효성 검사하여 이상이 생기기 전 차단함.
const validateMatrixSizeInputs = (rowA, colA, rowB, colB) => {
	const isValueInvalid = (numberValue) => numberValue < 1 || numberValue > 9 || isNaN(numberValue);
	return [rowA, colA, rowB, colB].some(isValueInvalid);
};

// 직접 입력 시 빈 칸 생성
const handleDirectInputMatrixClick = (calculatorA, calculatorB, hasInvalidInputs) => {
	if (hasInvalidInputs) {
		showApplicationAlert("#xinputArray, #xinputArray2, #yinputArray, #yinputArray2", "1~9까지의 숫자를 입력해 주세요.");
		$("#xprint_Array, #yprint_Array, #print_Array").empty();
	} else {
		$("#xprint_Array").html(calculatorA.createEmptyMatrix("inputA"));
		calculatorA.updateGridStyle("xprint_Array");
		$("#yprint_Array").html(calculatorB.createEmptyMatrix("inputB"));
		calculatorB.updateGridStyle("yprint_Array");
		$("#print_Array").empty();
	}
};

// 랜덤 입력 시 랜덤 칸 부여
const handleRandomInputMatrixClick = (calculatorA, calculatorB, hasInvalidInputs) => {
	if (hasInvalidInputs) {
		showApplicationAlert("#xinputArray, #xinputArray2, #yinputArray, #yinputArray2", "1~9까지의 숫자를 입력해 주세요.");
		$("#xprint_Array, #yprint_Array, #print_Array").empty();
	} else {
		$("#xprint_Array").html(calculatorA.createRandomMatrix("inputA"));
		calculatorA.updateGridStyle("xprint_Array");
		$("#yprint_Array").html(calculatorB.createRandomMatrix("inputB"));
		calculatorB.updateGridStyle("yprint_Array");
		$("#print_Array").empty();
	}
};

// 모든 출력 및 데이터를 지움
const handleResetApplicationClick = () => {
	$("#xprint_Array, #yprint_Array, #print_Array").empty();
	$("#xinputArray, #xinputArray2, #yinputArray, #yinputArray2").val("");
};

// 동일한 크기의 행렬만 연산 가능하므로 안정성을 위해 조건을 부여함.
const handleAdditionOrSubtractionClick = (operatorType, calculatorA, calculatorB) => {
	if (calculatorA.rowCount === calculatorB.rowCount && calculatorA.columnCount === calculatorB.columnCount) {
		const extractedDataA = calculatorA.getMatrixValuesFromDOM("inputA");
		const extractedDataB = calculatorB.getMatrixValuesFromDOM("inputB");
		let calculationResultHtml = '';
		
		if (operatorType === 'button_box_plus') {
			calculationResultHtml = MatrixCalculator.addMatrices(extractedDataA, extractedDataB);
		} else {
			calculationResultHtml = MatrixCalculator.subtractMatrices(extractedDataA, extractedDataB);
		}
		
		const resultMatrixCalculator = new MatrixCalculator(calculatorA.rowCount, calculatorA.columnCount);
		resultMatrixCalculator.updateGridStyle("print_Array");
		$("#print_Array").html(calculationResultHtml);
	} else {
		showApplicationAlert(null, "덧셈/뺄셈을 위해서는 좌우 행렬의 크기(행, 열)가 동일해야 합니다.");
		$("#print_Array").empty();
	}
};

// 행렬 곱 연산 규칙에 위배되면 치명적 오류를 초래하므로 예외를 관리함.
const handleMultiplicationClick = (calculatorA, calculatorB) => {
	if (calculatorA.columnCount === calculatorB.rowCount) {
		const extractedDataA = calculatorA.getMatrixValuesFromDOM("inputA");
		const extractedDataB = calculatorB.getMatrixValuesFromDOM("inputB");
		const calculationResultHtml = MatrixCalculator.multiplyMatrices(extractedDataA, extractedDataB);
		
		const resultMatrixCalculator = new MatrixCalculator(calculatorA.rowCount, calculatorB.columnCount);
		resultMatrixCalculator.updateGridStyle("print_Array");
		$("#print_Array").html(calculationResultHtml);
	} else {
		showApplicationAlert(null, "행렬 곱셈을 위해 좌측 행렬의 열과 우측 행렬의 행 크기가 일치해야 합니다.");
		$("#print_Array").empty();
	}
};

/**
 * 하나의 거대한 함수 구조가 사이드 이펙트를 낳을 수 있어 메인 핸들러는 트리거의 역할만 수행하게 함.
 */
$(document).on("click", "button, input[type='button']", function (eventObject) {
	const rowCountMatrixA = Number($("#xinputArray").val());
	const columnCountMatrixA = Number($("#yinputArray").val());
	const rowCountMatrixB = Number($("#xinputArray2").val());
	const columnCountMatrixB = Number($("#yinputArray2").val());
	
	const hasInvalidInputs = validateMatrixSizeInputs(rowCountMatrixA, columnCountMatrixA, rowCountMatrixB, columnCountMatrixB);

	const calculatorMatrixA = new MatrixCalculator(rowCountMatrixA, columnCountMatrixA);
	const calculatorMatrixB = new MatrixCalculator(rowCountMatrixB, columnCountMatrixB);
	const targetElementIdentifier = eventObject.currentTarget.id;

	switch (targetElementIdentifier) {
		case 'button_box_print':
			handleDirectInputMatrixClick(calculatorMatrixA, calculatorMatrixB, hasInvalidInputs);
			break;

		case 'button_box_random':
			handleRandomInputMatrixClick(calculatorMatrixA, calculatorMatrixB, hasInvalidInputs);
			break;

		case 'button_box_reset':
			handleResetApplicationClick();
			break;

		case 'button_box_plus':
		case 'button_box_minus':
		case 'button_box_multi':
			if ($("#xprint_Array").is(':empty') || $("#yprint_Array").is(':empty')) {
				showApplicationAlert(null, "먼저 행렬을 생성(자동완성 또는 직접입력)해 주세요.");
				return;
			}

			if (targetElementIdentifier === 'button_box_plus' || targetElementIdentifier === 'button_box_minus') {
				handleAdditionOrSubtractionClick(targetElementIdentifier, calculatorMatrixA, calculatorMatrixB);
			} else if (targetElementIdentifier === 'button_box_multi') {
				handleMultiplicationClick(calculatorMatrixA, calculatorMatrixB);
			}
			break;
	}
});
