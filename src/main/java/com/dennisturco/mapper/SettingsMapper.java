package com.dennisturco.mapper;

import org.springframework.stereotype.Component;

import com.dennisturco.dto.SettingsRequestDTO;
import com.dennisturco.dto.SettingsResponseDTO;
import com.dennisturco.model.Settings;

@Component
public class SettingsMapper {
    public SettingsResponseDTO toDTO(Settings settings) {
        return SettingsResponseDTO.builder()
            .Code(settings.getCode())
            .Value(settings.getValue())
            .Description(settings.getDescription())
            .build();
    }

    public Settings toEntity(SettingsRequestDTO dto) {
        return Settings.builder()
            .Code(dto.getCode())
            .Value(dto.getValue())
            .build();
    }
}
