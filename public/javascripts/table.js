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
                        field: 'name',
                        title: 'Name',
                        formatter: function(value) {
                            return value;
                        }
                    },

                    {
                        field: 'time',
                        title: 'Time',
                        formatter: function(value) {
                            var options = {
                                weekday: "long",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                            };
                            return new Date(value).toLocaleTimeString('en-US', options);
                        }
                    },

                    {
                        field: 'text',
                        title: 'Tweet',
                        cellStyle:function cellStyle(value, row, index, field) {
                              return {
                                classes: 'word-wrap: break-word;min-width: 160px;max-width: 160px;'
                                
                              };
                            }
                    }
                ],
                formatLoadingMessage: function() {
                    return '<span class="glyphicon glyphicon glyphicon-repeat glyphicon-animate"></span>';
                },
                data: data.table
            });
        }
        checkToHideNameColumn();
    }
   function checkToHideNameColumn(){
        if(screen.width<800){
            $('#tweetstable').bootstrapTable("hideColumn", "name");
        }
    }
    return module;
})();