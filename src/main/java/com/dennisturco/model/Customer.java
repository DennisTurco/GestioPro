package com.dennisturco.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "customer_type_id", nullable = false)
    private CustomerType customerType;

    @NotBlank
    @Column(nullable = false)
    private String name;
    
    @NotBlank
    @Column(nullable = false)
    private String surname;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false, unique = true)
    @Pattern(regexp = "^[0-9+ ]*$")
    private String phone;

    private String country;

    private String region;

    private String city;

    private String province;

    private String address;

    private String vatNumber;

    private String companyName;

    private String taxCode;

    @Pattern(regexp = "^[0-9+ ]*$")
    private String landline;

    private Double lat;

    private Double lon;

    private LocalDate insertDate;

    private LocalDate lastUpdateDate;
    
    @Column(length = 1000)
    private String notes;
}
