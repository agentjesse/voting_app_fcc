// eslint-disable-next-line
import React, { Component, Fragment as Frag } from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import './App.css'

//initialize context, destructure result to grab Provider/Consumer component pair. 
//Provider / Consumer components CANNOT BE RENAMED!!!!!
// eslint-disable-next-line
const { Provider, Consumer } = React.createContext()
//enhance by adding state to provider component
class MyProvider extends Component {
  state = {
    cats:43,
    pies:1000
  }
  render() {
    return (
      // here the value Provider passes on to the Consumers is an object, but can be anything. It's available in a consumers child function. All consumers are re-rendered whenever the Provider value changes. watch for caveats when provider set with value in parent: https://reactjs.org/docs/context.html#caveats
      <Provider
        value={ {
          state: this.state,
          actions: {
            incrementCats: ()=> this.setState( {cats: this.state.cats + 1} )
          }
        } }
      >
        {this.props.children}
      </Provider>
    )
  }
}

class App extends Component {
  state = {
    user: null,
    polls: null
  }

  componentDidMount() {
    //setState() in here triggers an extra rendering, but it will happen before the screen updates. Even though render() will be called twice, the user won’t see the intermediate state.
    
    /*
    fetch('/get_polls')
      .then( res => {
        if(res.ok) return res.json()
        throw new Error('Network response error.')
      } )
      .then( data => {
        console.log(data)
      } )
      .catch( error => console.log('Error with your fetch operation: ', error.message) )
    */

    //code in here will run once after component mounts, not after every render call as it would seem. For that, use componentDidUpdate() but note it will ignore the initial render call.
    const user = localStorage.getItem('user')
    if (user) {
      console.log('signed in mode')
      this.setState({user})
    }
    else console.log('public mode')
  }

  signInOut = () => {
    if (this.state.user) { //localStorage check possible too. componentDidMount will set user in state if user in LocalStorage
      alert('user in state and localStorage, both will be cleared to sign out.')
      localStorage.removeItem('user')
      this.setState({user:null})
    }
    else {
      alert('no user in state, redirecting to sign in...')
      window.location.pathname = '/auth/twitter'
    }
  }

  sendPoll() {
    const poll =
      {
        'pollTitle': 'favourite candy',
        'choices': { 'chocolate':1 ,'gum':666 },
        'created': Date.now(),
        'byUser': 'TommyTibble39X'
      }
    fetch('/send_poll',
      {
        method: 'POST',
        body: JSON.stringify( poll ),
        headers: {'content-type': 'application/json'}
      }
    )
      .then( res => {
        // if(res.ok) return res.text()
        if(res.ok) return res.text()
        throw new Error('Network response error.')
      } )
      .then( data => {
        console.log(data)
      } )
      .catch( error => console.log('Error with your fetch operation: ', error.message) )
  }

  render() {
    return (
      //Wrap the entire app in your enhanced provider component, and all consumer descendants will be able to access the store. here the router wraps the App div first to keep name for the component and not even need a fragment like you used before
      <MyProvider>
        <Router>
          <div className="App">

            {/*below using bulma hero to hold everything inside*/}
            <section className="hero is-info is-fullheight">

              <div className="hero-head">
                <div className="navbar">
                  <div className="container">
                    <div className="navbar-brand">
                      <a className="navbar-item is-size-3">Voting App</a>
                      <div className="navbar-burger burger"><span/><span/><span/></div>
                    </div>
                    {/* js el.classList.toggle('is-active') toggles is-active class on navbar-menu: to show it when the burger is clicked */}
                    <div className="navbar-menu">
                      <div className="navbar-end">
                        {/* regular link here triggers refresh and load this main component again. messy, but gets the job done quickly */}
                        <Link className='navbar-item is-size-5' to='/'>Home</Link>
                        {/* conditional render using the authorized user links */}
                        { this.state.user &&
                            <Frag>
                              <Link className='navbar-item is-size-5' to='/my-polls'>My Polls</Link>
                              <Link className='navbar-item is-size-5' to='/new-poll'>New Poll</Link>
                            </Frag>
                        }
                        <div className="navbar-item">
                          <button className="button is-link is-rounded" onClick={this.signInOut}>Twitter Sign In/Out</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hero-body">
                <div className="container main">
                  <button onClick={this.sendPoll}>send test poll</button>
                  <button onClick={()=>console.log(this.state)}>log state</button>

                  

                  <h1 className="title has-text-centered">All Polls</h1>
                  <h1 className="subtitle has-text-centered">Collection of polls from users of this app.</h1>

                  <Switch>
                    <Route exact path='/' component={ PollList }/>
                    <Route path='/my-polls' render={ ()=> <div>MyPolls component</div> }/>
                    <Route path='/new-poll' render={ ()=> <div>NewPoll component</div> }/>
                  </Switch>

                </div>
              </div>

              <div className="hero-foot">
                <div className="container">
                  <span className='is-size-7'>
                  Built by Jesse Tan Rivero. Github repo <a href="https://github.com/agentjesse/voting_app_fcc"><strong>here</strong></a>
                  </span>
                </div>
              </div>

            </section>

          </div>
        </Router>
      </MyProvider>
    )
  }
}

const PollList = () =>
  //items will never be reordered so index key is ok here. messageMod overwrites the bulma component's css with !important.
  Array(3).fill()
    .map( (val,i) => <div className="message message-body messageMod" key={String(i)}>
        {i}Lorem ipsum dolor. <strong>Pellentesque risus mi</strong> et dictum <a>felis venenatis</a> efficitur.
      </div>
    )

export default App
