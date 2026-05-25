package com.dennisturco.mapper;

import org.springframework.stereotype.Component;

import com.dennisturco.dto.ProductCategoryRequestDTO;
import com.dennisturco.dto.ProductCategoryResponseDTO;
import com.dennisturco.model.ProductCategory;

@Component
public class ProductCategoryMapper {

    public ProductCategory toEntity(ProductCategoryRequestDTO dto) {
        return ProductCategory.builder()
            .id(null)
            .name(dto.getName())
            .description(dto.getDescription())
            .creationDate(null)
            .lastUpdateDate(null)
            .build();
    }

    public ProductCategoryResponseDTO toDTO(ProductCategory pc) {
        return ProductCategoryResponseDTO.builder()
            .id(pc.getId())
            .name(pc.getName())
            .description(pc.getDescription())
            .creationDate(pc.getCreationDate())
            .lastUpdateDate(pc.getLastUpdateDate())
            .build();
    }
}
