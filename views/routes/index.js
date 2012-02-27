/* Landing page */
exports.index = function (req, res){
    res.render('index', { title: "Welcome!" });
};

/* Landing page for socket.io */
exports.sio_index = function (req, res){
    res.render('index', { title: "Welcome! Socket.io Setup!" });
};