function _resizeCalcButtons() {
	var buttonArea = document.getElementById('container-buttons');
	var calcButtons = document.getElementsByClassName('button');

	calcButtons = Array.prototype.slice.call(calcButtons, 0);

	calcButtons.forEach(function(elt){
		if (buttonArea.offsetWidth>buttonArea.offsetHeight) {
			elt.style.height = "80%";
			elt.style.width = elt.offsetHeight + 'px';
		}
		else {
			elt.style.width = "80%";
			elt.style.height = elt.offsetWidth + 'px';
		}
	});

}

function events() {
	var displayInfoButton = document.getElementById('button-info');	
	var displayCalcButton = document.getElementById('button-calc');

	var infos = document.getElementsByClassName('info');
	var calcs = document.getElementsByClassName('calc');
	var html = document.querySelector('html');

	var buttonPlace = document.getElementById('container-buttons');
	var calcDeleteButton = document.getElementById('calc-button-delete');
	var resizeCalcButtonsTimer;
	var calcButtonsResized = false;
	var calcInput = document.querySelector('#screen');
	var calcEqualsButton = document.querySelector('#calc-button-equals');
	var calcReady = true;
	var calcDeleteButtonState = 'backspace';

	function calcInit() {
		if (!calcReady) {
			calcInput.value = "";
			calcReady = true;
		}
		calcDeleteButtonState = 'backspace';
	}

	function resizeCalcButtons() {
		if (!resizeCalcButtonsTimer) {
			resizeCalcButtons = true;
			setTimeout(function() {
				resizeCalcButtons = false;
				_resizeCalcButtons();
			}, 17);
		}
	}

	function calcKeyboardInput(event) {
		if (!(/[0-9*+-\/()]{1}/.test(String.fromCharCode(event.charCode)))) {
			event.preventDefault();
			if (event.charCode == 13)
				calcCalculateExp(calcInput.value);
		}
		else
			calcInit();
	}

	function calcCalculateExp(expr) {
		try {
			var expression = expr;
			var answer;
			answer = eval(expression);
			if(/[0-9.-]/.test(answer))
				calcInput.value = answer;
			else throw new Error();
			} catch (error) {
				calcInput.value = "Error";
				calcReady = false;
		}
		calcDeleteButtonState = 'everything';
	}


	function calcButtonPress(event) {
		if (event.target.className == "button") {
			calcInit();
			var content = event.target.innerHTML;
			if (content == '\u00D7')
				calcInput.value = calcInput.value + '*';
			else if (content == '\u00F7')
				calcInput.value = calcInput.value + '/'
			else if (content == '=')
				calcCalculateExp(calcInput.value);
			else
				calcInput.value = calcInput.value + content;
		}
	}

	function calcDeleteButtonPress() {
		var content = calcInput.value;
		if (calcDeleteButtonState == 'backspace' && content.length != 1) 
			calcInput.value = content.slice(0, content.length - 1);
		else {
			calcInput.value = '0';
			calcReady = false;
		}
	}
	
	function displayCalc() {
		document.body.style.height = "100%";
		html.style.height = "100%";
		html.style.overflowY = "hidden";

		infos = Array.prototype.slice.call(infos, 0);
		calcs = Array.prototype.slice.call(calcs, 0);

		infos.forEach(function(elt) {
			elt.style.display = "none";
		});
		calcs.forEach(function(elt) {
			elt.style.display = "block";
		});

		if (!calcButtonsResized) {
			_resizeCalcButtons();
			calcButtonsResized = true;
		}

		if (calcInput.value=="") {
			calcInput.value = 0;
			calcReady = false;
		}

		displayCalcButton.removeEventListener("click", displayCalc);
		calcInput.addEventListener("keypress", calcKeyboardInput);
		buttonPlace.addEventListener("click", calcButtonPress);
		calcDeleteButton.addEventListener("click", calcDeleteButtonPress);
		window.addEventListener("resize", resizeCalcButtons);
		displayInfoButton.addEventListener("click", displayInfo);
	}

	function displayInfo() {
		document.body.style.height = "";
		html.style.height = "";
		html.style.overflowY = "";

		calcs = Array.prototype.slice.call(calcs, 0);
		infos = Array.prototype.slice.call(infos, 0);

		calcs.forEach(function(elt) {
			elt.style.display = "none";
		});
		infos.forEach(function(elt) {
			elt.style.display = "block";
		});

		displayInfoButton.removeEventListener("click", displayInfo);
		calcInput.removeEventListener("keypress", calcKeyboardInput);
		buttonPlace.removeEventListener("click", calcButtonPress);
		calcDeleteButton.removeEventListener("click", calcDeleteButtonPress);
		window.removeEventListener("resize", resizeCalcButtons);
		displayCalcButton.addEventListener("click", displayCalc);
	}

	displayCalcButton.addEventListener("click", displayCalc);
}

function main () {
	events();
}

window.onload = main;