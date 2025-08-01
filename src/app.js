const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

// Importar rotas
const authRoutes = require("./routes/auth")
const courseRoutes = require("./routes/courses")
const enrollmentRoutes = require("./routes/enrollments")

const app = express()

// Middlewares de segurança
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: "Muitas tentativas, tente novamente em 15 minutos",
})
app.use(limiter)

// Middlewares de parsing
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Rotas
app.use("/api/auth", authRoutes)
app.use("/api/courses", courseRoutes)
app.use("/api/enrollments", enrollmentRoutes)

// Rota de health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  })
})

// Middleware de tratamento de erros 404
app.use("*", (req, res) => {
  res.status(404).json({ error: "Rota não encontrada" })
})

// Middleware de tratamento de erros globais
app.use((error, req, res, next) => {
  console.error("Erro não tratado:", error)
  res.status(500).json({
    error: "Erro interno do servidor",
    ...(process.env.NODE_ENV === "development" && { details: error.message }),
  })
})

module.exports = app
