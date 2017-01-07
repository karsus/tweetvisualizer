var express = require('express');
var Promise = require('promise');
var client = require('../esconnection');
var linkify = require('linkifyjs');
var linkifyHtml = require('linkifyjs/html');

var exports = module.exports = {}
/**
    This module builds queries for elastic search, gets data from es
    and parses results
**/

exports.getSearchResults = function(tag,exclude) {
    return new Promise(function(resolve, reject) {
       
        client.search({
            index: "twitterdata",
            body: getQuery(tag,exclude)
        }).then(function(res) {
            var result = processResults(res);
           
            resolve(result);
        }, function(err) {
            reject(err);
        });
    });

};

function getQuery(tags,exclude) {
    var query = "";
    
    if (tags) {
        var filters = buildTermsQuery(tags);
        if(exclude===true)tags.pop();
        var tagsString=JSON.stringify(tags);
        query = "{ \"size\": 30, \"query\": { \"bool\": { \"must\":" + filters + "} },\n\"aggs\": { \"tags\": { \"terms\": { \"field\":                   \"entities.hashtags.text\", \"size\": 30,\"exclude\":"+tagsString+"} } } }";
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
        obj.text = linkifyHtml(result._source.text);
        obj.time = result._source['@timestamp'];
        obj.name = result._source.user.screen_name;
        obj.image=result._source.user.profile_image_url;
        tableContents.push(obj);
        //console.log(tableContents);
    });
    var uiResults = {};
    uiResults.buckets = buckets;
    uiResults.table = tableContents;
    return uiResults;

}
