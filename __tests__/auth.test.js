const request = require("supertest")
const app = require("../src/app")
const { pool } = require("../src/config/database")

describe("Auth Endpoints", () => {
  beforeAll(async () => {
    // Limpar tabela de usuários para testes
    await pool.execute('DELETE FROM users WHERE email LIKE "%test%"')
  })

  afterAll(async () => {
    // Limpar dados de teste
    await pool.execute('DELETE FROM users WHERE email LIKE "%test%"')
    await pool.end()
  })

  describe("POST /api/auth/register", () => {
    it("deve registrar um novo usuário com dados válidos", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "Test123456",
        role: "student",
      }

      const response = await request(app).post("/api/auth/register").send(userData).expect(201)

      expect(response.body).toHaveProperty("message", "Usuário criado com sucesso")
      expect(response.body).toHaveProperty("user")
      expect(response.body).toHaveProperty("token")
      expect(response.body.user.email).toBe(userData.email)
      expect(response.body.user).not.toHaveProperty("password")
    })

    it("deve retornar erro para email duplicado", async () => {
      const userData = {
        name: "Test User 2",
        email: "test@example.com", // mesmo email do teste anterior
        password: "Test123456",
        role: "student",
      }

      const response = await request(app).post("/api/auth/register").send(userData).expect(409)

      expect(response.body).toHaveProperty("error", "Email já está em uso")
    })

    it("deve retornar erro para dados inválidos", async () => {
      const userData = {
        name: "T", // nome muito curto
        email: "invalid-email",
        password: "123", // senha muito fraca
        role: "invalid-role",
      }

      const response = await request(app).post("/api/auth/register").send(userData).expect(400)

      expect(response.body).toHaveProperty("errors")
      expect(Array.isArray(response.body.errors)).toBe(true)
    })
  })

  describe("POST /api/auth/login", () => {
    it("deve fazer login com credenciais válidas", async () => {
      const loginData = {
        email: "test@example.com",
        password: "Test123456",
      }

      const response = await request(app).post("/api/auth/login").send(loginData).expect(200)

      expect(response.body).toHaveProperty("message", "Login realizado com sucesso")
      expect(response.body).toHaveProperty("user")
      expect(response.body).toHaveProperty("token")
      expect(response.body.user).not.toHaveProperty("password")
    })

    it("deve retornar erro para credenciais inválidas", async () => {
      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      }

      const response = await request(app).post("/api/auth/login").send(loginData).expect(401)

      expect(response.body).toHaveProperty("error", "Credenciais inválidas")
    })

    it("deve retornar erro para email não existente", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "Test123456",
      }

      const response = await request(app).post("/api/auth/login").send(loginData).expect(401)

      expect(response.body).toHaveProperty("error", "Credenciais inválidas")
    })
  })

  describe("GET /api/auth/profile", () => {
    let authToken

    beforeAll(async () => {
      // Fazer login para obter token
      const loginResponse = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "Test123456",
      })

      authToken = loginResponse.body.token
    })

    it("deve retornar perfil do usuário autenticado", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty("user")
      expect(response.body.user).toHaveProperty("email", "test@example.com")
      expect(response.body.user).not.toHaveProperty("password")
    })

    it("deve retornar erro sem token de autenticação", async () => {
      const response = await request(app).get("/api/auth/profile").expect(401)

      expect(response.body).toHaveProperty("error", "Token de acesso requerido")
    })

    it("deve retornar erro com token inválido", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", "Bearer invalid-token")
        .expect(403)

      expect(response.body).toHaveProperty("error", "Token inválido")
    })
  })
})
