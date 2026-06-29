package com.hakspace.dto;

import com.hakspace.model.Blacklist;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BlacklistResponse {
    private Long id;
    private String fullName;
    private String phoneNumber;
    private String email;
    private String nationalId;
    private String reason;
    private LocalDateTime blockedAt;
    private String blockedBy;
    private Boolean active;

    public static BlacklistResponse from(Blacklist entry) {
        BlacklistResponse resp = new BlacklistResponse();
        resp.setId(entry.getId());
        resp.setFullName(entry.getFullName());
        resp.setPhoneNumber(entry.getPhoneNumber());
        resp.setEmail(entry.getEmail());
        resp.setNationalId(entry.getNationalId());
        resp.setReason(entry.getReason());
        resp.setBlockedAt(entry.getBlockedAt());
        resp.setBlockedBy(entry.getBlockedBy());
        resp.setActive(entry.getActive());
        return resp;
    }
}
