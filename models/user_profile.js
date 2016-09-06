var mongoose = require('mongoose'),

UserProfileSchema = new mongoose.Schema({
    first_name          :   String,
    last_name           :   String,
    nick_name           :   String,
    username            :   {type: String, unique: true},
    mobile              :   {type: String, unique: true},
    password            :   String,
    car_make            :   String,
    car_model           :   String,
    car_year            :   String,
    twitter             :   String,
    reddit              :   String,
    essay               :   String,
    rating              :   String,
    gender              :   String,
    politics            :   String,
    outdoor             :   String,
    sports              :   String,
    orientation         :   String,
    talk                :   String,
    description         :   String,
    traits              :   [],
    current_image       :   String,
    ip_address          :   String,
    created: {
        type: Number,
        default: () => Date.now()
    }

});

module.exports = mongoose.model('UserProfile', UserProfileSchema);