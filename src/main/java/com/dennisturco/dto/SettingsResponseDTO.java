package com.dennisturco.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SettingsResponseDTO {
    private String Code;
    private String Value;
    private String Description;
}
