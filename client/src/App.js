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
    pies:10000
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
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  componentDidMount() {
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
                        <a className='navbar-item is-size-5' href='/'>Home</a>
                        <Link className='navbar-item is-size-5' to='/cat-farts'>Cat Farts</Link>
                        <a className="navbar-item is-size-5">All Polls</a>
                        <a className="navbar-item is-size-5">My Polls</a>
                        <a className="navbar-item is-size-5">New Poll</a>
                        <div className="navbar-item">
                          <a className="button is-link is-rounded">Twitter Sign In</a> 
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hero-body">
                <div className="container main">

                  <PollList />

                  <Switch>
                    <Route path='/cat-farts' render={ ()=> <div>cat fart component</div> }/>
                    <Route path='/squirrel-poop' component={ Squirrelpoop }/>
                    <Route path='/dog-breath' render={ props=> <DogBreath {...props} age={42}/> }/>
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


            
            <p>everything below here must be removed before release</p>
            {/* proper links to routes that create modified anchor tags (prevent default refresh) */}
            <Link to='/squirrel-poop'>Squirrel poop</Link>
            <Link to='/dog-breath'>Dog breath</Link>

          </div>
        </Router>
      </MyProvider>

    )
  }
}

const PollList = () =>
  Array(20).fill().map( (val,i) => <p key={String(i)}>hi</p> ) //items will never be reordered so index key is ok here

const Squirrelpoop = ( { match: {url} } ) =>
  <div>Squirrel poop component with url: {url}</div>

const DogBreath = ( { match: {url}, age } ) =>
  <div>
    DogBreath component with url: {url}
    <br/>
    age: {age}
  </div>

export default App
