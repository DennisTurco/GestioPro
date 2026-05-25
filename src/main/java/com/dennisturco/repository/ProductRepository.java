package com.dennisturco.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dennisturco.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsByCode(String code);
}