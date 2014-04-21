module.exports = function(configs) {
  var passport = require('passport'),
      FacebookStrategy = require('passport-facebook').Strategy;

  passport.use(new FacebookStrategy({
      clientID: configs.facebook.FACEBOOK_APP_ID,
      clientSecret: configs.facebook.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:9000/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      console.log(arguments);
    }
  ));
  
  return passport;
};

