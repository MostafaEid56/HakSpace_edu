package com.hakspace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CertificateBlockedResponse {
    private boolean blocked;
    private String reason;
}
