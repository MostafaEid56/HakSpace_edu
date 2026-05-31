package com.hakspace.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Entity @Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(unique = true, nullable = false) private String email;
    @Column(nullable = false) private String password;
    @Column(name = "full_name") private String fullName;
    @Enumerated(EnumType.STRING) private Role role = Role.USER;
    @Column(name = "created_at") private LocalDateTime createdAt = LocalDateTime.now();
    public enum Role { USER, ADMIN }
}