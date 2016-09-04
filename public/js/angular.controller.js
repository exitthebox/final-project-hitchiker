angular.module('app', ['ngRoute'])
  .controller('AppController', AppController)
  .directive('ngFiles', ['$parse', function ($parse) {

              function fn_link(scope, element, attrs) {
                  var onChange = $parse(attrs.ngFiles);
                  element.on('change', function (event) {
                      onChange(scope, { $files: event.target.files });
                  });
              };

              return {
                  link: fn_link
              }
          } ])
// inject the service $routeProvider, from ngRoute
angular.module('app')
  .config(function ($routeProvider) { 
    console.log('$routeProvider', $routeProvider)
    $routeProvider.when( '/', {
      
        templateUrl: './landing.html'
    });
    $routeProvider.when( '/login', {
      
        templateUrl: '/loginregister.html'
    });
    $routeProvider.when( '/logout', {
      
        templateUrl: '/logout'
    });
    // $routeProvider.when( '/message', {
      
    //     templateUrl: '/html/message.html'
    // });
    // $routeProvider.when( '/survey', {
      
    //     templateUrl: '/html/survey.html'
    // });
    $routeProvider.when( '/createRide', {
     
        templateUrl: '/html/createRide.html'
    });
    //not sure if this right below
    $routeProvider.when( '/ride', {
     
        templateUrl: '/html/rideboard.html'
    });
    ///////////////////////////////

    $routeProvider.when( '/useredit', {
     
        templateUrl: '/html/user-edit.html'
    });
    $routeProvider.when( '/userview/:id', {
     
        templateUrl: '/html/user-view.html'
    });
    // $routeProvider.when( '/confirmation', {
     
    //     templateUrl: '/html/confirmation.html'
    // });
    $routeProvider.when( '/message/:id/:origin/:destination', {
     
        templateUrl: '/html/message.html'
    });
    // $routeProvider.when( '/upload', {//this is being ignored!
     
    //     templateUrl: '/html/user-view.html'
    // });
    
    // the default route
    $routeProvider
      .otherwise({
        redirectTo: '/'
      });
  })
;

AppController.$inject = ['ApiFactory', '$window', '$routeParams', '$http']

