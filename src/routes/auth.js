const express = require("express")
const passport = require("../config/passport")
const { register, login, getProfile, updateProfile } = require("../controllers/authController")
const { authenticateToken } = require("../middleware/auth")
const { registerValidation, loginValidation, updateProfileValidation } = require("../validation/authValidation")

const router = express.Router()

// Rotas de autenticação JWT
router.post("/register", registerValidation, register)
router.post("/login", loginValidation, login)

// Rotas protegidas
router.get("/profile", authenticateToken, getProfile)
router.put("/profile", authenticateToken, updateProfileValidation, updateProfile)

// Rotas OAuth Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))

router.get("/google/callback", passport.authenticate("google", { session: false }), (req, res) => {
  const jwt = require("jsonwebtoken")
  const token = jwt.sign({ id: req.user.id, email: req.user.email, role: req.user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  })

  // Redirecionar para o frontend com o token
  res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/callback?token=${token}`)
})

module.exports = router
