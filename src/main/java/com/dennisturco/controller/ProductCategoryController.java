package com.dennisturco.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dennisturco.dto.ProductCategoryRequestDTO;
import com.dennisturco.dto.ProductCategoryResponseDTO;
import com.dennisturco.service.ProductCategoryService;

import io.micrometer.common.lang.NonNull;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/product-categories")
@RequiredArgsConstructor
public class ProductCategoryController {
    private final ProductCategoryService service;

    @GetMapping
    public List<ProductCategoryResponseDTO> getAll() {
        return service.getAll();
    }

    @PostMapping
    public ResponseEntity<Void> create(@RequestBody @NonNull @Valid ProductCategoryRequestDTO dto) {
        service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductCategoryResponseDTO> updateProductCategoryById(@PathVariable long id, @RequestBody @NonNull @Valid ProductCategoryRequestDTO dto) {
        ProductCategoryResponseDTO updated = service.updateById(id, dto);
        return ResponseEntity.ok(updated);
    }
}
