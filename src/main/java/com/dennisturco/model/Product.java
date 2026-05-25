package com.dennisturco.model;

import org.hibernate.annotations.Check;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Check(constraints = "quantity >= 0")
@Check(constraints = "vat_percentage >= 0")
@Check(constraints = "price >= 0")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "product_category_id", nullable = false)
    private ProductCategory category;

    @ManyToOne(optional = false)
    @JoinColumn(name = "porduct_status_id", nullable = false)
    private ProductStatus status;

    @Column(nullable = false, unique = true)
    private String code;

    private String ean;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 1000)
    private String description;

    @Min(0)
    private Integer quantity; // could be null if the product is a software key for example

    @Min(0)
    @Max(100)
    @Column(nullable = false, columnDefinition = "INTEGER DEFAULT 22")
    private Integer vatPercentage;

    @Min(0)
    @Column(nullable = false)
    private Float price;
}
