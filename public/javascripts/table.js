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
                            var options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
                            return new Date(value).toLocaleTimeString('en-US', options);
                        }
                    },

                    {
                        field: 'text',
                        title: 'Tweet',
                        width:"70%"
                    }
                ],
                formatLoadingMessage: function() {
                    return '<span class="glyphicon glyphicon glyphicon-repeat glyphicon-animate"></span>';
                },
                data: data.table
            });
        }
    }
    
    function format_time(date_obj) {
  // formats a javascript Date object into a 12h AM/PM time string
  var hour = date_obj.getHours();
  var minute = date_obj.getMinutes();
  var amPM = (hour > 11) ? "pm" : "am";
  if(hour > 12) {
    hour -= 12;
  } else if(hour == 0) {
    hour = "12";
  }
  if(minute < 10) {
    minute = "0" + minute;
  }
  return hour + ":" + minute + amPM;
}
    return module;
})();