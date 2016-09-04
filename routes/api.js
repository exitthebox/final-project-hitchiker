require('colors')

var request     =   require('request'),
    twitter     =   require('twitter'),
    snoocore    =   require('snoocore'),
    _           =   require('lodash'),
    userDB      =   require('../models/user'),
    rideDB      =   require('../models/ride');

var neo4j = require('neo4j');
var graphDB = new neo4j.GraphDatabase(process.env.neo4j_path);

var twilio     =   require('twilio')('process.env.TWILIO_key', 'process.env.TWILIO_secret')

    // keys        =   require('./keys.js')

    // console.log('TWITTER_consumer_key: ', process.env.TWITTER_consumer_key)
    // console.log('TWITTER_consumer_secret: ', process.env.TWITTER_consumer_secret)
    // console.log('TWITTER_access_token_key: ', process.env.TWITTER_access_token_key)
    // console.log('TWITTER_access_token_secret: ', process.env.TWITTER_access_token_secret)
    // console.log('TWILIO_key: ', process.env.TWILIO_key)
    // console.log('TWILIO_secret: ', process.env.TWILIO_secret)
    // console.log('WATSON_PI_key: ', process.env.WATSON_PI_key)
    // console.log('WATSON_PI_password: ', process.env.WATSON_PI_password)
    // console.log('REDDIT_key: ', process.env.REDDIT_key)
    // console.log('REDDIT_redirectURI: ', process.env.REDDIT_redirectURI)

var tweet = new twitter({

  consumer_key          : process.env.TWITTER_consumer_key,
  consumer_secret       : process.env.TWITTER_consumer_secret,
  access_token_key      : process.env.TWITTER_access_token_key,
  access_token_secret   : process.env.TWITTER_access_token_secret
});

var watson = require('watson-developer-cloud');

var personality_insights = watson.personality_insights({
  username : process.env.WATSON_PI_key,
  password : process.env.WATSON_PI_password,
  version: 'v2'
});

var params = require('../public/profile.json');//test .json file. remove later
var sample = require('../public/pi-sample.json');//test .json file. remove later

var loadPI = function(sessionUserId, traits){
    //need to save the big PI into the db

    // need to check if PI traits already exist and if they do, remove the current and add new

    userDB.findByIdAndUpdate(sessionUserId, {$unset: { traits: traits }}, (err, user)=>{
        if( err ) {
            console.log('#ERROR#'.red, 'Could not find new user :(', err);
            res.status(500).send(':(');
        } else {
            console.log('user found and updated:'.yellow, user)

        }
    })

    userDB.findByIdAndUpdate(sessionUserId, {$set: { traits: traits }}, (err, user)=>{
        if( err ) {
            console.log('#ERROR#'.red, 'Could not find new user :(', err);
            res.status(500).send(':(');
        } else {
            console.log('user found and updated:'.yellow, traits)

        }
    })

}

