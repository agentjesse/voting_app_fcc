import React, { Component, Fragment } from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import Chart from './Chart'
import './App.css'

//initialize context, destructure result to grab Provider/Consumer component pair. 
//Provider / Consumer components CANNOT BE RENAMED!!!!!
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
      response: ''
    }
  }

  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ response: res.express }))
      .catch(err => console.log(err))
  }

  callApi = async () => {
    // console.log(`making fetch`)
    const response = await fetch('/api/hello') //this will pass through the proxy for sure. not sure about browser based url requests...maybe react-router will handle because port 3000 is forced there?
    const body = await response.json()
    // console.log(`body:`,body)
    if (response.status !== 200) throw Error(body.message)
    return body
  }

  getGarbage = async () => {
    try {
      let response = await fetch('/garbage')
      if (response.ok) {
        let jsonResponse = await response.json()
        console.log(`server reply:`, jsonResponse)
        // console.log( `server reply:`, response )
        return //return now, or error below will fire after this conditional
      }
      throw new Error('Request failed!')
    }
    catch (err) { console.log('tried and caught error:', err) }
  }

  render() {
    return (
      //Wrap the entire app in your enhanced provider component, and all consumer descendants will be able to access the store
      <MyProvider> 

        <div className="App">

          <button onClick={this.getGarbage}>garbage</button>
          <a href="http://example.com">example.com</a>
          <a href="/auth/twitter">twitter auth link (only works in prod when express hosts client app on same port)</a>
          <p>{this.state.response}</p>
          <Chart />
          <hr/>

          <p>testing context api</p>
          {/*
            The Consumer below must ALWAYS be rendered with only ONE function as a child. no comments either!!
            The Consumer component subscribes to context changes. The function receives the current context value and returns a React node. All consumers re-render whenever the Provider value changes.
          */}
          <Consumer>
            { ( {state,actions} )=> (  //value object available to consumer from provider is destructured
              <Fragment>
                <p>{`cats from dynamic store: ${state.cats}`}</p>
                <p>pies:{state.pies}</p>
                <button onClick={actions.incrementCats}>more cats!</button>
              </Fragment>
            ) }
          </Consumer>
          <hr/>

          <p>testing render prop pattern/technique</p>
          {/* https://reactjs.org/docs/render-props.html */}
          {/* below I am using a component with a render prop by providing the prop in the named list of attributes. can also be inside the element as a child function, and called in the component as props.children() :
            <Piggy>{ data => <p>I'm a pig that likes:{data}</p>}</Piggy>
          */}
          <Piggy render={ data => <p>I'm a pig that likes:{data}</p> }/>
          
          <hr/>
          <Router>
            <Fragment>

              {/* regular link here triggers refresh and load this main component again. messy, but gets the job done quickly */}
              <a href='/'>Home</a>
              
              {/* proper links to routes that create modified anchor tags (prevent default refresh) */}
              <Link to='/cat-farts'>Cat Farts</Link>
              <Link to='/squirrel-poop'>Squirrel poop</Link>
              <Link to='/dog-breath'>Dog breath</Link>

              <hr/>

              {/*
                different types of rendering. <Switch> renders the first mathched <Route>/<Redirect> exclusively. In contrast, every <Route> that matches the location renders inclusively.
              */}
              <Switch>
                <Route path='/cat-farts' render={ ()=> <div>cat fart component</div> }/>
                <Route path='/squirrel-poop' component={ Squirrelpoop }/>
                <Route path='/dog-breath' render={ props=> <DogBreath {...props} age={42}/> }/>
              </Switch>

            </Fragment>
          </Router>

        </div>

      </MyProvider>

    )
  }
}

const Piggy = ( {render} ) => { //destructure props.render
  const food = 'apples'
  // the jsx you return below will appear where the Piggy component was used.
  //call the passed in function that will used some data argument (in this case const food) and it will return jsx, which you in turn return from this component
  return render(food)
  //.....or more stuff can be done instead of just calling the function with data, like rendering extra components:
  // return (
  //   <div>
  //     <p>i'm a paragraph in a div. rendered before calling the render prop function</p>
  //     {render(food)}
  //   </div>
  // )
}

const Squirrelpoop = ( { match: {url} } ) =>
  <div>Squirrel poop component with url: {url}</div>

const DogBreath = ( { match: {url}, age } ) =>
  <div>
    DogBreath component with url: {url}
    <br/>
    age: {age}
  </div>

export default App
