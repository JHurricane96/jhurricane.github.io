function events() {

	var displayInfoButton = document.getElementById('button-info');	
	var displayCalcButton = document.getElementById('button-calc');
	var fadeTime = 500;

	var infoContainer = document.getElementById('container-info');
	var calcContainer = document.getElementById('container-calc');
	var html = document.querySelector('html');

	var pageTurnersContainer = document.getElementById('container-pagebuttons')
	var pageLeft = document.querySelector('button#pageleft');
	var pageRight = document.querySelector('button#pageright');
	var pageIndicatorsContainer = document.getElementById('pageindicators')
	var pageIndicators = document.querySelectorAll('#pageindicators *');
	var pages = document.getElementById('pages');
	var page1 = document.getElementById('page1');
	var pageNo = 1;
	var pageLeftLimit = 1;
	var pageRightLimit = 4;
	var infoPageResized = false;
	var resizeInfoPageTimer;

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
		var calcButtons = document.querySelectorAll('button.calc');

		calcButtons = Array.prototype.slice.call(calcButtons, 0);

		calcButtons.forEach(function(elt){
			if (buttonPlace.offsetWidth>buttonPlace.offsetHeight) {
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
			calcButtonsResized = true;
			setTimeout(function() {
				calcButtonsResized = false;
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
		calcInput.focus();
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
		calcInput.focus();
	}
	
	function displayCalc() {
		calcContainer.style.opacity = 0;
		pageTurnersContainer.style.position = "static";

		displayCalcButton.removeEventListener("click", displayCalc);
		window.removeEventListener('keydown', pageTurnWithKeys);
		pageRight.removeEventListener("click", pageTurnRight);
		pageLeft.removeEventListener("click", pageTurnLeft);
		pageIndicatorsContainer.removeEventListener("click", pageTurn);
		window.removeEventListener("resize", onInfoResize);

		animate(function (t) {return t;}, fadeTime, function (x) {
			infoContainer.style.opacity = 1 - x;
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

			animate(function (t) {return t;}, fadeTime, function (x) {
				calcContainer.style.opacity = x;
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
			calcInput.focus();
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
		window.removeEventListener('keydown', pageTurnWithKeys);

		pageIndicators[pageNo-1].className = '';

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
			_onInfoResize();
			pageIndicatorsContainer.addEventListener("click", pageTurn);
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
		window.removeEventListener('keydown', pageTurnWithKeys);

		pageIndicators[pageNo-1].className = '';

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
			_onInfoResize();
			pageIndicatorsContainer.addEventListener("click", pageTurn);
		}

		animate(bounce, 1500, xToMarginLeft, cleanup);
		
		pageNo++;
		pageIndicators[pageNo-1].className = 'currentpage';
	}

	function pageTurnWithKeys(event) {
		if (event.keyCode==37)
			pageTurnLeft();
		else if (event.keyCode==39)
			pageTurnRight();
	}

	function pageTurn(event) {
		var newPageNo = event.target.id.slice(-1);
		if(!/^pageindicator\d$/.test(event.target.id))
			return;
		pageIndicatorsContainer.removeEventListener("click", pageTurn);
		if (newPageNo == pageNo) {
			pageIndicatorsContainer.addEventListener("click", pageTurn);
			return;
		}
		if (newPageNo-pageNo == 1) {
			pageTurnRight();
			return;
		}
		else if(newPageNo-pageNo == -1) {
			pageTurnLeft();
			return;
		}

		var newPage = document.getElementById('page' + newPageNo);
		var pageTurners = document.getElementsByClassName('pageturn');
		pageTurners = Array.prototype.slice.call(pageTurners, 0);
		pageTurners.forEach(function (elt) {
			elt.disabled = true;
		});
		window.removeEventListener('keydown', pageTurnWithKeys);
		pageIndicators[pageNo-1].className = '';

		var x0 = parseInt(pages.style.marginLeft);

		if (newPageNo > pageNo) {
			var afterCurrentPage = document.getElementById('page' + String(+pageNo+1));
			pages.insertBefore(newPage, afterCurrentPage);

			function xToMarginLeftTurnRight(x) {
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
				if (newPageNo==pageRightLimit)
					pages.appendChild(newPage);
				else
					pages.insertBefore(newPage, document.getElementById('page' + String(+newPageNo+1)));
				pages.style.marginLeft = String(100*(1-newPageNo)) + '%';
				pageIndicatorsContainer.addEventListener("click", pageTurn);
				_onInfoResize();
			}

			animate(bounce, 1500, xToMarginLeftTurnRight, cleanup);

		}
		else {
			var currentPage = document.getElementById('page' + String(pageNo));
			pages.insertBefore(newPage, currentPage);

			function xToMarginLeftTurnLeft(x) {
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
				pages.insertBefore(newPage, document.getElementById('page' + String(+newPageNo+1)));
				pages.style.marginLeft = String(100*(1-newPageNo)) + '%';
				pageIndicatorsContainer.addEventListener("click", pageTurn);
				_onInfoResize();
			}

			animate(bounce, 1500, xToMarginLeftTurnLeft, cleanup);

		}

		pageNo = newPageNo;
		pageIndicators[pageNo-1].className = 'currentpage';
	}

	function _onInfoResize() {
		page1.style.marginTop = Math.floor((window.innerHeight - pageRight.offsetHeight - 60)/2 - page1.offsetHeight/1.5) + 'px';
		if (parseInt(page1.style.marginTop)<0)
			page1.style.marginTop=0;

		if(window.innerHeight>window.innerWidth) {
			window.removeEventListener('keydown', pageTurnWithKeys);
			pages.style.marginLeft = '0';
			pageIndicators[pageNo-1].className = '';
			pageNo = 1;
			pageIndicators[0].className = 'currentpage';
		}
		else
			window.addEventListener('keydown', pageTurnWithKeys);
	}

	function onInfoResize() {
		if (!resizeInfoPageTimer) {
			infoPageResized = true;
			setTimeout(function() {
				infoPageResized = false;
				_onInfoResize();
			}, 17);
		}
	}

	function displayInfo() {
		infoContainer.style.opacity = 0;

		displayInfoButton.removeEventListener("click", displayInfo);
		calcInput.removeEventListener("keypress", calcKeyboardInput);
		buttonPlace.removeEventListener("click", calcButtonPress);
		calcDeleteButton.removeEventListener("click", calcDeleteButtonPress);

		animate(function (t) {return t;}, fadeTime, function (x) {calcContainer.style.opacity = 1 - x;}, cleanup1);

		function cleanup1() {
			document.body.style.height = "";
			html.style.height = "";
			html.style.overflowY = "";
			calcContainer.style.display = "none";
			infoContainer.style.display = "block";
			_onInfoResize();
			animate(function (t) {return t;}, fadeTime, function (x) {infoContainer.style.opacity = x; _onInfoResize();}, cleanup2);
		}

		function cleanup2() {
			window.removeEventListener("resize", resizeCalcButtons);
			displayCalcButton.addEventListener("click", displayCalc);
			window.addEventListener('keydown', pageTurnWithKeys);
			pageRight.addEventListener("click", pageTurnRight);
			pageLeft.addEventListener("click", pageTurnLeft);
			window.addEventListener("resize", onInfoResize);
			pageIndicatorsContainer.addEventListener("click", pageTurn);
		}
	}

	_onInfoResize();
	window.addEventListener("resize", _onInfoResize);
	displayCalcButton.addEventListener("click", displayCalc);
	window.addEventListener('keydown', pageTurnWithKeys);
	pageRight.addEventListener("click", pageTurnRight);
	pageLeft.addEventListener("click", pageTurnLeft);
	pageIndicatorsContainer.addEventListener("click", pageTurn);
	infoContainer.style.opacity = 1.0;
}

window.onload = events;