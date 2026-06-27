package com.hakspace.repository;

import com.hakspace.model.CourseGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CourseGroupRepository extends JpaRepository<CourseGroup, Long> {

    List<CourseGroup> findByCourseId(Long courseId);

    void deleteByCourseId(Long courseId);

    /**
     * Atomically increment currentStudents and mark unavailable if full.
     * Uses a single UPDATE statement to prevent race conditions.
     */
    @Modifying
    @Query("""
            UPDATE CourseGroup g
            SET g.currentStudents = g.currentStudents + 1,
                g.isAvailable = CASE
                    WHEN (g.currentStudents + 1) >= g.maxStudents THEN false
                    ELSE true
                END
            WHERE g.id = :id
              AND g.currentStudents < g.maxStudents
            """)
    int incrementStudentCount(@Param("id") Long id);

    /**
     * Atomically decrement currentStudents and mark available again.
     */
    @Modifying
    @Query("""
            UPDATE CourseGroup g
            SET g.currentStudents = g.currentStudents - 1,
                g.isAvailable = true
            WHERE g.id = :id
              AND g.currentStudents > 0
            """)
    int decrementStudentCount(@Param("id") Long id);
}
