using GestioPro.Common.Enums;

namespace GestioPro.Common.Helpers;

public static class ContractTypeExtensions
{
    public static int ToMonths(this ContractType type)
        => type switch
        {
            ContractType.MONTHLY => 1,
            ContractType.QUATERLY => 3,
            ContractType.SEMESTRAL => 6,
            ContractType.ANNUAL => 12,
            _ => throw new ArgumentOutOfRangeException(nameof(type))
        };

    public static DateOnly ExtendEndDateByContractType(DateOnly date, ContractType type)
        => date.AddMonths(type.ToMonths());
}
