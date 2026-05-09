package com.dennisturco.enums;

public enum CustomerTypeEnum {
    COMPANY, // vatNumber == taxCode; companyName not null
    PUBLIC_ADMIN, // vatNumber not null; companyName not null; taxCode not null; vatNumber != taxCode (taxCode must be numeric)
    FREELANCER, // vatNumber != taxCode; companyName not null; taxCode is a normal taxCode
    PRIVATE, // vatNumber must be null, companyName must be null
}
