package com.hakspace.controller;
import com.hakspace.model.User;
import com.hakspace.repository.UserRepository;
import com.hakspace.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
public class AuthController {
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepo.existsByEmail(user.getEmail()))
            throw new RuntimeException("auth.email.exists");
        user.setPassword(encoder.encode(user.getPassword()));
        userRepo.save(user);
        return ResponseEntity.ok(Map.of("message", "auth.registered"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> creds) {
        User user = userRepo.findByEmail(creds.get("email"))
                .orElseThrow(() -> new RuntimeException("auth.credentials.invalid"));
        if (!encoder.matches(creds.get("password"), user.getPassword()))
            throw new RuntimeException("auth.credentials.invalid");
        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return ResponseEntity.ok(Map.of("token", token, "user", Map.of("id", user.getId(), "role", user.getRole())));
    }
}