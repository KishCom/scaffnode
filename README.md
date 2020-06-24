    ____ ____ ____ ____ ____ _  _ ____ ___  ____
    [__  |    |__| |___ |___ |\ | |  | |  \ |___
    ___] |___ |  | |    |    | \| |__| |__/ |___

An ever changing personal preference Node.js web-app scaffolding. This specific branch is an experimental branch implementing a React.js frontend.

Use this if you're looking to hit the ground running with a project using Node.js, ExpressJS and some other fairly popular Node.js modules.

To install, make sure you have Node.js (>6.x) installed on your system as well as NPM. Make sure your node_modules folder, or the NODE_PATH environment variable are setup properly as well. Tested on Linux and OSX only. Windows users will need to address the `NODE_ENV` environment variable (TODO: `dotenv`).

If your Node.js and NPM are already configured, setup and installation is a breeze:

    # Install nodemon and bunyan globally
    npm install bunyan nodemon mocha webpack webpack-cli -g
    # Get other dependencies
    npm install
    # Configure server details
    cp config.sample.js config.js

    # Name the project. Replace "YourProjectsNameHere" and "yourproductiondomain.org" in the next commands with your project name and domain URL
    find . -type f | xargs sed -i 's/scaffnode.example.com/yourproductiondomain.org/gi'
    find . -type f | xargs sed -i 's/scaffnode/YourProjectsNameHere/gi'

    # Edit config.js with your details

    # Then start the server:
    npm start

## Frontend

(DOCUMENTATION IN PROGRESS) The scaffnode frontend is a React based SPA.

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

There are several helpers inside of the `deploy` folder:

 - `app.nginx` - An nginx config file. Copy to your nginx sites-enabled folder `sudo cp deploy/app.nginx /etc/nginx/sites-enable/scaffnode`. You will have to change SSL certificate file locations "ssl_certificate" and "ssl_certificate_key". I use [acme.sh](https://acme.sh) and the default paths.
 - `app.systemd.service` - A [systemD service file](https://www.devdungeon.com/content/creating-systemd-service-files). Copy, reload, restart, enjoy:
    '''
    sudo cp deploy/app.systemd.service /etc/systemd/system/scaffnode.service
    sudo systemctl daemon-reload
    sudo systemctl enable scaffnode
    sudo systemctl start scaffnode
    sudo systemctl status scaffnode
    '''
- `app.upstart` - An upstart file for older Ubuntu systems and other Linux distros that may still use Upstart instead of systemD.
- `updateApi.sh` - A simple BASH script to bootstrap a really basic CI system: `ssh ubuntu@scaffnode.example.com -C "./scaffnode/deploy/updateApi.sh"`
