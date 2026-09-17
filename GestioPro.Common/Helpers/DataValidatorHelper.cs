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
            throw new ValidationException("La partita IVA inserita non è valida");
        if (type == DataType.FiscalNumber && !FiscalCodeValidator.IsValid(value))
            throw new ValidationException("Il codice fiscale inserito non è valido");
        if (type == DataType.Email && !value.IsEmail())
            throw new ValidationException("L'email inserita non è valida");
        if (type == DataType.Website && !value.IsUrl())
            throw new ValidationException("Il link inserito non è valido");
    }

    public static bool TryGetTypeByCode(string code, out DataType type)
    {
        switch (code)
        {
            case "Website": type = DataType.Website; return true;
            case "Email": type = DataType.Email; return true;
            case "VatNumber": type = DataType.VatNumber; return true;
            case "FiscalNumber": type = DataType.FiscalNumber; return true;
            default: type = default; return false;
        }
    }
}
