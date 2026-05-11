package com.dennisturco.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CustomerResponseDTO {
    private Long id;
    private Long customerTypeId;
    private String customerTypeName;

    private String name;
    private String surname;
    private String email;
    private String phone;

    private String country;
    private String region;
    private String city;
    private String province;
    private String address;

    private String vatNumber;
    private String companyName;
    private String taxCode;

    private String landline;

    private Double lat;
    private Double lon;

    private String notes;
}
