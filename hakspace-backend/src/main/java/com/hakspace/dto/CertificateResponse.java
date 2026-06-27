package com.hakspace.dto;

import com.hakspace.model.Certificate;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CertificateResponse {
    private String certificateId;
    private String studentName;
    private String courseName;
    private LocalDateTime issueDate;

    public static CertificateResponse from(Certificate cert) {
        CertificateResponse resp = new CertificateResponse();
        resp.setCertificateId(cert.getCertificateId());
        resp.setStudentName(cert.getStudentName());
        resp.setCourseName(cert.getCourseName());
        resp.setIssueDate(cert.getIssueDate());
        return resp;
    }
}
