const FacebookStrategy = require('passport-facebook').Strategy;

passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: "/auth/facebook/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            const user = await User.findOneAndUpdate(
                { facebookId: profile.id },
                {
                    name: profile.displayName,
                    facebookId: profile.id,
                },
                { upsert: true, new: true }
            );
            done(null, user);
        }
    )
);
