package com.dennisturco.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dennisturco.model.ProductStatus;
import com.dennisturco.service.ProductStatusService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/product-statuses")
@RequiredArgsConstructor
public class ProductStatusController {
    private final ProductStatusService service;

    @GetMapping
    public List<ProductStatus> getAll() {
        return service.getAll();
    }
}