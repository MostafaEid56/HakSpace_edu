package com.hakspace.service;

import com.hakspace.dto.StudentCourseResponse;
import com.hakspace.model.Certificate;
import com.hakspace.model.StudentCourse;
import com.hakspace.repository.CertificateRepository;
import com.hakspace.repository.StudentCourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentCourseService {

    private final StudentCourseRepository studentCourseRepo;
    private final CertificateRepository certificateRepo;

    public List<StudentCourseResponse> getEnrolledStudents(Long courseId) {
        return studentCourseRepo.findByCourseId(courseId).stream()
                .map(StudentCourseResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public StudentCourseResponse updateCompletionStatus(Long id, String status) {
        StudentCourse sc = studentCourseRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("student.course.not.found"));

        StudentCourse.CompletionStatus newStatus;
        try {
            newStatus = StudentCourse.CompletionStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("enrollment.status.invalid");
        }

        if (newStatus == StudentCourse.CompletionStatus.COMPLETED) {
            sc.setCompletionStatus(StudentCourse.CompletionStatus.COMPLETED);
            sc.setCompletionDate(LocalDateTime.now());

            // Generate certificate if not exists
            if (sc.getCertificate() == null) {
                Certificate cert = new Certificate();
                cert.setCertificateId(generateUniqueCertificateId());
                cert.setStudent(sc.getStudent());
                cert.setCourse(sc.getCourse());
                cert.setStudentCourse(sc);
                cert.setIssueDate(LocalDateTime.now());
                cert.setStudentName(sc.getStudent().getFullName() != null ? sc.getStudent().getFullName() : sc.getStudent().getEmail());
                cert.setCourseName(sc.getCourse().getTitle());

                Certificate savedCert = certificateRepo.save(cert);
                sc.setCertificate(savedCert);
            }
        } else {
            sc.setCompletionStatus(StudentCourse.CompletionStatus.IN_PROGRESS);
            sc.setCompletionDate(null);
            // We keep the certificate linked if it already exists, so they don't lose it if marked back and forth,
            // or we could unlink it if required. The requirement says:
            // "Mark a student back to In Progress if needed. If a certificate already exists, do not generate another one."
            // Keeping it linked or not unlinking it is safer.
        }

        return StudentCourseResponse.from(studentCourseRepo.save(sc));
    }

    private synchronized String generateUniqueCertificateId() {
        int year = LocalDate.now().getYear();
        long nextNum = certificateRepo.count() + 1;
        String id;
        do {
            id = String.format("HSC-%d-%06d", year, nextNum++);
        } while (certificateRepo.findByCertificateId(id).isPresent());
        return id;
    }
}
