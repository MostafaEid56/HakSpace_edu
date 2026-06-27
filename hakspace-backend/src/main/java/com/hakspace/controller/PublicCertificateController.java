package com.hakspace.controller;

import com.hakspace.dto.CertificateResponse;
import com.hakspace.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class PublicCertificateController {

    private final CertificateService certificateService;

    @GetMapping("/{certificateId}")
    public ResponseEntity<CertificateResponse> verifyCertificate(@PathVariable String certificateId) {
        return ResponseEntity.ok(certificateService.verifyCertificate(certificateId));
    }
}
