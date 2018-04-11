//packages
require('dotenv').config()
const express = require('express'),
  mongoClient = require('mongodb').MongoClient,
  uri = `mongodb://${process.env.dbusername}:${process.env.dbpassword}@ds155288.mlab.com:55288/fcc_voting_app`,
  session = require('express-session'),
  passport = require('passport'),
  TwitterStrategy = require('passport-twitter').Strategy,
  CryptoJS = require('crypto-js')

//setup passport
passport.use(new TwitterStrategy(
  {
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: 'http://localhost:5000/auth/twitter/callback' //auth only works in production when serving from port 3000
  },
  (token, tokenSecret, profile, done) => {
    //purpose of this verify callback: find user matching credential arguments. When Passport authenticates a request, it parses the credentials contained in the request. It then invokes this verify callback with the credentials. You then check if they're valid and invokes done() to supply Passport with the user that authenticated.
      // User.findOrCreate(..., function(err, user) {
      //   if (err) { return done(err); }
      //   done(null, user);
      // });
    // console.log('twitter username: ', profile.username)
    done( null, profile.username ) //supply Passport with the user that authenticated
    // done(null,false) //failed authentication on your end. (remember twitter will only return with credentials of valid twitter accounts)
  }
) )
passport.serializeUser( (user, done) => done(null, user) )
passport.deserializeUser( (user, done) => done(null, user) )

//create app
const app = express()
//specify template engine
app.set('view engine', 'pug')
//specify a PATH for template files
app.set('views', `${__dirname}/templates`)

//middleware
  //logger
  app.use( (req,res,next) => { //defaults to '/'
    console.log(`${req.method} request received with url: ${req.originalUrl}`)
    next()
  })

  //parse requests with urlencoded or json  payloads to make req.body object
  app.use( express.urlencoded({extended:false}) )
  app.use( express.json() )
  
  // configure/use express-session middleware BEFORE PASSPORT!!!!
  //this saves a cookie to the browser with the user. future requests that don't originate from the SAME ORIGIN will have access to req.user. the twitter auth link from production originates from the app but the redirection then uses the verify callback which populates req.user
  app.use(session( {secret:'idontknowwhatthisis', resave:true, saveUninitialized:true} ) )
  
  //use passport
  app.use(passport.initialize())
  app.use(passport.session())

  // Redirect the user to Twitter for authentication.  When complete, Twitter will redirect to /auth/twitter/callback
  app.get('/auth/twitter', passport.authenticate('twitter') )
  // Twitter will redirect here.
  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', { successRedirect: '/set-redirect', failureRedirect:'/auth-failure' } )
  )
  app.get( '/set-redirect', (req,res) => {
    console.log('user: ' + req.user)

    //encrypt a string
    const encryptedString = CryptoJS.AES.encrypt('jesse is cool', 'passwordingz!').toString()
    console.log( encryptedString )
    //decrypt it
    const plaintext = CryptoJS.AES.decrypt(encryptedString, 'passwordingz!').toString(CryptoJS.enc.Utf8)
    console.log(plaintext)

    //res.render accepts a template filename (like the pug file) and data called locals
    res.render('setAndRedirect', {user: req.user} )
  } )
  app.get( '/auth-failure', (req,res) => { //runs only when verify callback fails authentication. no req.user
    res.sendFile( `${__dirname}/auth-failure.html` )
  } )

  //server receiving poll from client
  app.post( '/send_poll', (req,res) => {
    // console.log(`/give_food current user: ${req.user}`)
    // console.log(req.headers['content-type'], req.body)
    mongoClient.connect( uri, (err,client) => {
      const db = client.db('fcc_voting_app')
      db.collection('polls')
        .insertOne( req.body, (err,result) => {
          if (err) {
            console.error(err)
            res.end()
          }
          else {
            console.log( result.ops )
            res.send( 'server received poll' )
            // res.send('received and added to database:\n' + JSON.stringify(req.body) )
          }
          client.close()
        } )
    } )
  } )

  app.get( '/get_polls', (req,res) => {
    //connect to mongodb server and return an array of the polls to react
    mongoClient.connect( uri, (err,client) => {
      const db = client.db('fcc_voting_app')
      db.collection('polls')
        .find( {}, { sort:{created:1} } )
        .toArray( (err,docsArr) => {
          if (err) {
            console.error(err)
            res.end()
          }
          else res.send(docsArr)
          client.close()
        } )
    } )
  } )
  
  app.get('/api/hello', (req,res) => {
    res.send({ express: '...Hello From Express' });
  })

  //Serve static files from the React app
  app.use( express.static(`${__dirname}/client/build`) )
  //catch-all handler to serve react app if no routes matched.
  //uncomment when production build is ready in client/build folder
  app.get('*', (req, res) => {
    console.log('non-server request received... sending client build index.html to handle the request instead')
    res.sendFile(`${__dirname}/client/build/index.html`)
    // res.sendFile(`${__dirname}/test.html`)
  })


//error handler
// eslint-disable-next-line
app.use((err,req,res,next)=> { res.status(err.status || 500) })

//start listening
const port = process.env.PORT || 5000 //use port 5000 for dev.
// const port = process.env.PORT || 3000 //stick to create-react-app's default port 3000 for production.
app.listen(port, () => console.log(`Listening on port ${port}`))