var ams = require('ams');
var sys = require('sys')
var exec = require('child_process').exec;

var ROOT_DIR = __dirname + '/public/media',
    CSS_DIR = ROOT_DIR + '/css',
    JS_DIR = ROOT_DIR + '/js',
    HOST_NAME = 'http://localhost:8888';

// public/media/css/style.less is the main styles file
// Here we parse style.less into style.css - the dev server does this with middleware
var runless = 'lessc ' + CSS_DIR + '/style.less > ' + CSS_DIR + '/style.css';
exec(runless, function(error, stdout, stderr){
	console.log(stdout);
	runBuild();
});

function runBuild(){
    ams.build.create(ROOT_DIR)
    .add(
     [CSS_DIR + '/style.css',
     JS_DIR + '/ender.min.js',
//     JS_DIR + '/your_app.js']
)
    .process({
    	cssvendor: false, // Less takes care of vendor specific prefixes
        cssabspath: {
            host: HOST_NAME,
            verbose: true
        },
        htmlabspath: {
            host: HOST_NAME,
            verbose: true
        },
        texttransport: false,
        jstransport: false, // Don't wrap our JS in anything
        uglifyjs: {
            verbose: true
        }
    })
    .combine({ // Combine all js and css files
        js: 'app.min.js',
        css: 'app.min.css'
    })
    .write(ROOT_DIR) // Write them to disk
    .end();
}
