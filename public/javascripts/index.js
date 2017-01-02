(function() {

    var diameter = 800;
    if (screen.width < 800) {
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
    // Visualise the data function 
    function visualiseIt(pts, refresh) {
        if (refresh) {
            svg.selectAll(".node").remove();
        }
        var dataset = processData(pts);
        var bubble = d3.pack(dataset)
            .size([diameter, diameter])
        
            .padding(1.5);
        var nodes = d3.hierarchy(dataset)
            .sort(function(a,b){return a-b})
            .sum(function(d) {
                return d.size;
            });
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

        node.append("title")
            .text(function(d) {
                return d.data.name + ": " + d.data.size;
            });

        node.append("circle")
            .attr("r", function(d) {
                return d.r;
            })
            .style("fill", function(d, i) {
                return color(i);
            });

        node.append("a")
            .attr("xlink:href", function(d) {
                return "javascript:void(0)";
            })
            .append("text")
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .attr("class", "hyper")
            .style("font-size", function(d) {
                var len = d.data.name.substring(0, d.r / 3).length;
                var size = d.r / 3;
                size *= 4 / len;
                size += 1;
                return Math.round(size) + 'px';
            })
            .on("click", function(d) {
                getData(true, d.data.name);
            })
            .text(function(d) {
                var display = d.data.name + ":" + d.data.size;
                return display.substring(0, d.r / 3);
            });
        if (!refresh) {
            d3.select(self.frameElement)
                .style("height", diameter + "px");
        }
    } 
    function getData(refresh, data, updateBreadCrumb) {
        var url = "/api/results";
        if (data) {
            if (!updateBreadCrumb&&tags[data]){             
                $('#myModal').modal('show'); 
                return;
              };
            tags[data] = true;
            var tagsArray = [];
            $.each(tags, function(key, value) {
                tagsArray.push(key);
            });
            if(!updateBreadCrumb){
                addBreadCrumb(data, tags);
            }
            url = url + "?tag=" + JSON.stringify(tagsArray);
        }

        $.ajax({
            url: url,
            dataType: 'json', // Notice! JSONP <-- P (lowercase)
            success: function(json) {
                // do stuff with json (in this case an array)
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
                columns: [{
                        field: 'time',
                        title: 'Time'
                    }, {
                        field: 'name',
                        title: 'User Screen Name'
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
  function updateBreadCrumb(data,parents){
     
      tags=$.parseJSON(parents); 
      console.log(tags);
       $( "ul.breadcrumb li" ).each(function( index,element ) {
            if(element.id!=="hometag" && !tags[element.id] ){
                $(this).remove();
            }
            
      });
      getData(true,data,true);

      
  }
    function addBreadCrumb(data, tags) {
        var json= JSON.stringify(tags);
        var href =$('<a/>', {
            text: data,
            id:json,
            href: "#",
            click: function(e,element) {
               updateBreadCrumb($(this).text(),$(this).attr('id'))
            }
        });
        $('<li/>', {
            id: data,
            html: href,
            "class": 'active'
        }).appendTo('.breadcrumb')     
    }
    $("#home").on('click',function(e){
        $( "ul.breadcrumb li" ).each(function( index,element ) {
            if(element.id!=="hometag"){
                $(this).remove();
            }
            
      });
        tags = {};
        getData(true);
    });
    
    


})();