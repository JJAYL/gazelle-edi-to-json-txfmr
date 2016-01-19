'use strict'

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/test';

let edifact = require('../index.js');
let validator = new edifact.Validator();
let parser = new edifact.Parser(validator);
validator.define(require('../segments.js'));
validator.define(require('../elements.js'));

var documentedi;

let result;
let elements;
let components;
let mydata = "{";


app.use(bodyParser());

app.get('/', function (req, res) {
    var html = '<form action = "translate" method = "post">' +
               '<textarea name = "content" rows="50" cols="50">' +
               '</textarea>' +
               '<input type = "submit" value = "translate">' +
               '</form>';
    res.send(html);
});




app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

app.post('/translate', function(req, res){
    documentedi = req.body.content;
    documentedi = documentedi.replace(/(?:\r\n|\r|\n)/g, '');
    console.log("\n\ndocumentedi\n\n "+ documentedi);
    parser.onopensegment = function (segment) {
        elements = [];
        result.push({ name: segment, elements: elements });
    }
    
    parser.onelement = function () {
        components = [];
        elements.push(components);
    }

    parser.oncomponent = function (value) {
        components.push(value);
    }

    result = [];
    parser.write(documentedi);
    for (let i = 0; i < result.length; i++) {
        mydata += '"' + result[i].name + '": [' + result[i].elements + "]";
        console.log('"' + result[i].name + '": [' + result[i].elements + "]");
    }
    mydata += "}"

    var html = mydata + '<br>' +
               '<a href="/">Try again.</a>';
    console.log("documentedi \n"+ documentedi+ "\njson\n" +mydata);
    res.send(html);
});

