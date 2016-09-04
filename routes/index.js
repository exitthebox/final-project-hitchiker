var API = require('./api'); // contoller file, an object full of route handlers
var Auth = require('./auth-route');
var bodyParser = require('body-parser');

module.exports = (app) => {
    app.post('*', bodyParser.json(), bodyParser.urlencoded({extended: true}))

    //render the auth pages
    app.get('/login',   Auth.render)  // login page
    app.get('/logout',    Auth.logout) // logout route + redirect

    app.post('/login',    Auth.login);         // login form submission
    app.post('/register', Auth.register)    // register form submission

    app.all('/ride',        Auth.middlewares.session);
    app.all('/userprofile', Auth.middlewares.session);

    //parent HTML pages
    app.get('/', (req, res) => {
      // console.log('app.get res.render()')
      res.render('landing.html')
        
    });
    app.get('/ride', (req, res) => {
      console.log('app.get res.render()'.cyan, req.session)
      res.render('ride.html', req.session)
        
    });
    app.get('/userprofile', (req, res) => {
      // console.log('app.get res.render()')
      res.render('userprofile.html')
        
    });

    //3rd party API calls
    app.get('/api/twitter/:id',     API.fetchTweets)
    app.get('/api/reddit/:id',      API.fetchRedditComments)

    app.put('/api/pi', bodyParser.text({ type: 'text/html' }), API.fetchPersonality)
    app.post('/api/sendMessage',    API.sendMessage)

    //database get
    app.get('/api/user',            API.fetchUser)
    app.get('/db/getAllRides',      API.getAllRides)
    app.get('/db/loadUser/:id',     API.loadUser)
    app.post('/db/graph',            API.createCypher)

    app.get('/db/loadUserForMessage/:id/:origin/:destination',       API.loadUserForMessage)

    //render non-auth pages
    // app.get('/createRide', API.createRide)
    // app.get('/message/:id',     API.renderMessage)

    //update the database
    app.post('/db/userPost',    API.updateUser)
    app.post('/db/ridePost',    API.addRide)

    app.post('/fs/fileUpload/:id',         API.upload)

    
    



    // app.get('/rideboard', (req, res) => {
    //     res.render('rideboard.html', req.session);
    // })
}



