package com.dennisturco.exception;

public record FieldErrorDTO(
        String field,
        String defaultMessage
) {}