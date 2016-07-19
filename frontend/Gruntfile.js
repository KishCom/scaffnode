var execBash = require('child_process').exec;
module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    var localpackage = grunt.file.readJSON('package.json');
    grunt.initConfig({
        localpackage: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: '\n'
            },
            allJavascripts: {
                src: [
                    /* First the libraries your app requires */
                    /* Don't forget! Anything you add to frontend/package.json will have to be added here too */
                    'node_modules/jquery/dist/jquery.js',
                    'node_modules/moment/moment.js',
                    'node_modules/bootstrap/dist/js/bootstrap.js',
                    'node_modules/lodash/lodash.js',
                    /* Another other *globally* used JS */
                    'js/app.js'
                ],
                dest: '../public/media/js/scripts.js'
            }
        },
        uglify: {
            options: {
                banner: "/**\n"+
                        "<%= localpackage.name %> - <%= gitRevisionSHA %><%= gitRevisionDirty %>\n" +
                        "<%= localpackage.description %>\n" +
                        "JavaScript minified on <%= grunt.template.today('dddd, mmmm dS, yyyy, h:MM:ss TT') %>\n" +
                        "**/\n",
                //sourceMap: 'dist/js/scripts.map', // make sure these don't hit live
                //sourceMapName: 'dist/js/scripts.map'
            },
            dist: {
                files: {
                    '../public/media/js/scripts.min.js': ['<%= concat.allJavascripts.dest %>']
                }
            }
        },
        less: {
            development: {
                options: {
                    paths: [""]
                },
                files: {
                    "../public/media/css/style.css": [
                        "less/style.less",
                        "node_modules/bootstrap/dist/css/bootstrap.css",
                        "node_modules/font-awesome/css/font-awesome.css"
                        // Place additional LESS or CSS style sheets here
                    ]
                }
            },
            production: { // Basically just a minifier task - doesn't actually recompile less
                options: {
                    paths: [""],
                    plugins: [
                        new (require('less-plugin-clean-css'))()
                    ],
                },
                files: {
                    "../public/media/css/style.min.css": ["../public/media/css/style.css"]
                }
            }
        },
        copy: {
            images: {
                expand: true,
                filter: 'isFile',
                flatten: true,
                cwd: 'images/',
                src: ['**'],
                dest: '../public/media/images/'
            },
            fonts: {
                expand: true,
                flatten: true,
                filter: 'isFile',
                src: [
                    "fonts/*",
                    "node_modules/font-awesome/fonts/*",
                    "node_modules/bootstrap/dist/fonts/*",
                ],
                dest: '../public/media/fonts/'
            },
            cssMap: {
                src: ["node_modules/bootstrap/dist/css/bootstrap.css.map"],
                dest: '../public/media/css/bootstrap.css.map'
            },
            outdatedBrowser: {
                expand: true,
                cwd: "node_modules/outdated-browser/outdatedbrowser/",
                src: "**",
                dest: "../public/media/outdated-browser/"
            }
        },
        watch: {
            javascript: {
                files: ['js/**/*.js'],
                tasks: ['concat:allJavascripts']
            },
            less: {
                files: ['less/**/*.less'],
                tasks: ['less:development']
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    customAttrSurround: [[/\s*\{%\s*if\s.+?%\}\s*/, /\s*\{%\s*endif\s*%\}\s*/]], // Leave backend nunjucks tags in place
                    minifyJS: true
                },
                expand: true,
                cwd: '../views',
                src: ['**/*.html'],
                dest: '../viewsLive/'
            }
        }
    });

    grunt.registerTask('getGitRevision', function() {
        var done = this.async(); // Tell Grunt this task is async
        execBash("git rev-parse HEAD", function(error, SHA){
            grunt.config('gitRevisionSHA', SHA.replace("\n", ""));
            execBash('git diff --shortstat', function(error2, isDirty){
                isDirty = isDirty.replace("\n", "");
                if (isDirty !== ""){
                    isDirty = "\nDirty build: " + isDirty;
                }else{
                    isDirty = "\nClean build";
                }
                grunt.config('gitRevisionDirty', isDirty);
                done(true);
            });
        });
    });
    grunt.registerTask('default', ['getGitRevision', 'concat', 'htmlmin', 'less:development', 'copy', 'watch']);
    grunt.registerTask('start_app', ['getGitRevision', 'concat', 'htmlmin', 'less:development', 'copy']);
    grunt.registerTask('launch', ['getGitRevision', 'concat', 'htmlmin', 'uglify', 'less', 'copy']);
    grunt.registerTask('build', ['getGitRevision', 'concat', 'htmlmin', 'uglify', 'less', 'copy']);
};
