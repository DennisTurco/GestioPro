package com.dennisturco.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductCategoryRequestDTO {
    @NotBlank
    @Size(max = 50, message = "Nome troppo lungo")
    private String name;

    @NotBlank
    @Size(max = 455, message = "Descrizione troppo lunga")
    private String description;
}
