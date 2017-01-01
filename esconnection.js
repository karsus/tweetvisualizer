var elasticsearch = require('elasticsearch');

var elasticClient = new elasticsearch.Client({  
    host: 'localhost:9200',
    log: 'info'
});

module.exports=elasticClient;