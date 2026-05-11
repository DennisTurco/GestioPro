package com.dennisturco.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponseDTO {
    private String name;
    private String surname;
    private String username;
    private String email;
}
