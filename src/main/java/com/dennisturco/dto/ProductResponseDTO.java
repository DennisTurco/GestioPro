package com.dennisturco.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductResponseDTO {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private Long statusId;
    private String statusName;
    private String code;
    private String ean;
    private String name;
    private String description;
    private Integer quantity;
    private Integer vatPercentage;
    private Float price;
}
