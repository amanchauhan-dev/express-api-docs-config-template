import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { database } from "../config/database";
import { generatePassword } from "src/helpers/passwordGenerator";
import { config } from "../config/config"
import { hashPassword } from "../helpers/auth.helpers";

const prisma = database.prisma

passport.use(
    new GoogleStrategy(
        {
            clientID: config.oauth.clientId,
            clientSecret: config.oauth.secret,
            callbackURL: `${config.oauth.clientUrl}/api/oauth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await prisma.user.findUnique({
                    where: { email: profile.emails?.[0].value },
                });

                if (!user) {
                    const password = await hashPassword(generatePassword(16))
                    user = await prisma.user.create({
                        data: {
                            email: profile.emails?.[0].value!,
                            name: profile.displayName,
                            password: password,
                            provider: "GOOGLE",
                            providerId: profile.id,
                            googleAccessToken: accessToken,
                            googleRefreshToken: refreshToken
                        },
                    });
                } else {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            provider: "GOOGLE",
                            googleAccessToken: accessToken,
                            googleRefreshToken: refreshToken || user.googleRefreshToken
                        },
                    });
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    )
);

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

export default passport;
