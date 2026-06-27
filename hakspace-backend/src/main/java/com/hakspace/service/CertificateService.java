package com.hakspace.service;

import com.hakspace.dto.CertificateResponse;
import com.hakspace.model.Certificate;
import com.hakspace.repository.CertificateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CertificateRepository certificateRepo;

    public CertificateResponse verifyCertificate(String certificateId) {
        Certificate cert = certificateRepo.findByCertificateId(certificateId)
                .orElseThrow(() -> new RuntimeException("certificate.not.found"));
        return CertificateResponse.from(cert);
    }
}
