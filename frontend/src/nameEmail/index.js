import React from 'react';
import ReactDOM from 'react-dom';
let FullEmail = "";
function handleKeyPress(e) {
    render();
}
function render(){
    const theEmail = document.getElementById('email') ? "mailto:" + document.getElementById('email').value : "";
    const theName = document.getElementById('name') ? document.getElementById('name').value : "";
    ReactDOM.render(
        <div id='NameEmail'>
        Name: <input type='text' name='name' className='form-control' id='name' onKeyUp={handleKeyPress} /> <br />
        Email: <input type='email' name='email' className='form-control' id='email' onKeyUp={handleKeyPress} /><br />
        A link to your email: <a href={theEmail} id="FullEmail">{theName}</a><br />
        </div>,
        document.getElementById('NameEmailComponentHolder')
    );
}

render();
