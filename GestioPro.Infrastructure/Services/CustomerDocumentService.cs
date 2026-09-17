using GestioPro.Common.DTOs;
using GestioPro.Common.Exceptions;
using GestioPro.Common.Interfaces;
using GestioPro.Common.Models;
using GestioPro.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GestioPro.Infrastructure.Services;

public class CustomerDocumentService(AppDbContext context, IAuditService auditService) : ICustomerDocumentService
{
    private const long MaxSizeBytes = 5 * 1024 * 1024;

    public async Task<List<CustomerDocumentResponseDTO>> GetByCustomerIdAsync(long customerId)
        => await context.CustomerDocuments
            .AsNoTracking()
            .Where(d => d.CustomerId == customerId)
            .OrderByDescending(d => d.UploadDate)
            .Select(d => MapToDto(d))
            .ToListAsync();

    public async Task<CustomerDocumentResponseDTO> UploadAsync(long customerId, string fileName, string contentType, long sizeBytes, Stream content)
    {
        if (sizeBytes > MaxSizeBytes)
            throw new ValidationException("Il file supera la dimensione massima consentita di 5 MB");

        var customer = await context.Customers.FirstOrDefaultAsync(c => c.Id == customerId)
            ?? throw new EntityNotFoundException("Cliente non trovato");

        using var memoryStream = new MemoryStream();
        await content.CopyToAsync(memoryStream);

        var document = new CustomerDocument
        {
            CustomerId = customer.Id,
            FileName = fileName,
            ContentType = contentType,
            SizeBytes = sizeBytes,
            Content = memoryStream.ToArray(),
            UploadDate = DateTimeOffset.UtcNow,
        };

        await context.AddAsync(document);
        await context.SaveChangesAsync();

        await auditService.LogAsync("Create", nameof(CustomerDocument), document.Id.ToString(), newValues: MapToDto(document));

        return MapToDto(document);
    }

    public async Task<(byte[] Content, string ContentType, string FileName)> DownloadAsync(long id)
    {
        var document = await context.CustomerDocuments
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == id)
            ?? throw new EntityNotFoundException("Documento non trovato");

        return (document.Content, document.ContentType, document.FileName);
    }

    public async Task DeleteAsync(long id)
    {
        var document = await context.CustomerDocuments
            .FirstOrDefaultAsync(d => d.Id == id)
            ?? throw new EntityNotFoundException("Documento non trovato");

        var oldValues = MapToDto(document);

        context.CustomerDocuments.Remove(document);
        await context.SaveChangesAsync();

        await auditService.LogAsync("Delete", nameof(CustomerDocument), document.Id.ToString(), oldValues);
    }

    private static CustomerDocumentResponseDTO MapToDto(CustomerDocument d)
        => new(d.Id, d.CustomerId, d.FileName, d.ContentType, d.SizeBytes, d.UploadDate);
}
