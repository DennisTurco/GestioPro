package com.dennisturco.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserRequestDTO {
    private String username;
    private String email;
    private String password;
    private String name;
    private String surname;
}
