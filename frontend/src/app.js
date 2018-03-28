import './../scss/style.scss';
import TinyRick from './../images/tiny_rick.png';

//import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';

import nameEmail from './nameEmail/';
import {cube} from './math.js';

class Scaffnode extends React.Component{
    constructor(props){
        super(props);
        this.state = {currentDatetime: new Date().toLocaleTimeString()};

        // Attach this Scaffnode React Class "this" to tickTheClock defined below
        this.tickTheClock = this.tickTheClock.bind(this);
    }

    componentDidMount(){
        this.timer = setInterval(this.tickTheClock, 1000);
    }

    componentWillUnmount(){
        clearInterval(this.timer);
    }

    tickTheClock() {
        this.setState({currentDatetime: new Date().toLocaleTimeString()});
    }

    render(){
        const self = this;
        function HelloWorldName(props) {
            return <h1>Hello, world {props.name}!</h1>
        }
        function ClockTime(props) {
            return <h2>{self.state.currentDatetime}</h2>
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
                5 cubed is equal to {cube(5)}<br />
                <img src={TinyRick} /><br />
                <div className="open-logos">Zgu</div>
                <button className="btn btn-primary errorOut" onClick={handleError}>Error out</button>
                <HelloWorldName name="Doug" /><br />
                <HelloWorldName name="Sam" /><br />
                <HelloWorldName name="Frank" /><br />
                <ClockTime />
            </div>
        )
    }
}

ReactDOM.render(
    <Scaffnode />,
    document.getElementById("ReactHW")
);
