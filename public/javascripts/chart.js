/**
 This module is responsible for visualizing the data in chart
**/
var chart = (function() {
    "use strict";
    var module = {};
    var diameter = 750;
    var svgresized=false;
    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("color", "white")
        .style("padding", "8px")
        .style("background-color", "rgba(0, 0, 0, 0.75)")
        .style("border-radius", "6px")
        .style("font", "12px sans-serif")
        .text("tooltip");
  
    var tableSize = $('#tweetstable').width();
    if(tableSize<diameter){
        diameter=tableSize;
    }
    var adjusth=200;
    var svgh=diameter>700?200:0;
    var format = d3.format(",d"),
        color = d3.scaleOrdinal(d3.schemeCategory20);
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", diameter)
        .attr("height", diameter-svgh)
        .attr("class", "bubble");

    function isTouchDevice() {
        return true == ("ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch);
    }

    function buildNode(bubble, nodes, refresh) {
        var node = svg.selectAll(".node")
            .data(bubble(nodes).descendants())
            .enter()
            .filter(function(d) {
                return !d.children
            })
            .append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        node.append("circle")
            .attr("r", function(d) {
                return d.r;
            })
            .on("mouseover", function(d) {
                if (!isTouchDevice()) {
                    tooltip.text(d.data.name + ": " + format(d.data.size));
                    tooltip.style("visibility", "visible");
                }
            })
            .on("mousemove", function() {
                return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                return tooltip.style("visibility", "hidden");
            })
            .on("click", function(d) {
                tooltip.style("visibility", "hidden")
                main.getData(true, d.data.name);
            })
            .style("fill", function(d, i) {
                return color(i);
            });

        return node;
    }

    function addTitleText(node) {
        node.append("a")
            .attr("xlink:href", function(d) {
                return "javascript:void(0)";
            })
            .append("text")
            .on("click", function(d) {
                main.getData(true, d.data.name);
            })
            .attr("class", "hyper")
            .text(function(d) {
                return d.data.name.substring(0, d.r / 3);
            })
            .style("font-size", function(d) {
                return Math.min(2 * d.r, (2 * d.r - 12) / this.getComputedTextLength() * 14) + "px";
            })
            .style("text-anchor", "middle")
            .attr("dy", ".35em");

    }

    function updateNode(bubble, nodes) {
        var obj = {};
        var node = svg.selectAll(".node")
            .data(
                bubble(nodes).children);
        var nodeEnter = node.enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        // re-use enter selection for circles
        nodeEnter
            .append("circle")
            .on("click", function(d) {
                tooltip.style("visibility", "hidden")
                main.getData(true, d.data.name);
            })
            .attr("r", function(d) {
                return d.r;
            })
            .on("mouseover", function(d) {
                if (!isTouchDevice()) {
                    tooltip.text(d.data.name + ": " + format(d.data.size));
                    tooltip.style("visibility", "visible");
                }
            })
            .on("mousemove", function() {
                return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                return tooltip.style("visibility", "hidden");
            })
            .style("fill", function(d, i) {
                return color(i);
            })

        obj.node = node;
        obj.nodeEnter = nodeEnter;
        return obj;
    }

    // Visualise the data function 
    module.visualizeChart = function(pts, refresh) {
        if (refresh) {
            svg.selectAll(".hyper").remove();
            svg.selectAll("a").remove();
        }
        var dataset = processData(pts);
        var bsize = diameter-adjusth;
        if (pts.buckets.length === 1&& diameter>700) {
            bsize = diameter - (adjusth+100);
            svg.attr("height", diameter-(adjusth+100));
            svgresized=true;
        }else if(svgresized){
            svg.attr("height", diameter-adjusth);
        }
        var bubble = d3.pack(dataset)
            .size([bsize, bsize])
            .padding(1.5);
        var nodes = d3.hierarchy(dataset)
            .sum(function(d) {
                return d.size;
            })
            .sort(function(a, b) {
                return b.value - a.value;
            });

        if (refresh) {
            // capture the enter selection
            var obj = updateNode(bubble, nodes);
            addTitleText(obj.nodeEnter);
            addTitleText(obj.node);
            animateChanges(obj.nodeEnter, obj.node)
        } else {
            var node = buildNode(bubble, nodes);
            addTitleText(node);
            d3.select(self.frameElement)
                .style("height", diameter + "px");

        }

    }

    function animateChanges(nodeEnter, node) {
        // re-use enter selection for titles
        node.select("circle")
            .transition().duration(1000)
            .attr("r", function(d) {
                return d.r;
            })
            .style("fill", function(d, i) {
                return color(i);
            });

        node.transition().attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        node.exit().remove();

    }

    function processData(data) {
        if (!data) return;
        var buckets = data.buckets;
        var newDataSet = [];
        buckets.forEach(function(entry) {
            newDataSet.push({
                name: entry.key,
                size: entry.doc_count
            });
        });
        return {
            children: newDataSet
        };
    }
    return module;
})();