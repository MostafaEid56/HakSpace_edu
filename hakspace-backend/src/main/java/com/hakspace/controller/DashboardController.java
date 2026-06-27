package com.hakspace.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    @GetMapping
    public ResponseEntity<?> getStats() {
        // Static placeholder — replace with DashboardService when real metrics are needed
        return ResponseEntity.ok(Map.of(
                "totalRevenue", 124500,
                "activeStudents", 3492,
                "courseCompletions", 845
        ));
    }
}