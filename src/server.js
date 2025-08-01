const app = require("./app")
const { testConnection } = require("./config/database")

const PORT = process.env.PORT || 3000

const startServer = async () => {
  try {
    // Testar conexão com o banco
    await testConnection()

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`)
      console.log(`📚 API da Plataforma de Cursos Online`)
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || "development"}`)
      console.log(`📖 Documentação: http://localhost:${PORT}/api/health`)
    })
  } catch (error) {
    console.error("❌ Erro ao iniciar servidor:", error)
    process.exit(1)
  }
}

startServer()
