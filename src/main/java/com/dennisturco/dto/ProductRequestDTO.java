package com.dennisturco.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductRequestDTO {
    private Long productCategoryId;
    private Long productStatusId;

    @NotBlank
    private String code;

    private String ean;

    @Size(max = 50, message = "Nome troppo lungo")
    private String name;

    @Size(max = 1000, message = "Descrizione troppo lunga")
    private String description;

    @Min(value = 0, message = "La quantita' non può essere negativa")
    private Integer quantity;

    @Min(value = 0, message = "L'IVA non può essere negativa")
    @Max(value = 100, message = "L'IVA non può essere > 100")
    private Integer vatPercentage;

    @Min(value = 0, message = "Il prezzo può essere negativo")
    private Float price;
}
