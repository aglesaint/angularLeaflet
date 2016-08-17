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