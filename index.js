var state = 'info';

function events() {
	var infoButton = document.getElementById('button-info');
	var calcButton = document.getElementById('button-calc');
	
	function displayCalc() {
		var infos = document.getElementsByClassName('info');
		//var calcs = document.getElementsByClassName('calc');
		infos = Array.prototype.slice.call(infos, 0);
		infos.forEach(function(elt) {
			elt.style.display = "none";
		});
		/*calcs.forEach(function(elt) {
			elt.style.display = "inline";
		});*/
		calcButton.removeEventListener("click", displayCalc);
		infoButton.addEventListener("click", displayInfo);
	}

	function displayInfo() {
		var calcs = document.getElementsByClassName('calc');
		var infos = document.getElementsByClassName('info');
		calcs = Array.prototype.slice.call(calcs, 0);
		infos = Array.prototype.slice.call(infos, 0);
		calcs.forEach(function(elt) {
			elt.style.display = "none";
		});
		infos.forEach(function(elt) {
			elt.style.display = "inline";
		});
		infoButton.removeEventListener("click", displayInfo);
		calcButton.addEventListener("click", displayCalc);
	}

	calcButton.addEventListener("click", displayCalc);
}

function main () {
	events();
}

window.onload = main;