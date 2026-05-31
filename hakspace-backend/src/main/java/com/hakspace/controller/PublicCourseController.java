package com.hakspace.controller;
import com.hakspace.model.Course;
import com.hakspace.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/courses") @RequiredArgsConstructor
public class PublicCourseController {
    private final CourseRepository repo;
    @GetMapping public ResponseEntity<List<Course>> getAll() { return ResponseEntity.ok(repo.findAll()); }
    @GetMapping("/{id}") public ResponseEntity<Course> getById(@PathVariable Long id) { return ResponseEntity.ok(repo.findById(id).orElseThrow()); }
}