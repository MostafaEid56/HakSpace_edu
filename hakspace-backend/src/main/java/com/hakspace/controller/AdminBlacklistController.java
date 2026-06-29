package com.hakspace.controller;

import com.hakspace.dto.BlacklistRequest;
import com.hakspace.dto.BlacklistResponse;
import com.hakspace.service.BlacklistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/blacklist")
@RequiredArgsConstructor
public class AdminBlacklistController {

    private final BlacklistService blacklistService;

    @GetMapping
    public ResponseEntity<List<BlacklistResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(blacklistService.getAll(search, status));
    }

    @PostMapping
    public ResponseEntity<BlacklistResponse> add(@Valid @RequestBody BlacklistRequest req) {
        return ResponseEntity.ok(blacklistService.addToBlacklist(req, "Admin"));
    }

    @PutMapping("/{id}/reason")
    public ResponseEntity<BlacklistResponse> updateReason(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        if (reason == null || reason.isBlank()) {
            throw new RuntimeException("blacklist.reason.required");
        }
        return ResponseEntity.ok(blacklistService.updateReason(id, reason));
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<BlacklistResponse> deactivate(@PathVariable Long id) {
        return ResponseEntity.ok(blacklistService.removeFromBlacklist(id));
    }

    @PutMapping("/{id}/reactivate")
    public ResponseEntity<BlacklistResponse> reactivate(@PathVariable Long id) {
        return ResponseEntity.ok(blacklistService.reactivate(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        blacklistService.deleteBlacklistEntry(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
