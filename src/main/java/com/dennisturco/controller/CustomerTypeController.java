package com.dennisturco.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dennisturco.model.CustomerType;
import com.dennisturco.service.CustomerTypeService;

import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/v1/customer-types")
@RequiredArgsConstructor
public class CustomerTypeController {
    private final CustomerTypeService customerTypeService;
    
    @GetMapping
    public List<CustomerType> getAllCustomerTypes() {
        return customerTypeService.getAllCustomerTypes();
    }
}
