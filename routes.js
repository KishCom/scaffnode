var log, self, model;
var validator = require('validator');
var Routes = function(app, bunyan, appModels){
    self = app;
    log = bunyan;
    model = appModels;
};

/* Landing page */
Routes.prototype.index = function (req, res, next){
    // Get data stick on to the window object for angular (limit to 100 results)
    model.find({}).limit(100).exec(function(err, results){
        if (err){
            log.error(err);
            next();
        }
        res.render("base", { title: req.__("Welcome!"), "all_scaffnode_model": JSON.stringify(results) });
    });
};
Routes.prototype.create = function (req, res){
    var error = false;
    var errorMessage = "";

    if (!req.body.name){
        error = true;
        errorMessage = "Missing name";
    }
    if (!req.body.content){
        error = true;
        errorMessage = "Missing content";
    }

    if (error){
        res.status(400).json({"error": true, "message": ("Bad request. " + errorMessage)});
    }else{
        var newItem = new model({
            "name": validator.escape(req.body.name),
            "content": validator.escape(req.body.content),
            "ip": req.ip,
            "ua": req.headers["user-agent"]
        });
        newItem.save(function(err, content, numberAffected){
            if (err){
                log.error(err);
                res.status(500).json({"error": true, "message": ("Save to database error.")});
            }else{
                res.status(201).json({"error": false, "message": "Content saved.", "content": content});
            }
        });
    }
};
Routes.prototype.update = function (req, res){
    res.status(501).json({"error": true, "message": "Update not implemented yet."});
};
Routes.prototype.remove = function (req, res){
    res.status(501).json({"error": true, "message": "Remove implemented yet."});
};
module.exports = Routes;