var model = require('../domain/model.js');
var mongoose = require('mongoose');
var mongoutil = require("./util/mongoutil.js");
var async = require("async");

exports.save = function(req, res) {
    delete req.body._id;
    var id = req.params.id;
    req.body.user = req.session.user_id;
    model.VintageCellar.findByIdAndUpdate(id,req.body,{upsert:true}).exec(function(err,results) {
        res.send(results);
    });
};

exports.findAll = function(req, res) {
    var query = model.VintageCellar.find({user:req.session.user_id},{'__v':0});
    query.populate('beer');
    query.exec(function(err,results) {
        res.send(results);
    });
};

// exports.clearZeros = function(req, res) {
//     console.log("RRRRR",req.session.user_id);
//     model.Cellar.find({user:req.session.user_id, amount:0}).remove(function(err,resp) {
//         console.log("ERR",resp);
//         res.send();
//     });
// };
