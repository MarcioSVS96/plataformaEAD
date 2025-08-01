const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const JwtStrategy = require("passport-jwt").Strategy
const ExtractJwt = require("passport-jwt").ExtractJwt
const { pool } = require("./database")

// Estratégia JWT
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const [rows] = await pool.execute(
          "SELECT id, name, email, role, is_active FROM users WHERE id = ? AND is_active = true",
          [payload.id],
        )

        if (rows.length > 0) {
          return done(null, rows[0])
        }
        return done(null, false)
      } catch (error) {
        return done(error, false)
      }
    },
  ),
)

// Estratégia Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Verificar se usuário já existe
        const [existingUser] = await pool.execute("SELECT * FROM users WHERE google_id = ? OR email = ?", [
          profile.id,
          profile.emails[0].value,
        ])

        if (existingUser.length > 0) {
          // Atualizar google_id se necessário
          if (!existingUser[0].google_id) {
            await pool.execute("UPDATE users SET google_id = ? WHERE id = ?", [profile.id, existingUser[0].id])
          }
          return done(null, existingUser[0])
        }

        // Criar novo usuário
        const [result] = await pool.execute(
          "INSERT INTO users (name, email, google_id, avatar, role) VALUES (?, ?, ?, ?, ?)",
          [profile.displayName, profile.emails[0].value, profile.id, profile.photos[0]?.value || null, "student"],
        )

        const [newUser] = await pool.execute("SELECT * FROM users WHERE id = ?", [result.insertId])

        return done(null, newUser[0])
      } catch (error) {
        return done(error, null)
      }
    },
  ),
)

module.exports = passport
