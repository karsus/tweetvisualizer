# Tweet Visualizer App
http://khoj.me

This application uses the [Express](https://expressjs.com/) framework , [Bootstrap](http://getbootstrap.com/) and [d3.js] (https://d3js.org/) to build a tweet visualization app that is deployed to [AWS EC2](http://aws.amazon.com). The application stores data in [Elastic Search](http://aws.amazon.com/elasticsearch/). Docker image of the app is deployed on ec2.

## Features
1. Live tweets for few locations(US,UK,India) are indexed in elastic search using logstash
2. App provides UI visualization for the tweets. It provides dynamic charts showing top hash tags
3. Data can be explored using charts

## ScreenShots
![alt tag](https://user-images.githubusercontent.com/23145157/58148717-b175fa80-7c14-11e9-9c43-3145bb850dd3.png)
![alt tag](https://user-images.githubusercontent.com/23145157/58148784-f863f000-7c14-11e9-8577-8ab542cf5516.png)
