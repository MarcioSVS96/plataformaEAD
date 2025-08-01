const express = require("express")
const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  approveCourse,
} = require("../controllers/courseController")
const { authenticateToken, authorize, checkOwnership } = require("../middleware/auth")
const { createCourseValidation, updateCourseValidation } = require("../validation/courseValidation")

const router = express.Router()

// Rotas públicas
router.get("/", getCourses)
router.get("/:id", getCourseById)

// Rotas protegidas
router.post("/", authenticateToken, authorize("instructor", "admin"), createCourseValidation, createCourse)

router.put("/:id", authenticateToken, checkOwnership("course"), updateCourseValidation, updateCourse)

router.delete("/:id", authenticateToken, checkOwnership("course"), deleteCourse)

// Rota apenas para admins
router.patch("/:id/approve", authenticateToken, authorize("admin"), approveCourse)

module.exports = router
