define(['../resources'], function() {

	var beer = angular.module("dl.beer", ["dl.resources"]);

    beer.run(['$templateCache',function($templateCache) {
        //new for server side listview
        $templateCache.put("listview-score.html",'<span beer-percentil="$model.score"></span>');
        //legacy for califications page
        $templateCache.put("score.html",'<span beer-percentil="getValue(row,header)"></span>');
    }]);


	beer.controller("BeerController",
        ['$scope', 'Beer', '$translate', 'DLHelper', 'Brewery','$location','Cache', '$log', 'Responsive','RatingService',
        function($scope, Beer, $translate, DLHelper, Brewery,$location,Cache, $log, Responsive,RatingService) {

            $scope.beers = Beer;

			$scope.filterBeer = function(name) {
				return Beer.query({
					"filter[searchCriteria]": name
				}).$promise;
			};

            $scope.sort = {
                // initial: '-score.overall -score.avg score.position',
                combo: [{
                    label: 'Mejores calificaciones',
                    sort: '-score.overall -score.avg score.position'
                },{
                    label: 'Mejores por estilo',
                    sort: '-score.style style -score.category -score.avb score.position'
                },{
                    label: 'Mejores por categoria',
                    sort: '-score.category category -score.style -score.avb score.position'
                },{
                    label: 'Por cerveceria',
                    sort: 'brewery score.position'
                },{
                    label: 'Por nombre',
                    sort: 'name score.position'
                }]
            };

            $scope.config = {
                pageSize: Responsive.isXs() || Responsive.isSm() ? 10 : 10,
                filterOrder: ['[brewery]', '[style]', '[category]'],
                filterColSpan: 6,
                plural: $translate('beer.data.beer')+'s',
                singular: $translate('beer.data.beer'),
                searchCriteriaLabel: $translate('side.search')
            };

            $scope.headers = [{
                    field:'score.position',
                    caption: '#',
                    tooltip: $translate('beer.data.position'),
                    hidden: {xs: true,sm: true}
                },{
                    field: 'name',
                    caption: $translate('beer.data.beer'),
                    template:   '<a href="#/beer/detail/{{$model._id}}">' +
                                    '<b>{{$model.name}}</b>' +
                                '</a>'
                },{
                    field:'brewery.name',
                    caption: $translate('beer.data.brewery'),
                    hidden: {xs: true,sm: true},
                    template:   '<a href="#/beer?[brewery]={{$model.brewery._id}}"' +
                                    '<b>{{$model.brewery.name}}</b>' +
                                '</a>'
                },{
                    field:'style.name',
                    caption: $translate('beer.data.style')
                },{
                    field:'category.name',
                    caption: $translate('beer.data.category'),
                    hidden: {xs: true,sm: true}
                },{
                    field:'score.avg',
                    sort: ['score.overall', 'score.avg'],
                    caption: $translate('beer.data.score'),
                    width: '7em',
                    tooltip: $translate('beer.data.score.help'),
                    template: '<span class="{{header.class($model)}}">{{$model.score.avg||"-"}}</span>',
                    class: function(beer) {
                        if ( beer.score ) {
                            return 'badge alert-' + DLHelper.colorByScore(beer.score.avg);
                        } else {
                            return 'badge';
                        }
                    }
                },{
                    field:'score',
                    caption: 'G / S',
                    width: '9em',
                    style: {'text-align': 'center','min-width': '9em'},
                    tooltip: $translate('beer.data.score.gs.help'),
                    templateUrl: 'listview-score.html'
                },{
                    field:'score.count',
                    caption: $translate('beer.data.score.count.short'),
                    tooltip: $translate('beer.data.score.count.help'),
                    hidden: {xs: true,sm: true}
                },{
                    field:'score.myScore',
                    caption: $translate('beer.data.score.my'),
                    width: '5em',
                    tooltip: $translate('beer.data.score.my.help'),
                    templateUrl: 'beer/list/my-score.html',
                    getMyScore: function(beer) {

                        var avg = RatingService.avgForBeer(beer);
                        if ( avg && avg >= 0 ) {
                            return parseFloat(avg.toFixed(1));
                        } else {
                            return avg;
                        }

                    },
                    class: function(header, beer) {
                        var s = header.getMyScore(beer);
                        if ( s ) {
                            return 'badge alert-' + DLHelper.colorByScore(s);
                        } else {
                            return 'badge';
                        }
                    }
                }
            ];

            $scope.filterData = {};
            $scope.filterData['[style]'] = {
                caption: $translate('beer.data.style'),
                type: 'combo',
                groupBy: function(value) {
                    return value.category._id + '-' + value.category.name;
                },
                comparator: 'equal',
                getLabel: function(value) {
                    return value.name + ' (' + value._id.toUpperCase() + ')';
                },
                valueKey: '_id',
                ignoreCase: false,
                data: Cache.styles(),
                orderBy: '_id'
            };

            $scope.filterData['[category]'] = {
                caption: $translate('beer.data.category'),
                type: 'combo',
                comparator: 'equal',
                getLabel: function(value) {
                    return value.name + ' (' + value._id + ')';
                },
                valueKey: '_id',
                ignoreCase: false,
                data: Cache.categories(),
                orderBy: '_id'
            };
            $scope.filterData['[brewery]'] = {
                caption: $translate('beer.data.brewery'),
                type: 'combo',
                comparator: 'equal',
                getLabel: function(value) {
                    return value.name;
                },
                valueKey: '_id',
                ignoreCase: false,
                data: Brewery.query(),
                orderBy: 'name'
            };

            angular.forEach($scope.filterData,function(f,key){
                if ( $location.$$search[key] ) {
                    $scope.filterData[key].value = $location.$$search[key];
                }
            });
            if ( $location.$$search.searchCriteria ) {
                $scope.config.searchCriteria = $location.search().searchCriteria;
            }


            // $scope.config = {
            //     emptyResultText: $translate('beer.search.emtpy')
            // };

        }]);

	beer.controller("NewStyleByLabelController", function($scope, $modalInstance, StyleByLabel) {
		$scope.styleByLabel = new StyleByLabel();
		$scope.ok = function () {
		    $modalInstance.close($scope.styleByLabel);
		};
		$scope.cancel = function () {
		    $modalInstance.dismiss('cancel');
		};
	});

	beer.controller("NewBreweryController", function($scope, $modalInstance, Brewery,focus) {
		$scope.brewery = new Brewery();
        focus('breweryName');
		$scope.ok = function () {
		    $modalInstance.close($scope.brewery);
		};
		$scope.cancel = function () {
		    $modalInstance.dismiss('cancel');
		};
	});

    beer.factory("BeerEditControllerResolve",
            ['Cache', 'StyleByLabel', 'Brewery', '$q',
            function(Cache, StyleByLabel, Brewery, $q) {
        return function() {
            var p = $q.all([
                Cache.styles().$promise,
                StyleByLabel.query().$promise,
                Brewery.query().$promise,
                Cache.categories().$promise]);
            return p;
        }
    }]);

	beer.controller("BeerEditController", [
                '$scope', 'Brewery', 'StyleByLabel',
                '$location', '$modal',
                '$rootScope', '$timeout', '$q',
                'MainTitle', 'focus','combosData','beer','$translate',
		function(
                $scope, Brewery, StyleByLabel,
                $location,   $modal,
                $rootScope,   $timeout,   $q,
                MainTitle,   focus, combosData, beer, $translate) {

            $scope.$log.debug("BEER",beer);

            //comboData comes from routeparams
			$scope.styles = combosData[0];
			$scope.stylesByLabel = combosData[1];
			$scope.breweries = combosData[2];
            $scope.categories = combosData[3];

            $scope.beer = beer;
            MainTitle.add($scope.beer.name||$translate('beer.new'));
            $scope.$on("$destroy", function() {
                MainTitle.clearAdd();
            });
            focus('beername');

			$scope.openNewBrewery = function () {
				var modalInstance = $modal.open({
				  	templateUrl: 'beer/brewery.html',
				  	controller: 'NewBreweryController'
				});

				modalInstance.result.then(function (brewery) {
				  	brewery._id = brewery.name.replace(/[^a-z0-9]/ig, '');

				  	brewery.$save(function(saved) {
						$scope.breweries = Brewery.query(function() {
							$timeout(function() {
								$scope.beer.brewery = saved._id;
							},100);

						});
					});

				});
			};

			$scope.openNewStyleByLabel = function () {
				var modalInstance = $modal.open({
				  	templateUrl: 'beer/style-by-label.html',
				  	controller: 'NewStyleByLabelController'
				});

				modalInstance.result.then(function (styleByLabel) {
				  	styleByLabel._id = styleByLabel.name.replace(/[^a-z0-9]/ig, '');
				  	styleByLabel.$save(function(saved) {
						$scope.stylesByLabel = StyleByLabel.query(function() {
							$timeout(function() {
								$scope.beer.styleByLabel = saved._id;
							},100);
						});
					});
				});
			};

            $scope.blurBrewery = function(value) {
                console.log(value)
                if ( !$scope.beer.brewery ) {

                }
            };

            $scope.error = {};

            function validate() {
                var valid = true;

                if ( !$scope.beer.name ) {
                    valid = false;
                    $scope.error.name = 'Debe ingresar un nombre para la cerveza';
                } else {
                    delete $scope.error.name;
                }

                if ( !$scope.beer.brewery ) {
                    valid = false;
                    $scope.error.brewery = 'Debe seleccionar una cerveceria de la lista';
                } else {
                    delete $scope.error.brewery;
                }

                if ( !$scope.beer.style ) {
                    valid = false;
                    $scope.error.style = 'Debe seleccionar una estilo BJCP';
                } else {
                    delete $scope.error.style;
                }

                return valid;
            }

            $scope.errorClass = function(field) {
                return $scope.error[field] ? 'has-error' : '';
            }

			//Save
			$scope.save = function() {
                if ( validate() ) {
                    if ( !$scope.beer._id ) {
                        $scope.beer._id = $scope.beer.name.replace(/[^a-z0-9]/ig, '') + "-" + new Date().getTime();
                    }
                    $scope.beer.$save(function(beer) {
                        $location.path('/beer/detail/' + beer._id);
                    },function(err) {
                        if ( err.status == 401 ) {
                            console.log("Operacion no autorizada",err);
                        } else {
                            console.log("Error",err);
                        }

                    });
                }
			};

            $scope.formatBrewerySelection = function(brewery_id, breweries) {
                if ( !breweries ) return null;
                var filtered = util.Arrays.filter(breweries, function(item) {
                    return item._id == brewery_id ? 0 : -1;
                });
                if ( filtered.length > 0 ) {
                    return filtered[0].name;
                } else {
                    return null;
                }
            };


	}]);

	beer.controller("BeerDetailController",
		        ['$scope', 'Beer','$routeParams', 'Rating', 'DLHelper', '$filter',
                'MainTitle','CellarService','RatingService', 'YesNo',
		function( $scope,   Beer,  $routeParams,   Rating,   DLHelper,   $filter,
            MainTitle, CellarService, RatingService, YesNo) {

			$scope.beer = Beer.get({_id: $routeParams.beer_id, populate:true}, function() {
                $scope.ratings = Rating.getByBeer({beer_id:$scope.beer._id});
                MainTitle.add($scope.beer.name);
                $scope.$on("$destroy", function() {
                    MainTitle.clearAdd();
                });
            });

            $scope.CellarService = CellarService;

            $scope.vintageTooltip = function(rating) {
                if ( rating.bottled ) {
                    var dateFormat = $filter('date');
                    var bot = new Date(rating.bottled).getTime();
                    var drink = new Date(rating.date).getTime();
                    var time = drink - bot;
                    $scope.$log.debug("time", time);
                    var anos = time / (1000*60*60*24*365);
                    var rest = anos - Math.floor(anos);
                    rest = Math.ceil(rest *12);
                    if ( rest == 12 )  {
                        anos++;
                        rest = 0;
                    }
                    if ( anos > 1 ) {
                        var resp = 'Embotellada en ' + dateFormat(rating.bottled,'dd/MM/yyyy') + ' tomada con ' + Math.floor(anos) + ' años';
                        if ( rest !== 0 ) {
                             resp += 'y ' + rest + ' meses';
                        }
                        return resp;
                    } else {
                        return 'Embotellada en ' + dateFormat(rating.bottled,'dd/MM/yyyy') + ' tomada con ' + rest + ' meses';
                    }
                } else {
                    return null;
                }
            };

            $scope.scoreClass = function(score) {
                return 'text-' + DLHelper.colorByScore(score);
            };

            $scope.ratingScoreClass = function(score) {
                return 'alert-' + DLHelper.colorByScore(score);
            };

            $scope.beerLink = function(beer) {
                return encodeURIComponent('http://www.birrasquehetomado.com.ar/html/tag.html#/beer/detail/' + beer._id);
            };

            $scope.embed = function(beer) {
                return '<iframe src="http://www.birrasquehetomado.com.ar/html/tag.html#/beer/tag/' + beer._id +
                '" width="400" height="200" scrolling="no" frameborder="0"></iframe>'
            };

            $scope.removeRating = function(rating) {
                YesNo.open("Eliminar Calificacion","¿Esta seguro que desea eliminar la calificacion?", function() {
                    rating.$delete(function() {
                        util.Arrays.remove($scope.ratings, rating);
                        $scope.beer = Beer.get({_id: $routeParams.beer_id, populate:true});
                        RatingService.loadMyRatings();
                    });
                });

            };

	}]);


	/*
	 * Directives
	 */
	beer.directive("beerDetail", ['GoTo',function(GoTo) {
		return {
			restrict : 'A',
            scope : {
                beer: '=beerDetail'
            },
            templateUrl: 'beer/beer-detail-directive.html',
            controller: function($scope, DLHelper) {

                $scope.values = ['abv','ibu','og','fg'];
                $scope.units = { abv: '%' };

                $scope.openBrewery = function(brewery) {
                    GoTo.brewery(brewery._id);
                };

                $scope.openStyle = function(style) {
                    GoTo.style(style._id);
                };

                $scope.showValues = function(beer) {
                    if ( !beer ) return false;
                    var show = false;
                    angular.forEach($scope.values, function(v) {
                        show = show || beer[v];
                    });
                    return show;
                };

            	$scope.scoreClass = function(score) {
            		return 'text-' + DLHelper.colorByScore(score);
            	}
            }
		};
	}]);

    beer.directive("beerPercentil", function() {
        return {
            scope: {
                score:'=beerPercentil'
            },
            template: '<span><span tooltip="{{tooltipG}}" class="dl-score-overall">{{score.overall||"-"}}</span>'+
                '<span tooltip="{{tooltipS}}" class="dl-score-style">{{score.style||"-"}}</span>' +
                '<span tooltip="{{tooltipC}}" class="dl-score-category">{{score.category||"-"}}</span></span>',
            controller: ['$scope', '$translate',function($scope, $translate) {
                $scope.tooltipG = $translate('beer.data.score.overall');
                $scope.tooltipS = $translate('beer.data.score.style');
                $scope.tooltipC = $translate('beer.data.score.category');
            }]
        };
    });

	return beer;
});
