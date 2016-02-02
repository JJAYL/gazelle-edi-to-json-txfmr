'use strict'

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var multer  =   require('multer');
var fs = require('fs');

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

var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/mydb';
var gfile;
var storage = multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, './uploads');
        },
        filename: function (req, file, callback) {
            gfile = file.fieldname+'-'+Date.now();
            callback(null, gfile);
        }
    });
var upload = multer({ storage : storage}).single('userPhoto');
app.get('/',function(req,res){
    res.sendFile(__dirname + "/index.html");

    MongoClient.connect(url, function(err, db) {
        if(err){
            console.log("unable to connect to the mongoDB server, Error:\n"+ err);
        } else {
            console.log('Connection established to, '+ url);
        }
    });

    

    });
app.post('/api/photo',function(req,res){
    upload(req,res,function(err) {
    if(err) {
        return res.end("Error uploading file.");
    }

    //TODO do a bunch of shit
    fs.readFile('uploads/'+gfile, 'utf8', function (err, data){
        if (err) {
                return console.log(err);
            }
        console.log(data);
        documentedi = data; 
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
        parser.close();
        });
    });
});


app.use(bodyParser());


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

app.post('/translate', function(req, res){


    MongoClient.connect("mongodb://localhost:27017/exampleDb", function(err, db) {
    if(err) { return console.dir(err); }
       // db.collection('test', function(err, collection) {});
       // db.collection('test', {w:1}, function(err, collection) {});
       // db.createCollection('test', function(err, collection) {});
       // db.createCollection('test', {w:1}, function(err, collection) {});
});




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
    parser.close();

});

