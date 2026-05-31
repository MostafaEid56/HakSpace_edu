package com.hakspace.controller;
import com.hakspace.model.Enrollment;
import com.hakspace.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/admin/leads") @RequiredArgsConstructor
public class AdminEnrollmentController {
    private final EnrollmentRepository repo;
    @GetMapping public ResponseEntity<List<Enrollment>> getAll() { return ResponseEntity.ok(repo.findAll()); }
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Enrollment update) {
        Enrollment e = repo.findById(id).orElseThrow();
        e.setStatus(update.getStatus());
        return ResponseEntity.ok(repo.save(e));
    }
}