package com.dennisturco.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dennisturco.model.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    boolean existsByEmail(String email);
}
