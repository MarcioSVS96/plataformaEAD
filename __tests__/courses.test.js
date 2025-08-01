const request = require("supertest")
const app = require("../src/app")
const { pool } = require("../src/config/database")

describe("Courses Endpoints", () => {
  let instructorToken
  let studentToken
  let adminToken
  let courseId

  beforeAll(async () => {
    // Limpar dados de teste
    await pool.execute('DELETE FROM courses WHERE title LIKE "%Test Course%"')
    await pool.execute('DELETE FROM users WHERE email LIKE "%coursetest%"')

    // Criar usuários de teste
    const instructorData = {
      name: "Test Instructor",
      email: "instructor.coursetest@example.com",
      password: "Test123456",
      role: "instructor",
    }

    const studentData = {
      name: "Test Student",
      email: "student.coursetest@example.com",
      password: "Test123456",
      role: "student",
    }

    const adminData = {
      name: "Test Admin",
      email: "admin.coursetest@example.com",
      password: "Test123456",
      role: "admin",
    }

    // Registrar usuários
    const instructorResponse = await request(app).post("/api/auth/register").send(instructorData)
    instructorToken = instructorResponse.body.token

    const studentResponse = await request(app).post("/api/auth/register").send(studentData)
    studentToken = studentResponse.body.token

    const adminResponse = await request(app).post("/api/auth/register").send(adminData)
    adminToken = adminResponse.body.token
  })

  afterAll(async () => {
    // Limpar dados de teste
    await pool.execute('DELETE FROM courses WHERE title LIKE "%Test Course%"')
    await pool.execute('DELETE FROM users WHERE email LIKE "%coursetest%"')
    await pool.end()
  })

  describe("POST /api/courses", () => {
    it("deve criar um curso como instrutor", async () => {
      const courseData = {
        title: "Test Course JavaScript",
        description: "Um curso completo de JavaScript para iniciantes",
        category: "Programming",
        level: "beginner",
        price: 99.99,
      }

      const response = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${instructorToken}`)
        .send(courseData)
        .expect(201)

      expect(response.body).toHaveProperty("message", "Curso criado com sucesso")
      expect(response.body).toHaveProperty("course")
      expect(response.body.course.title).toBe(courseData.title)

      courseId = response.body.course.id
    })

    it("deve retornar erro ao tentar criar curso como estudante", async () => {
      const courseData = {
        title: "Test Course Unauthorized",
        description: "Este curso não deveria ser criado",
        category: "Programming",
        level: "beginner",
      }

      const response = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(courseData)
        .expect(403)

      expect(response.body).toHaveProperty("error", "Acesso negado. Permissões insuficientes")
    })

    it("deve retornar erro para dados inválidos", async () => {
      const courseData = {
        title: "AB", // título muito curto
        description: "Desc", // descrição muito curta
        category: "",
        level: "invalid-level",
      }

      const response = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${instructorToken}`)
        .send(courseData)
        .expect(400)

      expect(response.body).toHaveProperty("errors")
      expect(Array.isArray(response.body.errors)).toBe(true)
    })
  })

  describe("GET /api/courses", () => {
    it("deve listar cursos públicos", async () => {
      const response = await request(app).get("/api/courses").expect(200)

      expect(response.body).toHaveProperty("courses")
      expect(response.body).toHaveProperty("pagination")
      expect(Array.isArray(response.body.courses)).toBe(true)
    })

    it("deve filtrar cursos por categoria", async () => {
      const response = await request(app).get("/api/courses?category=Programming").expect(200)

      expect(response.body).toHaveProperty("courses")
      response.body.courses.forEach((course) => {
        expect(course.category).toBe("Programming")
      })
    })
  })

  describe("GET /api/courses/:id", () => {
    it("deve retornar detalhes de um curso específico", async () => {
      const response = await request(app).get(`/api/courses/${courseId}`).expect(200)

      expect(response.body).toHaveProperty("course")
      expect(response.body.course.id).toBe(courseId)
      expect(response.body.course).toHaveProperty("modules")
      expect(response.body.course).toHaveProperty("stats")
    })

    it("deve retornar erro para curso inexistente", async () => {
      const response = await request(app).get("/api/courses/99999").expect(404)

      expect(response.body).toHaveProperty("error", "Curso não encontrado")
    })
  })

  describe("PUT /api/courses/:id", () => {
    it("deve atualizar curso como proprietário", async () => {
      const updateData = {
        title: "Test Course JavaScript Updated",
        description: "Descrição atualizada do curso de JavaScript",
        category: "Web Development",
        level: "intermediate",
      }

      const response = await request(app)
        .put(`/api/courses/${courseId}`)
        .set("Authorization", `Bearer ${instructorToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body).toHaveProperty("message", "Curso atualizado com sucesso")
      expect(response.body.course.title).toBe(updateData.title)
    })

    it("deve retornar erro ao tentar atualizar curso de outro usuário", async () => {
      const updateData = {
        title: "Unauthorized Update",
      }

      const response = await request(app)
        .put(`/api/courses/${courseId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(updateData)
        .expect(403)

      expect(response.body).toHaveProperty("error", "Acesso negado")
    })
  })

  describe("PATCH /api/courses/:id/approve", () => {
    it("deve aprovar curso como admin", async () => {
      const response = await request(app)
        .patch(`/api/courses/${courseId}/approve`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ approved: true })
        .expect(200)

      expect(response.body).toHaveProperty("message", "Curso aprovado com sucesso")
    })

    it("deve retornar erro ao tentar aprovar como não-admin", async () => {
      const response = await request(app)
        .patch(`/api/courses/${courseId}/approve`)
        .set("Authorization", `Bearer ${instructorToken}`)
        .send({ approved: true })
        .expect(403)

      expect(response.body).toHaveProperty("error", "Acesso negado. Permissões insuficientes")
    })
  })
})
