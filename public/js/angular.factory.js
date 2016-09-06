angular.module('app')
    .factory('ApiFactory', ApiFactory)

ApiFactory.$inject = ['$http']

// Our factory will be the MAIN place we make calls to the backend
function ApiFactory ($http){

    function getTweets (req) {
      if(!req){
        req = 'twitter'
      }
      // console.log('getTweets() factory')
      return $http.get('/api/twitter/'+req)
    }
    function getRedditComments (req){
      if(!req){
        req = 'reddit'
      }

      return $http.get('/api/reddit/'+req)
    }
    function getPersonality (req){
      // console.log('xxxxxxxxxxxxxxxxx getPersonality... this needs to be a $put! xxxxxxxxxxxxxxx', req)
      return $http({
        method: 'PUT',
        url: '/api/pi',
        headers: {
          'Content-Type':'text/html'
        },
        data: req
      }, req)
    }
    function fetchUser (req){
      // console.log('api fetchUser()', req)
      return $http.get('/api/user')
    }
    function updateUser (req){
      // console.log('factory updateUser() req:', req)
      return $http.post('/db/userPost', req)
    }
    function addRide (req){
      return $http.post('/db/ridePost', req)
    }
    function getAllRides (req){
      return $http.get('/db/getAllRides')
    }
    function loadUser (req){
      return $http.get('/db/loadUser/'+req)
    }
    // function renderMessage (req){
    //   return $http.get('/message/'+req)
    // }
    function loadUserForMessage (req){
      var path = req.id+'/'+req.origin+'/'+req.destination
      // console.log('loadUserForMessage() angular factory', req, path)
      return $http.get('/db/loadUserForMessage/'+path)
    }
    function sendMessage(req){
      return $http.post('/api/sendMessage', req)
    }
    function uploadFiles(req){//this is not being used
      // console.log('factory uploadFiles() before $http.post', req)
      return $http.post('/fs/fileUpload', {data : req, headers : { 'Content-Type': undefined }} )
    }
    function createUserGraphDB(req){
      return  $http.post('/db/graph', req)
    }

    // This return value is exactly what we gain access to in the controller
    return {
        getTweets               : getTweets,
        getRedditComments       : getRedditComments,
        getPersonality          : getPersonality,
        fetchUser               : fetchUser,
        updateUser              : updateUser,
        addRide                 : addRide,
        getAllRides             : getAllRides,
        loadUser                : loadUser,
        loadUserForMessage      : loadUserForMessage,
        sendMessage             : sendMessage,
        uploadFiles             : uploadFiles,
        createUserGraphDB       : createUserGraphDB
        
    }
} 