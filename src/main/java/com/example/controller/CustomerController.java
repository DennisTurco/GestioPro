package com.example.controller;

import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.example.model.Customer;
import com.example.service.CustomerService;

@RestController
@RequestMapping("/api/v1/customers")
@CrossOrigin
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerService.getAllCustomers();
    }

    @PostMapping
    public void addNewCustomer(@RequestBody Customer customer) {
        customerService.insertCustomer(customer);
    }
}