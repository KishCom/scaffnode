#!/bin/bash
# Pick what app you want
# useage: ./pick sio.js
#    - replaces app.js with sio.js
#    - removes other app files
#    - truncates README and TODO files
if [ -e $1 ] ; then
echo `mv $1 app.js`
echo "" > README
echo "" > TODO
rm pick.sh #removes itself
fi
