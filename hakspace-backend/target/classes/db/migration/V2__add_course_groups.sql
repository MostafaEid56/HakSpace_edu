-- V2: Add course_groups table and group_id column to enrollments

CREATE TABLE IF NOT EXISTS course_groups (
    id               BIGSERIAL PRIMARY KEY,
    course_id        BIGINT       NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    group_name       VARCHAR(100) NOT NULL,
    max_students     INTEGER      NOT NULL DEFAULT 20,
    current_students INTEGER      NOT NULL DEFAULT 0,
    schedule         VARCHAR(255) NOT NULL,
    is_available     BOOLEAN      NOT NULL DEFAULT true,
    CONSTRAINT chk_students CHECK (current_students >= 0 AND current_students <= max_students)
);

-- Add group_id to enrollments (nullable for backward compatibility)
ALTER TABLE enrollments
    ADD COLUMN IF NOT EXISTS group_id BIGINT REFERENCES course_groups(id) ON DELETE SET NULL;
