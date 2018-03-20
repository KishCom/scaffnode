import './../scss/style.scss';
import TinyRick from './../images/tiny_rick.png';

//import _ from 'lodash';
import {cube} from './math.js';

function component() {
    const element = document.createElement('div');
    //element.innerHTML = _.join(['Hello', 'webpack'], ' ', '5 cubed is equal to ' + cube(5));
    element.innerHTML = '5 cubed is equal to ' + cube(5);
    element.classList.add('hello-webpack');

    const TR = new Image();
    TR.src = TinyRick;
    element.appendChild(TR);

    const OL = document.createElement('div');
    OL.innerHTML = "Zgu";
    OL.classList.add('open-logos');
    element.appendChild(OL);

    const aButton = document.createElement("button");
    aButton.innerHTML = "Error out";
    aButton.addEventListener("click", (evt) => {
        throw new Error();
    }, false);
    element.appendChild(aButton);

    return element;
}
document.body.appendChild(component());
