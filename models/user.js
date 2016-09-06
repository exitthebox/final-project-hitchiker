const SALTY_BITS = 10; // strength of your passowrd encryption, 10 is usually more than enough

var mongoose = require('mongoose'),
    // bcrypt = require('bcrypt') // sudo apt-get install bcrypt [ run update first, thanks Juliano ;) ] USE THIS FOR PRODUCTION
    bcrypt = require('bcryptjs'),
    UserSchema = new mongoose.Schema({
        email               :   {type: String, unique: true},    
        username            :   {type: String, unique: true},    
        password            :   String,       
        created: {
            type: Number,
            default: () => Date.now()
        }
    });

// hash passwords before saving a new user
UserSchema.pre('save', function(next) { // don't use an arrow function here, we need the scope!
    var user = this; // this is why we can't use an arrow function  here, again we need the scope

    // only hash the password if it has been modified (for updating users)
    if( !user.isModified('password') ) {
        return next();
    }
    // generate a salt value to encrypt our password
    bcrypt.genSalt(SALTY_BITS, (saltErr, salt) => { // used to guarentee uniqueness
        if(saltErr) {
            return next(saltErr);
        }
        console.info('SALT generated!'.yellow, salt);

        // now let's hash this bad boy!
        bcrypt.hash(user.password, salt, (hashErr, hashedPassword) => {
            if( hashErr ) {
                return next(hashErr);
            }
            // over-ride the plain text password with the hashed one
            user.password = hashedPassword;
            next();
        });
    });
});

module.exports = mongoose.model('User', UserSchema);
