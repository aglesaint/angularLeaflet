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
 directive toggle div ex : accounting
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
/********************************
 cartographie map'it
*********************************/
app.controller('mapitController', ['$scope', '$rootScope', 'infoFonctionsFactory', '$compile', 'leafletData', function ($scope, $rootScope, infoFonctionsFactory, $compile, leafletData) {
	var ctrl = this; // context capture to transmit to $scope listener
	var local_icons = {
		default_icon: {
			iconUrl: 'images/marker-default.png',
			iconSize: [40, 40],
			iconAnchor: [20, 40]
		},
		pCIcon: {
			iconUrl: 'images/marker-computer.png',
			iconSize: [40, 40],
			iconAnchor: [20, 40]
		},
		routerIcon: {
			iconUrl: 'images/marker-router.png',
			iconSize: [40, 40],
			iconAnchor: [20, 40]
		},
		bugIcon: {
			iconUrl: 'images/marker-bug.png',
			iconSize: [40, 40],
			iconAnchor: [20, 40]
		},
		pokemonIcon: {
			iconUrl: 'images/marker-pokemon.png',
			iconSize: [80, 80],
			iconAnchor: [40, 40]
		}
	};
	$scope.title = "Toulouse area";
	/*
	 *  extend
	 */
	angular.extend($scope, {
		toulouse: {
			lat: 43.635875,
			lng: 1.481903,
			zoom: 20
		},
		defaults: {
			scrollWheelZoom: false
		},
		markers: new Array(),
		icons: local_icons,
		position: {
			lat: 43.635875,
			lng: 1.481903
		},
		events: { // or just {} //all events
			markers: {
				enable: ['dragend'],
				logic: 'emit'
			},
			map: {
				enable: ['zoomstart', 'drag', 'click', 'mousemove', 'popupopen'],
				logic: 'emit'
					// , logic: 'emit'
			}
		}
	});
	/**
	 * la map
	 **/
	var map;
	leafletData.getMap().then(function (lfMap) {
		map = lfMap;
	});
	/**
	 * events binder
	 **/
	$scope.eventDetected = "No events yet...";
	$scope.$on('leafletDirectiveMap.zoomstart', function (event) {
		$scope.eventDetected = "ZoomStart";
	});
	$scope.$on('leafletDirectiveMap.drag', function (event) {
		$scope.eventDetected = "Drag";
	});
	$scope.$on('leafletDirectiveMap.click', function (event) {
		$scope.eventDetected = "Click";
		//$scope.markers = new Array(); // works fine !!!
	});
	$scope.$on('leafletDirectiveMap.popupopen', function (event) {
		$scope.eventDetected = "Popup";
		console.log("==== open a popup ====");
	});
	/**
	 * add new markers
	 **/
	$scope.addMarkers = function (itemName) {
		/** test factory
		 * $scope.pattes = 
		 * infoFonctionsFactory.recupNbrPattes("12");
		 */
		var myIcon, myMessage, myId;
		var rand = Math.floor((Math.random() * 1000) + 1);
		switch (itemName) {
		case "PC":
			myIcon = local_icons.pCIcon;
			myId = "#PC" + rand;
			break;
		case "router":
			myIcon = local_icons.routerIcon;
			myId = "#router" + rand;
			break;
		case "pokemon":
			myIcon = local_icons.pokemonIcon;
			myId = "#pokemon" + rand;
			break;
		case "bug":
			myIcon = local_icons.bugIcon;
			myId = "#bug" + rand;
			break;
		default:
			myIcon = local_icons.default_icon;
			myId = "#person" + rand;
		}
		myMessage = "<div ng-include src=\"'myLeafletMarkerTemplate.html'\"></div>";
		$scope.markers.push({
			lat: 43.635875,
			lng: 1.481903,
			focus: true,
			message: myMessage,
			getMessageScope: function () {
				$scope.id = myId;
				return $scope;
			},
			compileMessage: true,
			draggable: true,
			icon: myIcon,
			id: myId
		});
	};
	/**
	 *remove one marker
	 **/
	$scope.removeMarker = function (idmarker) {
		leafletData.getMarkers().then(function (markers) {
			var index;
			for (var i = 0; i <= $scope.markers.length; i++) {
				if (idmarker == $scope.markers[i].id) {
					index = i;
					break;
				}
			}
			// deleting outside the loop to avoid undefined id
			if (index != "undefined") {
				map.removeLayer(markers[index]);
			}
		});
	};
	$scope.$on("leafletDirectiveMarker.dragend", function (event, args) {
		$scope.position.lat = args.model.lat;
		$scope.position.lng = args.model.lng;
	});
	//    $scope.$on('AddMarker', ctrl.addMarkers);
	//    $scope.$on('RemoveMarker', ctrl.removeMarker);
}]);
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