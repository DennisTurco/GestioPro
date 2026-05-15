package com.dennisturco.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CustomerRequestDTO {
    private Long customerTypeId;

    @NotBlank
    @Size(max = 50, message = "Nome troppo lungo")
    private String name;

    @NotBlank
    @Size(max = 50, message = "Cognome troppo lungo")
    private String surname;

    @NotBlank
    @Email(message = "Email non valida")
    @Size(max = 50, message = "Email troppo lunga")
    private String email;

    @Pattern(regexp = "^[0-9+ ]*$", message = "Il telefono può contenere solo numeri, + e spazi")
    @Size(max = 20, message = "Numero telefonico troppo lungo")
    private String phone;

    private String country;
    private String region;
    private String city;
    private String province;
    private String address;

    private String vatNumber;
    private String companyName;
    private String taxCode;

    @Pattern(regexp = "^[0-9+ ]*$", message = "Il telefono può contenere solo numeri, + e spazi")
    @Size(max = 20, message = "Numero telefonico troppo lungo")
    private String landline;

    private Double lat;
    private Double lon;

    @Size(max = 1000, message = "Note troppo lunghe")
    private String notes;
}
