var express = require('express');
var Promise = require('promise');
var client = require('../esconnection');

var exports = module.exports = {}
/**
    This module builds queries for elastic search, gets data from es
    and parses results
**/

exports.getSearchResults = function(tag) {
    return new Promise(function(resolve, reject) {
        console.log("searchresults");
        client.search({
            index: "twitterdata",
            body: getQuery(tag)
        }).then(function(res) {
            var result = processResults(res);
            console.log(result);
            resolve(result);
        }, function(err) {
            reject(err);
        });
    });

};

function getQuery(tags) {
    var query = "";
    
    if (tags) {
        var filters = buildTermsQuery(tags);
        query = "{ \"size\": 30, \"query\": { \"bool\": { \"must\":" + filters + "} },\n\"aggs\": { \"tags\": { \"terms\": { \"field\":                   \"entities.hashtags.text\", \"size\": 30 } } } }";
    } else {
        query = "{ \"size\": 50, \"query\": { \"bool\": { \"must\": [ { \"term\": { \"lang\": \"en\" } } ] } }, \"sort\": { \"@timestamp\": { \"order\": \"desc\" }}, \"aggs\": { \"tags\": { \"terms\": { \"field\": \"entities.hashtags.text\", \"size\": 30 } } } }"
    }
    console.log(query);
    return query;
}

function buildTermsQuery(tags) {
    var termsFilters = [];
    tags.forEach(function(entry) {
        var termObj = {};
        termObj['entities.hashtags.text'] = entry;
        var obj = {};
        obj.term = termObj;
        termsFilters.push(obj);
    });
    var engLang = {};
    engLang['lang'] = "en";
    var lobj={};
    lobj.term=engLang;
    termsFilters.push(lobj);
    var filters = JSON.stringify(termsFilters);
    return filters
}

function processResults(resp) {
    var buckets = resp.aggregations.tags.buckets;
    var response = resp.hits.hits;
    var tableContents = [];
    response.forEach(function(result) {
      //  console.log(result);
        var obj = {};
        obj.text = result._source.text;
        obj.time = result._source['@timestamp'];
        obj.name = result._source.user.screen_name;
        tableContents.push(obj);
        //console.log(tableContents);
    });
    var uiResults = {};
    uiResults.buckets = buckets;
    uiResults.table = tableContents;
    return uiResults;

}
