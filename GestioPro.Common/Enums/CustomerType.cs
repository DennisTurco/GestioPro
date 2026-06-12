namespace GestioPro.Common.Enums;

public enum CustomerType : byte
{
    COMPANY = 1,       // vatNumber == taxCode; companyName not null
    PUBLIC_ADMIN = 2,  // vatNumber != taxCode (taxCode numeric); companyName not null
    FREELANCER = 3,    // vatNumber != taxCode; companyName not null
    PRIVATE = 4        // vatNumber null; companyName null
}
