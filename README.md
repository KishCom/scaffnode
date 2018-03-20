    ____ ____ ____ ____ ____ _  _ ____ ___  ____
    [__  |    |__| |___ |___ |\ | |  | |  \ |___
    ___] |___ |  | |    |    | \| |__| |__/ |___

An ever changing personal preference Node.js web-app scaffolding. This specific branch is an experimental branch implementing a React.js frontend.

Use this if you're looking to hit the ground running with a project using Node.js, ExpressJS and some other fairly popular Node.js modules.

To install, make sure you have Node.js (>6.x) installed on your system as well as NPM. Make sure your node_modules folder, or the NODE_PATH environment variable are setup properly as well.

If your Node.js and NPM are already configured, setup and installation is a breeze:

    # Install nodemon and bunyan globally
    npm install bunyan nodemon mocha -g
    # Get other dependencies
    npm install
    # Configure server details
    cp config.sample.js config.js

    # Name the project. Replace "YourProjectsNameHere" in the next command with your project name (alpha-numeric only)
    find . -type f | xargs sed -i 's/scaffnode/YourProjectsNameHere/gi'

    # Edit config.js with your details

    # Then start the server:
    npm start

## Frontend

The front end of this app bundles jQuery, Bootstrap, and moment.js with a starter framework setup in the `frontend` folder. Assets are compiled and minified with Grunt and packages are managed by NPM.

This app setup is probably a little different than you're used to, if you have any questions please feel free to [ask me](https://twitter.com/twitter) or open an issue in this repo.

#### Traditional Node.js/Express App

The rest of the Scaffnode project uses Angular.js 1.5 to create a single-page-app. This branch sets up a more "traditional" app that renders each view with a pageload.

You can re-minify the frontend:

    cd frontend
    npm install
    # Run grunt, it will watch for changes and rebuild automatically
    grunt

## Tests

Scaffnode is only setup for backend API tests ([Mocha](http://mochajs.org/) + [superagent](http://visionmedia.github.io/superagent/)).

Run tests:

    npm test

Which is just an alias of:

    NODE_ENV=dev mocha tests/*_tests.js

###i18n Multi-language support

Example language files are found in `locale` and example useage can be found in `views/index.html`.

###Build frontend for production

We need tests, but until then:

    cd frontend
    grunt build
    cd ..

or run a live server (concats/minifies JS/CSS)

    npm run start.live

##Live Deploy Helpers

You'll also find an app.upstart file that allows you to install this app as an upstart service for Linix systems that support [upstart](http://upstart.ubuntu.com/). Modify the contents of that file and copy it to `/etc/init` - you'll be able to start and stop your server with `sudo service appname start`

There's now an NGINX config file too! Make sure you have your SSL crt and key path correctly set ([or generate your own](https://devcenter.heroku.com/articles/ssl-certificate-self))
