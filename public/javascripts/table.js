var table = (function() {
    "use strict";
    var module = {};
    module.fillTable = function(data, refresh) {
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
    return module;
})();