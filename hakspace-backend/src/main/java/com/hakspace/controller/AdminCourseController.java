package com.hakspace.controller;

import com.hakspace.dto.CourseDetailResponse;
import com.hakspace.dto.CourseRequest;
import com.hakspace.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/courses")
@RequiredArgsConstructor
public class AdminCourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<List<CourseDetailResponse>> getAll() {
        return ResponseEntity.ok(courseService.adminGetAll());
    }

    @PostMapping
    public ResponseEntity<CourseDetailResponse> create(@Valid @RequestBody CourseRequest req) {
        return ResponseEntity.ok(courseService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseDetailResponse> update(@PathVariable Long id,
                                                       @Valid @RequestBody CourseRequest req) {
        return ResponseEntity.ok(courseService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        courseService.delete(id);
        return ResponseEntity.ok().build();
    }
}
