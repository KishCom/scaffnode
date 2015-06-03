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
    model.examplemodel.find({}, function(err, results){
        if (err){
            log.error(err);
            next();
            return;
        }
        res.render("base", { title: req.__("Welcome!"), "all_scaffnode_model": JSON.stringify(results) });
    });
};

/* Example CRUD routes */
// Create
Routes.prototype.create = function (req, res){
    // Some validations, you'll probably want to do more
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
        return;
    }

    var newItem = model.examplemodel.create({
        "name": validator.escape(req.body.name),
        "content": validator.escape(req.body.content),
        "ip": req.ip,
        "ua": req.headers["user-agent"]
    }, function(err, content){
        if (err){
            log.error(err);
            res.status(500).json({"error": true, "message": ("Save to database error.")});
        }else{
            res.status(201).json({"error": false, "message": "Content saved.", "content": [content]});
        }
    });
};

// Read
Routes.prototype.read = function (req, res, next){
    var error = false;
    var message = "";
    if (!validator.isNumeric(req.query.gofrom)){
        req.query.gofrom = 0;
    }
    if (!validator.isNumeric(req.query.limit)){
        req.query.limit = 100;
    }else{
        if (req.query.limit > 500){
            req.query.limit = 500;
            message = "Warning: requested limit too high -- capped to 500.";
        }
        if (req.query.limit <= 0){
            req.query.limit = 1;
            message = "Warning: requested limit too low -- set to 1.";
        }
    }
    // Actually get the data now
    model.examplemodel.find({ skip: req.query.gofrom,
                 limit: req.query.limit },
        function(err, results){
            if (err){
                log.error(err);
                res.status(500).json({error: true, "message": "Problem reading from DB." });
            }
            res.json({error: false, "message": message, "content": results });
        });
};

// Update
Routes.prototype.update = function (req, res){
    // Some validations, you'll probably want to do more
    var error = false;
    var errorMessage = "";
    // Make sure we have the id to update
    if (!req.body.scaffnodeId){
        error = true;
        errorMessage = "Missing scaffnodeId";
    }
    // Make sure it's a valid kind of ID for our db
    if (String(req.body.scaffnodeId).match(/^[a-f\d]{24}$/i) === null){
        error = true;
        errorMessage = "Invalid scaffnodeId";
    }
    // In this simple case we're requring both "name" and "content" to update
    if (!req.body.name){
        error = true;
        errorMessage = "Missing name";
    }
    if (!req.body.content){
        error = true;
        errorMessage = "Missing content";
    }

    // If we had any errors, pass them now and return
    if (error){
        res.status(400).json({"error": true, "message": ("Bad request. " + errorMessage)});
        return;
    }

    // Lookup the id
    model.findById(req.body.scaffnodeId, function (err, content){
        if (err){
            log.error(err);
            res.status(500).json({"error": true, "message": ("Look up content for update database error.")});
        }else{
            // null means there is no document with that id
            if (content === null){
                res.status(500).json({"error": true, "message": ("Cannot find content with that id.")});
            }else{
                // We have the document. Set the new content. We could have done this all with a mongoose.update command instead of findById(), then model.save().
                content.name = req.body.name;
                content.content = req.body.content;
                content.save(function(err, content){
                    if (err){
                        log.error(err);
                        res.status(500).json({"error": true, "message": ("Saving update to database error.")});
                    }else{
                        res.status(200).json({"error": false, "message": "Content updated.", "content": content});
                    }
                });
            }
        }
    });
};

// Delete
Routes.prototype.remove = function (req, res){
    // Some validations, you'll probably want to do more
    var error = false;
    var errorMessage = "";
    if (!req.body.scaffnodeId){
        error = true;
        errorMessage = "Missing scaffnodeId";
    }
    if (String(req.body.scaffnodeId).match(/^[a-f\d]{24}$/i) === null){
        error = true;
        errorMessage = "Invalid scaffnodeId";
    }
    if (error){
        res.status(400).json({"error": true, "message": ("Bad request. " + errorMessage)});
        return;
    }

    model.remove({"_id": req.body.scaffnodeId}, function(err){
        if (err){
            log.error(err);
            res.status(500).json({"error": true, "message": ("Remove from database error.")});
        }else{
            res.status(200).json({"error": false, "message": "Content removed.", "_id": req.body.scaffnodeId});
        }
    });
};

/* Fill in backend variables for the frontend templates */
Routes.prototype.frontendTemplates = function (req, res){
    res.render("templates.js.html", { title: req.__("Welcome!") }, function(err, html){
        res.set("Content-Type", "application/javascript");
        res.send(html);
    });
};

module.exports = Routes;
