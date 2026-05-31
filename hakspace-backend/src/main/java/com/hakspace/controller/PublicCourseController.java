package com.hakspace.controller;
import com.hakspace.model.Course;
import com.hakspace.model.Enrollment;
import com.hakspace.repository.CourseRepository;
import com.hakspace.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/courses") @RequiredArgsConstructor
public class PublicCourseController {
    private final CourseRepository repo;
    private final EnrollmentRepository enrollmentRepo;

    @GetMapping public ResponseEntity<List<Course>> getAll() { return ResponseEntity.ok(repo.findAll()); }
    @GetMapping("/{id}") public ResponseEntity<Course> getById(@PathVariable Long id) { return ResponseEntity.ok(repo.findById(id).orElseThrow()); }

    @PostMapping("/enroll")
    public ResponseEntity<?> enroll(@RequestBody Enrollment enrollment) {
        if (enrollment.getCourse() == null || enrollment.getCourse().getId() == null) {
            return ResponseEntity.badRequest().body("Course ID is required");
        }
        Course course = repo.findById(enrollment.getCourse().getId())
            .orElseThrow(() -> new RuntimeException("Course not found"));
        enrollment.setCourse(course);
        enrollment.setStatus(Enrollment.LeadStatus.NEW);
        Enrollment saved = enrollmentRepo.save(enrollment);
        return ResponseEntity.ok(saved);
    }
}