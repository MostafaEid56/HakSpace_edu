package com.hakspace.controller;

import com.hakspace.dto.StudentCourseResponse;
import com.hakspace.service.StudentCourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AdminStudentCourseController {

    private final StudentCourseService studentCourseService;

    @GetMapping("/api/admin/courses/{courseId}/students")
    public ResponseEntity<List<StudentCourseResponse>> getEnrolledStudents(@PathVariable Long courseId) {
        return ResponseEntity.ok(studentCourseService.getEnrolledStudents(courseId));
    }

    @PutMapping("/api/admin/student-courses/{id}/status")
    public ResponseEntity<StudentCourseResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(studentCourseService.updateCompletionStatus(id, status));
    }
}
