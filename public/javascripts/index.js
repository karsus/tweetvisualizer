(function() {
    var diameter = screen.width > 1500 ? 960 : 800;
    if (screen.width < diameter) {
        diameter = screen.width - 50;
    }
    var format = d3.format(",d"),
        color = d3.scaleOrdinal(d3.schemeCategory20);
    var tags = {};
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
                getData(true, d.data.name);
            })
            .style("fill", function(d, i) {
                return color(i);
            });

        return node;
    }

    function addTitleText(node) {
        node.append("title")
            .text(function(d) {
                return d.data.name + ": " + d.data.size;
            });
        node.append("a")
            .attr("xlink:href", function(d) {
                return "javascript:void(0)";
            })
            .append("text")
            .attr("dy", ".5em")
            .style("text-anchor", "middle")
            .attr("class", "hyper")
            .style("font-size", function(d) {
                var len = d.data.name.substring(0, d.r / 1.5).length;
                var size = d.r / 1.5;
                size *= 4/ len;
                size += 1;
                return Math.round(size) + 'px';
            })
            .on("click", function(d) {
                getData(true, d.data.name);
            })
            .text(function(d) {
                var display = d.data.name;
                return display.substring(0, d.r / 3);
            });
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
                getData(true, d.data.name);
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
    function visualiseIt(pts, refresh) {
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
        nodeEnter.append("a")
            .attr("xlink:href", function(d) {
                return "javascript:void(0)";
            })
            .append("text")
            .attr("dy", ".5em")
            .style("text-anchor", "middle")
            .attr("class", "hyper")
            .style("font-size", function(d) {
                var len = d.data.name.substring(0, d.r / 1.5).length;
                var size = d.r / 1.5;
                size *= 4 / len;
                size += 1;
                return Math.round(size) + 'px';
            })
            .on("click", function(d) {
                getData(true, d.data.name);
            })
            .text(function(d) {
                var display = d.data.name;
                return display.substring(0, d.r / 3);
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

    function getData(refresh, data, updateBreadCrumb) {
        var url = "/api/results";

        if (data) {
            if (!updateBreadCrumb && tags[data]) {
                $('#myModal').modal('show');
                return;
            };
            var tagsLocal = $.extend({}, tags);
            tagsLocal[data]=true;
            var tagsArray = [];
            $.each(tagsLocal, function(key, value) {
                tagsArray.push(key);
            });


            url = url + "?tag=" + JSON.stringify(tagsArray);
        }

        $.ajax({
            url: url,
            dataType: 'json',
            cache: false,
            success: function(json) {
                if(data){
                    tags[data] = true;
                    if (!updateBreadCrumb) {
                        addBreadCrumb(data, tags);
                    }
                }
                visualiseIt(json, refresh);
                fillTable(json, refresh);
            },
            error: function() {
                alert("Error");
            }
        });
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

    function fillTable(data, refresh) {
        if (refresh) {
            $('#tweetstable').bootstrapTable("load", data.table);
        } else {
            $('#tweetstable').bootstrapTable({
                columns: [

                    {
                        field: 'image',
                        title: 'User',
                        formatter: function(value) {
                            return '<div class="cell"><img src=' + value + '/></div>';
                        }
                    },

                    {
                        field: 'time',
                        title: 'Time',
                        formatter: function(value) {
                            return new Date(value);
                        }
                    },

                    {
                        field: 'text',
                        title: 'Tweet'
                    }
                ],
                formatLoadingMessage: function() {
                    return '<span class="glyphicon glyphicon glyphicon-repeat glyphicon-animate"></span>';
                },
                data: data.table
            });
        }
    }
    getData();

    function updateBreadCrumb(data, parents) {
        tags = $.parseJSON(parents);
        $("ol.breadcrumb li").each(function(index, element) {
            if (element.id !== "hometag" && !tags[element.id]) {
                $(this).remove();
            }

        });
        getData(true, data, true);
    }

    function addBreadCrumb(data, tags) {
        var json = JSON.stringify(tags);
        var href = $('<a/>', {
            text: data,
            id: json,
            href: "#",
            click: function(e, element) {
                updateBreadCrumb($(this).text(), $(this).attr('id'))
            }
        });
        $('<li/>', {
            id: data,
            html: href,
            "class": 'active'
        }).appendTo('.breadcrumb')
    }
    $("#home").on('click', function(e) {
        $("ol.breadcrumb li").each(function(index, element) {
            if (element.id !== "hometag") {
                $(this).remove();
            }

        });
        tags = {};
        getData(true);
    });
})();