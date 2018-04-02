import React from 'react';
import ReactDOM from 'react-dom';

class Scaffnode extends React.Component {
    constructor(props) {
        super(props);
        this.state = { currentDatetime: new Date().toLocaleTimeString() };

        // Attach this Scaffnode React Class "this" to tickTheClock defined below
        this.tickTheClock = this.tickTheClock.bind(this);
    }

    componentDidMount() {
        this.timer = setInterval(this.tickTheClock, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    tickTheClock() {
        //this.setState({currentDatetime: new Date().toLocaleTimeString()});
    }

    render() {
        function ClockTime(props) {
            return <h2>{self.state.currentDatetime}</h2>
        }
    }
}
