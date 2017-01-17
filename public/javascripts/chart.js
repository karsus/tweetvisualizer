/**
 This module is responsible for visualizing the data in chart
**/
var chart = (function() {
    "use strict";
    var module = {};


    var diameter = screen.width > 1500 ? 960 : 800;
    if (screen.width < diameter) {
        diameter = screen.width - 50;
    }
    var format = d3.format(",d"),
        color = d3.scaleOrdinal(d3.schemeCategory20);
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .attr("class", "bubble");

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
            .on("click", function(d) {
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
                return d.data.name;
            })
            .style("font-size", function(d) {
                return Math.min(2 * d.r, (2 * d.r - 8) / this.getComputedTextLength() * 12) + "px";
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
                main.getData(true, d.data.name);
            })
            .attr("r", function(d) {
                return d.r;
            })
            .style("fill", function(d, i) {
                return color(i);
            });
        obj.node = node;
        obj.nodeEnter = nodeEnter;
        return obj;
    }

    // Visualise the data function 
    module.visualizeChart = function(pts, refresh) {
        if (refresh) {
            svg.selectAll(".hyper").remove();
            svg.selectAll("a").remove();
            svg.selectAll("title").remove();
        }
        var dataset = processData(pts);
        var bubble = d3.pack(dataset)
            .size([diameter, diameter])
            .padding(1.5);
        var nodes = d3.hierarchy(dataset)
            .sort(function(a, b) {
                return b.data.size - a.data.size
            })
            .sum(function(d) {
                return d.size;
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
        nodeEnter
            .append("title")
            .text(function(d) {
                return d.data.name + ": " + format(d.data.size);
            });

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