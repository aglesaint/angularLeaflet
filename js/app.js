// {} [] ||
'use strict';
var app = angular.module('myConnectit', ['leaflet-directive']);
/*****************
get json navigator
******************/
app.controller('TabPanelController', ['$http', function ($http) {
	var menu = this;
	menu.nav = [];
	$http.get('js/navigator.json').success(function (data) {
		menu.nav = data;
	});
	this.tabSelected = "#tab1";
	this.tabChange = function (e) {
		if (e.target.nodeName === 'A') {
			this.tabSelected = e.target.getAttribute("href");
			e.preventDefault();
		}
	};
}]);
/****************************************
 directive toggle div ex : stock
*****************************************/
app.directive('slideToggle', function () {
	return {
		restrict: 'A',
		scope: {
			isOpen: "=slideToggle"
		},
		link: function (scope, element, attr) {
			var slideDuration = parseInt(attr.slideToggleDuration, 10) || 200;
			if (attr.startShown == "false") {
				element.hide();
			}
			scope.$watch('isOpen', function (newVal, oldVal) {
				if (newVal !== oldVal) {
					element.stop().slideToggle(slideDuration);
				}
			});
		}
	};
});

/********************
   gestion des stocks
*********************/
app.controller('StockDescrController', ['$http', '$scope', '$log', function ($http, $scope, $log) {
	// init formulaire
	$scope.nav = [];
	$http.get('js/stock.json').then(function (response) {
		$scope.nav = response.data;
	});
	$scope.delete = function () {
		let key = sessionStorage.getItem("keyStock");
		$log.debug("> delete current stock form " + key);
		sessionStorage.removeItem(key);
		sessionStorage.removeItem("keyStock");
	}
	$scope.submitForm = function () {
		// name of the file to store (TODO)
		for (let node in $scope.nav) {
			$scope.stockFileName = $scope.nav[node][0].data;
		}
		//(TODO)
		if (typeof sessionStorage != 'undefined' && JSON) {
			$log.debug("> store stock filename : " + $scope.stockFileName);
			sessionStorage.setItem("keyStock", $scope.stockFileName);
			let monobjet_json = JSON.stringify($scope.nav);
			sessionStorage.setItem($scope.stockFileName, monobjet_json);
			/*
			test
			*/
			/* var obj = JSON.parse(sessionStorage.getItem("TESTkeyStock")) || {};
			 obj.push($scope.stockFileName);
			 let objson = JSON.stringify(obj);
			 sessionStorage.setItem("TESTkeyStock", objson);*/
		} else $log.warn("sessionStorage is not supported");
	}
            }]).directive('dynamicName', function ($compile) {
	return {
		restrict: "A",
		terminal: true,
		priority: 1000,
		link: function (scope, element, attrs) {
			element.attr('name', scope.$eval(attrs.dynamicName));
			element.removeAttr("dynamic-name");
			$compile(element)(scope);
		}
	}
}).controller('GetJsonInfoController', ['$scope', '$log', function ($scope, $log) {
	// retrieve all json to display file
	$scope.getJson = function () {
		if (typeof sessionStorage != 'undefined' && JSON) {
			let key = sessionStorage.getItem("keyStock");
			$log.debug(">> refresh stock key entry : " + key);
			let monobjet_json = sessionStorage.getItem(key);
			$scope.myjson = [];
			$scope.myjson = JSON.parse(monobjet_json);
			// test
			//
			//            $scope.TESTmyjson = [];
			//            let TESTkey = [];
			//            TESTkey = JSON.parse(sessionStorage.getItem("TESTkeyStock"));
			//
			/*   TESTkey.forEach(function (elt) {
                console.log("TESTkey : " + elt);
                if ($scope.TESTmyjson.indexOf(elt) == -1 || $scope.TESTmyjson.length > 0) {
                    $scope.TESTmyjson += "," + sessionStorage.getItem(elt);
                }

        });
    console.log("TESTmyjson " + JSON.stringify($scope.TESTmyjson));*/
			// FIN TEST
		} else $log.warn("sessionStorage is not supported");
	};
	// open file in form (TODO)
	$scope.openFile = function (name) {
		// $("#stockId").val(name);
		let i = 0;
		for (let node in $scope.myjson.fields) {
			let fieldname = "#" + $scope.myjson.fields[i].name;
			let value = $scope.myjson.fields[i].data;
			console.log("fieldname " + fieldname);
			console.log("value " + value);
			$(fieldname).val(value);
			i++;
		}
	}
}]);
/**
refresh stock on save
**/
app.controller('RefreshController', function ($scope, $interval) {
	var c = 0;
	$scope.message = "This DIV is refreshed " + c + " time.";
	var timer = $interval(function () {
		if (c === 1000) {
			$scope.killtimer();
		}
		$scope.message = "This DIV is refreshed " + c + " time.";
		$scope.getJson();
		c++;
	}, 1000);
	$scope.killtimer = function () {
		if (angular.isDefined(timer)) {
			$interval.cancel(timer);
			timer = undefined;
		}
	};
});

///////////////////////////////////////////////////////
// CODE JQUERY POUR LE BOUTON RECHERCHER
// Ajouter case sensitive dans Jquery
///////////////////////////////////////////////////////
$.expr[":"].contains = $.expr.createPseudo(function (arg) {
	return function (elem) {
		return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
	};
});
//Quand la page a fini de recharger 
$(window).load(function () {
	//Evenement click sur le bouton rechercher
	$(".btn-primary").on('click', function () {
		//Récupérer la valeur dans le textbox de recherche
		var textchercher = $(".form-control").val()
			// alert("Valeur cherchée: " +  $(".form-control").val())
			//Enlever le back-ground des mots trouvés précédents
		$(".cssTextChercher").removeClass("cssTextChercher")
			//Sortir si la valeur à chercher est nulle ou vide
		if (textchercher == null || textchercher === undefined || textchercher == '') {
			return;
		}
		//Chercher les mots
		$('*:contains("' + textchercher + '")').each(function () {
			if ($(this).children().length < 1) {
				//Ajouter le fond jaune pour les mots trouvés 
				$(this).addClass("cssTextChercher")
					// Aller à la postion des mots trouvés
				$('html, body').stop().animate({
					scrollTop: $(this).offset().top
				}, 1000);
			}
		});
		//$(':not(:contains('+ textchercher +'))').each(function(){
		//   $(this).removeClass("cssTextChercher")      
		//}); 
	})
});