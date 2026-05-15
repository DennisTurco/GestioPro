package com.dennisturco.model;

import org.hibernate.annotations.Check;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Check(constraints = "amount >= 0")
@Check(constraints = "vat_percentage >= 0")
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String number;

    @ManyToOne(optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(length = 1000)
    private String description;

    @Column(length = 1000)
    private String notes;

    @NotBlank
    @Column(nullable = false)
    private Integer status;

    @Min(0)
    @Column(nullable = false, columnDefinition = "INTEGER DEFAULT 0")
    private Float amount;

    @Min(0)
    @Min(100)
    @Column(nullable = false, columnDefinition = "INTEGER DEFAULT 22")
    private Integer vatPercentage;
}
