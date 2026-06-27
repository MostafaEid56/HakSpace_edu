package com.hakspace.service;

import com.hakspace.model.User;
import com.hakspace.repository.UserRepository;
import com.hakspace.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    public void register(User user) {
        if (userRepo.existsByEmail(user.getEmail())) {
            throw new RuntimeException("auth.email.exists");
        }
        user.setPassword(encoder.encode(user.getPassword()));
        userRepo.save(user);
    }

    public Map<String, Object> login(String email, String password) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("auth.credentials.invalid"));
        if (!encoder.matches(password, user.getPassword())) {
            throw new RuntimeException("auth.credentials.invalid");
        }
        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return Map.of(
                "token", token,
                "user", Map.of("id", user.getId(), "role", user.getRole())
        );
    }
}
