const { body } = require("express-validator")

const createCourseValidation = [
  body("title").trim().isLength({ min: 3, max: 255 }).withMessage("Título deve ter entre 3 e 255 caracteres"),

  body("description")
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Descrição deve ter entre 10 e 2000 caracteres"),

  body("category").trim().isLength({ min: 2, max: 100 }).withMessage("Categoria deve ter entre 2 e 100 caracteres"),

  body("level")
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("Nível deve ser beginner, intermediate ou advanced"),

  body("price").optional().isFloat({ min: 0 }).withMessage("Preço deve ser um número positivo"),
]

const updateCourseValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage("Título deve ter entre 3 e 255 caracteres"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Descrição deve ter entre 10 e 2000 caracteres"),

  body("category")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Categoria deve ter entre 2 e 100 caracteres"),

  body("level")
    .optional()
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("Nível deve ser beginner, intermediate ou advanced"),

  body("price").optional().isFloat({ min: 0 }).withMessage("Preço deve ser um número positivo"),
]

module.exports = {
  createCourseValidation,
  updateCourseValidation,
}
