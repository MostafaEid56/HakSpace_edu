package com.hakspace.security;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {
    @Value("${jwt.secret}") private String secret;
    @Value("${jwt.expiration}") private long expiration;

    private SecretKey getSigningKey() { return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret)); }

    public String generateToken(String subject, String role) {
        return Jwts.builder().subject(subject).claims(Map.of("role", role))
            .issuedAt(new Date()).expiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(getSigningKey()).compact();
    }

    public Map<String, Object> extractAllClaims(String token) {
        return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
    }
}