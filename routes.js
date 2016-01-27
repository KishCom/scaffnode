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
        results = results.reverse();
        var User = req.user ? JSON.stringify( utils.cleanUserDoc(req.user) ) : "false"; // The Angular frontend will parse this JSON object on app-load as the currently logged in user
        res.render("base", { title: req.__("Welcome!"), "all_scaffnode_model": JSON.stringify(results), "User": User });
    });
};

/* User Routes */
Routes.prototype.newUser = function (req, res){
    var error = false;
    var errorMessage, onField = "";
    if (!req.body.name){
        error = true;
        errorMessage = "Please enter your full name";
        onField = "name";
    }
    if (!req.body.email){
        error = true;
        errorMessage = "Please enter your email address";
        onField = "email";
    }
    if (!req.body.password){
        error = true;
        errorMessage = "Please enter a password";
        onField = "password";
    }else{
        if (req.body.password.length < 8){
            error = true;
            errorMessage = "Please enter a password that is at least 8 characters or longer";
            onField = "password";
        }
        if (req.body.password.length > 128){
            error = true;
            errorMessage = "Please enter a password that is not longer then 128 characters";
            onField = "password";
        }
    }
    var responseJSON = {"error":true,"message": "Validation failed", "errors":{}};
    if (error){
        responseJSON.errors[onField] = {"message": req.__(errorMessage),
                                        "name": "ValidatorError",
                                        "path": onField,
                                        "type": "manual",
                                        "value": req.body[onField]
                                    };
        res.status(400).json(responseJSON);
        return;
    }

    var newUser = new Users({
        "name": req.body.name,
        "email": req.body.email,
        "password": req.body.password,
        "lang": req.getLocale()
    });

    newUser.validate(function(err){
        if (err){
            res.status(400).json({"error": true, "message": err.message, "errors": err.errors});
        }else{
            newUser.save(function(err, content, numberAffected){
                if (err){
                    if (err.code){
                        if (err.code === 11000){
                            responseJSON.errors.email = {"message": req.__("The email address has already been used"),
                                        "name": "ValidatorError",
                                        "path": "email",
                                        "type": "manual",
                                        "value": req.body.email
                                    };
                            res.status(400).json(responseJSON);
                        }else{
                            log.error(err);
                            res.status(500).json({"error": true, "critical": true, "message": req.__("An unexpected error has occurred, please try again later")});
                        }
                    }else{
                        log.error(err);
                        res.status(500).json({"error": true, "critical": true, "message": req.__("An unexpected error has occurred, please try again later")});
                    }
                }else{
                    // After "coming soon", have users be auto-logged in. Remove the following 2 lines and uncomment the block under those.
                    // TODO: Email thanks after email is setup properly
                    /*if (!config.isTestMode){
                        var emailUser = utils.cleanUserDoc(newUser);
                        var thanksEmail = config.nunjucks.render("emails/thankYou-"+req.getLocale()+".html", {"user": emailUser});
                        utils.sendEmail(newUser.email, thanksEmail, (newUser.name + ", " + req.__("thank you for registering!")), function(err, sendInfo){
                            if (err){
                                log.error(err);
                            }else{
                                log.trace(sendInfo);
                            }
                        });
                    }else{
                        log.trace("Skip sending signup email in test mode");
                    }*/

                    // Automatically log the newly signed up user in.
                    req.logIn(content, function(err){
                        if (err) { log.error(err); }
                        content = utils.cleanUserDoc(content);
                        res.status(201).json({"error": false, "message": "Content saved.", "content": content});
                    });
                }
            });
        }
    });
};
Routes.prototype.logout = function (req, res){
    req.logout();
    res.redirect('/');
};

// TODO/COMING-VERY-SOON: Forgot password

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
    model.find({}).skip(req.query.gofrom).limit(req.query.limit).exec(function(err, results){
        if (err){
            log.error(err);
            next();
        }
        results = results.reverse();
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
