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
	var calcInverseButton = document.querySelector('button#inverse')
	var calcAnswer = 0;
	var calcReady = true;
	var calcDeleteButtonState = 'backspace';
	var calcMode = 'deg';

	function initCalcOps() {
		var calcOperators = [];
		function Operator(value, arity, precedence) {
			this.value = value;
			this.arity = arity;
			this.precedence = precedence;
		}
		calcOperators['*'] = new Operator('*', 2, 1);
		calcOperators['/'] = new Operator('/', 2, 1);
		calcOperators['-'] = new Operator('-', 2, 0);
		calcOperators['+'] = new Operator('+', 2, 0);
		calcOperators['u+'] = new Operator('+', 1, 3);
		calcOperators['u-'] = new Operator('-', 1, 3);
		calcOperators['^'] = new Operator('Math.pow', 2, 2);
		calcOperators['sin'] = new Operator('Math.sin', 1, 3);
		calcOperators['cos'] = new Operator('Math.cos', 1, 3);
		calcOperators['tan'] = new Operator('Math.tan', 1, 3);
		calcOperators['asin'] = new Operator('Math.asin', 1, 3);
		calcOperators['acos'] = new Operator('Math.acos', 1, 3);
		calcOperators['atan'] = new Operator('Math.atan', 1, 3);
		calcOperators['log'] = new Operator('Math.log10', 1, 3);
		calcOperators['ln'] = new Operator('Math.log', 1, 3);
		calcOperators['!'] = new Operator('calcFactorial', 1, 3);
		calcOperators['\u221A'] = new Operator('Math.sqrt', 1, 3);
		return calcOperators;
	}
	var calcOperators = initCalcOps();

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
		if (!(/[0-9*+-\/()!^]{1}/.test(String.fromCharCode(event.charCode)))) {
			event.preventDefault();
			if (event.charCode == 13)
				calcCalculateExp(calcInput.value);
		}
		else
			calcInit();
	}

	function calcFactorial(n) {
		if (n != Math.floor(n) || n<0)
			throw new Error('! needs integer');
		else if (n == 0)
			return 1;

		var i, ans = 1;
		for (i = 2; i<=n; ++i)
			ans *= i;
		return ans;
	}

	function parseCalcInput(expr) {
		var exprLength = expr.length;
		var state = 'number/unary';
		var startFrom = 0;
		var curChar;
		var unarySignAllowed = true;
		var object = '';
		var exprParsed = [];
		var numTest = /\d+[.]?\d*|[.]\d+/g;

		while (startFrom < expr.length) {
			curChar = expr[startFrom];

			if (curChar == '(' || curChar == ')') {
				if (state == 'unary') {
					if (curChar == ')' || !calcOperators[object])
						throw new Error('Bracket mismatch');
					else if (calcOperators[object]) {
						exprParsed.push(object);
						object = '';
						state = 'number/unary';
					}
				}
				exprParsed.push(curChar)
				startFrom++;
			}

			else if (state == 'binary') {
				if (curChar == '!') {
					var length = exprParsed.length;
					exprParsed[length] = exprParsed[length - 1];
					exprParsed[length - 1] = '!';
				}
				else if (calcOperators[curChar].arity == '2') {
					exprParsed.push(curChar);
					unarySignAllowed = true;
					state = 'number/unary';
				}
				else
					throw new Error('Syntax error');
				startFrom++;
			}

			else if (state == 'number/unary' || state == 'unary') {
				if (unarySignAllowed) {
					if (curChar == '+') {
						exprParsed.push('u+');
						startFrom++;
						unarySignAllowed = false;
						curChar = expr[startFrom];
					}
					else if (curChar == '-') {
						exprParsed.push('u-');
						startFrom++;
						unarySignAllowed = false;
						curChar = expr[startFrom];
					}
				}
				if (state == 'number/unary') {
					if (/[\d.]/.test(curChar)) {
						numTest.lastIndex = startFrom;
						object = numTest.exec(expr)[0];
						startFrom = numTest.lastIndex;
						exprParsed.push(object);
						object = '';
						state = 'binary';
					}
					else if (curChar == '\u03C0') {
						exprParsed.push('Math.PI');
						startFrom++;
						state = 'binary';
					}
					else if (curChar == 'e') {
						exprParsed.push('Math.E');
						startFrom++;
						state = 'binary';
					}
					else {
						object += curChar;
						startFrom++;
						state = 'unary';
					}
				}
				else if (state == 'unary') {
					object += curChar;
					if (object.length >= 5)
						throw new Error('Syntax error');
					startFrom++;
				}
			}
		}
		return exprParsed;
	}

	function calcExprToRPN(expr) {
		var exprRPN = [];
		var opStack = [];

		expr.forEach(function (term) {
			if (!calcOperators[term] && term != ')' && term != '(')
				exprRPN.push(term);
			else {
				if (term == '(')
					opStack.push(term);
				else if (term == ')') {
					while(opStack[opStack.length-1]!='(') {
						if (opStack.length == 0)
							throw new Error('Syntax error');
						exprRPN.push(opStack.pop());
					}
					opStack.pop();
				}
				else {
					while(opStack.length > 0 && opStack[opStack.length-1] != '(') {
						if (calcOperators[term].precedence > calcOperators[opStack[opStack.length-1]].precedence)
							break;
						exprRPN.push(opStack.pop());
					}
					opStack.push(term);
				}
			}
		});

		while(opStack.length > 0) {
			if (opStack[opStack.length-1] == '(' || opStack[opStack.length-1] == ')')
				throw new Error('Bracket mismatch');
			else if (opStack[opStack.length-1].arity == 'binary')
				throw new Error('Syntax error');
			exprRPN.push(opStack.pop());
		}
		return exprRPN;
	}

	function calcEvalRPN(expr) {
		var a, b;
		var answer = [];
		expr.forEach(function (term) {
			if (!calcOperators[term])
				answer.push(term);
			else {
				if (calcOperators[term].arity == 2) {
					if (answer.length >= 2) {
						b = answer.pop();
						a = answer.pop();
						if (term == '^')
							answer.push(eval(calcOperators[term].value + '(' + a + ',' + b + ')'));
						else
							answer.push(eval(a + calcOperators[term].value + b));
					}
					else
						throw new Error('Syntax error');
				}
				else if (calcOperators[term].arity == 1) {
					if (answer.length >= 1) {
						a = answer.pop();
						if (/asin|acos/.test(term) && (a > 1 || a < -1))
							throw new Error('Out of domain');
						if (/sin|cos|tan/.test(term) && calcMode == 'deg') {
							if (/pressed/.test(calcInverseButton.className))
								answer.push(eval(calcOperators[term].value + '(' + a + ')' + '*180/Math.PI'));
							else
								answer.push(eval(calcOperators[term].value + '(' + a + '*Math.PI/180'+ ')'));
						}
						else
							answer.push(eval(calcOperators[term].value + '(' + a + ')'));
					}
					else
						throw new Error('Syntax error');
				}
			}
		});
		if (answer.length > 1)
			throw new Error('Syntax error');
		else
			return answer[0];
	} 

	function calcCalculateExp(expr) {
		try {
			var exprParsed =  parseCalcInput(expr);
			console.log(exprParsed);
			var exprRPN = calcExprToRPN(exprParsed);
			console.log(exprRPN);
			var answer = calcEvalRPN(exprRPN);
			console.log(answer);
			if(answer||answer===0) {
				if (/e/.test(String(answer))) {
					var parts = String(answer).match(/-?[\d.]+/g);
					answer = String(parseFloat(parts[0]).toFixed(6)) + '*(10^(' + parts[1] + '))';
				}
				calcInput.value = calcAnswer = answer;
			}
			else if (expr!=='')
				throw new Error('Syntax error');
			} catch (error) {
				calcInput.value = String(error).slice(7);
				calcReady = false;
		}
		calcDeleteButtonState = 'everything';
	}


	function calcButtonPress(event) {
		calcInput.focus();
		if (/calc/.test(event.target.className)) {
			var content = event.target.innerHTML;
			if (content == '=') {
				calcCalculateExp(calcInput.value);
				return;
			}

			if (content == 'Deg') {
				if (!/pressed/.test(event.target.className)) {
					calcMode = 'deg';
					event.target.className += ' pressed';
					document.querySelector('button.calc#rad').className = document.querySelector('button.calc#rad').className.replace(/ pressed/, '');	
				}
				return;
			}

			else if (content == 'Rad') {
				if (!/pressed/.test(event.target.className)) {
					calcMode = 'rad';
					event.target.className += ' pressed';
					document.querySelector('button.calc#deg').className = document.querySelector('button.calc#deg').className.replace(/ pressed/, '');
				}
				return;
			}

			else if (content == 'Inv') {
				if (!/pressed/.test(event.target.className))
					event.target.className += ' pressed';
				else
					calcInverseButton.className = calcInverseButton.className.replace(/ pressed/, '');

				var calcShown = document.querySelectorAll('button.calc.invertible');
				var calcToShow = document.querySelectorAll('button.calc.inverse');

				Array.prototype.forEach.call(calcShown, function (elt) {
					elt.className = elt.className.replace('invertible', 'inverse');
				});
				Array.prototype.forEach.call(calcToShow, function (elt) {
					elt.className = elt.className.replace('inverse', 'invertible');
				});
				_resizeCalcButtons();
				return;
			}

			calcInit();
			if (content == 'Ans')
				calcInput.value = calcInput.value + calcAnswer;
			else if (content == '\u00D7')
				calcInput.value = calcInput.value + '*';
			else if (content == '\u00F7')
				calcInput.value = calcInput.value + '/';
			else if (content == 'sin')
				calcInput.value = calcInput.value + 'sin(';
			else if (content == 'cos')
				calcInput.value = calcInput.value + 'cos(';
			else if (content == 'tan')
				calcInput.value = calcInput.value + 'tan(';
			else if (content == 'asin')
				calcInput.value = calcInput.value + 'asin(';
			else if (content == 'acos')
				calcInput.value = calcInput.value + 'acos(';
			else if (content == 'atan')
				calcInput.value = calcInput.value + 'atan(';
			else if (content == 'ln')
				calcInput.value = calcInput.value + 'ln(';
			else if (content == 'e<sup>x</sup>')
				calcInput.value = calcInput.value + 'e^';
			else if (content == 'log')
				calcInput.value = calcInput.value + 'log(';
			else if (content == '10<sup>x</sup>')
				calcInput.value = calcInput.value + '10^';
			else if (content == 'x<sup>2</sup>')
				calcInput.value = calcInput.value + '^2';	
			else if (content == 'x<sup>y</sup>')
				calcInput.value = calcInput.value + '^';
			else if (content == '\u221Ax')
				calcInput.value = calcInput.value + '\u221A(';
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