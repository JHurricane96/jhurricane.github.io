function events() {

	var displayInfoButton = document.getElementById('button-info');	
	var displayCalcButton = document.getElementById('button-calc');
	var squeezeTime = 600;

	var infoContainer = document.getElementById('container-info');
	var calcContainer = document.getElementById('container-calc');
	var html = document.querySelector('html');

	var pageTurnersContainer = document.getElementById('container-pagebuttons')
	var pageLeft = document.querySelector('button#pageleft');
	var pageRight = document.querySelector('button#pageright');
	var pageIndicators = document.querySelectorAll('#pageindicators *');
	var page1 = document.getElementById('page1');
	var pageNo = 1;
	var pageLeftLimit = 1;
	var pageRightLimit = 4;

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
		//calcContainer.style.opacity = 0;
		pageTurnersContainer.style.position = "static";

		displayCalcButton.removeEventListener("click", displayCalc);
		pageRight.removeEventListener("click", pageTurnRight);
		pageLeft.removeEventListener("click", pageTurnLeft);

		animate(function (t) {return t;}, squeezeTime/2, function (x) {
			infoContainer.style.width = 100*(1 - x) + '%';
		}, cleanup1);

		function cleanup1() {
			document.body.style.height = "100%";
			html.style.height = "100%";
			html.style.overflowY = "hidden";
			infoContainer.style.display = "none";
			calcContainer.style.display = "block";

			if (calcInput.value=="") {
				calcInput.value = 0;
				calcReady = false;
			}

			_resizeCalcButtons();

			animate(bounce, squeezeTime*1.5, function (x) {
				calcContainer.style.width = x*100 + '%';
				_resizeCalcButtons();
			}, cleanup2);
		}

		function cleanup2() {
			if (!calcButtonsResized) {
				_resizeCalcButtons();
				calcButtonsResized = true;
			}


			calcInput.addEventListener("keypress", calcKeyboardInput);
			buttonPlace.addEventListener("click", calcButtonPress);
			calcDeleteButton.addEventListener("click", calcDeleteButtonPress);
			window.addEventListener("resize", resizeCalcButtons);
			displayInfoButton.addEventListener("click", displayInfo);
			_resizeCalcButtons();
		}
	}

	function animate(xfromt, duration, xToMovement, cleanup) {
		var t0 = new Date;

		var _animate = setInterval(function () {
			var t = (new Date - t0)/duration;				
			if (t>1)
				t=1;

			var x = xfromt(t);

			xToMovement(x);
			
			if (t==1) {
				clearInterval(_animate);
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

	function easeInOut(t) {
		function x (t) {
			return 0.5-Math.sqrt(0.25-t*t);
		}

		if (t<0.5)
			return x(t);
		else
			return 1-x(1-t);
	}

	function easeOut(t) {
		return Math.sqrt(1-Math.pow(1-t, 2));
	}

	function pageTurnLeft() {
		if (pageNo==pageLeftLimit)
			return;

		var pageTurners = document.getElementsByClassName('pageturn');
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

		animate(bounce, 1500, xToMarginLeft, cleanup);
		
		pageNo--;
		pageIndicators[pageNo-1].className = 'currentpage';
	}

	function pageTurnRight() {
		if (pageNo==pageRightLimit)
			return;

		var pageTurners = document.getElementsByClassName('pageturn');
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

		animate(bounce, 1500, xToMarginLeft, cleanup);
		
		pageNo++;
		pageIndicators[pageNo-1].className = 'currentpage';
	}

	function onInfoResize() {
		page1.style.marginTop = Math.floor((window.innerHeight - pageRight.offsetHeight - 60)/2 - page1.offsetHeight) + 'px';
		if (parseInt(page1.style.marginTop)<0)
			page1.style.marginTop=0;

		if(window.innerHeight>window.innerWidth) {
			pages.style.marginLeft = '0';
			pageIndicators[pageNo-1].className = '';
			pageNo = 1;
			console.log(pageNo);
			pageIndicators[0].className = 'currentpage';
		}

	}

	function displayInfo() {
		//infoContainer.style.opacity = 0;

		displayInfoButton.removeEventListener("click", displayInfo);
		calcInput.removeEventListener("keypress", calcKeyboardInput);
		buttonPlace.removeEventListener("click", calcButtonPress);
		calcDeleteButton.removeEventListener("click", calcDeleteButtonPress);

		animate(function (t) {return t;}, squeezeTime/3, function (x) {calcContainer.style.width = 100*(1 - x) + '%';}, cleanup1);

		function cleanup1() {
			document.body.style.height = "";
			html.style.height = "";
			html.style.overflowY = "";
			calcContainer.style.display = "none";
			infoContainer.style.display = "block";
			onInfoResize();
			animate(bounce, squeezeTime*1.5, function (x) {infoContainer.style.width = 100*x + '%';}, cleanup2);
		}

		function cleanup2() {
			window.removeEventListener("resize", resizeCalcButtons);
			displayCalcButton.addEventListener("click", displayCalc);
			pageRight.addEventListener("click", pageTurnRight);
			pageLeft.addEventListener("click", pageTurnLeft);
			window.addEventListener("resize", onInfoResize);
			pageTurnersContainer.style.position = "fixed";
		}
	}

	onInfoResize();
	window.addEventListener("resize", onInfoResize);
	displayCalcButton.addEventListener("click", displayCalc);
	pageRight.addEventListener("click", pageTurnRight);
	pageLeft.addEventListener("click", pageTurnLeft);
	infoContainer.style.opacity = 1.0;
}

window.onload = events;