(function(){
    angular.module('app.auth', [])
        .controller('app.auth.controller', Auth)

    Auth.$inject = ['$http', '$window'];

    function Auth($http, $window) { // window.Auth
        // console.info('Auth controller loaded!');

        var auth = this,
            alertError = ['alert','alert-danger'];

        auth.payload = { // used both for registering and loggin in
            // ng-models are point to properties on this object
            // email (ng-model)
            // password (ng-model)
        };

        auth.login = {
            // happens when the user clicks submit on the login form
            submit: function($event) { // click-event
                // console.info('auth.login.submit', $event);

                $http.post('/login', auth.payload)
                    .then(auth.login.success, auth.login.error);
                    // brandon reminds you, that a wiffle bat will strike you if you forget your error callback!
            },
            success: function(res) { // server response callback
                // console.log('login success! in auth.js')
                // location.href = '/ride/#/ride';
                $window.location.href = '/ride/#/ride'
            },
            error: function(err) {
                // console.error('Login.error', err);

                // user feedback stuffs, sets up the alert box on error
                auth.login.alert = alertError;
                auth.login.message = ( err.data && err.data.message ) || 'Login failed, contact us!';
            }
        };

        auth.register = {
            submit: function () {
                // happens when the user clicks submit on the register form
                $http.post('/register', auth.payload)
                    .then(auth.register.success, auth.register.error);
            },
            success: function() {
                // when register is successful, just redirect them into the user edit (already logged in)
                location.href = "/userprofile/#/useredit";
            },
            error: function(err) {
                // console.error('auth.register.error', err);

                // user feedback stuffs, sets up the alert box on error
                auth.register.alert = alertError;
                auth.register.message = ( err.data && err.data.message ) || 'Register failed, contact us!'
            }
        };
    }
})();
