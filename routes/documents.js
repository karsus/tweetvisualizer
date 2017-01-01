var express = require('express');
var router = express.Router();
var client = require('../esconnection');

router.get('/about', function (req, res) {
  res.send('About birds')
});
/*Get top hashtags*/
router.get('/results', function(req,res) {   
    client.search({
        index: "twitterdata",
        body: {
            "size": 20,
            "query": {
                "exists": {
                    "field": "entities.hashtags"
                }
            },
            "sort": {
                "@timestamp": {
                    order: "desc"
                }
            },

            "aggs": {
                "tags": {
                    "terms": {
                        "field": "entities.hashtags.text",
                        "size": 10
                    }
                }
            }
        }
    }).then(function(res) {
        
            res.write(processResults(res));
        

    }, function(err) {
        res.write("Error occured");
    });
  
});

function processResults(resp) {
    var buckets = resp.aggregations.tags;
    var response = resp.hits.hits;
    var tableContents = {};
    response.forEach(function(result) {
        var obj = {};
        obj.text = result.text;
        obj.time = new Date(result.timestamp_ms).toTimeString();
        obj.name = screen_name;
        tableContents.push(obj);
    });
    var uiResult = {};
    uiResults.buckets = buckets;
    uiResults.table = tableContents;
    return uiResults;

}
module.exports = router;
