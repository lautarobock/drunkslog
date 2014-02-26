var model = require('../domain/model.js');
var mongoose = require('mongoose');
var activity = require("./activity.js");

exports.count = function(req, res) {
    var filter = null;
    if ( req.query.brewery ) {
        filter = filter||{};
        filter.brewery = req.query.brewery;
    }
    console.log(filter);
    model.Beer.count(filter)
        .exec(function(err,results) {
            console.log(results);
            res.send({count:results});
    });    
};

exports.findAll = function(req, res) {
    var filter = null;
    if ( req.query.brewery ) {
        filter = filter||{};
        filter.brewery = req.query.brewery;
    }
    model.Beer.find(filter)
        .limit(req.query.limit)
        .skip(req.query.skip)
        .sort(req.query.sort)
        .populate('style')
        .populate('styleByLabel')
        .populate('brewery')
        .populate('category')
        .exec(function(err,results) {
            res.send(results);
    });    
};

exports.save = function(req, res) {
    delete req.body._id;
    var isNew = false;
    var now = new Date();
    req.body.updateDate = now;
    if ( !req.body.version || req.body.version.length == 0 ) {
        isNew = true;
        req.body.version = [{
            number: 1,
            user_id: req.session.user_id,
            timeStamp: now,
            user_name: req.session.user_name
        }];
        req.body.creationDate = now;
        req.body.createdBy = req.session.user_id;
    } else {
        var oldV = req.body.version[req.body.version.length-1];
        req.body.version.push({
            number: oldV.number+1,
            user_id: req.session.user_id,
            timeStamp: now,
            user_name: req.session.user_name
        });
    }

    req.body.category = req.body.style.substr(0,2);
    model.Beer.findByIdAndUpdate(req.params.id,req.body,{upsert:true})
        .exec(function(err,results) {
            var user = {
                _id: req.session.user_id,
                name: req.session.user_name
            }
            if ( isNew ) {
                activity.newBeer(user, results);
            } else {
                activity.updateBeer(user, results);
            }
            res.send(results);
        }
    );
};

exports.findById = function(req, res) {
    var query = model.Beer.findOne({_id:req.params.id});
    if ( req.query.populate ) {
        query.populate('styleByLabel')
        query.populate('style')
        query.populate('brewery')
        query.populate('category')
    }
    query.exec(function(err,results) {
        res.send(results);
    });  
};