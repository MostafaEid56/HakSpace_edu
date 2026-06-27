package com.hakspace.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request body for submitting a course enrollment / lead.
 */
@Data
public class EnrollmentRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "City is required")
    private String city;

    private String contactMethod = "WHATSAPP";
    private String contactTime = "ANYTIME";
    private String notes;

    @NotNull(message = "Course ID is required")
    private Long courseId;

    /** Optional — the group the user selected. If null, no group is assigned. */
    private Long groupId;
}
