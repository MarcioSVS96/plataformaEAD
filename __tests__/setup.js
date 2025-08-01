// Configurações globais para os testes
require("dotenv").config({ path: ".env.test" })

// Importar Jest para usar a função setTimeout
const jest = require("jest")

// Configurar timeout para operações de banco de dados
jest.setTimeout(10000)

// Mock de console.log para testes mais limpos
global.console = {
  ...console,
  log: jest.fn(),
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
}
