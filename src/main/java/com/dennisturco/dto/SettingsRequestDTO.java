package com.dennisturco.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SettingsRequestDTO {
    @NotBlank
    @NotNull
    private String Code;

    @Size(max = 100, message = "Valore troppo lungo")
    private String Value;
}
