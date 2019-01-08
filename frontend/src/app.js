import './../scss/style.scss';
import TinyRick from './../images/tiny_rick.png';

//import _ from 'lodash';
import {cube} from './math.js';
import nameEmail from './nameEmail/';
import ReactDOM from 'react-dom';
import React from 'react';


/*
TODO:
    Change your "5 cubed" to be dynamic (text or dropdown)
    Add clock back in as module
    Add/configure tests and test suites
    Add/configure https://github.com/webpack-contrib/webpack-bundle-analyzer
*/

class Scaffnode extends React.Component{
    render(){
        const self = this;
        const cubeMe = document.getElementById("CubeMe") ? document.getElementById("CubeMe").value : 5;
        function HelloWorldName(props) {
            return <h1>Hello, world {props.name}!</h1>;
        }

        function CubePicker(props) {
            if (/\d+/.test(cubeMe) === false){ return; }
            return (
                <div id="CubePicker">
                    <input id="CubeMe" type="text" className="col-xs-1"/> is {cube(cubeMe)} cubed.
                    <button className="btn btn-primary" value={cubeMe} onClick={handleCube}>Cube</button>
                </div>
            );
        }
        function handleCube(evt) {
            self.render();
        }

        function handleError(evt) {
            try{
                throw new Error("Whoah dude");
            }catch(e){
                console.error("An error!", e);
            }
        }
        return(
            <div className="hello-webpack container-fluid">
                <CubePicker /><br />
                <img src={TinyRick} /><br />
                <i className="fa fa-spotify"></i>
                <div className="open-logos">Zgu</div>
                <button className="btn btn-primary errorOut" onClick={handleError}>Error out</button>
                <HelloWorldName name="Doug" /><br />
                <HelloWorldName name="Sam" /><br />
                <HelloWorldName name="Frank" /><br />
            </div>
        );
    }
}


ReactDOM.render(
    <Scaffnode />,
    document.getElementById("ReactHW")
);
