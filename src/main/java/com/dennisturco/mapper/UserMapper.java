package com.dennisturco.mapper;

import java.time.LocalDate;

import org.springframework.stereotype.Component;

import com.dennisturco.dto.UserRequestDTO;
import com.dennisturco.model.User;

@Component
public class UserMapper {
    public User toEntity(UserRequestDTO dto) {
        return User.builder()
            .id(null)
            .username(dto.getUsername())
            .email(dto.getEmail())
            .password(dto.getPassword())
            .name(dto.getName())
            .surname(dto.getSurname())
            .createdDate(LocalDate.now())
            .build();
    }
}
