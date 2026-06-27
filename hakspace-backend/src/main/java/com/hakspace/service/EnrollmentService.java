package com.hakspace.service;

import com.hakspace.model.Enrollment;
import com.hakspace.model.Enrollment.LeadStatus;
import com.hakspace.model.StudentCourse;
import com.hakspace.model.User;
import com.hakspace.repository.CourseGroupRepository;
import com.hakspace.repository.EnrollmentRepository;
import com.hakspace.repository.StudentCourseRepository;
import com.hakspace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepo;
    private final CourseGroupRepository groupRepo;
    private final UserRepository userRepo;
    private final StudentCourseRepository studentCourseRepo;
    private final PasswordEncoder passwordEncoder;

    public List<Enrollment> getAll() {
        return enrollmentRepo.findAll();
    }

    @Transactional
    public Enrollment updateStatus(Long id, String rawStatus) {
        if (rawStatus == null) {
            throw new RuntimeException("enrollment.status.required");
        }

        LeadStatus newStatus;
        try {
            newStatus = LeadStatus.valueOf(rawStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("enrollment.status.invalid");
        }

        Enrollment enrollment = enrollmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("enrollment.not.found"));

        LeadStatus oldStatus = enrollment.getStatus();
        Long groupId = (enrollment.getGroup() != null) ? enrollment.getGroup().getId() : null;

        // ── Seat counter side-effects ─────────────────────────────────────────
        if (groupId != null) {
            boolean approving = (newStatus == LeadStatus.ENROLLED && oldStatus != LeadStatus.ENROLLED);
            boolean cancelling = (oldStatus == LeadStatus.ENROLLED && newStatus != LeadStatus.ENROLLED);

            if (approving) {
                int updated = groupRepo.incrementStudentCount(groupId);
                if (updated == 0) {
                    throw new RuntimeException("enrollment.group.full");
                }

                // Find or create User representing the student
                User student = userRepo.findByEmail(enrollment.getEmail())
                        .orElseGet(() -> {
                            User newUser = new User();
                            newUser.setEmail(enrollment.getEmail());
                            newUser.setFullName(enrollment.getFullName());
                            newUser.setPassword(passwordEncoder.encode("123456")); // default password
                            newUser.setRole(User.Role.USER);
                            return userRepo.save(newUser);
                        });

                // Verify duplicate enrollment
                if (!studentCourseRepo.existsByStudentIdAndCourseId(student.getId(), enrollment.getCourse().getId())) {
                    StudentCourse studentCourse = new StudentCourse();
                    studentCourse.setStudent(student);
                    studentCourse.setCourse(enrollment.getCourse());
                    studentCourse.setGroup(enrollment.getGroup());
                    studentCourse.setEnrollmentDate(LocalDateTime.now());
                    studentCourse.setCompletionStatus(StudentCourse.CompletionStatus.IN_PROGRESS);
                    studentCourseRepo.save(studentCourse);
                }
            } else if (cancelling) {
                groupRepo.decrementStudentCount(groupId);
            }
        }

        enrollment.setStatus(newStatus);
        return enrollmentRepo.save(enrollment);
    }
}
