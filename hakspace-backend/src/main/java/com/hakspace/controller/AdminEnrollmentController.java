package com.hakspace.controller;

import com.hakspace.model.Enrollment;
import com.hakspace.model.Enrollment.LeadStatus;
import com.hakspace.repository.CourseGroupRepository;
import com.hakspace.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/leads")
@RequiredArgsConstructor
public class AdminEnrollmentController {

    private final EnrollmentRepository repo;
    private final CourseGroupRepository groupRepo;

    @GetMapping
    public ResponseEntity<List<Enrollment>> getAll() {
        return ResponseEntity.ok(repo.findAll());
    }

    /**
     * Update lead status.
     * <p>
     * Booking workflow rules:
     * <ul>
     *   <li>NEW → ENROLLED  : increment group's currentStudents (if group set)</li>
     *   <li>ENROLLED → CLOSED : decrement group's currentStudents</li>
     *   <li>All other transitions : no seat counter change</li>
     * </ul>
     */
    @PutMapping("/{id}/status")
    @Transactional
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String rawStatus = body.get("status");
        if (rawStatus == null) {
            throw new RuntimeException("enrollment.status.required");
        }

        LeadStatus newStatus;
        try {
            newStatus = LeadStatus.valueOf(rawStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("enrollment.status.invalid");
        }

        Enrollment enrollment = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("enrollment.not.found"));

        LeadStatus oldStatus = enrollment.getStatus();
        Long groupId = (enrollment.getGroup() != null) ? enrollment.getGroup().getId() : null;

        // ── Apply seat counter side-effects ──────────────────────────────
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
        return ResponseEntity.ok(repo.save(enrollment));
    }
}