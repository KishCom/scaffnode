    ____ ____ ____ ____ ____ _  _ ____ ___  ____
    [__  |    |__| |___ |___ |\ | |  | |  \ |___
    ___] |___ |  | |    |    | \| |__| |__/ |___

[![Build Status](https://travis-ci.org/KishCom/scaffnode.svg)](https://travis-ci.org/KishCom/scaffnode)

An ever changing personal preference Node.js web-app scaffolding.

Use this if you're looking to hit the ground running with a project using Node.js, ExpressJS and some other fairly popular Node.js modules.

To install, make sure you have Node.js (>0.10.x) installed on your system as well as NPM and of course Cassandra. Make sure your node_modules folder, or the NODE_PATH environment variable are setup properly as well.

I recommend using a Cassandra docker image to setup for local development. If you don't have a Cassandra server ready, just [install Docker](https://docs.docker.com/installation/) and follow these instructions (uses the [official Docker Cassandra repo](https://registry.hub.docker.com/_/cassandra/)):


    # Setup the networking for the cassandra db in one of two ways:

    # Bind port 9042 to docker host (running scaffnode app outside of a docker container)
    docker run --name scaffnode-cassandra -d cassandra:2.1.5 -p 9042:9042

    #or

    #Docker to Docker (running scaffnode app inside of a docker container)
    docker run --name scaffnode-cassandra -d cassandra:2.1.5
    docker run --name some-app --link scaffnode-cassandra:cassandra -d app-that-uses-cassandra

    # See cassandra logs:
    docker logs scaffnode-cassandra

If your Node.js and NPM are already configured, setup and installation is a breeze:

    # Install nodemon and bunyan globally
    sudo npm install bunyan nodemon mocha karma-cli bower -g
    # Reset permissions for everything in ~/.npm (just in case)
    sudo chown -R `whoami`:`groups $(whoami) | cut -d' ' -f1` ~/.npm
    # Get other dependencies
    npm install
    # Configure server details
    cp config.sample.js config.js

    # Name the project. Replace "YourProjectsNameHere" in the next command with your project name (alpha-numeric only)
    # This changes all instances of "scaffnode" to whatever you wish (TODO: yeoman generator)
    find . -type f | xargs sed -i 's/scaffnode/YourProjectsNameHere/gi'

    # Edit config.js with your details

    # Then start the server:
    npm start

## Frontend

The front end of this app bundles Angular.js, Underscore, Bootstrap, and moment.js with a starter framework setup in the `frontend` folder. Assets are compiled and minified with Grunt and packages are managed by bower. The frontend also uses [Restangular](https://github.com/mgonto/restangular) to manage RESTful API calls.

This app setup is probably a little different than you're used to, if you have any questions please feel free to [ask me](https://twitter.com/twitter) or open an issue in this repo.

#### Hybrid single page app

Templates used in the Angular.js frontend are preprocessed by the Express.js backend. A Grunt task ensures that all files in the `frontend/templates/partials/` folder are compiled into a backend view file `views/templates.js.html`. When requested this file is processed and served by the backend. This allows backend variables to be used in your frontend partial templates. Backend variables use Nunjucks style `{{ BackendVariable }}` -- this conflicts with Angular, so we use a different [interpolation provider](http://docs.angularjs.org/api/ng.$interpolateProvider): access frontend Angular variables like this instead: `"[[ FrontendVariable ]]"`.

#### Development Rules

Backend tags in frontend partial files MUST use single quotes `'` not double quotes `"`.

    Good:
    <span>
    {% if somebackendthing == 'derp' %}Derp from the backend.{% endif %}
    </span>

    Bad -- notice the double quotes around derp:
    <span>
    {% if somebackendthing == "derp" %}Derp from the backend.{% endif %}
    </span>

Do not call `<script>` tags in your frontend partial files. All JS logic should go in the `frontend/js` folder -- ideally in the controller file for the template you're working on. If needed you can add `<script>` tags in `frontend/templates/header.html` or `frontend/templates/footer.html` (but you really should be just adding this to `bower.json` and the Gruntfile to be compiled with the rest of your JS).

    Bad:
    <span>I don't know how to use Angular, Grunt or Bower, so I'm just going to include this jQuery script</span>
    <script src='/some/lib.js'></script>

The views used by the backend `views/base.html` and `views/base_static.html` are also dynamically generated based on the frontend templates found in `frontend/templates`. Angular.js templates are precompiled and bundled into `views/base.html`. `views/base_static.html` is to be used for error pages, and other pages in your app that you do not want inside of your frontend single page app.

After following the directions above and your server is running, you can start setting up the frontend:

Builds and concatinates JS files, doesn't minify.

    cd frontend
    npm install
    # Run grunt, it will watch for changes and rebuild automatically
    grunt

## Tests

Scaffnode aims to have full "end to end" testing. This includes backend API tests ([Mocha](http://mochajs.org/) + [superagent](http://visionmedia.github.io/superagent/)), frontend unit tests ([Mocha](http://mochajs.org/) + [Karma](http://karma-runner.github.io)). Frontend integration tests using ([Selenium](http://www.seleniumhq.org/)) are coming soon (see the `selenium` branch of this repo).

Run frontend unit tests, backend unit tests, and JSHint linter:

    npm test

Run just backend unit tests:

    NODE_ENV=dev mocha tests/*_tests.js

Run just frontend unit tests:

    # Running locally? Test in your browsers instead of phantomjs by editing app_karma.conf
    karma start app_karma.conf.js --log-level debug --single-run

###i18n Multi-language support

Example language files are found in `locale` and example useage can be found in `frontend/templates/partials/home.html`. Currently all i18n translations must be done on the backend, frontend translation is coming soon (it's easily hacked in and I'd welcome a pull request -- I personally just try to avoid frontend i18n translation).

###Build frontend for production

We need tests, but until then:

    cd frontend
    grunt build
    cd ..

###Updating Bootstrap + Font-Awesome

Bootstrap and Font-Awesome are manually installed and updated - it is not fetched through bower like the other frontend packages. It's using the "cerulean" theme from Bootswatch.
Update it:

    # Download bootstrap source
    # Copy everything in the less/ folder into the app/less/bootstrap/ - overwrite everything
    # Download "cerulean" theme http://bootswatch.com/cerulean/variables.less - overwrite `app/less/bootstrap/variables.less`
    # Download http://bootswatch.com/cerulean/bootswatch.less - overwrite `app/less/bootstrap/bootswatch.less`
    # Update `@icon-font-path:` to be `"fonts/";`
    # Download bootstrap dist (we don't want to muck about with compiling their JS)
    # Copy dist/js/bootstrap.js to app/js/bootstrap.js
    # Copy fonts from dist/fonts/* to /app/fonts/.

##Live Deploy Helpers

You'll also find an app.upstart file that allows you to install this app as an upstart service for Linix systems that support [upstart](http://upstart.ubuntu.com/). Modify the contents of that file and copy it to `/etc/init` - you'll be able to start and stop your server with `sudo service appname start`

There's now an NGINX config file too! Make sure you have your SSL crt and key path correctly set ([or generate your own](https://devcenter.heroku.com/articles/ssl-certificate-self))
