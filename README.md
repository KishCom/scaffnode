    ____ ____ ____ ____ ____ _  _ ____ ___  ____
    [__  |    |__| |___ |___ |\ | |  | |  \ |___
    ___] |___ |  | |    |    | \| |__| |__/ |___

An ever changing personal preference Node.js web-app scaffolding.

Use this if you're looking to hit the ground running with a project using Node.js, and popular Node.js modules (Express.js, Bunyan logs, Multer file uploads, Nunjucks HTML templates).

To install, make sure you have Node.js (>16.x) installed on your system as well as NPM. Make sure your node_modules folder, or the NODE_PATH environment variable are setup properly as well. Tested on Linux and OSX only. Windows users will need to address the `NODE_ENV` environment variable.

If your Node.js and NPM are already configured, setup and installation is a breeze:

    # Install nodemon and bunyan globally
    npm install bunyan nodemon mocha webpack webpack-cli -g
    # Get other dependencies
    npm install
    # Configure server environment details
    cp config.sample.js config.js

    # Name the project. Replace "YourProjectsNameHere" in the next command with your project name (alpha-numeric only)
    find . -type f | xargs sed -i 's/scaffnode/YourProjectsNameHere/gi'

    # Edit config.js with your details

    # Then start the server:
    npm start

## Frontend

(DOCUMENTATION IN PROGRESS) The scaffnode frontend is a Svelte based SPA.

    cd frontend
    npm i
    
    #Build for development
    npm run build #which runs: NODE_ENV=dev npx webpack --config webpack.config.js
    
    ##OR watch for changes and rebuild:
    npm run watch #which runs: NODE_ENV=dev npx webpack --watch --config webpack.config.js

    ##OR build for production
    npm run build.live #which runs: NODE_ENV=live npx webpack --config webpack.config.js
    

## Tests

Scaffnode is setup for backend API tests using ([Mocha](http://mochajs.org/) + [superagent](http://visionmedia.github.io/superagent/)) as well as frontend tests using [Jest](https://facebook.github.io/jest/).

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

Find NGINX config and SystemD service in the `deploy` folder. You can also use pm2 if desired, a very basic pm2 ecosystem file is provided. The systemD file makes a few assumptions about your environment: You have a `www-data` user+group, and that you installed Node.js with [ASDF](https://asdf-vm.com).