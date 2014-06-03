    ____ ____ ____ ____ ____ _  _ ____ ___  ____
    [__  |    |__| |___ |___ |\ | |  | |  \ |___
    ___] |___ |  | |    |    | \| |__| |__/ |___

An ever changing personal preference Node.js web-app scaffolding.

Use this if you're looking to hit the ground running with a project using Node.js, ExpressJS and some other fairly popular Node.js modules.

To install, make sure you have Node.js (>0.10.x) installed on your system as well as NPM. Make sure your node_modules folder, or the NODE_PATH environment variable are setup properly as well.

If your Node.js and NPM are already configured, setup and installation is a breeze:

    # Install nodemon and bunyan globally
    sudo npm install nodemon -g
    sudo npm install bunyan -g
    # Get other dependencies
    npm install
    # Start the server
    npm start

##Live Deploy Helpers

You'll also find an app.upstart file that allows you to install this app as an upstart service for Linix systems that support [upstart](http://upstart.ubuntu.com/). Modify the contents of that file and copy it to `/etc/init` - you'll be able to start and stop your server with `sudo service appname start`

There's now an NGINX config file too! Make sure you have your SSL crt and key path correctly set ([or generate your own](https://devcenter.heroku.com/articles/ssl-certificate-self))

## Coming soon:

Full angular.js based frontend starter package - including bower integration, and Grunt config.