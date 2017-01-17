/**
 This module is main one which is responsible to get data from server and give it to chart and table module
 This module also maintains state of breadcrumbs
**/
var main = (function() {
    'use strict';
    var module = {};
    var tags = {};
    module.getData = function(refresh, data, updateBreadCrumb) {
        var url = "/api/results";
        if (data) {
            if (!updateBreadCrumb && tags[data]) {
                $('#myModal').modal('show');
                return;
            };
            var tagsLocal = $.extend({}, tags);
            tagsLocal[data] = true;
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
                if (data) {
                    tags[data] = true;
                    if (!updateBreadCrumb) {
                        addBreadCrumb(data, tags);
                    }
                }
                chart.visualizeChart(json, refresh);
                table.fillTable(json, refresh);
            },
            error: function() {
                alert("Error");
            }
        });
    }

    module.getData();
    function updateBreadCrumb(data, parents) {
        tags = $.parseJSON(parents);
        $("ol.breadcrumb li").each(function(index, element) {
            if (element.id !== "hometag" && !tags[element.id]) {
                $(this).remove();
            }

        });
        module.getData(true, data, true);
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
        main.getData(true);
    });
    return module;
})()