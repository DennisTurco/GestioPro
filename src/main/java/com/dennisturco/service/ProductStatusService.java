package com.dennisturco.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.dennisturco.model.ProductStatus;
import com.dennisturco.repository.ProductStatusRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductStatusService {
    private final ProductStatusRepository repo;

    public List<ProductStatus> getAll() {
        return repo.findAll();
    }

    public ProductStatus getProductStatus(long id) {
        return repo.findById(id).orElse(null);
    }
}
