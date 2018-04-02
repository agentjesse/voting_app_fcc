import React from 'react'
import ReactDOM from 'react-dom'
import './bulma.min.css' //import minified bulma css file here before App component import so css loads earlier than your own and you can overwrite it. it nicely zeroes out body margin and padding and sets a nice font too, so no need for an index.css file.
import App from './App'

ReactDOM.render(<App />, document.getElementById('root'))
