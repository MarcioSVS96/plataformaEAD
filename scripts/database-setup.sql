-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS online_courses;
USE online_courses;

-- Tabela de usuários
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    role ENUM('admin', 'instructor', 'student') DEFAULT 'student',
    google_id VARCHAR(255) UNIQUE,
    avatar VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de cursos
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id INT NOT NULL,
    category VARCHAR(100),
    level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    price DECIMAL(10,2) DEFAULT 0.00,
    thumbnail VARCHAR(255),
    is_published BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de módulos
CREATE TABLE modules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Tabela de aulas
CREATE TABLE lessons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    module_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    video_url VARCHAR(500),
    duration INT, -- em segundos
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

-- Tabela de arquivos das aulas
CREATE TABLE lesson_files (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lesson_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- Tabela de matrículas
CREATE TABLE enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    progress DECIMAL(5,2) DEFAULT 0.00,
    UNIQUE KEY unique_enrollment (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Tabela de progresso das aulas
CREATE TABLE lesson_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    lesson_id INT NOT NULL,
    completed BOOLEAN DEFAULT false,
    watched_duration INT DEFAULT 0,
    completed_at TIMESTAMP NULL,
    UNIQUE KEY unique_progress (student_id, lesson_id),
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- Tabela de provas
CREATE TABLE exams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    passing_score DECIMAL(5,2) DEFAULT 70.00,
    time_limit INT, -- em minutos
    attempts_allowed INT DEFAULT 3,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Tabela de questões
CREATE TABLE questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    exam_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('multiple_choice', 'true_false', 'essay') DEFAULT 'multiple_choice',
    points DECIMAL(5,2) DEFAULT 1.00,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

-- Tabela de opções de resposta
CREATE TABLE question_options (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question_id INT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    order_index INT NOT NULL,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Tabela de tentativas de prova
CREATE TABLE exam_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    exam_id INT NOT NULL,
    score DECIMAL(5,2),
    passed BOOLEAN DEFAULT false,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    time_taken INT, -- em segundos
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

-- Tabela de respostas dos estudantes
CREATE TABLE student_answers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_option_id INT,
    answer_text TEXT,
    is_correct BOOLEAN,
    points_earned DECIMAL(5,2) DEFAULT 0.00,
    FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (selected_option_id) REFERENCES question_options(id)
);

-- Tabela de certificados
CREATE TABLE certificates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    certificate_code VARCHAR(100) UNIQUE NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP NULL,
    UNIQUE KEY unique_certificate (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Tabela de comentários
CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lesson_id INT NOT NULL,
    student_id INT NOT NULL,
    parent_id INT NULL,
    content TEXT NOT NULL,
    is_question BOOLEAN DEFAULT false,
    is_answered BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- Índices para melhor performance
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_modules_course ON modules(course_id);
CREATE INDEX idx_lessons_module ON lessons(module_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_lesson_progress_student ON lesson_progress(student_id);
CREATE INDEX idx_comments_lesson ON comments(lesson_id);
CREATE INDEX idx_exam_attempts_student ON exam_attempts(student_id);
