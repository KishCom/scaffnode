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
    # Configure server details
    cp config.sample.js config.js

    # Name the project. Replace "YourProjectsNameHere" in the next command with your project name (alpha-numeric only)
    find . -type f | xargs sed -i 's/scaffnode/YourProjectsNameHere/gi'

    # Edit config.js with your details

    # Then start the server:
    npm start

## Frontend

The front end of this app bundles Angular.js, Bootstrap, and moment.js with a starter framework setup in the `frontend` folder. Assets are compiled and minified with Grunt and packages are managed by bower

The views used by the backend `views/base.html` and `views/base_static.html` are dynamically generated based on the frontend templates found in `frontend/templates`. Angular.js templates are precompiled and bundled into `views/base.html`. Just edit/create templates inside of `frontend/templates/partials/` and Grunt will automatically include them into your Angular.js app.

This app setup DOES NOT USE `"{{ variable }}"` notation in Angular.js. It uses a different [interpolation provider](http://docs.angularjs.org/api/ng.$interpolateProvider), so do this instead: `"[[ variable ]]"`. (This is because the backend templates use Nunjucks, which also uses`{{ }}` notation).
After following the directions above and your server is running, you can start setting up the frontend:

Builds and concatinates JS files, doesn't minify.

    cd frontend
    npm install
    # Run grunt, it will watch for changes and rebuild automatically
    grunt

###i18n Multi-language support

Example language files are found in `locale` and example useage can be found in `frontend/templates/partials/home.html`. Currently all i18n translations must be done on the backend, frontend translation is coming soon (it's easily hacked in and I'd welcome a pull request -- I personally just try to avoid frontend i18n translation).

###Build frontend for production

We need tests, but until then:

    cd frontend
    grunt build
    cd ..

###UnCSS

This project uses UnCSS to remove any unused CSS selectors. This saves you tons of space (default CSS: 152kB :arrow_right: After UnCSS: 6.3kB :arrow_right: After minified: 4.9kB) but can cause you some headaches if you dynamically insert styles using JavaScript, have a bunch of complex media queries, or are doing other esoteric tricks with your CSS. You may need to modify parameters in the [UnCSS grunt task](https://github.com/KishCom/scaffnode/blob/master/frontend/Gruntfile.js#L163) [according to their documentation](https://github.com/addyosmani/grunt-uncss).

###Updating Bootstrap

Bootstrap is manually installed and updated - it is not fetched through bower like the other frontend packages. It's using the "flatly" theme from Bootswatch.
Update it:

    # Download bootstrap source
    # Copy everything in the less/ folder into the app/less/bootstrap/ - overwrite everything
    # Download "flatly" theme http://bootswatch.com/flatly/variables.less - overwrite `app/less/bootstrap/variables.less`
    # Download http://bootswatch.com/flatly/bootswatch.less - overwrite `app/less/bootstrap/bootswatch.less`
    # Update `@icon-font-path:` to be `"fonts/";`
    # Download bootstrap dist (we don't want to muck about with compiling their JS)
    # Copy dist/js/bootstrap.js to app/js/bootstrap.js
    # Copy fonts from dist/fonts/* to /app/fonts/.

##Live Deploy Helpers

You'll also find an app.upstart file that allows you to install this app as an upstart service for Linix systems that support [upstart](http://upstart.ubuntu.com/). Modify the contents of that file and copy it to `/etc/init` - you'll be able to start and stop your server with `sudo service appname start`

There's now an NGINX config file too! Make sure you have your SSL crt and key path correctly set ([or generate your own](https://devcenter.heroku.com/articles/ssl-certificate-self))