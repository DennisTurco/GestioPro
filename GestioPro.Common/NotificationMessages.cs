using GestioPro.Common.DTOs;

namespace GestioPro.Common;

public static class NotificationMessages
{
    public static NotificationRequestDTO UserForceUpdate
        => new ("Aggiornamento Utente", "Il tuo utente è stato aggiornato forzatamente da un admin di sistema");

    public static NotificationRequestDTO UserPasswordForceUpdate
        => new ("Aggiornamento Utente", "La password del tuo utente è stata aggiornata forzatamente da un admin di sistema");

    public static NotificationRequestDTO ContractRenewed(string contractTitle, string number, DateOnly endDate)
        => new ("Contratto rinnovato", $"Il contratto '{contractTitle}' ({number}) è stato rinnovato fino al {endDate.Day}/{endDate.Month}/{endDate.Year}!");

    public static NotificationRequestDTO ContractExpiration(string contractTitle, string number, DateOnly endDate)
        => new ("Contratto in scadenza", $"Il contratto '{contractTitle}' ({number}) è in scadenza. Scadenza prevista in data {endDate.Day}/{endDate.Month}/{endDate.Year}");
}
