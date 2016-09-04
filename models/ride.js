
var mongoose = require('mongoose')

RideSchema = new mongoose.Schema({
  username    :   String,
  userType    :   String,   // only valid values are "rider" or "driver"
  origin      :   String,
  departure   :   String,   //time of day someone is leaving their origin
  destination :   String,
  arrival     :   String,   //time of day someone is arriving at their destination
  seats       :   Number,   //number of seats available for ride
  days        :   String,   //string of day abbreviations
  sunday      :   String,
  monday      :   String,
  tuesday     :   String,
  wednesday   :   String,
  thursday    :   String,
  friday      :   String,
  saturday    :   String,
  onetime     :   Boolean,  //indicates if this is a one-time trip only
  date        :   Date      //if its a one-time trip, this needs to be populated
})

module.exports = mongoose.model('Ride', RideSchema);