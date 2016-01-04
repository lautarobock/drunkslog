var model = require('../domain/model.js');
var mongoose = require('mongoose');

function createRest(service, customId) {
    return {
        findAll: function(req, res) {
            // console.log("INFO", "findAll");
            model[service].find().exec(function(err,results) {
                if ( err ) {
                    res.send(err);
                } else {
                    res.send(results);
                }
            });
        },
        save: function(req, res) {
            // console.log("INFO", "save");
            delete req.body._id;
            var id;
            if ( customId ) {
                id = req.params.id;
            } else {
                id = new mongoose.Types.ObjectId(req.params.id);
            }
            model[service].findByIdAndUpdate(id,req.body,{upsert:true}).exec(function(err,results) {
                res.send(results);
            });
        },
        remove: function(req, res) {
            // console.log("INFO", "remove");
            model[service].findByIdAndRemove(req.params.id,function(err,results) {
                res.send(results);
            });
        },
        findById: function(req, res) {
            // console.log("INFO", "findById");
            model[service].findOne({_id:req.params.id}, {'__v':0},function(err,results) {
                res.send(results);
            });
        }
    };
}

exports.createAndBind = function(name, customId, app, path, security) {
    var rest = exports.create(name, customId);
    exports.bind(name, rest, app, path, security);
};

exports.create = function(name, customId) {
    return createRest(name, customId);
};

exports.bind = function(name, rest, app, path, security) {
    security = security || {};
    path = path || '';
    app.get('/' + path + name+ "/:id", rest.findById)
    app.get('/' + path + name, rest.findAll);
    app.post('/' + path + name + "/:id", security.save || [], rest.save);
    app.post('/' + path + name, security.save || [], rest.save);
    app.delete('/' + path + name + "/:id", rest.remove);
};
