class matrix_calculator {
	constructor (xArray, yArray) {
		this.xArray = xArray;
		this.yArray = yArray;
		this.valueArray = [];
		this.xprint_Array = '';
		this.idArray = '';
		this.calArray = '';
	}

	inputArray (idName) {
		this.valueArray = [];
		this.xprint_Array = '';
		let i = 0;
		while (i < this.xArray) {
			this.valueArray.push([]);            
			let j = 0;
			while (j < this.yArray) {
				this.valueArray[i][j] = 0;
				this.xprint_Array += '<input id="' + idName + i + "_" + j + '" class="miniBox" type="number" value="0">';
				j++;
			}
			i++;
		}
		return this.xprint_Array;
	}

	randomArray (idName) {
		this.valueArray = [];
		this.xprint_Array = '';
		let i = 0;
		while (i < this.xArray) {
			this.valueArray.push([]);            
			let j = 0;
			while (j < this.yArray) {
				this.valueArray[i][j] = Math.floor(Math.random() * 100);
				this.xprint_Array += '<input id="' + idName + i + "_" + j + '" class="miniBox" type="number" value="' + this.valueArray[i][j] + '">';
				j++;                
			}
			i++;
		}
		return this.xprint_Array;
	}

	setPrintSize (printId) {
		let multiplier = 2.9; 

		$("#" + printId).css({
			"width": (multiplier * this.yArray) + "vw",
			"height": "auto",
			"display": "grid",
			"grid-template-columns": "repeat(" + this.yArray + ", 1fr)",
			"gap": "0.4vw",
			"justify-items": "center",
			"margin": "0 auto"
		});
	}

	plusArray () {
		this.calArray = '';
		const matrixA = [];
		const matrixB = [];

		for (let i = 0; i < this.xArray; i++) {
			matrixA.push([]);
			matrixB.push([]);
			for (let j = 0; j < this.yArray; j++) {
				matrixA[i].push(parseInt($("#inputA" + i + "_" + j).val()) || 0);
				matrixB[i].push(parseInt($("#inputB" + i + "_" + j).val()) || 0);
			}
		}

		let i = 0;
		while (i < this.xArray) {
			let j = 0;
			while (j < this.yArray) {
				const resVal = matrixA[i][j] + matrixB[i][j];
				this.calArray += '<input class="miniBox" type="text" value="' + resVal + '" readonly>';
				j++;
			}
			i++;
		}
	}

	minusArray () {
		this.calArray = '';
		const matrixA = [];
		const matrixB = [];

		for (let i = 0; i < this.xArray; i++) {
			matrixA.push([]);
			matrixB.push([]);
			for (let j = 0; j < this.yArray; j++) {
				matrixA[i].push(parseInt($("#inputA" + i + "_" + j).val()) || 0);
				matrixB[i].push(parseInt($("#inputB" + i + "_" + j).val()) || 0);
			}
		}

		let i = 0;
		while (i < this.xArray) {
			let j = 0;
			while (j < this.yArray) {
				const resVal = matrixA[i][j] - matrixB[i][j];
				this.calArray += '<input class="miniBox" type="text" value="' + resVal + '" readonly>';
				j++;
			}
			i++;
		}
	}
}

const alertEvent = (selectors, body) => {
	$(".alert_event_box").css("display", "block");
	$("#alert_box").html(body);
	if (selectors) {
		$(selectors).val("");
	}
	$(".alert_event_box").off("click").on("click", function () {
		$(this).css("display", "none");        
	});
}

$(".xinputArray, .yinputArray, .xinputArray2, .yinputArray2").on("keyup", function () {
	const checkIn = /^[-0]|[\.]/g;
	if (checkIn.test($(this).val())) {
		alertEvent(this, "1~9까지 입력해 주세요.");
		$("#xprint_Array, #yprint_Array, #print_Array").empty();
	}
});

