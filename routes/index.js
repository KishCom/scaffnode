/* Landing page */
exports.index = function (req, res){
    res.render('index', 
                {locals: {
                    title: "Welcome!",
                    content: "This is where we'd pull some dynamic content"
                }, partials: {
                    datetime: new Date().getHours()
                }});
};

/* Landing page for socket.io */
exports.sio_index = function (req, res){
res.render('index', 
            {locals: {
                socketio: true,
                title: "Welcome to socket.io!",
                content: "This is where we'd pull some dynamic content"
            }, partials: {
                datetime: new Date().getHours()
            }});
};