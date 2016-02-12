define(["resources"], function() {

    var vintage = angular.module('dl.vintage', ['dl.resources']);


    vintage.controller("VintageController", ['$scope','VintageCellar','$translate','$filter', 'DLHelper', 'Cache',
        function($scope,VintageCellar,$translate,$filter,DLHelper, Cache) {

        $scope.styles = {};
        Cache.styles(function(styles) {
            angular.forEach(styles, function(style) {
                $scope.styles[style._id] = style;
            });
        });

        $scope.showZeros = false;

        $scope.config = {
            collection: [],
            name: $translate('beer.data.beer')+'s',
            singular: $translate('beer.data.beer'),
            orderBy: "beer.name",
            orderDir: "",
            pageSize: 20,
            headers: [{
                field:'title',
                caption: $translate('beer.data.beer'),
                type: 'link',
                href: function(row) {return '#/vintage/detail/' + row._id;},
                class: function(cellar) {
                    if ( cellar.amount === 0 ) {
                        return 'dl-line-through';
                    }
                }
            },{
                field: 'beer.style',
                caption: 'Estilo',
                title: function(rating) {
                    return rating ? $scope.styles[rating.beer.style].name : null;
                },
                format: function(value) {
                    return value.toUpperCase();
                }
            },{
                field:'beer.score.avg',
                caption: $translate('beer.data.score'),
                width: '7em',
                tooltip: $translate('beer.data.score.help'),
                class: function(cellar) {
                    if ( cellar.beer.score ) {
                        return 'badge alert-' + DLHelper.colorByScore(cellar.beer.score.avg);
                    } else {
                        return 'badge';
                    }
                }
            },{
                field: 'left',
                width: '10em',
                caption: $translate('cellar.amount'),
                class: function(cellar) {
                    if ( cellar.amount === 0 ) {
                        return 'dl-line-through';
                    }
                }
            },{
                field:'entry',
                caption: 'Fecha',
                width: '14em',
                format: function(value) {
                    var format = $filter('date');
                    return format(
                        new Date(
                            format(
                                value,
                                'dd-MM-yyyy'
                            ).date
                        ),
                        'dd-MM-yyyy'
                    );
                }
            }]
        };

        function reload() {
            VintageCellar.query({populate:true}, function(cellars) {
                if ( $scope.showZeros ) {
                    $scope.config.collection = cellars;
                } else {
                    $scope.config.collection = _.filter(cellars, function(cellar) {
                        return cellar.left > 0;
                    });
                }
                $scope.bottleCount = 0;
                angular.forEach(cellars, function(c) {
                    $scope.bottleCount += c.left;
                });
            })
        }
        // reload();
        $scope.$watch('showZeros', function() {
            reload();
        });
    }]);

    vintage.controller(
        "VintageEditController",
        [
            '$scope', '$location', '$modal','$rootScope', '$timeout', '$q',
            'MainTitle', 'focus','vintage','$translate', 'Beer',
            function(
                $scope,
                $location, $modal, $rootScope,   $timeout,   $q,
                MainTitle, focus, vintage, $translate, Beer) {

                $scope.$log.debug("BEER",vintage);

                //comboData comes from routeparams
                // $scope.beers = combosData[0];
                $scope.beers = [];

                $scope.filterBeer = function(name) {
    				return Beer.query({
    					"filter[searchCriteria]": name
    				}, function(r) {
                        $scope.beers = r;
                    }).$promise;
    			};

                $scope.vintage = vintage;
                MainTitle.add($scope.vintage.name||$translate('beer.new'));
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


                //Save
                $scope.save = function() {
                    // if ( validate() ) {
                        if ( !$scope.vintage._id ) {
                            $scope.vintage._id = 'Vintage_' + $scope.vintage.beer.replace(/[^a-z0-9]/ig, '') + "-" + new Date().getTime();
                        }
                        $scope.vintage.$save(function(vintage) {
                            $location.path('/vintage/detail/' + vintage._id);
                        },function(err) {
                            if ( err.status == 401 ) {
                                console.log("Operacion no autorizada",err);
                            } else {
                                console.log("Error",err);
                            }

                        });
                    // }
                };

                $scope.onSelectBeer = function(beer) {
                    $scope.vintage.title = $scope.vintage.title || beer.name;
                };

                $scope.formatBeerSelection = function(beer_id, beers, $item) {
                    if ( $scope.vintage.beer_name ) {
                        return $scope.vintage.beer_name
                    } else if ( beers ) {
                        var filtered = util.Arrays.filter(beers, function(item) {
                            return item._id == beer_id ? 0 : -1;
                        });
                        if ( filtered.length > 0 ) {
                            return filtered[0].name;
                        } else {
                            return null;
                        }
                    } else {
                        return null;
                    }
                };

                $scope.opened = {
                    botting: false,
                    expiration: false,
                    entry: false
                };

                $scope.openDate = function($event, type) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope.opened[type] = true;
                };

                $scope.drinkingPlannedOpen = {};
                $scope.openDrinkingPlannedOpen = function($event, type) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope.drinkingPlannedOpen[type] = true;
                };

                $scope.drinkingDrunkOpen = {};
                $scope.openDrinkingDrunkOpen = function($event, type) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope.drinkingDrunkOpen[type] = true;
                };

                $scope.now = new Date();

                $scope.addDrinking = function() {
                    $scope.vintage.drinkings = $scope.vintage.drinkings || [];
                    $scope.vintage.drinkings.push({});
                };

                $scope.removeDrinking = function(drinking) {
                    var index = $scope.vintage.drinkings.indexOf(drinking);
                    $scope.vintage.drinkings.splice(index,1);
                };
            }
        ]
    );

    vintage.factory(
        "VintageEditControllerResolve",
        [
            'Beer', '$q',
            function(Beer, $q) {
                return function() {
                    var p = $q.all([
                        Beer.query().$promise]);
                    return p;
                };
            }
        ]
    );


    return vintage;
});