$(document).on("click", function (e) {
	const xinputValue = Number($("#xinputArray").val());
	const yinputValue = Number($("#yinputArray").val());
	const xinputValue2 = Number($("#xinputArray2").val());
	const yinputValue2 = Number($("#yinputArray2").val());
	
	const inputValue = new matrix_calculator(xinputValue, yinputValue);
	const inputValue2 = new matrix_calculator(xinputValue2, yinputValue2);

	const multiArray = () => {
		const matrixA = [];
		for (let i = 0; i < xinputValue; i++) {
			matrixA.push([]);
			for (let k = 0; k < yinputValue; k++) {
				matrixA[i].push(parseInt($('#inputA' + i + "_" + k).val()) || 0);
			}
		}

		const matrixB = [];
		for (let k = 0; k < xinputValue2; k++) {
			matrixB.push([]);
			for (let j = 0; j < yinputValue2; j++) {
				matrixB[k].push(parseInt($('#inputB' + k + "_" + j).val()) || 0);
			}
		}

		let newArray = '';
		for (let i = 0; i < xinputValue; i++) {
			for (let j = 0; j < yinputValue2; j++) {
				let totalValue = 0;
				for (let k = 0; k < yinputValue; k++) {
					totalValue += matrixA[i][k] * matrixB[k][j];
				}
				newArray += '<input class="miniBox" type="text" value="' + totalValue + '" readonly>';
			}
		}
		return newArray;
	}

	const checkIn = /^[-0]|[\.]/g;
	const isAnyInvalid = [xinputValue, yinputValue, xinputValue2, yinputValue2].some(val => val < 1 || val > 9 || isNaN(val));

	switch (e.target.id) {
		case 'button_box_print':
			if (isAnyInvalid) {
				alertEvent("#xinputArray, #xinputArray2, #yinputArray, #yinputArray2", "1~9까지 입력해 주세요.");
				$("#xprint_Array, #yprint_Array, #print_Array").empty();
			} else {
				$("#xprint_Array").html(inputValue.inputArray("inputA"));
				inputValue.setPrintSize("xprint_Array");
				$("#yprint_Array").html(inputValue2.inputArray("inputB"));
				inputValue2.setPrintSize("yprint_Array");
			}
			break;

		case 'button_box_random':
			if (isAnyInvalid) {
				alertEvent("#xinputArray, #xinputArray2, #yinputArray, #yinputArray2", "1~9까지 입력해 주세요.");
				$("#xprint_Array, #yprint_Array, #print_Array").empty();
			} else {
				$("#xprint_Array").html(inputValue.randomArray("inputA"));
				inputValue.setPrintSize("xprint_Array");
				$("#yprint_Array").html(inputValue2.randomArray("inputB"));
				inputValue2.setPrintSize("yprint_Array");
			}
			break;

		case 'button_box_reset':
			$("#xprint_Array, #yprint_Array, #print_Array").empty();
			$("#xinputArray, #xinputArray2, #yinputArray, #yinputArray2").val("");
			break;

		case 'button_box_plus':
			if ($("#xprint_Array").html() === "" || $("#yprint_Array").html() === "") {
				alertEvent(null, "자동완성을 먼저 눌러주세요.");
			} else if (xinputValue === xinputValue2 && yinputValue === yinputValue2) {
				inputValue.plusArray();
				inputValue.setPrintSize("print_Array");
				$("#print_Array").html(inputValue.calArray);
			} else {
				alertEvent(null, "좌우 행열이 같아야 합니다.");
				$("#print_Array").empty();
			}
			break;

		case 'button_box_minus':
			if ($("#xprint_Array").html() === "" || $("#yprint_Array").html() === "") {
				alertEvent(null, "자동완성을 먼저 눌러주세요.");
			} else if (xinputValue === xinputValue2 && yinputValue === yinputValue2) {
				inputValue.minusArray();
				inputValue.setPrintSize("print_Array");
				$("#print_Array").html(inputValue.calArray);
			} else {
				alertEvent(null, "좌우 행열이 같아야 합니다.");
				$("#print_Array").empty();
			}
			break;

		case 'button_box_multi':
			if ($("#xprint_Array").html() === "" || $("#yprint_Array").html() === "") {
				alertEvent(null, "자동완성을 먼저 눌러주세요.");
			} else if (yinputValue === xinputValue2) {
				const resultMatrix = new matrix_calculator(xinputValue, yinputValue2);
				resultMatrix.setPrintSize("print_Array");
				$("#print_Array").html(multiArray());
			} else {
				alertEvent(null, "좌측 행렬의 열과 우측 행렬의 행이 같아야 합니다.");
				$("#print_Array").empty();
			}
			break;
	}
});
