let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
//let uriUtil = require('mongodb-uri');

//var mongodbUri ="mongodb+srv://Xue:ajdxmn12138@myproject-xhpdr.mongodb.net/novels??retryWrites=true&w=majority";

//mongoose.connect(mongodbUri);

mongoose.connect('mongodb://localhost:27017/novels');

let novels = mongoose.connection;

novels.on('error', function (err) {
    console.log('Unable to Connect to [ ' + novels.name + ' ]', err);
});

novels.once('open', function () {
    console.log('Successfully Connected to [ ' + novels.name + ' ]');
});

module.exports = router;