module.exports = {

    fetchTweets: (req, res) => {
        // console.log('fetchTweets() api.js', req.params.id)
        //NPM example code - 
        var params = {screen_name: req.params.id || 'twitter', count: 20};
        var tweetCollection = 'tweets '
        tweet.get('statuses/user_timeline', params, function(error, tweets, response) {
            tweets.forEach((t)=>{
                // console.log('foreach() t:', t.text)
                tweetCollection += t.text
            })
            if(tweetCollection){
                // console.log('tweetCollection...'.yellow, tweetCollection)
                res.send(tweetCollection)
            }else{
                console.log("fetchTweets() error".yellow, error)
                res.end()
            }
            
            
        });
    },
    fetchRedditComments: (req, res) => {
        // var urlCaptionsArray = []
        var userCommentsArray = []
        var user = req.params.id
        // console.log("fetchRedditComments() user:..".yellow, req.params.id)
        //library for accessing reddit api 7/27/2016
        // var Snoocore = window.Snoocore;
        var reddit = new snoocore(
          {/* config options */

          // Unique string identifying the app
          userAgent: '/u/exitthebox refactoruPics@0.0.0',
          // It's possible to adjust throttle less than 1 request per second.
          // Snoocore will honor rate limits if reached.
          throttle: 300,
          oauth: {
            type            : 'implicit',
            key             : process.env.REDDIT_key,
            redirectUri     : process.env.REDDIT_redirectURI,
            // The OAuth scopes that we need to make the calls that we
            // want. The reddit documentation will specify which scope
            // is needed for evey call
            scope: [ 'read', 'vote', 'history' ]
          }
        })

        reddit('/user/'+user+'/comments').get({
          limit: 15 //todo: add angular expression so users can set this value
        }).then((result)=>{
            var redditComments = 'reddit '
            //loop through the result and pluck the comments
            result.data.children.forEach((r)=>{
                redditComments += r.data.body

            })
            // console.log('result: ', redditComments)
            res.send(redditComments)

        }).catch((error)=>{
            console.log("reddit error: ".yellow, error.stack)
        })

        return {

          userCommentsArray: userCommentsArray
        }
    },
    fetchPersonality: (req, res) => {

        // ENABLE THE CODE BELOW FOR THE ACTUAL API CALL
        var personality = new Object
        var piArray = []
        var sessionUserId = req.session.user._id
        var reqBody = req.body
        // console.log("fetchPersonality().. with data...".yellow, reqBody)

        personality_insights.profile({
            text: reqBody,
            contentItems: 'text'
        }, 
        (error, response) => {
          if (error){
            console.log('error:', error);
            res.send(error)
            }
          else{
            console.log('Watson personality_insights called'.yellow)

            var data = _.filter(response.tree.children, (per)=>{
                // console.log("per: ", per.children)
                if(per.percentage > .5){
                    piArray.push({"name" : per.name, "percentage" : per.percentage})

                }
                else
                {
                    // console.log('per less than .5'.yellow)
                }

                return _.filter(per.children, (x)=>{

                    if(x.percentage > .5)
                        {
                            piArray.push({"name" : x.name, "percentage" : x.percentage})
                            
                        }
                        else
                        {
                            // console.log('x less than .5'.yellow)
                        }

                        return _.filter(x.children, (y)=>{


                            if(y.percentage > .5){
                                piArray.push({"name" : y.name, "percentage" : y.percentage})
                               
                            }
                            else
                            {
                                // console.log('y less than .5'.yellow)
                            }

                            return _.filter(y.children, (z)=>{

                                
                                if(z.percentage > .5){
                                    piArray.push({"name" : z.name, "percentage" : z.percentage})
                                    
                                }
                                else{
                                    // console.log('zzzzzz less than .5'.yellow)
                                }
                            })
                        })

                    })
                   

                }) //underscore .filter

            }//else personality_insights.profile error

            //update the db with the PI data
            loadPI(sessionUserId, piArray)
            // console.log('piArray after'.red, piArray)

          }//personality_insights.profile

        );//personality_insights.profile

         // res.send('piData updated in MongoDB')
         res.end();
    },
    fetchUser: (req, res)=>{
        // res.json(req.session.user)
        var session = req.session

                console.log('fetchUser() username req.session: '.yellow, session)

        if(session !== null){
            userDB.findOne({
                _id: req.session.user._id
            }, (err, user)=>{
                console.log('fetchUser() MongoDB: '.yellow)
                if (err){ return (err)
                }
                else{
                    console.log('fetchUser() MongoDB: '.yellow, user)
                    res.json(user)
                 // console.log('user returned: ', user.username)   
                }
                
            })
        }
        else{
            console.log('no user logged in'.yellow)
            res.send('not logged in')
        }
    },
    updateUser: (req, res)=>{
        console.log('req.session.id in api.js:'.cyan, req.session.user._id);
        userDB.findOne({
            _id: req.session.user._id
        }, (err, user) => {
            if( err ) {
                console.log('#ERROR#'.red, 'Could not find new user :(', err);
                res.status(500).send(':(');
            } else {
                // console.log('New user created in MongoDB:', user);
                user.update(req.body, (err, user) => {
                    // console.log('req.session.user: ', req.session.user)
                    res.send(err||user);
                    // console.log('updatedUser.update() success'.yellow)
                    // res.redirect('/ride/#/createRide')   //this won't work because I get headers already defined errors                     
                });
            }
        });
    },
    addRide: (req, res)=> {
        
        var newRide = new rideDB(req.body)
        // console.log('req.session.user._id: '.cyan, req.session.user)
        // console.log('req.body: '.yellow, req.body)
        // req.body._id = req.session.user._id
        newRide.save(req.body, (err, ride) => {
            if( err ) {
                res.status(500).send(':(');
            } else {
                res.send(ride);
            }
        })
    },
    getAllRides: (req, res)=>{
        // var allRides = new rideDB(req.body)

        rideDB.find({}, (err, docs)=>{
            if( err ) {
                res.status(500).send(':(');
            } else {
                // console.log('docs'.yellow, docs)
                res.send(docs);
            }
        })
    },
    loadUser: (req, res)=>{
        
        var uId = req.params.id
        console.log('loadUser() uId: '.yellow, uId)
        if(uId){
            userDB.findOne({
                username: uId
            }, (err, user)=>{
                if (err){ 
                    res.send(err)
                }
                else{
                    res.json(user)
                    // console.log('loadUser() returned: ', user.username)   
                }
                
            })
        }
        else{
            res.redirect('/login')
        }
    },
    loadUserForMessage: (req, res)=>{

        var uId = req.params.id
        console.log('loadUser() uId: '.yellow, uId)

        userDB.findOne({
            username: uId
        }, (err, user)=>{
            if (err){ 
                return (err)
            }
            else{
                res.json(user)
                console.log('loadUser() returned: ', user.username)   
            }
            
        })
        // I will definitely need a page to sendMessage using Twillio
    },
    sendMessage: (req, res)=>{
        var mobile = '+1'+req.body.mobile; 
        // console.log('sendMessage mobile'.yellow, mobile)
        // console.log('sendMessage body'.yellow, req.body.message.body)

        //Send an SMS text message
        twilio.sendMessage({   



            to: mobile, // Any number Twilio can deliver to
            from: '+17209437390', // A number you bought from Twilio and can use for outbound communication
            body: req.body.message.body // body of the SMS message

        }, function(err, responseData) { //this function is executed when a response is received from Twilio

            if (!err) { // "err" is an error received during the request, if any

                // "responseData" is a JavaScript object containing data received from Twilio.
                // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
                // http://www.twilio.com/docs/api/rest/sending-sms#example-1
                // console.log(responseData); // outputs "+14506667788"

                // console.log(responseData.from); // outputs "+14506667788"
                // console.log(responseData.body); // outputs "word to your mother."
                res.send(responseData)
            }
            else
            {
                console.log('twilio error', err)
                res.send('twilio error!', err)
            }
        });


        
    },
    upload: (req, res)=>{
        console.log('upload()before mv'.yellow , req.files["0"])
        var picFile;
 
        if (!req.files) {
            res.send('No files were uploaded.');
            return;
        }
        var suffix
        if(req.files["0"].mimetype === 'image/jpeg')
        {
            suffix = '.jpg'
        }
        else if(req.files["0"].mimetype === 'image/png'){
            suffix = '.png'
        }
        else{
            return res.send('invalid file type')
        }
        //get the current time and append it to the name
        var currentDate = new Date()
        currentDate = currentDate.getTime()
        //append the username
        req.files["0"].name = req.params.id+currentDate+suffix
        //update the user mongo record with the current filename
        // updateUser({current_image : req.files["0"].name}).then((res)=>{
        //     console.log('updateUser from pic upload'.green, res)
        // })
    
     
        picFile = req.files["0"];
        // console.log('upload() picFile '.yellow, picFile)
        picFile.mv('./upload/'+picFile.name, function(err) {
            if (err) {
                res.status(500).send(err);
            }
            else {
                console.log('file uploaded'.green)
                res.send(req.files["0"].name);
                // res.render('userprofile')
            }
        });
    },
    createCypher: (req, res)=>{

        // console.log('createUserCypher()...'.yellow, req.body)

        //create a node for the username
        // var cypher = 'CREATE ('+req.body.username+':User '+'{name: '+req.body.first_name+' '+req.body.last_name+'})'
        var userCypher = `CREATE (${req.body.username}:User {name: '${req.body.first_name} ${req.body.last_name}'})`
        graphDB.cypher({
        query: userCypher,
            params: {
                username:   req.body.username,
                first   :   req.body.first_name,
                last    :   req.body.last_name
            },
            }, (err, results) => {
                if (err) throw err;
                if(results){
                    console.log('results from create user cypher'.yellow, results)
                }
        });

        req.body.traits.forEach((trait)=>{
            console.log('traits before: '.cyan, trait.name, trait.percentage)
            var new_string = trait.name.replace(/-|\s/g,"");
            trait.name = new_string
            console.log('traits after: '.cyan, trait.name, trait.percentage)
            
            var piCypher = `CREATE (${trait.name}:Trait {trait: '${trait.name}'})`
            graphDB.cypher({
            query: piCypher,
                params: {
                    
                },
                }, (err, results) => {
                    if (err) throw err;
                    if(results){
                        console.log('results from create traits cypher'.yellow, results)
                        // res.send(results)
                    }
            });
        })

//relationships   
//CREATE  (Keanu)-[:ACTED_IN {roles:['Neo']}]->(TheMatrix)


        res.send(req.body)
    }


}

