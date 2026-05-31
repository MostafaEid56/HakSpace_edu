package com.hakspace.controller;

import com.hakspace.model.Course;
import com.hakspace.repository.CourseRepository;
import com.hakspace.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/courses")
@RequiredArgsConstructor
public class AdminCourseController {

    private final CourseRepository courseRepo;
    private final EnrollmentRepository enrollmentRepo;

    @GetMapping
    public ResponseEntity<List<Course>> getAll() {
        return ResponseEntity.ok(courseRepo.findAll());
    }

    @PostMapping
    public ResponseEntity<Course> create(@RequestBody Course course) {
        if (course.getRating() == null) {
            course.setRating(0.0);
        }
        if (course.getStudentCount() == null) {
            course.setStudentCount(0);
        }
        return ResponseEntity.ok(courseRepo.save(course));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Course> update(@PathVariable Long id, @RequestBody Course update) {
        Course c = courseRepo.findById(id).orElseThrow();
        c.setTitle(update.getTitle());
        c.setDescription(update.getDescription());
        c.setImageUrl(update.getImageUrl());
        c.setDuration(update.getDuration());
        c.setInstructorName(update.getInstructorName());
        c.setPrice(update.getPrice());
        if (update.getRating() != null) {
            c.setRating(update.getRating());
        }
        if (update.getStudentCount() != null) {
            c.setStudentCount(update.getStudentCount());
        }
        return ResponseEntity.ok(courseRepo.save(c));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Course c = courseRepo.findById(id).orElseThrow();
        // Delete related enrollment leads to satisfy database foreign keys
        enrollmentRepo.deleteByCourseId(id);
        courseRepo.delete(c);
        return ResponseEntity.ok().build();
    }
}
