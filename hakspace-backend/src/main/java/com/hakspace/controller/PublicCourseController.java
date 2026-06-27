package com.hakspace.controller;

import com.hakspace.dto.CourseDetailResponse;
import com.hakspace.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class PublicCourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<List<CourseDetailResponse>> getAll() {
        return ResponseEntity.ok(courseService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDetailResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getById(id));
    }

    @PostMapping("/enroll")
    public ResponseEntity<?> enroll(@jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody
                                    com.hakspace.dto.EnrollmentRequest req) {
        return ResponseEntity.ok(courseService.enroll(req));
    }
}