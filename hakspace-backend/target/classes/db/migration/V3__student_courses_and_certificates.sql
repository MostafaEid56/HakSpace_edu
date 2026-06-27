-- V3: Create student_courses and certificates tables

CREATE TABLE IF NOT EXISTS student_courses (
    id                BIGSERIAL PRIMARY KEY,
    student_id        BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id         BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    group_id          BIGINT NOT NULL REFERENCES course_groups(id) ON DELETE CASCADE,
    enrollment_date   TIMESTAMP NOT NULL DEFAULT NOW(),
    completion_status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    completion_date   TIMESTAMP,
    CONSTRAINT uq_student_course UNIQUE (student_id, course_id)
);

CREATE TABLE IF NOT EXISTS certificates (
    id                 BIGSERIAL PRIMARY KEY,
    certificate_id     VARCHAR(50) UNIQUE NOT NULL,
    student_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id          BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_course_id  BIGINT NOT NULL REFERENCES student_courses(id) ON DELETE CASCADE,
    issue_date         TIMESTAMP NOT NULL DEFAULT NOW(),
    student_name       VARCHAR(255) NOT NULL,
    course_name        VARCHAR(255) NOT NULL
);

-- Add certificate_id column to student_courses if needed, or link via OneToOne
ALTER TABLE student_courses
    ADD COLUMN IF NOT EXISTS certificate_id BIGINT REFERENCES certificates(id) ON DELETE SET NULL;
