package com.hakspace.controller;

import com.hakspace.dto.CourseDetailResponse;
import com.hakspace.dto.EnrollmentRequest;
import com.hakspace.model.Course;
import com.hakspace.model.CourseGroup;
import com.hakspace.model.Enrollment;
import com.hakspace.repository.CourseGroupRepository;
import com.hakspace.repository.CourseRepository;
import com.hakspace.repository.EnrollmentRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class PublicCourseController {

    private final CourseRepository courseRepo;
    private final CourseGroupRepository groupRepo;
    private final EnrollmentRepository enrollmentRepo;

    /** List all courses (lightweight — no groups embedded for list view). */
    @GetMapping
    public ResponseEntity<List<CourseDetailResponse>> getAll() {
        return ResponseEntity.ok(
                courseRepo.findAll().stream()
                        .map(CourseDetailResponse::from)
                        .collect(Collectors.toList())
        );
    }

    /** Get a single course with full group availability details. */
    @GetMapping("/{id}")
    public ResponseEntity<CourseDetailResponse> getById(@PathVariable Long id) {
        Course course = courseRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found: " + id));
        return ResponseEntity.ok(CourseDetailResponse.from(course));
    }

    /**
     * Submit an enrollment request.
     * <p>
     * Rules:
     * <ul>
     *   <li>Does NOT increment student count — that only happens on admin approval.</li>
     *   <li>Validates that the selected group (if any) is not full before accepting the request.</li>
     * </ul>
     */
    @PostMapping("/enroll")
    public ResponseEntity<?> enroll(@Valid @RequestBody EnrollmentRequest req) {
        // Validate course exists
        Course course = courseRepo.findById(req.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found: " + req.getCourseId()));

        // Validate group if provided
        CourseGroup group = null;
        if (req.getGroupId() != null) {
            group = groupRepo.findById(req.getGroupId())
                    .orElseThrow(() -> new RuntimeException("Group not found: " + req.getGroupId()));

            // Ensure group belongs to the same course
            if (!group.getCourse().getId().equals(course.getId())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Group does not belong to the specified course."));
            }

            // Prevent booking into a full group
            if (!group.getIsAvailable() || group.getCurrentStudents() >= group.getMaxStudents()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "The selected group is full. Please choose another group."));
            }
        }

        // Build and save the enrollment (status stays NEW — no seat count change yet)
        Enrollment enrollment = new Enrollment();
        enrollment.setFullName(req.getFullName());
        enrollment.setPhone(req.getPhone());
        enrollment.setEmail(req.getEmail());
        enrollment.setCity(req.getCity());
        enrollment.setContactMethod(req.getContactMethod());
        enrollment.setContactTime(req.getContactTime());
        enrollment.setNotes(req.getNotes());
        enrollment.setCourse(course);
        enrollment.setGroup(group);
        enrollment.setStatus(Enrollment.LeadStatus.NEW);

        return ResponseEntity.ok(enrollmentRepo.save(enrollment));
    }
}