# API da Plataforma de Cursos Online

Uma API RESTful completa para plataforma de educação à distância (EAD) construída com Node.js, Express e MySQL.

## 🚀 Funcionalidades

### Autenticação e Autorização
- ✅ Autenticação JWT
- ✅ Autenticação OAuth (Google)
- ✅ Sistema de roles (Admin, Instrutor, Aluno)
- ✅ Middleware de autorização baseado em permissões

### Gestão de Usuários
- ✅ Registro e login de usuários
- ✅ Perfis de usuário
- ✅ Três tipos de usuários com permissões específicas

### Gestão de Cursos
- ✅ CRUD completo de cursos
- ✅ Sistema de aprovação de cursos (Admin)
- ✅ Categorização e níveis de dificuldade
- ✅ Upload de thumbnails e arquivos

### Sistema de Matrículas
- ✅ Matrícula em cursos
- ✅ Acompanhamento de progresso
- ✅ Histórico de aprendizado

### Módulos e Aulas
- ✅ Organização em módulos
- ✅ Aulas com vídeos e arquivos
- ✅ Controle de progresso por aula

### Sistema de Avaliação
- ✅ Provas online
- ✅ Questões múltipla escolha e verdadeiro/falso
- ✅ Correção automática
- ✅ Controle de tentativas

### Certificados
- ✅ Geração automática de certificados
- ✅ Códigos únicos de verificação
- ✅ Validade configurável

### Sistema de Comentários
- ✅ Comentários por aula
- ✅ Sistema de dúvidas e respostas
- ✅ Threads de discussão

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Banco de Dados**: MySQL
- **Autenticação**: JWT, Passport.js (Google OAuth)
- **Validação**: Express-validator
- **Testes**: Jest, Supertest
- **Segurança**: Helmet, CORS, Rate Limiting
- **Upload de Arquivos**: Multer

## 📋 Pré-requisitos

- Node.js (v14 ou superior)
- MySQL (v8 ou superior)
- npm ou yarn

## 🔧 Instalação

1. **Clone o repositório**
\`\`\`bash
git clone <repository-url>
cd online-courses-api
\`\`\`

2. **Instale as dependências**
\`\`\`bash
npm install
\`\`\`

3. **Configure as variáveis de ambiente**
\`\`\`bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
\`\`\`

4. **Configure o banco de dados**
\`\`\`bash
# Execute o script SQL para criar as tabelas
mysql -u root -p < scripts/database-setup.sql
\`\`\`

5. **Execute os testes**
\`\`\`bash
npm test
\`\`\`

6. **Inicie o servidor**
\`\`\`bash
# Desenvolvimento
npm run dev

# Produção
npm start
\`\`\`

## 📚 Documentação da API

### Autenticação

#### Registro de Usuário
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "MinhaSenh@123",
  "role": "student"
}
