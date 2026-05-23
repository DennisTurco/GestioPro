package com.dennisturco.dto;

import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SettingsRequestDTO {
    private String Code;

    @Size(max = 100, message = "Valore troppo lungo")
    private String Value;
}
