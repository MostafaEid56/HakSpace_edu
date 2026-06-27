package com.hakspace.repository;

import com.hakspace.model.StudentCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentCourseRepository extends JpaRepository<StudentCourse, Long> {
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);
    Optional<StudentCourse> findByStudentIdAndCourseId(Long studentId, Long courseId);
    List<StudentCourse> findByCourseId(Long courseId);
}
