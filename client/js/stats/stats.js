define(["resources","util/misc", "util/maps", "util/d3"], function() {

    var stats = angular.module("dl.stats", ['dl.resources','dl.misc','pascalprecht.translate','dl.maps','dl.d3']);

    stats.controller("StatsD3Controller", function($scope,StatsService,$filter,Rating,Cache,Brewery,$translate) {

        $scope.styles = {};
        $scope.categories = {};
        $scope.breweries = {};
        $scope.context = $scope;
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
        Brewery.query(function(breweries) {
            angular.forEach(breweries, function(brewery) {
                $scope.breweries[brewery._id] = brewery;
            });
        });

        var monthNames = [
            $translate('month.january'),
            $translate('month.february'),
            $translate('month.march'),
            $translate('month.april'),
            $translate('month.may'),
            $translate('month.june'),
            $translate('month.july'),
            $translate('month.august'),
            $translate('month.september'),
            $translate('month.october'),
            $translate('month.november'),
            $translate('month.december')
        ];

        $scope.byMonthData = [];
        $scope.byMonthConfig = {
            bars: {
                // thickness: 30,
                padding: 1,
                vertical: false,
                color: function() { 
                    return 'steelblue';
                }
            },
            data: {
                value: function(month) {
                    return month.count;
                },
                text: function(month) {
                    return month.count;
                },
                key: function(month) {
                    // var year = month._id.split("_")[0];
                    // var monthValue = parseInt(month._id.split("_")[1]);
                    // return monthNames[monthValue-1] + ' ' + year;
                    return month._id;
                }
            }
        };
        $scope.byMonthConfigV = {
            bars: {
                // thickness: 30,
                padding: 1,
                vertical: true,
                color: function() { 
                    return 'steelblue';
                }
            },
            data: {
                value: function(month) {
                    return month.count;
                },
                text: function(month) {
                    return month.count;
                },
                key: function(month) {
                    // var year = month._id.split("_")[0];
                    // var monthValue = parseInt(month._id.split("_")[1]);
                    // return monthNames[monthValue-1] + ' ' + year;
                    return month._id;
                }
            }
        };

        Rating.query(function(ratings) {
            $scope.myStats = StatsService.myStats(ratings, $scope.breweries);
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

            $scope.byMonthData = orderBy($scope.myStats.months,'_id');
        });
        
    });

    stats.controller("StatsController", 
        ['$scope','Rating', 'StatsService', '$filter', 'Cache', '$translate', '$location', 'Brewery', 'GoTo',
        'MapFactory', '$timeout',
        function($scope,Rating, StatsService, $filter, Cache, $translate,$location, Brewery, GoTo,MapFactory,$timeout) {
            
            $scope.$watch("user", function(user) {
                if ( user ) {
                    loadData();
                }
            });


            $scope.tabs = [{
                name: 'general',
                caption: $translate('stats.general')
            },{
                name: 'styles',
                caption: $translate('beer.data.style')
            },{
                name: 'categories',
                caption: $translate('beer.data.category')
            },{
                name: 'breweries',
                caption: $translate('beer.data.brewery')
            },{
                name: 'countries',
                caption: $translate('stats.drunkIn')
            },{
                name: 'locations',
                caption: $translate('stats.drunkInLocation')
            },{
                name: 'origin',
                caption: $translate('stats.origin')
            },{
                name: 'map',
                caption: $translate('general.map')
            }];
            $scope.tabSelected = $scope.tabs[0];

            $scope.selectTab = function(tab) {
                $scope.tabSelected = tab;
            };


            function loadData() {
                $scope.styles = {};
                $scope.categories = {};
                $scope.breweries = {};
                $scope.context = $scope;
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
                Brewery.query(function(breweries) {
                    angular.forEach(breweries, function(brewery) {
                        $scope.breweries[brewery._id] = brewery;
                    });
                    loadRatings();
                });
                function loadRatings() {
                    Rating.query(function(ratings) {
                        $scope.myStats = {};

                        if ( ratings.length == 0 ) return;

                        $scope.myStats = StatsService.myStats(ratings, $scope.breweries);
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

                        loadTableData();

                        loadCharts();

                        loadTabs();

                        loadMap(ratings);

                        //Rating per month chart
                        var categories = [];
                        var values = [];
                        var monthNames = [
                            $translate('month.january'),
                            $translate('month.february'),
                            $translate('month.march'),
                            $translate('month.april'),
                            $translate('month.may'),
                            $translate('month.june'),
                            $translate('month.july'),
                            $translate('month.august'),
                            $translate('month.september'),
                            $translate('month.october'),
                            $translate('month.november'),
                            $translate('month.december')
                        ];
                        angular.forEach(orderBy($scope.myStats.months,'_id'), function(month) {
                            var year = month._id.split("_")[0];
                            var monthValue = parseInt(month._id.split("_")[1]);
                            categories.push(monthNames[monthValue-1] + ' ' + year);
                            values.push(month.count);
                        });


                        $scope.beersPerMonth = {
                            options: {
                                chart: {
                                    type: 'column'
                                },
                                title: {
                                    text: $translate('stats.chart.beerPerMonth')
                                }
                            },
                            xAxis: {
                                categories: categories
                            },
                            yAxis: {
                                min: 0,
                                title: {
                                    text: $translate('stats.amount')
                                }
                            },
                            tooltip: {
                                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                                    '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
                                footerFormat: '</table>',
                                shared: true,
                                useHTML: true
                            },
                            series: [{
                                name: $translate('beer.data.beer')+'s',
                                data: values
                            }]
                        };
                    });
                }
            }

            function loadTabs() {
                $scope.tabConfig = {};
                $scope.tabConfig.styles = {
                    collection: $scope.myStats.styles,
                    name: $translate('beer.data.style')+'s',
                    singular: $translate('beer.data.style'),
                    filterColSpan: 6,
                    orderBy: 'count',
                    orderDir: "-",
                    pageSize: 25,
                    emptyResultText: $translate('beer.search.emtpy'),
                    headers: [{
                        field:'_id',
                        caption: 'ID'
                    },{
                        field:'name',
                        type: 'link',
                        caption: $translate('beer.data.name'),
                        valueTemplateUrl: 'stats-name.html',
                        onClick: function(row) {
                            GoTo.style(row._id);
                        }

                    },{
                        field:'count',
                        caption: $translate('stats.amount')
                    },{
                        field:'avg.value',
                        caption: $translate('stats.avg')
                    }]
                };
                $scope.tabConfig.categories = {
                    collection: $scope.myStats.categories,
                    name: $translate('beer.data.category')+'s',
                    singular: $translate('beer.data.category'),
                    filterColSpan: 6,
                    orderBy: 'count',
                    orderDir: "-",
                    pageSize: 25,
                    emptyResultText: $translate('beer.search.emtpy'),
                    headers: [{
                        field:'_id',
                        caption: 'ID'
                    },{
                        field:'name',
                        caption: $translate('beer.data.name'),
                        valueTemplateUrl: 'stats-name.html',
                        onClick: function(row) {
                            GoTo.category(row._id);
                        }
                    },{
                        field:'count',
                        caption: $translate('stats.amount')
                    },{
                        field:'avg.value',
                        caption: $translate('stats.avg')
                    }]
                };
                $scope.tabConfig.breweries = {
                    collection: $scope.myStats.breweries,
                    name: $translate('beer.data.brewery')+'s',
                    singular: $translate('beer.data.brewery'),
                    filterColSpan: 6,
                    orderBy: 'count',
                    orderDir: "-",
                    pageSize: 25,
                    emptyResultText: $translate('beer.search.emtpy'),
                    headers: [{
                        field:'name',
                        caption: $translate('beer.data.name'),
                        valueTemplateUrl: 'stats-name.html',
                        onClick: function(row) {
                            GoTo.brewery(row._id);
                        }
                    },{
                        field:'count',
                        caption: $translate('stats.amount')
                    },{
                        field:'avg.value',
                        caption: $translate('stats.avg')
                    }]
                };
                //Countries
                $scope.tabConfig.countries = {
                    collection: $scope.myStats.countries,
                    name: $translate('brewery.data.locations'),
                    singular: $translate('brewery.data.location'),
                    filterColSpan: 6,
                    orderBy: 'count',
                    orderDir: "-",
                    pageSize: 25,
                    emptyResultText: $translate('beer.search.emtpy'),
                    headers: [{
                        field:'_id',
                        caption: $translate('brewery.data.location.address.country')
                    },{
                        field:'count',
                        caption: $translate('stats.amount')
                    },{
                        field:'avg.value',
                        caption: $translate('stats.avg')
                    }]
                };
                //Locations
                $scope.tabConfig.locations = {
                    collection: $scope.myStats.locations,
                    name: $translate('brewery.data.locations'),
                    singular: $translate('brewery.data.location'),
                    filterColSpan: 6,
                    orderBy: 'count',
                    orderDir: "-",
                    pageSize: 25,
                    emptyResultText: $translate('beer.search.emtpy'),
                    headers: [{
                        field:'location.name',
                        caption: $translate('brewery.data.location')
                    },{
                        field:'count',
                        caption: $translate('stats.amount')
                    },{
                        field:'avg.value',
                        caption: $translate('stats.avg')
                    }]
                };
                //Origin
                $scope.tabConfig.origin = {
                    collection: $scope.myStats.origin,
                    name: $translate('brewery.data.locations'),
                    singular: $translate('brewery.data.location'),
                    filterColSpan: 6,
                    orderBy: 'count',
                    orderDir: "-",
                    pageSize: 25,
                    emptyResultText: $translate('beer.search.emtpy'),
                    headers: [{
                        field:'_id',
                        caption: $translate('stats.origin')
                    },{
                        field:'count',
                        caption: $translate('stats.amount')
                    },{
                        field:'avg.value',
                        caption: $translate('stats.avg')
                    }]
                };
            }

            function loadCharts() {

                //Style chart
                var stylesCount = transformChartData($scope.myStats.styles, 9);
                $scope.styleChartConfig = getBaseChart(stylesCount, function() {
                    var style = $scope.styles[this.point.name] || {name:$translate('stats.others')};
                    return '<span style="font-size: 10px">'+style.name+'</span><br/><b>'+Math.round(this.percentage)
                                +'%</b> (' + this.y + ')';
                });

                //Category
                var categoryCount = transformChartData($scope.myStats.categories, 9);
                $scope.categoryChartConfig = getBaseChart(categoryCount, function() {
                    var category = $scope.categories[this.point.name] || {name:$translate('stats.others')};
                    return '<span style="font-size: 10px">'+category.name+'</span><br/><b>'+Math.round(this.percentage)
                                +'%</b> (' + this.y + ')';
                });      
                
                //Brewery
                var breweryCount = transformChartData($scope.myStats.breweries, 9);
                $scope.breweriesChartConfig = getBaseChart(breweryCount, function() {
                    var brewery = $scope.breweries[this.point.name] || {name:$translate('stats.others')};
                    return '<span style="font-size: 10px">'+brewery.name+'</span><br/><b>'+Math.round(this.percentage)
                                +'%</b> (' + this.y + ')';
                });
                $scope.breweriesChartConfig.options.plotOptions.pie.dataLabels.enabled = false;

                //Country
                var countryCount = transformChartData($scope.myStats.countries, 9);
                $scope.countryChartConfig = getBaseChart(countryCount, function() {
                    var country = this.point.name || $translate('stats.others');
                    return '<span style="font-size: 10px">'+country+'</span><br/><b>'+Math.round(this.percentage)
                                +'%</b> (' + this.y + ')';
                });      
                $scope.countryChartConfig.options.plotOptions.pie.dataLabels.enabled = false;

                //Location
                var locationCount = transformChartData($scope.myStats.locations, 9);
                $scope.locationChartConfig = getBaseChart(locationCount, function() {
                    var location = this.point.name || $translate('stats.others');
                    return '<span style="font-size: 10px">'+location+'</span><br/><b>'+Math.round(this.percentage)
                                +'%</b> (' + this.y + ')';
                });
                $scope.locationChartConfig.options.plotOptions.pie.dataLabels.enabled = false;

                //Origen de la cerveza
                var originCount = transformChartData($scope.myStats.origin, 9);
                $scope.originChartConfig = getBaseChart(originCount, function() {
                    var origin = this.point.name || $translate('stats.others');
                    return '<span style="font-size: 10px">'+origin+'</span><br/><b>'+Math.round(this.percentage)
                                +'%</b> (' + this.y + ')';
                });
            }

            function getBaseChart(data, formatter) {
                return {
                    options: {
                        chart: {
                            reflow: false,
                            height: 250
                        },
                        title: {
                            text: null
                        },
                        plotOptions: {
                            pie: {
                                allowPointSelect: true,
                                cursor: 'pointer',
                                dataLabels: {
                                    enabled: true,
                                    distance: -20
                                },
                                showInLegend: false
                            }
                        },
                        tooltip: {
                            formatter: formatter
                        }
                    },
                    series: [{
                        type: 'pie',
                        name: $translate('stats.amount'),
                        data: data
                    }]
                };
            }



            function transformChartData(data, count) {
                var orderBy = $filter('orderBy');
                
                var sumOthers = 0;
                var result = [];
                angular.forEach(orderBy(data,'-count'), function(value, index) {
                    if ( index < count ) {
                        result.push([value._id,value.count]);
                    } else {
                        sumOthers += value.count;
                    }
                });
                if ( sumOthers > 0 ) {
                    result.push([$translate('stats.others'),sumOthers]);
                }
                return result;
            }

            function loadTableData() {

                $scope.styleTBConfig = {
                    rows: $scope.myStats.styles,
                    headers: [{
                        caption: $translate('beer.data.style'),
                        style: {width: '60%'},
                        value: "{{context.styles[row._id].name}} ({{row._id}})",
                        onClick: function(row) {
                            // $location.path("/beer").search('style._id',row._id);
                            GoTo.style(row._id);
                        }
                    },{
                        caption: $translate('stats.amount'),
                        style: {width: '40%'},
                        value: "{{row.count}}"
                    }],
                    orderBy: 'count',
                    top: 3,
                    bottom: 3
                };

                $scope.styleAvgTBConfig = {
                    rows: $filter("notNull")($scope.myStats.styles,'avg.value'),
                    headers: [{
                        caption: $translate('beer.data.style'),
                        style: {width: '60%'},
                        value: "{{context.styles[row._id].name}} ({{row._id}})",
                        onClick: function(row) {
                            GoTo.style(row._id);
                        }
                    },{
                        caption: $translate('stats.avg'),
                        style: {width: '40%'},
                        value: "{{row.avg.value}} ({{row.count}})"
                    }],
                    orderBy: 'avg.value',
                    top: 3,
                    bottom: 3
                };

                $scope.catTBConfig = {
                    rows: $scope.myStats.categories,
                    headers: [{
                        caption: $translate('beer.data.style'),
                        style: {width: '60%'},
                        onClick: function(row) {
                            // $location.path("/beer").search('category._id',row._id);
                            GoTo.category(row._id);
                        },
                        value: "{{context.categories[row._id].name}} ({{row._id}})"
                    },{
                        caption: $translate('stats.amount'),
                        style: {width: '40%'},
                        value: "{{row.count}}"
                    }],
                    orderBy: 'count',
                    top: 3,
                    bottom: 3
                };

                $scope.catAvgTBConfig = {
                    rows: $filter("notNull")($scope.myStats.categories,'avg.value'),
                    headers: [{
                        caption: $translate('beer.data.style'),
                        style: {width: '60%'},
                        onClick: function(row) {
                            GoTo.category(row._id);
                        },
                        value: "{{context.categories[row._id].name}} ({{row._id}})"
                    },{
                        caption: $translate('stats.avg'),
                        style: {width: '40%'},
                        value: "{{row.avg.value}} ({{row.count}})"
                    }],
                    orderBy: 'avg.value',
                    top: 3,
                    bottom: 3
                };

                $scope.breweriesTBConfig = {
                    rows: $scope.myStats.breweries,
                    headers: [{
                        caption: $translate('beer.data.brewery'),
                        style: {width: '60%'},
                        value: "{{context.breweries[row._id].name}}",
                        onClick: function(row) {
                            GoTo.brewery(row._id);
                        }
                    },{
                        caption: $translate('stats.amount'),
                        style: {width: '40%'},
                        value: "{{row.count}}"
                    }],
                    orderBy: 'count',
                    top: 3,
                    bottom: 3
                };

                $scope.breweriesAvgTBConfig = {
                    rows: $filter("notNull")($scope.myStats.breweries,'avg.value'),
                    headers: [{
                        caption: $translate('beer.data.brewery'),
                        style: {width: '60%'},
                        value: "{{context.breweries[row._id].name}}",
                        onClick: function(row) {
                            GoTo.brewery(row._id);
                        }
                    },{
                        caption: $translate('stats.avg'),
                        style: {width: '40%'},
                        value: "{{row.avg.value}} ({{row.count}})"
                    }],
                    orderBy: 'avg.value',
                    top: 3,
                    bottom: 3
                };

                //Country
                $scope.countryTBConfig = {
                    rows: $scope.myStats.countries,
                    headers: [{
                        caption: $translate('brewery.data.location.address.country'),
                        style: {width: '60%'},
                        value: "{{row._id}}"
                    },{
                        caption: $translate('stats.amount'),
                        style: {width: '40%'},
                        value: "{{row.count}}"
                    }],
                    orderBy: 'count',
                    top: 3,
                    bottom: 3
                };

                $scope.countryAvgTBConfig = {
                    rows: $filter("notNull")($scope.myStats.countries,'avg.value'),
                    headers: [{
                        caption: $translate('brewery.data.location.address.country'),
                        style: {width: '60%'},
                        // onClick: function(row) {
                        //     GoTo.category(row._id);
                        // },
                        value: "{{row._id}}"
                    },{
                        caption: $translate('stats.avg'),
                        style: {width: '40%'},
                        value: "{{row.avg.value}} ({{row.count}})"
                    }],
                    orderBy: 'avg.value',
                    top: 3,
                    bottom: 3
                };

                //Location
                $scope.locationTBConfig = {
                    rows: $scope.myStats.locations,
                    headers: [{
                        caption: $translate('stats.drunkInLocation'),
                        style: {width: '60%'},
                        value: "{{row.location.name}}"
                    },{
                        caption: $translate('stats.amount'),
                        style: {width: '40%'},
                        value: "{{row.count}}"
                    }],
                    orderBy: 'count',
                    top: 3,
                    bottom: 3
                };

                $scope.locationAvgTBConfig = {
                    rows: $filter("notNull")($scope.myStats.locations,'avg.value'),
                    headers: [{
                        caption: $translate('stats.drunkInLocation'),
                        style: {width: '60%'},
                        value: "{{row.location.name}}"
                    },{
                        caption: $translate('stats.avg'),
                        style: {width: '40%'},
                        value: "{{row.avg.value}} ({{row.count}})"
                    }],
                    orderBy: 'avg.value',
                    top: 3,
                    bottom: 3
                };

                //Origin
                $scope.originTBConfig = {
                    rows: $scope.myStats.origin,
                    headers: [{
                        caption: $translate('stats.origin'),
                        style: {width: '60%'},
                        value: "{{row._id}}"
                    },{
                        caption: $translate('stats.amount'),
                        style: {width: '40%'},
                        value: "{{row.count}}"
                    }],
                    orderBy: 'count',
                    top: 3,
                    bottom: 3
                };

                $scope.originAvgTBConfig = {
                    rows: $filter("notNull")($scope.myStats.origin,'avg.value'),
                    headers: [{
                        caption: $translate('stats.origin'),
                        style: {width: '60%'},
                        value: "{{row._id}}"
                    },{
                        caption: $translate('stats.avg'),
                        style: {width: '40%'},
                        value: "{{row.avg.value}} ({{row.count}})"
                    }],
                    orderBy: 'avg.value',
                    top: 3,
                    bottom: 3
                };

            }

            function loadMap(ratings) {

                $scope.changeSource = function() {
                    var list = [];
                    angular.forEach(ratings, function(rating) { 
                        if ( $scope.conf.pointsSource == "rating" ) {
                            if ( rating.location && rating.location.latitude ) {
                                list.push({
                                    latitude: rating.location.latitude,
                                    longitude: rating.location.longitude,
                                    name: rating.location.name,
                                    icon: rating.location.icon,
                                    beer: rating.beer.name,
                                    popup: rating.beer.name + " - " + rating.location.name,
                                    _id: rating._id
                                });
                            }    
                        } else {
                            var brewery = $scope.breweries[rating.beer.brewery];
                            if ( brewery.location && brewery.location.latitude ) {
                                list.push({
                                    latitude: brewery.location.latitude,
                                    longitude: brewery.location.longitude,
                                    name: brewery.location.name,
                                    icon: brewery.location.icon,
                                    beer: brewery.name,
                                    popup: brewery.name + " - " + brewery.location.name,
                                    _id: brewery._id
                                });
                            }
                        }
                    });
                    $scope.map.setPoints(list);
                };

                $scope.conf = {
                    pointsSource: "rating"
                };

                $scope.map = MapFactory.map({
                    fit:true,
                    clusterOptions:{},
                    doCluster: true,
                    events: {
                        tilesloaded: function(map) {
                            $scope.$apply(function() {
                                $scope._map = map;
                            });
                        }
                    }
                });

                $scope.changeSource();
                
            }
    }]);

    stats.directive("tableTopBottom", function() {
        return {
            scope: {
                config: '=',
                context: '=?'
            },
            templateUrl: 'stats/table-top-bottom.html',
            controller: function($scope, $interpolate) {
                $scope.getValue = function (header, row) {
                    if ( header.value instanceof Function ) {
                        return header.value(row);    
                    } else {
                        return $interpolate(header.value)({row:row, context: $scope.context});
                    }
                    
                };
            }
        };
    });

    stats.factory("StatsService", function() {
        return StatsService;
    });

    stats.filter("notNull",['$interpolate', function($interpolate) {
        return function(list, field) {
            var result = [];
            angular.forEach(list, function(v) {
                var value = $interpolate("{{v."+field+"}}")({v:v});
                if ( value ) result.push(v);
            });
            return result;
        };
    }])

    stats.run(['$templateCache',function($templateCache) {
        $templateCache.put("stats-name.html",'<a href="" ng-click="header.onClick(row)">{{context()[row._id].name}}</a>');
    }]);

    return stats;
});