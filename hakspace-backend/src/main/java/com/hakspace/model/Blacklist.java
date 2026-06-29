package com.hakspace.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "blacklist")
public class Blacklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String phoneNumber;

    private String email;

    private String nationalId;

    @Column(nullable = false, length = 1000)
    private String reason;

    @Column(name = "blocked_at")
    private LocalDateTime blockedAt = LocalDateTime.now();

    @Column(name = "blocked_by")
    private String blockedBy;

    @Column(nullable = false)
    private Boolean active = true;
}
