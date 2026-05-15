package com.dennisturco.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuotationRequestDTO {

    private Long quotationStatusId;

    private Long customerId;

    @NotBlank(message = "Il numero del preventivo è obbligatorio")
    private String number;

    @NotNull
    @PositiveOrZero(message = "Non è possibile inserire un importo negativo")
    private Float amount;

    @NotNull
    @Min(value = 0, message = "IVA non può essere negativa")
    @Max(value = 100, message = "IVA non può essere > 100")
    private Integer vatPercentage;

    @NotNull
    @Min(value = 0, message = "Lo sconto non può essere negativo")
    @Max(value = 100, message = "Lo sconto non può essere > 100")
    private Integer discountPercentage;

    @Size(max = 2000, message = "Descrizione troppo lunga")
    private String description;

    @Size(max = 1000, message = "Note troppo lunghe")
    private String notes;

    private LocalDate issueDate;
    private LocalDate validityDate;
}
