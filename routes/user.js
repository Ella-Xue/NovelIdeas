let User = require('../models/user');
let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/novels');



router.editPassword = (req,res)=>{

    User.findById(req.params.id, function(err,user) {
        var newpassword = req.body.password;
        if (err)
            res.json({ message: 'User NOT Found!', errmsg : err } );
        else if(user.password == newpassword){
            res.json({ message: 'No change to the Password', data: user} );
        }
        else {
            user.password = newpassword;
            user.save(function (err) {
                if (err)
                    res.json({ message: 'Password Not changed!', errmsg : err } );
                else
                    res.json({ message: 'Password Successfully changed!', data: user });
            });
        }
    });
}

router.register = (req,res) => {
    res.setHeader('Content-Type', 'application/json');

    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;


    if( username == ''){
        res.json({ message: 'The username can not be empty'} );
        return;
    }
    if( password == ''){
        res.json({ message: 'The password can not be empty'} );
        return;
    }
    if( email == ''){
        res.json({ message: 'The email can not be empty'} );
        return;
    }
    User.findOne({
        username:username
    },function (err, info) {
        if(info){
            res.json({ message: 'The username is occupied',errmsg : err} );
            return;
        }
        var user = new User({
            username: username,
            password: password,
            email:email
        });
        user.save(function(err) {
            if (err)
                res.json({ message: 'User Not Registered', errmsg : err } );
            else
                res.json({ message: 'User Successfully registered', data: user });
        });
    });

}

router.login = (req,res) => {
    res.setHeader('Content-Type', 'application/json');

    var username = req.body.username;
    var password = req.body.password;

    if(password == ''|| username==''){
        res.json({ message: 'The username or password  can not be empty'} );
        return
    }
    User.findOne({
        username:username
    },function (err, user) {
        if(user){
            if(user.password == password){
                res.json({ message: 'Sign in Successfully',data:user});
                return;
            }
            res.json({ message: 'Wrong Password'});
        }
        else{
            res.json({ message: 'Username is not exist'});
        }

    });
}

router.userInfo = (req, res) => {

    res.setHeader('Content-Type', 'application/json');

    User.find({ "_id" : req.params.id },function(err, user) {
        if (err)
            res.json({ message: 'User NOT Found!', errmsg : err } );
        else
            res.send(JSON.stringify(user,null,10));
    });
}
module.exports = router;