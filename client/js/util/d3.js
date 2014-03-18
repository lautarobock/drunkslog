define([], function() {

    var d3module = angular.module("dl.d3", []);

    d3module.factory("d3Service", function() {
        return window.d3;
    });

    /**
    Based on @see http://www.ng-newsletter.com/posts/d3-on-angular.html
    */
    d3module.directive('d3Bars', function(d3Service, $window) {
        return {
            restrict: 'EA',
            scope: {
                data: '=d3BarsData',
                config: '=d3BarsConfig'
            },
            link: function(scope, ele, attrs) {
                // console.log("config", scope);
                var margin = parseInt(attrs.margin) || 20,
                    barHeight = parseInt(scope.config.bars.thickness) || 20,
                    barPadding = parseInt(scope.config.bars.padding) || 5;

                var svg = d3Service.select(ele[0])
                    .append('svg')
                    .style('border-radius','1em')
                    .style('padding','1em')
                    .style('width', '100%')
                    .style('background', 'white');

                // Browser onresize event
                window.onresize = function() {
                    scope.$apply();
                };

                // Watch for resize event
                scope.$watch(function() {
                    return angular.element($window)[0].innerWidth;
                }, function() {
                    scope.render(scope.data);
                });

                scope.$watch("data",function() {
                   scope.render(scope.data); 
                },true);

                scope.render = function(data) {
                    
                    svg.selectAll('*').remove();

                    // If we don't pass any data, return out of the element
                    if (!data) return;

                    // setup variables
                    var width = d3.select(ele[0]).node().offsetWidth - margin -8,
                        // calculate the height
                        height = data.length * (barHeight),
                        // Use the category20() scale function for multicolor support
                        color = scope.config.bars.color || d3.scale.category20b();
                        // our xScale

                    var getValue = scope.config.data.value;

                    var getText = scope.config.data.text;

                    
                    var x = d3.scale.linear()
                        .range([0, width]);

                    x.domain([0, d3.max(data, function(d) { return getValue(d); })]);

                    // console.log("height", height);
                    svg.attr("height", height);

                    var bar = svg.selectAll("g")
                    .data(data)
                    .enter().append("g")
                    .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

                    bar.append("rect")
                    .attr("fill",function(d) { return color(getValue(d)); })
                    .attr("width", function(d) {
                        return x(getValue(d)); 
                    })
                    .attr("height", barHeight - (barPadding*2));

                    bar.append("text")
                    .attr("fill", "white")
                    .attr("font", "10px sans-serif")
                    .attr("text-anchor","end")
                    .attr("x", function(d,i) {
                        return x(getValue(d)) - 5; 
                    })
                    .attr("y", barHeight / 2 - (barPadding))
                    .attr("dy", ".35em")
                    .text(getText);
                }
            }
        };
    });

});