var elasticsearch = require('elasticsearch');

var elasticClient = new elasticsearch.Client({  
    host: 'xxxx',
    log: 'info'
});

module.exports=elasticClient;
