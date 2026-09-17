namespace GestioPro.Common.DTOs;

public record CustomerDocumentResponseDTO(
    long Id,
    long CustomerId,
    string FileName,
    string ContentType,
    long SizeBytes,
    DateTimeOffset UploadDate
);
