var User = require('../models/user'),
    bcrypt = require('bcryptjs'),
    errors = {
        general: {
            status: 500,
            message: 'Backend Error'
        },
        login: {
            status: 403,
            message: 'Invalid username or password.'
        }
    };

module.exports = {
    render: (req, res) => { // render the login page
        // res.render('login.html');
        // console.log('res.render()')
        res.render('./loginregister.html');

    },
    logout: (req, res) => {
        req.session.user = null;
        res.redirect('/#/login');
    },
    login: (req, res) => { // form post submission

        //the below console.log will expose the password in plain text
        console.log('auth-route.login() before User.findOne()'.yellow, req.session, req.body);


        User.findOne({
            email: req.body.email
        }, (err, user) => {
            if( err ) {
                console.error('MongoDB error:'.red, err);
                res.status(500).json(errors.general);
            }
            if( !user ) {
                // forbidden
                console.warn('No user found!'.yellow);
                res.status(403).json(errors.login);
            } else {
                // console.info('auth.login.user', user);

                // at this point, user.password is hashed!
                bcrypt.compare(req.body.password, user.password, (bcryptErr, matched) => {
                    // matched will be === true || false
                    if( bcryptErr ) {
                        console.error('MongoDB error:'.red, err);
                        res.status(500).json(errors.general);
                    } else if ( !matched ) {
                        // forbidden, bad password
                        console.warn('Password did not match!'.yellow);
                        res.status(403).json(errors.login);
                    } else {
                        req.session.user = user;
                        delete user.password; // just for securty, delete the password before sending it to the front-end;
                        console.log('login success! in auth-route.js'.yellow, req.session.user.username)
                        // res.end()
                        res.send('logged in');
                        // res.redirect('ride/#/rideboard');
                    }
                });
            }
        });
    },
    register: (req, res) => {
        console.info('Register payload:'.cyan, req.body);

        var newUser = new User(req.body);

        newUser.save((err, user) => {
            if( err ) {
                console.log('#ERROR#'.red, 'Could not save new user :(', err);
                res.status(500).send(errors.general);
            } else {
                console.log('New user created in MongoDB:', user);
                req.session.user = user;
                // console.log('req.session.user: ', req.session.user)
                res.send(user);
                // console.log('res.send()')
                // res.redirect('/userprofile/#/user-edit')
            }
        });
    },
    // Auth middleware functions, grouped
    middlewares: {
        session: (req, res, next) => {
            console.log('middlewares session: ', req.session.user)
            if( req.session.user ) {
                console.info('User is logged in, proceeding to dashboard...'.green, req.session);
                next();
            } else {
                console.warn('User is not logged in! middlewares notice'.yellow, req.session)
                res.redirect('/#/login');
            }
        }
    }
}
