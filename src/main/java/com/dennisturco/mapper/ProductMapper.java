package com.dennisturco.mapper;

import org.springframework.stereotype.Component;

import com.dennisturco.dto.ProductRequestDTO;
import com.dennisturco.dto.ProductResponseDTO;
import com.dennisturco.model.Product;
import com.dennisturco.repository.ProductCategoryRepository;
import com.dennisturco.repository.ProductStatusRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ProductMapper {
    private final ProductCategoryRepository productCategoryRepository;
    private final ProductStatusRepository productCategoryStatus;

    public ProductResponseDTO toDTO(Product p) {
        return ProductResponseDTO.builder()
            .categoryId(p.getCategory().getId())
            .categoryName(p.getCategory().getName())
            .statusId(p.getStatus().getId())
            .statusName(p.getStatus().getName().name())
            .code(p.getName())
            .ean(p.getEan())
            .name(p.getName())
            .description(p.getDescription())
            .build();
    }

    public Product toEntity(ProductRequestDTO dto) {

        long productCategoryId = dto.getProductCategoryId();
        long productStatusId = dto.getProductStatusId();

        return Product.builder()
            .id(null)
            .category(productCategoryRepository.findById(productCategoryId).orElse(null))
            .status(productCategoryStatus.findById(productStatusId).orElse(null))
            .code(dto.getCode())
            .ean(dto.getEan())
            .name(dto.getName())
            .description(dto.getDescription())
            .quantity(dto.getQuantity())
            .vatPercentage(dto.getVatPercentage())
            .price(dto.getPrice())
            .build();
    }
}
