import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import './bulma.min.css' //import minified bulma css file here at root. it nicely zeroes out body margin and padding and sets a nice font too, so no need for an index.css file.

ReactDOM.render(<App />, document.getElementById('root'))
