var elasticsearch = require('elasticsearch');

var elasticClient = new elasticsearch.Client({  
    host: 'search-karthik-bnsjnlm6couerbfdzerdvt6cbq.us-east-1.es.amazonaws.com:80',
    log: 'info'
});

module.exports=elasticClient;