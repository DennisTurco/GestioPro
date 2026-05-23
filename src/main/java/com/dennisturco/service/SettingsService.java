package com.dennisturco.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.dennisturco.dto.SettingsRequestDTO;
import com.dennisturco.dto.SettingsResponseDTO;
import com.dennisturco.exception.BusinessException;
import com.dennisturco.mapper.SettingsMapper;
import com.dennisturco.model.Settings;
import com.dennisturco.repository.SettingsRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SettingsService {
    private final SettingsRepository repo;
    private final SettingsMapper mapper;

    public List<SettingsResponseDTO> getAll() {
        return repo.findAll()
            .stream()
            .map(mapper::toDTO)
            .toList();
    }

    public SettingsResponseDTO update(SettingsRequestDTO dto) {
        Settings existing = repo.findById(dto.getCode())
            .orElseThrow(() -> new BusinessException("Impostazione di sistema non trovata"));

        Settings setting = mapper.toEntity(dto);
        existing.setValue(setting.getValue());
        existing.setLastUpdateDate(LocalDate.now());

        setting = repo.save(existing);
        return mapper.toDTO(setting);
    }
}
