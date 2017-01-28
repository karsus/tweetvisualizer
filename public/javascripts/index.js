/**
 This module is main one which is responsible to get data from server and give it to chart and table module
 This module also maintains state of breadcrumbs
**/
var main = (function() {
    'use strict';
    var module = {};
    var tags = {};
    var hash = "";
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
            url = url + "?tag=" + JSON.stringify(tagsArray) + "&lfilter=" + hash;
        } else {
            url = url + "?lfilter=" + hash;
        }

        if (refresh) {
            $(".se-pre-con").fadeIn("slow");
        }
        $.ajax({
            url: url,
            dataType: 'json',
            cache: false,
            success: function(json) {
                $(".se-pre-con").fadeOut("slow");;
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
    $(document).ready(function() {
        addActiveClass();
        module.getData();
        hookupNavClick();
    });

    function hookupNavClick() {
        $('.nav-sidebar').click(function(e) {
            if (hash === window.location.hash.substr(1)) {
                addActiveClass();
                resetBreadCrumb();
                e.preventDefault();
            }
        });
    }

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

    function resetBreadCrumb() {
        $("ol.breadcrumb li").each(function(index, element) {
            if (element.id !== "hometag") {
                $(this).remove();
            }

        });
        tags = {};
        main.getData(true);
    }
    $("#home").on('click', function(e) {
        resetBreadCrumb();
    });

    function addActiveClass() {
        var hashVal = window.location.hash.substr(1);
        switch (hashVal) {
            case "US":
                hash = "US";
                break;
            case "UK":
                hash = "UK";
                break;
            case "IN":
                hash = "IN";
                break;
            default:
                hash = "All";
        }
        $('.nav-sidebar li.active').removeClass('active');
        var $this = $("#" + hash);
        if (!$this.hasClass('active')) {
            $this.addClass('active');
        }

    }

    $(window).bind('hashchange', function() {
        addActiveClass();
        resetBreadCrumb();
    });
    return module;
})()