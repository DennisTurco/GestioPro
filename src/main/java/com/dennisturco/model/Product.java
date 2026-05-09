package com.dennisturco.model;

import org.hibernate.annotations.Check;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Data
@Setter
@Getter
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

    @NotBlank
    @Column(nullable = false, unique = true)
    private String code;

    private String ean;

    @NotBlank
    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 1000)
    private String description;
    
    @Min(0)
    @Column(nullable = false, columnDefinition = "INTEGER DEFAULT 0")
    private Integer quantity;

    @Min(0)
    @Column(nullable = false, columnDefinition = "INTEGER DEFAULT 22")
    private Integer vatPercentage;

    @Min(0)
    @Min(100)
    @Column(nullable = false)
    private Float price;
}
