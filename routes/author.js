let Author = require('../models/author');
let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/novels');

router.findAll = (req, res) => {
    // Return a JSON representation of our list
    res.setHeader('Content-Type', 'application/json');

    Author.find(function(err, author) {
        if (err)
            res.send(err);

        res.send(JSON.stringify(author,null,10));
    });
}

router.findOne = (req, res) => {

    res.setHeader('Content-Type', 'application/json');

    Author.find({ "_id" : req.params.id },function(err, author) {
        if (err)
            res.json({ message: 'Author NOT Found!', errmsg : err } );
        else
            res.send(JSON.stringify(author,null,10));
    });

}

router.addAuthor = (req, res) => {

    res.setHeader('Content-Type', 'application/json');

    var name = req.body.name;
    var keyword1 = req.body.keyword1;
    var keyword2 = req.body.keyword2;
    var numofbooks = req.body.numofbooks;

    if( name == ''){
        res.json({ message: 'The author name can not be empty'} );
        return;
    }

    Author.findOne({
        name:name
    },function (err, info) {
        if(info){
            res.json({ message: 'The author is already exist',errmsg : err} );
            return;
        }
        var author = new Author({
            name: name,
            keyword1: keyword1,
            keyword2: keyword2,
            numofbooks:numofbooks
        });
        author.save(function(err) {
            if (err)
                res.json({ message: 'Author not added', errmsg : err } );
            else
                res.json({ message: 'Author Successfully added', data: author });
        });
    });
}

router.collectAuthor = (req, res) => {
    var author = getByValue(author,req.params.id);

    if (author != null) {
        author.numofcollected += 1;
        res.json({status : 200, message : 'Collected Successful' , author : author });
    }
    else
        res.send('Author NOT Found - collect NOT Successful!!');
}
router.collectAuthor = (req, res) => {

    Author.findById(req.params.id, function(err,author) {
        if (err)
            res.json({ message: 'Author NOT Found!', errmsg : err } );
        else {
            author.numofcollected += 1;
            author.save(function (err) {
                if (err)
                    res.json({ message: 'Author is not being collected', errmsg : err } );
                else
                    res.json({ message: 'Author Successfully collected!', data: author });
            });
        }
    });
}

router.removeCollection = (req, res) => {

    Author.findByIdAndRemove(req.params.id, function(err) {
        if (err)
            res.json({ message: 'Author NOT Found!', errmsg : err } );
        else
            res.json({ message: 'Author Successfully Deleted!'});
    });
}


module.exports = router;