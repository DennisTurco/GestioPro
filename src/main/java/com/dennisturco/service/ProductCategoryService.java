package com.dennisturco.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.dennisturco.dto.ProductCategoryRequestDTO;
import com.dennisturco.dto.ProductCategoryResponseDTO;
import com.dennisturco.exception.BusinessException;
import com.dennisturco.mapper.ProductCategoryMapper;
import com.dennisturco.model.ProductCategory;
import com.dennisturco.repository.ProductCategoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductCategoryService {

    private final ProductCategoryRepository repo;
    private final ProductCategoryMapper mapper;

    public List<ProductCategoryResponseDTO> getAll() {
        return repo.findAll()
            .stream()
            .map(mapper::toDTO)
            .toList();
    }

    public ProductCategoryResponseDTO getProductCategoryById(long id) {
        ProductCategory category =  repo.findById(id).orElse(null);
        return mapper.toDTO(category);
    }

    public void create(ProductCategoryRequestDTO dto) {
        ProductCategory category = mapper.toEntity(dto);

        if (category == null)
            throw new BusinessException("Errore creazione categoria prodotto");

        if (repo.existsByName(category.getName()))
            throw new BusinessException("Nome categoria già presente");

        LocalDateTime now = LocalDateTime.now();
        category.setCreationDate(now);
        category.setLastUpdateDate(now);

        repo.save(category);
    }

    public void deleteById(long id) {
        repo.deleteById(id);
    }

    public ProductCategoryResponseDTO updateById(long id, ProductCategoryRequestDTO dto) {
        ProductCategory existing = repo.findById(id).orElseThrow(() -> new BusinessException("Categoria prodotto non trovata"));

        ProductCategory category = mapper.toEntity(dto);
        existing.setId(category.getId());
        existing.setName(category.getName());
        existing.setDescription(category.getDescription());
        existing.setCreationDate(category.getCreationDate());
        existing.setLastUpdateDate(LocalDateTime.now());

        category = repo.save(existing);
        return mapper.toDTO(category);
    }
}
