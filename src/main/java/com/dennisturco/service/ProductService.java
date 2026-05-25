package com.dennisturco.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.dennisturco.dto.ProductRequestDTO;
import com.dennisturco.dto.ProductResponseDTO;
import com.dennisturco.exception.BusinessException;
import com.dennisturco.mapper.ProductMapper;
import com.dennisturco.model.Product;
import com.dennisturco.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repo;
    private final ProductMapper mapper;

    public List<ProductResponseDTO> getAll() {
        return repo.findAll()
            .stream()
            .map(mapper::toDTO)
            .toList();
    }

    public ProductResponseDTO getProductById(long id) {
        Product product = repo.findById(id).orElse(null);
        return mapper.toDTO(product);
    }

    public void insertProduct(ProductRequestDTO dto) {
        Product product = mapper.toEntity(dto);

        if (product == null)
            throw new BusinessException("Errore creazione prodotto");

        if (repo.existsByCode(product.getCode()))
            throw new BusinessException("Codice prodotto già presente");

        repo.save(product);
    }

    public void deleteById(long id) {
        repo.deleteById(id);
    }

    public ProductResponseDTO updateProductById(long id, ProductRequestDTO dto) {
        Product existing = repo.findById(id).orElseThrow(() -> new BusinessException("Prodotto non trovato"));

        Product product = mapper.toEntity(dto);
        existing.setName(product.getName());
        existing.setCategory(product.getCategory());
        existing.setStatus(product.getStatus());
        existing.setCode(product.getCode());
        existing.setEan(product.getEan());
        existing.setDescription(product.getDescription());
        existing.setQuantity(product.getQuantity());
        existing.setVatPercentage(product.getVatPercentage());
        existing.setPrice(product.getPrice());

        product = repo.save(existing);
        return mapper.toDTO(product);
    }
}
