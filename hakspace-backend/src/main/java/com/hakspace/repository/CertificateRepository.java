package com.hakspace.repository;

import com.hakspace.model.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    Optional<Certificate> findByCertificateId(String certificateId);
    Optional<Certificate> findByStudentCourseId(Long studentCourseId);
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);
}
