using GestioPro.Common.Enums;
using GestioPro.Common.Exceptions;
using ItalianFiscalKit;
using StringKit;

namespace GestioPro.Common.Helpers;

public static class DataValidatorHelper
{
    public static void ThrowIfInvalidInformation(DataType type, string? value)
    {
        if (value == null || value.IsNullOrWhiteSpace())
            return;
        if (type == DataType.VatNumber && !ItalianVatCodeValidator.IsValid(value, false, false))
            throw new BusinessException("La partita IVA inserita non è valida");
        if (type == DataType.FiscalNumber && !FiscalCodeValidator.IsValid(value))
            throw new BusinessException("Il codice fiscale inserito non è valido");
        if (type == DataType.Email && !value.IsEmail())
            throw new BusinessException("L'email inserita non è valida");
        if (type == DataType.Website && !value.IsUrl())
            throw new BusinessException("Il link inserito non è valido");
    }

    public static DataType GetTypeByCode(string code)
        => code switch
        {
            "Website" => DataType.Website,
            "Email" => DataType.Email,
            "VatNumber" => DataType.VatNumber,
            "FiscalNumber" => DataType.FiscalNumber,
            _ => throw new NotImplementedException("Non è possibile convertire correttamente il codice fornito"),
        };
}
