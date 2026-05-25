package com.dennisturco.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dennisturco.enums.ProductStatusEnum;
import com.dennisturco.model.ProductCategory;

public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {
    Optional<ProductCategory> findByName(ProductStatusEnum name);

    boolean existsByName(String name);
}
