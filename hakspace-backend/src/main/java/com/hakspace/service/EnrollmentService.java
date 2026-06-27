package com.hakspace.service;

import com.hakspace.model.Enrollment;
import com.hakspace.model.Enrollment.LeadStatus;
import com.hakspace.repository.CourseGroupRepository;
import com.hakspace.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepo;
    private final CourseGroupRepository groupRepo;

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
            } else if (cancelling) {
                groupRepo.decrementStudentCount(groupId);
            }
        }

        enrollment.setStatus(newStatus);
        return enrollmentRepo.save(enrollment);
    }
}
