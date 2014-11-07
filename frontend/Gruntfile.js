module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-git-describe');
    grunt.loadNpmTasks('grunt-inline-angular-templates');
    grunt.loadNpmTasks('grunt-uncss');
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
                /* Don't forget! Anything you add to bower.json will have to be added here too */
                'bower_components/jquery/dist/jquery.js',
                'bower_components/angular/angular.js',
                'bower_components/moment/moment.js',
                'bower_components/angular-animate/angular-animate.js',
                'bower_components/angular-route/angular-route.js',
                'bower_components/angular-cookies/angular-cookies.js',
                'bower_components/angular-touch/angular-touch.js',
                'bower_components/angular-moment/angular-moment.js',
                /* The rest of the angular.js app */
                'js/bootstrap.js',
                'js/directives.js',
                'js/factories.js',
                'js/controllers.js',
                'js/controllers/*.js',
                'js/app.js'
                ],
                dest: '../public/media/js/scripts.js'
            },
            backendAngularView: {
                src: ['templates/header.html', 'templates/angular.html', 'templates/compiled_partials.html', 'templates/footer.html'],
                dest: '../views/base.html',
                options: {
                    banner: "<!doctype html>\n <!--\n"+
                            "<%= localpackage.name %> - <%= gitRevisionSHA %><%= gitRevisionDirty %>\n" +
                            "<%= localpackage.description %>\n" +
                            "Templates compiled on <%= grunt.template.today('dddd, mmmm dS, yyyy, h:MM:ss TT') %>\n" +
                            "-->\n",
                    separator: '\n \n'
                }
            },
            backendStaticView: {
                src: ['templates/header.html', 'templates/static.html', 'templates/footer.html'],
                dest: '../views/base_static.html',
                options: {
                    banner: "<!doctype html>\n <!--\n"+
                            "<%= localpackage.name %> - <%= gitRevisionSHA %><%= gitRevisionDirty %>\n" +
                            "<%= localpackage.description %>\n" +
                            "Templates compiled on <%= grunt.template.today('dddd, mmmm dS, yyyy, h:MM:ss TT') %>\n" +
                            "-->\n",
                    separator: '\n \n'
                }
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
                    "../public/media/css/style.css": [ "less/style.less"
                                                        // Place additional LESS or CSS style sheets here
                                                    ]
                }
            },
            production: { // Basically just a minifier task - doesn't actually recompile less
                options: {
                    paths: [""],
                    cleancss: true,
                },
                files: {
                    "../public/media/css/style.min.css": [ "../public/media/css/style.css" ]
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
                src: ["fonts/*"],
                dest: '../public/media/css/'
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
            },
            partials: {
                files: ['templates/header.html', 'templates/partials/*.html', 'templates/footer.html'],
                tasks: ['getGitRevision', 'concat', 'inline_angular_templates']
            }
        },
        inline_angular_templates: {
            dist: {
                options: {
                    method: 'append',
                    base: 'templates/partials/'
                },
                files: {
                    '../views/base.html': ['templates/partials/**/*.html']
                }
            }
        },
        "git-describe": {
            build: {
                options: {
                    prop: "gitInfo"
                }
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'js/**/*.js'],
            options: {
                // options here to override JSHint defaults
                globals: {
                    angular: true,
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true
                }
            }
        },
        uncss: {
            dist: {
                options: {
                    ignore       : ['#added_at_runtime', /test\-[0-9]+/],
                    // by default UnCSS processes stylesheets with media query "all", "screen", and those without one. Specify here which others to include.
                    //media        : ['(min-width: 700px) handheld and (orientation: landscape)'],
                    csspath      : '../public/media/css/',
                    //raw          : 'h1 { color: green }',
                    stylesheets  : ['style.css'],
                    ignoreSheets : [/fonts.googleapis/],
                    timeout      : 1000,
                    htmlroot     : '../public',
                    report       : 'min'
                },
                files: {
                    '../public/media/css/style.css': ['../views/base.html', 'templates/partials/*']
                }
            }
        }
    });

    grunt.registerTask('getGitRevision', function() {
        grunt.event.once('git-describe', function (rev) {
            grunt.config('gitRevisionSHA', rev.object);
            grunt.config('gitRevisionTag', rev.tag);
            grunt.config('gitRevisionDirty', rev.dirty);
        });
        grunt.task.run('git-describe');
    });
    grunt.registerTask('default', ['getGitRevision', 'concat','inline_angular_templates', 'less:development', 'uncss', 'copy', 'watch']);
    grunt.registerTask('start_app', ['getGitRevision', 'concat', 'inline_angular_templates', 'less:development', 'uncss', 'copy']);
    grunt.registerTask('launch', ['getGitRevision', 'concat', 'inline_angular_templates', 'uglify', 'less', 'copy']);
    grunt.registerTask('test', ['jshint']); // lol, tests coming soon
    grunt.registerTask('build', ['getGitRevision', 'concat', 'inline_angular_templates', 'uglify', 'less:development', 'uncss', 'less:production', 'copy']);
};
