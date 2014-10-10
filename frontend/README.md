##Scaffnode Frontend

Angular.js based frontend scaffold.

_*AT LEAST READ THIS:*_ The app DOES NOT USE `"{{ variable }}"` ... it uses a different [interpolation provider](http://docs.angularjs.org/api/ng.$interpolateProvider), so do this instead: `"[[ variable ]]"`. (The backend templates use swig, which also uses`{{ }}` notation)

#Build for dev

Builds and concatinates JS files, doesn't minify.
    npm install

    # Run grunt, it will watch for changes and rebuild automatically
    grunt

###Build for prod

We need tests, but until then:

    rm -Rf dist
    grunt build

###Updating Bootstrap

Bootstrap is manually installed and updated. It's using the "Yeti" theme from Bootswatch.
Update it:

    # Download bootstrap source
    # Copy everything in the less/ folder into the app/less/bootstrap/ - overwrite everything
    # Download "Yeti" theme http://bootswatch.com/yeti/variables.less - overwrite `app/less/bootstrap/variables.less`
    # Download http://bootswatch.com/yeti/bootswatch.less - overwrite `app/less/bootstrap/bootswatch.less`
    # Update `@icon-font-path:` to be `"fonts/";`
    # Download bootstrap dist (we don't want to muck about with compiling their JS)
    # Copy dist/js/bootstrap.js to app/js/bootstrap.js
    # Copy fonts from dist/fonts/* to /app/fonts/.