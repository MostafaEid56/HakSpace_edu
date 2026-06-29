package com.hakspace.service;

import com.hakspace.dto.BlacklistRequest;
import com.hakspace.dto.BlacklistResponse;
import com.hakspace.model.Blacklist;
import com.hakspace.repository.BlacklistRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BlacklistService {

    private final BlacklistRepository blacklistRepo;

    @Transactional
    public BlacklistResponse addToBlacklist(@Valid BlacklistRequest req, String adminName) {
        if (req.getPhoneNumber() != null && !req.getPhoneNumber().isBlank()) {
            if (blacklistRepo.existsByPhoneNumberAndActiveTrue(req.getPhoneNumber().trim())) {
                throw new RuntimeException("blacklist.duplicate");
            }
        }

        Blacklist entry = new Blacklist();
        entry.setFullName(req.getFullName().trim());
        entry.setPhoneNumber(req.getPhoneNumber().trim());
        entry.setEmail(req.getEmail() != null && !req.getEmail().isBlank() ? req.getEmail().trim().toLowerCase() : null);
        entry.setNationalId(req.getNationalId() != null ? req.getNationalId().trim() : null);
        entry.setReason(req.getReason().trim());
        entry.setBlockedAt(LocalDateTime.now());
        entry.setBlockedBy(adminName);
        entry.setActive(true);

        return BlacklistResponse.from(blacklistRepo.save(entry));
    }

    @Transactional
    public BlacklistResponse updateReason(Long id, String reason) {
        Blacklist entry = blacklistRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("blacklist.not.found"));
        entry.setReason(reason.trim());
        return BlacklistResponse.from(blacklistRepo.save(entry));
    }

    @Transactional
    public BlacklistResponse removeFromBlacklist(Long id) {
        Blacklist entry = blacklistRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("blacklist.not.found"));
        entry.setActive(false);
        return BlacklistResponse.from(blacklistRepo.save(entry));
    }

    @Transactional
    public BlacklistResponse reactivate(Long id) {
        Blacklist entry = blacklistRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("blacklist.not.found"));
        if (entry.getPhoneNumber() != null && blacklistRepo.existsByPhoneNumberAndActiveTrue(entry.getPhoneNumber())) {
            throw new RuntimeException("blacklist.duplicate");
        }
        entry.setActive(true);
        return BlacklistResponse.from(blacklistRepo.save(entry));
    }

    @Transactional
    public void deleteBlacklistEntry(Long id) {
        Blacklist entry = blacklistRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("blacklist.not.found"));
        blacklistRepo.delete(entry);
    }

    public List<BlacklistResponse> getAll(String search, String statusFilter) {
        List<Blacklist> entries;

        if (search != null && !search.isBlank()) {
            entries = blacklistRepo.findByFullNameContainingIgnoreCaseOrPhoneNumberContainingIgnoreCase(search, search);
            if (statusFilter != null && !statusFilter.isBlank()) {
                boolean activeOnly = "active".equalsIgnoreCase(statusFilter);
                entries = entries.stream()
                        .filter(e -> e.getActive() == activeOnly)
                        .collect(Collectors.toList());
            }
        } else if ("inactive".equalsIgnoreCase(statusFilter)) {
            entries = blacklistRepo.findByActiveFalse();
        } else if ("active".equalsIgnoreCase(statusFilter)) {
            entries = blacklistRepo.findByActiveTrue();
        } else {
            entries = blacklistRepo.findAll();
        }

        return entries.stream()
                .map(BlacklistResponse::from)
                .collect(Collectors.toList());
    }

    public Optional<Blacklist> findActiveByPhone(String phone) {
        if (phone == null || phone.isBlank()) return Optional.empty();
        return blacklistRepo.findByPhoneNumberAndActiveTrue(phone.trim());
    }
}
