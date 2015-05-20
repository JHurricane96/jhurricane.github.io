var calcButtonsResized = false;

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
	
	var resizeCalcButtonsTimer;

	function resizeCalcButtons() {
		if (!resizeCalcButtonsTimer) {
			resizeCalcButtons = true;
			setTimeout(function() {
				resizeCalcButtons = false;
				_resizeCalcButtons();
			}, 17);
		}
	}
	
	function displayCalc() {
		var infos = document.getElementsByClassName('info');
		var calcs = document.getElementsByClassName('calc');
		var html = document.querySelector("html")

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

		displayCalcButton.removeEventListener("click", displayCalc);
		displayInfoButton.addEventListener("click", displayInfo);
		window.addEventListener("resize", resizeCalcButtons);
	}

	function displayInfo() {
		var calcs = document.getElementsByClassName('calc');
		var infos = document.getElementsByClassName('info');
		var html = document.querySelector("html");

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
		window.removeEventListener("resize", resizeCalcButtons);
		displayCalcButton.addEventListener("click", displayCalc);
	}

	displayCalcButton.addEventListener("click", displayCalc);
}

function main () {
	events();
}

window.onload = main;