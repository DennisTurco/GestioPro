package com.dennisturco.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dennisturco.dto.CustomerRequestDTO;
import com.dennisturco.dto.CustomerResponseDTO;
import com.dennisturco.service.CustomerService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
@CrossOrigin
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public List<CustomerResponseDTO> getAllCustomers() {
        return customerService.getAllCustomers();
    }

    @PostMapping
    public ResponseEntity<Void> addNewCustomer(@RequestBody @NonNull @Valid CustomerRequestDTO dto) {
        customerService.insertCustomer(dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build(); // means: i deleted but with no returns
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponseDTO> updateCustomerById(@PathVariable long id, @RequestBody @NonNull @Valid CustomerRequestDTO dto) {
        CustomerResponseDTO updated = customerService.updateCustomerById(id, dto);
        return ResponseEntity.ok(updated);
    }
}