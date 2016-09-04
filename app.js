require('colors')

var express       =     require('express'),
    upload        =     require('express-fileupload'),
    bodyParser    =     require('body-parser'),
    mongoose      =     require('mongoose'),
    request       =     require('request'),
    snoocore      =     require('snoocore'),

    twit          =     require('twitter'),
    watson        =     require('watson-developer-cloud'),
    Routes        =     require('./routes'),
    path          =     require('path'),
    logger        =     require('morgan'),
    
    lodash        =     require('lodash'),
    ejs           =     require('ejs'),
    sessions      =     require('client-sessions'), // encrypted cookies!

    neo4j         =     require('neo4j'),

    port          =     process.env.PORT || 3000

    // keys        =   require('./routes/keys.js')



var app = express();

// app.use :: speaking in code: mounting middleware via the USE method (vertically!)
app.use( logger('dev') );
app.use(sessions({
    cookieName: '_mean-auth', // front-end cookie name
    secret: 'adr1ann@', // the encryption password : keep this safe
    requestKey: 'session', // req.session,
    duration: 864000, // 60 * 60 * 24 (number of seconds in a day), tells the middleware when the cookie/session should expire,
    cookie: {
        ephemeral: false,   // when true, cookie expires when browser is closed
        httpOnly: true,     // when true, the cookie is not accesbile via front-end JavaScript
        secure: false       // when true, cookie will only be read when sent over HTTPS
    }
}));

// vetically mounting a file server, pointing to public
app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(path.join(__dirname,'upload')));
app.use(upload());


// set variable in the app objects
app.set('publicHTML', __dirname +'/public/html');


// app.set('publicViews', __dirname +'/public/views');

app.set('view engine','html'); // allows us to specify the default extension for the files in the views folder
app.engine('html', ejs.renderFile); // this is the function that binds to res.render

mongoose.connect('mongodb://localhost/mean-auth', (mongooseErr) => {
    if( mongooseErr ) {
        console.error('#ERROR#'.red,'Could not initilize mongoose!', mongooseErr);
    } else {
        console.info('Mongoose initilized!'.green.bold);
    }
});

// make sure you mount routes BELOW vertically mounted middleware!
Routes(app);

// console.log('app.js keys: '.yellow, keys.consoleLog)

app.listen(port, (error) => {
    if( error ) {
        console.error('Everything crashed and burned :(', error);
    } else {
        // interpolation sensation using template literals
        console.log(`Serving tweets on port: ${port}`);
    }
});