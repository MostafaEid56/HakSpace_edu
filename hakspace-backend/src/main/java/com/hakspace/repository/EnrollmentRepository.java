package com.hakspace.repository;

import com.hakspace.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    void deleteByCourseId(Long courseId);

    List<Enrollment> findByGroupId(Long groupId);
}