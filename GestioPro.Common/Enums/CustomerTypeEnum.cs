namespace GestioPro.Common.Enums;

public enum CustomerTypeEnum
{
    COMPANY,       // vatNumber == taxCode; companyName not null
    PUBLIC_ADMIN,  // vatNumber != taxCode (taxCode numeric); companyName not null
    FREELANCER,    // vatNumber != taxCode; companyName not null
    PRIVATE        // vatNumber null; companyName null
}