function AppController(ApiFactory, $window, $routeParams, $http){

  var ac = this
  // var tweetList = ''
  ac.user = {}
  ac.ride = {}

  ac.loadUserFromSessionId = function (){
    console.log('loadUserFromSessionId()...')
    ApiFactory.fetchUser().then((res)=>{
      console.log('res.data.username', res.data.username)
      ac.user.username = res.data.username
    })
  }
  ac.loadUserFromSessionId()

  var formdata = new FormData();
  ac.getTheFiles = ($files) => {
    // console.log('$files: ', $files)
      angular.forEach($files, function (value, key) {
          formdata.append(key, value);
          // console.log(key + ' ' + value.name)
      });
      ac.uploadFiles(ac.user.username)
  };

  ac.uploadFiles = function(username) {
    var request = {
            method: 'POST',
            url: '/fs/fileUpload/'+username,
            data: formdata,
            headers: {
                'Content-Type': undefined
            }
        };
        $http(request).then((res)=>{
          console.log('$http.then', res.data)

          ApiFactory.updateUser({current_image : res.data}).then((response)=>{
            // console.log('ApiFactory.updateUser()', response)
            // ac.user.current_image = response.data.current_image
            ApiFactory.loadUser(ac.user.username).then((response)=>{
              // console.log('response.data from loadUser(): ', response.data)
              ac.user = response.data
    })
          })
        })

  }
  ac.loadUserEdit = function(){
    
    ApiFactory.loadUser(ac.user.username).then((response)=>{
      console.log('response.data from loadUser(): ', response.data)
      ac.user = response.data
    })
  }

  ac.sendMessage = function (req){
    // console.log(message)
    ApiFactory.sendMessage(req).then((response)=>{
      $window.alert('twillio message sent', response)
      // console.log('twillio message sent', response)
      $window.location.href = '/ride/#/ride/'
    })
  }

  ac.loadUserForMessage = function(){
    // console.log('loadUserForMessage()')
    // var uId = $routeParams.id
    console.log('loadUserForMessage(): ', $routeParams)
    ApiFactory.loadUserForMessage($routeParams).then((response)=>{
      console.log('ApiFactory.loadUserForMessage()', response)
      // checkPersonalityForMatch(ac.user.username)
      // console.log('loaded traits: ', response.data.traits[0].name)

      //need the user data for the phone number to send to twillio
      ac.user = response.data
      ac.user.origin = $routeParams.origin
      ac.user.destination = $routeParams.destination

    })
  }

  function checkPersonalityForMatch (username){



    // use ac.user.username for the logged in user
    var loggedInUser = ac.user.username
    var loggedInUserTraits = []
    var usernameTraits = []
    var matchingTraits = []

    var liUserTraitNames = []
    var uNameTraitNames = []

    // fetch the logged in user's profile
    ApiFactory.fetchUser(loggedInUser).then((res)=>{

      //xxxxxxxxxxxxxxxx  todo .filter orderby on percentage property in object collection 
      // to order the objects by percentage from strongest to weakest... might need to find
      // matching objects first   xxxxxxxxxxxxxxxxxxxxx

      loggedInUserTraits = res.data.traits

      //get the PI name from each object and load into another array
      loggedInUserTraits.forEach((i)=>{
        liUserTraitNames.push(i.name)
      })
      liUserTraitNames.sort()
            console.log("loggedInUserTraits: ", liUserTraitNames)
            // console.log('$routeParams: ', $routeParams)

      // fetch the username's profile
      ApiFactory.loadUser($routeParams.id).then((res)=>{
        // console.log('usernameTraits: ', res.data.traits)
        usernameTraits = res.data.traits

        //get the PI name from each object and load into another array
        usernameTraits.forEach((i)=>{
          uNameTraitNames.push(i.name)
        })
        uNameTraitNames.sort()

        // forEach over logged in user's traits
        // nested forEach over username's traits
        uNameTraitNames.forEach((i)=>{
          liUserTraitNames.forEach((j)=>{
            // console.log('forEach: ', i, j)
            if(i === j){
              // console.log('match: ', i, j)
              matchingTraits.push(i)
            }
            else{
              console.log('no match')
            }
          })
        })

        ac.traits = matchingTraits
      })
    })


    // console.log('matchingTraits: ', matchingTraits)
    // record matching traits, count matching traits
  }
  
  ac.loadUser = function(){
        // console.log('ac.user.storedUser in loadUser(): ', $routeParams.id)

    var uId = $routeParams.id
    // console.log('loadUser(): ', uId)
    ApiFactory.loadUser(uId).then((response)=>{
      checkPersonalityForMatch(ac.user.username)
      // console.log('loaded traits: ', response.data.traits[0].name)
      ac.user = response.data
    })

  }

//use this to view a user's profile
  ac.userClicked = function(x){
    //enable and fix the line below to redirect to the user's profile
    // $window.location.href = '/userprofile/#/user-view/:id'
    console.log('userClicked', x)
    ac.user.storedUser = x
    console.log('ac.user.storedUser in userClicked(): ', ac.user.storedUser)
    $window.location.href = '/userprofile/#/userview/'
  }

  ac.listOfRides = function(){
    ApiFactory.getAllRides().then((response)=>{
      ac.rideList = response.data
      ac.rideList.forEach((ride)=>{
        // console.log('ac.rideList.departure: ', ride.departure)
        var hours = new Date(ride.departure)
        var hh = hours.getHours()
        var mm = hours.getMinutes()
        // console.log('hhmm departure: ', hh.toString().concat(':',mm))
        ride.departure = hh.toString().concat(':', mm)

        hours = new Date(ride.arrival)
        hh = hours.getHours()
        var mm = hours.getMinutes()
        // console.log('hhmm arrival: ', hh.toString().concat(':',mm))
        ride.arrival = hh.toString().concat(':', mm)


      })
      
      console.log('ac.rideList: ', ac.rideList)

    })
  }

  ac.addRide = function(req){

    // console.log('addRide(): ', ac.ride)

    ac.ride.days = ''

    if(ac.ride.sunday){
      ac.ride.sunday    = 'sunday'
      ac.ride.days = ac.ride.days.concat('su ')
    }
    if(ac.ride.monday){
      ac.ride.monday    = 'monday'
      ac.ride.days = ac.ride.days.concat('mo ')
    }    
    if(ac.ride.tuesday){
      ac.ride.tuesday    = 'tuesday'
      ac.ride.days = ac.ride.days.concat('tu ')
    }
    if(ac.ride.wednesday){
      ac.ride.wednesday    = 'wednesday'
      ac.ride.days = ac.ride.days.concat('we ')
    }    
    if(ac.ride.thursday){
      ac.ride.thursday    = 'thursday'
      ac.ride.days = ac.ride.days.concat('th ')
    }
    if(ac.ride.friday){
      ac.ride.friday    = 'friday'
      ac.ride.days = ac.ride.days.concat('fr ')
    }
    if(ac.ride.saturday){
      ac.ride.saturday    = 'saturday'
      ac.ride.days = ac.ride.days.concat('sa ')
    } 
 
    ac.ride.username = ac.user.username

    console.log('addRide(): ', ac.ride)

    // console.log('ac.user.username: ', ac.user.username)
    //need to pass session user id in addition to req.body
    ApiFactory.addRide(req).then((response)=>{
      // console.log('ac.addRide() response', response)
      $window.location.href = '/ride/#/ride'

    })
  }

  ac.updateUser = function(req){

    //collect all data for passing to PI
    var piData = 'piData '
    //send essay 
    var essay = ac.user.essay

    // console.log('ac.updateUser()...', ac.user)

    //get tweets if screen name provided
    ApiFactory.getTweets(ac.user.twitter).then((response)=>{
      
      //check response for valid data or error
      // console.log('piData:', piData)
      piData += response.data
      // console.log('getTweets()', piData)
      //error handling

      // get reddit comments if username provided
      ApiFactory.getRedditComments(ac.user.reddit).then((response)=>{
        // console.log('getRedditComments()', response)
        //check response for valid data or error
        piData += response.data
        //error handling

        piData += essay
      
        // console.log('piData: ', piData)
        // req.body.traits = []
        //find the personality profile and update it
       ApiFactory.getPersonality(piData).then((response)=>{
          // console.log('getPersonality() in controller', response.data)
          if(response.data){
            ac.user.traits.push(response.data)
          }
          // console.log('ac.user: ', ac.user)
          // console.log('req.body: ', req)
          ApiFactory.updateUser(ac.user).then((response)=>{
            // console.log('ac.updateUser() ac.user', ac.user)

            // var userObject = ac.user

            // ApiFactory.createUserGraphDB(userObject).then((response)=>{
            //   console.log('createUserGraphDB', response)
            // })

          
          //want to change this to go back to last location
          $window.location.href = '/ride/#/ride'
          
          })
       })
      })
    })
       


  }
  //replace this with EJS if you have time
  ac.fetchUser = function(username){
    ApiFactory.fetchUser(username).then((response)=>{
      ac.user.username = response.data.username
      // ac.user._id = response.data._id
      ac.userData = response.data //whole data object
    })
  }
  // ac.fetchUser()

  //sets the toggle between the register and login tabs
  ac.activeTab = 1
  ac.setActiveTab = function(tabToSet){
    ac.activeTab = tabToSet
  }

  ac.getTweets = function(){
    // console.log('getTweets()')
    ApiFactory
      .getTweets()
      .then(function(response){
        ac.tweetList = response.data;
        // console.log('getTweets() data', ac.tweetList)
      });
  }
  // ac.getTweets();

  ac.getRedditComment = function(req, res){
    ApiFactory
      .getRedditComments()
      .then(function(response){
        ac.redditComment = response.data
        // console.log((getRedditComments(), ac.redditComment))
      })
  }
  // ac.getRedditComment('exitthebox')//todo need parameter here for user

  ac.getPersonality = function(req, res){
    ApiFactory
      .getPersonality(req, res)
      .then(function(){
        console.log('getPersonality() in controller', res.data)
        ac.traits = res.data.traits
        // console.log()
      })
  }
  // ac.getPersonality()

}
