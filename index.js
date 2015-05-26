function events() {
	var displayInfoButton = document.getElementById('button-info');	
	var displayCalcButton = document.getElementById('button-calc');

	var infos = document.getElementsByClassName('info');
	var calcs = document.getElementsByClassName('calc');
	var html = document.querySelector('html');

	var pageLeft = document.querySelector('button#pageleft');
	var pageRight = document.querySelector('button#pageright');
	var pageNo = 1;
	var pageLeftLimit = 1;
	var pageRightLimit = 2;
	var pageTurnSpeed = 1;

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

	function _resizeCalcButtons() {
		var buttonArea = document.getElementById('container-buttons');
		var calcButtons = document.querySelectorAll('button.calc');

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
			var answer;
			expr = expr.replace(/sin/g, 'Math.sin');
			expr = expr.replace(/cos/g, 'Math.cos');
			expr = expr.replace(/tan/g, 'Math.tan');
			console.log(expr);
			answer = eval(expr);
			if(answer||answer===0) {
				calcInput.value = answer;
			}
			else if (expr!=='')
				throw new Error();
			} catch (error) {
				calcInput.value = "Syntax error";
				calcReady = false;
		}
		calcDeleteButtonState = 'everything';
	}


	function calcButtonPress(event) {
		if (event.target.className == "calc") {
			var content = event.target.innerHTML;
			if (content == '=') {
				calcCalculateExp(calcInput.value);
				return;
			}
			calcInit();
			if (content == '\u00D7')
				calcInput.value = calcInput.value + '*';
			else if (content == '\u00F7')
				calcInput.value = calcInput.value + '/'
			else if (content == 'sin')
				calcInput.value = calcInput.value + 'sin(';
			else if (content == 'cos')
				calcInput.value = calcInput.value + 'cos(';
			else if (content == 'tan')
				calcInput.value = calcInput.value + 'tan(';
			
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
		pageRight.removeEventListener("click", pageTurnRight);
		pageLeft.addEventListener("click", pageTurnLeft);
		calcInput.addEventListener("keypress", calcKeyboardInput);
		buttonPlace.addEventListener("click", calcButtonPress);
		calcDeleteButton.addEventListener("click", calcDeleteButtonPress);
		window.addEventListener("resize", resizeCalcButtons);
		displayInfoButton.addEventListener("click", displayInfo);
	}

	function move(x0, xfromt, duration, xToMovement, cleanup) {
		var x0 = x0;
		var t0 = new Date;

		var animate = setInterval(function () {
			var t = (new Date - t0)/duration;				
			if (t>1)
				t=1;

			var x = xfromt(t);

			xToMovement(x);
			
			if (t==1) {
				clearInterval(animate);
				cleanup()
			}
		}, 10);
	}

	function bounce(t) {
		function reverseBounce(t) {
			for(var a = 0, b = 1, result; 1; a += b, b /= 2) {
				if (t >= (7 - 4 * a) / 11) {
			    	return -Math.pow((11 - 6 * a - 11 * t) / 4, 2) + Math.pow(b, 2);
				}
			}
		}
		return 1-reverseBounce(1-t);
	}
	function pageTurnLeft() {
		if (pageNo==pageLeftLimit)
			return;

		var pageTurners = document.getElementsByClassName('pageturn');
		var pageIndicators = document.querySelectorAll('#pageindicators *');
		pageTurners = Array.prototype.slice.call(pageTurners, 0);
		pageTurners.forEach(function (elt) {
			elt.disabled = true;
		});

		pageIndicators[pageNo-1].className = '';

		var pages = document.getElementById('pages');
		var x0 = parseInt(pages.style.marginLeft);
		

		function xToMarginLeft(x) {
			if (isNaN(x0)) {
					pages.style.marginLeft = x*100 + '%';

				}
				else
					pages.style.marginLeft = x0 + x*100 + '%';
		}

		function cleanup() {
			pageTurners.forEach(function (elt) {
			elt.disabled = false;
			});
		}

		move(x0, bounce, 1500, xToMarginLeft, cleanup);
		
		pageNo--;
		pageIndicators[pageNo-1].className = 'currentpage';
	}

	function pageTurnRight() {
		if (pageNo==pageRightLimit)
			return;

		var pageTurners = document.getElementsByClassName('pageturn');
		var pageIndicators = document.querySelectorAll('#pageindicators *');
		pageTurners = Array.prototype.slice.call(pageTurners, 0);
		pageTurners.forEach(function (elt) {
			elt.disabled = true;
		});

		pageIndicators[pageNo-1].className = '';

		var pages = document.getElementById('pages');
		var x0 = parseInt(pages.style.marginLeft);
		

		function xToMarginLeft(x) {
			if (isNaN(x0)) {
					pages.style.marginLeft = -x*100 + '%';

				}
				else
					pages.style.marginLeft = x0 - x*100 + '%';
		}

		function cleanup() {
			pageTurners.forEach(function (elt) {
			elt.disabled = false;
			});
		}

		move(x0, bounce, 1500, xToMarginLeft, cleanup);
		
		pageNo++;
		pageIndicators[pageNo-1].className = 'currentpage';
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
		pageRight.addEventListener("click", pageTurnRight);
		pageLeft.addEventListener("click", pageTurnLeft);
	}

	displayCalcButton.addEventListener("click", displayCalc);
	pageRight.addEventListener("click", pageTurnRight);
	pageLeft.addEventListener("click", pageTurnLeft);
}

function main () {
	events();
}

window.onload = main;