package com.dennisturco.exception;

import java.util.List;

public record ValidationErrorResponse(
        String message,
        List<FieldErrorDTO> errors
) {}