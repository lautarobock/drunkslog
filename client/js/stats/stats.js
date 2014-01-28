define([], function() {

    var stats = angular.module("dl.stats", []);

    /*
    - Genenral
     - Cantidad de Tomadas
     - Cantidad puntuada
     - Cantidad de cervecerias
     - Cantidad de Esilos
     - Cantidad de categorias
     - Con mas %. Top 3 & Bottom 3
     - Con mas ptos. Top 3 & Bottom 3
     - Con max IBUS. Top 3 & Bottom 3
    - Por cantidad
     - Por mes, 12 meses.
     - Por estilo. (3 estilos + otros)
     - Por categoria. (3 cat + otros)
     - Por cerveceria. (3 cerv + otros)
    - Por Puntaje
     - Por mes, 12 meses.
     - Por estilo. (3 estilos + otros)
     - Por categoria. (3 cat + otros)
     - Por cerveceria. (3 cerv + otros)

    */


    stats.controller("StatsController", 
        ['$scope','Rating', 'StatsService', '$filter', 'Cache', '$translate', '$location',
        function($scope,Rating, StatsService, $filter, Cache, $translate,$location) {
            
            $scope.$watch("user", function(user) {
                if ( user ) {
                    loadData();
                }
            });


            function loadData() {
                $scope.styles = {};
                $scope.categories = {};
                Cache.styles(function(styles) {
                    angular.forEach(styles, function(style) {
                        $scope.styles[style._id] = style;
                    });
                });
                Cache.categories(function(cats) {
                    angular.forEach(cats, function(cat) {
                        $scope.categories[cat._id] = cat;
                    });
                });
                Rating.query(function(ratings) {
                    $scope.myStats = {};

                    if ( ratings.length == 0 ) return;

                    $scope.myStats = StatsService.myStats(ratings);
                    var orderBy = $filter('orderBy');
                    var filter = $filter('filter');
                    function abvDefined(rating) {
                        return rating.beer.abv;
                    }
                    function sortABV(rating) {
                        return rating.beer.abv || 0;
                    }
                    function sortOverall(rating) {
                        return rating.finalScore || 0;
                    }
                    function scoreDefined(rating) {
                        return rating.finalScore;
                    }
                    $scope.myStats.maxABV = orderBy(ratings,sortABV,true)[0].beer;
                    $scope.myStats.minABV = orderBy(filter(ratings,abvDefined),sortABV,false)[0].beer;
                    $scope.myStats.maxScore = orderBy(ratings,sortOverall,true)[0];
                    $scope.myStats.minScore = orderBy(filter(ratings,scoreDefined),sortOverall,false)[0];

                    $scope.styleTBConfig = {
                        rows: $scope.myStats.styles,
                        headers: [{
                            caption: $translate('beer.data.style'),
                            style: {width: '60%'},
                            value: function(row) {
                                return $scope.styles[row._id].name
                            }
                        },{
                            caption: $translate('stats.amount'),
                            style: {width: '40%'},
                            value: function(row) {
                                return row.count;
                            }
                        }],
                        orderBy: '-count',
                        top: 3,
                        bottom: 3
                    };

                    console.log($scope.myStats.categories);
                    $scope.catTBConfig = {
                        rows: $scope.myStats.categories,
                        headers: [{
                            caption: $translate('beer.data.style'),
                            style: {width: '60%'},
                            rowStyle: function(row) {
                                return {cursor: 'pointer'};
                            },
                            onClick: function(row) {
                                $location.path("/beer").search('category._id',row._id);
                            },
                            value: function(row) {
                                return $scope.categories[row._id].name
                            }
                        },{
                            caption: $translate('stats.amount'),
                            style: {width: '40%'},
                            value: function(row) {
                                return row.count;
                            }
                        }],
                        orderBy: '-count',
                        top: 3,
                        bottom: 3
                    };
                });
            }
    }]);

    stats.directive("tableTopBottom", function() {
        return {
            scope: {
                config: '='
            },
            templateUrl: 'stats/table-top-bottom.html'
        };
    });

    stats.factory("StatsService", function() {
        return StatsService;
    })

    return stats;
});