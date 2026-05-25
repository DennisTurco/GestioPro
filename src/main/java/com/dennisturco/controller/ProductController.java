package com.dennisturco.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dennisturco.dto.ProductRequestDTO;
import com.dennisturco.dto.ProductResponseDTO;
import com.dennisturco.service.ProductService;

import io.micrometer.common.lang.NonNull;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@CrossOrigin
public class ProductController {
    private final ProductService service;

    @GetMapping
    public List<ProductResponseDTO> getAll() {
        return service.getAll();
    }

    @PostMapping
    public ResponseEntity<Void> create(@RequestBody @NonNull @Valid ProductRequestDTO dto) {
        service.insertProduct(dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> updateProductById(@PathVariable long id, @RequestBody @NonNull @Valid ProductRequestDTO dto) {
        ProductResponseDTO updated = service.updateProductById(id, dto);
        return ResponseEntity.ok(updated);
    }
}
