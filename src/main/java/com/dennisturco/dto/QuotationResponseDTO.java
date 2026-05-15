package com.dennisturco.dto;

import java.time.LocalDate;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuotationResponseDTO {
    private Long id;
    private Long customerId;
    private String customerSurname;
    private Long quotationStatusId;
    private String quotationStatusName;
    private String number;
    private Float amount;
    private Integer vatPercentage;
    private Integer discountPercentage;
    private String description;
    private String notes;
    private LocalDate creationDate;
    private LocalDate lastUpdateDate;
    private LocalDate issueDate;
    private LocalDate validityDate;
}
