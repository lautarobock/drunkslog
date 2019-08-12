define("app", [
    "locale/locale",
    "menu/menu",
    "resources",
    "gplus",
    "beer/beer",
    "brewery/brewery",
    "rating/rating",
    "cellar/cellar",
    "vintage/vintage",
    "activity/activity",
    "stats/stats",
    "side/side",
    "util/directives",
    "util/misc",
    "abm/abm",
    "util/helper",
    "util/mousetrap"
    ], function(locale, menu, resources, gplus, beer, rating) {

    var app = angular.module("app", [
        'ngRoute',
        'ngSanitize',
        'ui.bootstrap',
        'pascalprecht.translate',
        'highcharts-ng',
        'dl.menu',
        'dl.resources',
        'dl.gplus',
        'dl.beer',
        'dl.brewery',
        'dl.rating',
        'dl.cellar',
        'dl.vintage',
        'dl.activity',
        'dl.stats',
        'dl.side',
        'gt.listview',
        'dl.directives',
        'gt.abm',
        'dl.helper',
        'dl.misc',
        'ng-mousetrap']);

    //Esto esta aca porque este .js se carga en forma asincronica
    angular.element(document).ready(function() {
        // setTimeout(function() {
            angular.bootstrap(document, ['app']);
        // },3000);
    });

    app.run(['$rootScope',function($rootScope) {
        navigator.geolocation.getCurrentPosition(function(position) {
            if (position) {
                $rootScope.position = position;
            }
        });
    }]);

    app.run(
        ['$rootScope','$translate','MainTitle','$log',
            function(
                    $rootScope,
                    $translate,
                    MainTitle,
                    $log) {

        $rootScope.$log = $log;

        MainTitle.set($translate('menu.title.desktop'));

        $rootScope.mainTitle = function() {
            return MainTitle.get();
        };

    }]);

    app.run(
        ['$rootScope','Login','evaluateAuthResult','User', '$log', 'CellarService', 'RatingService',
            function(
                    $rootScope,
                    Login,
                    evaluateAuthResult,
                    User,
                    $log,
                    CellarService,
                    RatingService) {

        $rootScope.loginSuccess = false;

        $rootScope.$on('g+login', function(event, googleUser) {

            // evaluateAuthResult(authResult, function(err, googleUser) {
            //     if ( err ) {
            //         $rootScope.loginError = err.message;
            //         $rootScope.$apply();
            //         $log.error("ERROR", "Login Error", err.message);
            //     } else if ( googleUser ) {
                    $rootScope.googleUser = googleUser;
                    Login.get({
                            // google_id:googleUser.getId(),
                            // name:googleUser.getBasicProfile().getName(),
                            // email: googleUser.getBasicProfile().getEmail()
                            google_id: googleUser.id,
                            name: googleUser.name,
                            email: googleUser.email
                        }, function(user) {
                            $rootScope.user = User.get({_id: user._id}, function(user) {
                                $rootScope.loginSuccess = true;
                                // $rootScope.user = user;
                                CellarService.loadMyCellar();
                                RatingService.loadMyRatings();
                            });
                    });
                // } else {
                //     $log.info("ERROR", "Silent Login Error");
                // }
            // });
        });

    }]);



    app.config(['$logProvider',function($logProvider) {
        $logProvider.debugEnabled(false);
    }]);

    app.config(['abmProvider',function(abmProvider) {
        // abmProvider.setTemplateDir('template');
    }]);

    app.config(['$translateProvider','$routeProvider', function ($translateProvider, $routeProvider) {

        //Configure Translate
        $translateProvider.translations('es', locale.es);
        $translateProvider.preferredLanguage('es');

        //Configure Routes
        $routeProvider.
                when('/beer/new', {
                    templateUrl: 'beer/beer-edit.html',
                    controller: 'BeerEditController',
                    resolve: {
                        combosData: ['BeerEditControllerResolve',
                            function(BeerEditControllerResolve) {
                                return BeerEditControllerResolve();
                            }
                        ],
                        beer: ['Beer', function(Beer) {
                            return new Beer();
                        }]
                    }
                }).
                when('/beer/edit/:beer_id', {
                    templateUrl: 'beer/beer-edit.html',
                    controller: 'BeerEditController',
                    resolve: {
                        combosData: ['BeerEditControllerResolve',
                            function(BeerEditControllerResolve) {
                                return BeerEditControllerResolve();
                            }
                        ],
                        beer: ['Beer', '$route', function(Beer, $route) {
                            return Beer.get({_id: $route.current.params.beer_id}).$promise;
                        }]
                    }
                }).
                when('/beer/detail/:beer_id', {templateUrl: 'beer/beer-detail.html',   controller: 'BeerDetailController'}).
                when('/beer/tag/:beer_id', {templateUrl: 'beer/beer-tag.html',   controller: 'BeerDetailController'}).
                when('/beer/search_:filter', {templateUrl: 'beer/beer.html',   controller: 'BeerController'}).
                when('/beer', {templateUrl: 'beer/beer.html',   controller: 'BeerController'}).

                when('/brewery/detail/:brewery_id', {templateUrl: 'brewery/brewery-detail.html',   controller: 'BreweryDetailController'}).
                when('/brewery/edit/:brewery_id', {templateUrl: 'brewery/brewery-edit.html',   controller: 'BreweryEditController'}).
                when('/brewery', {templateUrl: 'brewery/brewery.html',   controller: 'BreweryController'}).

                when('/cellar', {templateUrl: 'cellar/cellar.html',   controller: 'CellarController'}).

                when('/vintage', {templateUrl: 'vintage/vintage.html',   controller: 'VintageController'}).
                when('/vintage/new', {
                    templateUrl: 'vintage/vintage-edit.html',
                    controller: 'VintageEditController',
                    resolve: {
                        // combosData: [
                        //     'VintageEditControllerResolve',
                        //     function(VintageEditControllerResolve) {
                        //         return VintageEditControllerResolve();
                        //     }
                        // ],
                        vintage: ['VintageCellar', function(VintageCellar) {
                            var vintage = new VintageCellar();
                            vintage.left = 0;
                            vintage.entry = {
                                date: new Date()
                            };
                            return vintage;
                        }]
                    }
                }).
                when('/vintage/edit/:vintage_id', {
                    templateUrl: 'vintage/vintage-edit.html',
                    controller: 'VintageEditController',
                    resolve: {
                        // combosData: [
                        // 'VintageEditControllerResolve',
                        //     function(VintageEditControllerResolve) {
                        //         return VintageEditControllerResolve();
                        //     }
                        // ],
                        vintage: [
                            'VintageCellar',
                            '$route',
                            function(VintageCellar, $route) {
                                return VintageCellar.get({
                                    _id: $route.current.params.vintage_id
                                }).$promise;
                            }
                        ]
                    }
                }).
                when('/vintage/detail/:vintage_id', {
                    templateUrl: 'vintage/vintage-edit.html',
                    controller: 'VintageEditController',
                    resolve: {
                        // combosData: [
                        // 'VintageEditControllerResolve',
                        // function(VintageEditControllerResolve) {
                        //     return VintageEditControllerResolve();
                        // }
                        // ],
                        vintage: [
                            'VintageCellar',
                            '$route',
                            'Beer',
                            function(VintageCellar, $route, Beer) {
                                return VintageCellar.get({
                                    _id: $route.current.params.vintage_id
                                }).$promise.then(function (vintage) {
                                    return Beer.get({_id: vintage.beer}).$promise.then(function(beer) {
                                        vintage.beer_name = beer.name;
                                        return vintage;
                                    });
                                });
                            }
                        ]
                    }
                }).

                when('/stats', {templateUrl: 'stats/stats.html',   controller: 'StatsController'}).

                when('/statsd3', {templateUrl: 'stats/statsd3.html',   controller: 'StatsD3Controller'}).

                when('/rating', {
                    templateUrl: 'rating/rating.html',
                    controller: 'RatingBeerController'
                    // ,
                    // resolve: {
                    //     loggedUser: ['$q','$rootScope', function($q,$rootScope) {
                    //         var defer = $q.defer;
                    //         $rootScope.$
                    //         return defer.promise;
                    //     }]
                    // }
                }).
                when('/rating/new', {templateUrl: 'rating/rating-edit.html',   controller: 'RatingEditController'}).
                when('/rating/edit/:rating_id', {templateUrl: 'rating/rating-edit.html',   controller: 'RatingEditController'}).
                when('/rating/detail/:rating_id', {templateUrl: 'rating/rating-detail.html',   controller: 'RatingDetailController'}).

                when('/activity', {templateUrl: 'activity/activity.html', controller: 'ActivityController'}).

                otherwise({redirectTo: '/beer'});

    }]);


    app.factory('loading', function($rootScope) {
        var services = 0;
        return {
            inc: function(count) {
                services += count||1;
                $rootScope.$broadcast('loading', services);
            },
            dec: function(count) {
                services -= count||1;
                $rootScope.$broadcast('loading', services);
            }
        };
    })

    app.directive("loading", function() {
        return {
            transclude: true,
            template: '<div class="dl-loading" ng-show="loading" ><span ng-transclude></span> ({{loading}})</div>',
            link: function(scope) {
                scope.loading = null;
                scope.$on("loading", function(e, value) {
                    scope.loading = value;
                });
            }
        };
    });

    app.factory('httpInterceptor', function($q,loading,$injector) {
        var _http = null;
        var _requestEnded = function() {
            _http = _http || $injector.get('$http');
            loading.dec();
        };
        return {
            request: function(config) {
                loading.inc();
                return config;
            },

            response: function(response) {
                _requestEnded();
                return response;
            },

            responseError: function(reason) {
                _requestEnded();
                return $q.reject(reason);
            }
        }
    });

    app.config(['$httpProvider',function($httpProvider) {
        $httpProvider.interceptors.push('httpInterceptor');
    }]);

});
