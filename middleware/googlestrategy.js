const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            // Find or create user in your database
            const user = await User.findOneAndUpdate(
                { googleId: profile.id },
                {
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                },
                { upsert: true, new: true }
            );
            done(null, user);
        }
    )
);
