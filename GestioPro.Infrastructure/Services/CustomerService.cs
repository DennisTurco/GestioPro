using GestioPro.Common.DTOs;
using GestioPro.Common.Enums;
using GestioPro.Common.Exceptions;
using GestioPro.Common.Helpers;
using GestioPro.Common.Interfaces;
using GestioPro.Common.Models;
using GestioPro.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GestioPro.Infrastructure.Services;

public class CustomerService(AppDbContext context, IAuditService auditService) : ICustomerService
{
    public async Task<List<CustomerResponseDTO>> GetAllAsync()
    {
        var activeThreshold = DateOnly.FromDateTime(DateTime.Today).AddDays(14);

        return await context.Customers
            .AsNoTracking()
            .Where(c => !c.IsDisabled)
            .Select(c => new CustomerResponseDTO(
                c.Id,
                c.CustomerType,
                c.Name,
                c.Surname,
                c.Email,
                c.Phone,
                c.Country,
                c.Region,
                c.City,
                c.Province,
                c.Address,
                c.VatNumber,
                c.CompanyName,
                c.TaxCode,
                c.Landline,
                c.Lat,
                c.Lon,
                c.Notes,
                c.InsertDate,
                c.LastUpdateDate,
                c.IsDisabled,
                context.Quotations.Count(q => q.CustomerId == c.Id && !q.IsDisabled),
                context.Contracts.Count(ct => ct.Quotation.CustomerId == c.Id && ct.EndDate >= activeThreshold)
            ))
            .ToListAsync();
    }

    public async Task<CustomerResponseDTO?> GetByIdAsync(long id)
    {
        var customer = await context.Customers
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (customer is null) return null;
        var (qCount, cCount) = await GetCountsAsync(id);
        return MapToDto(customer, qCount, cCount);
    }

    public async Task<CustomerResponseDTO> CreateAsync(CustomerRequestDTO dto)
    {
        await ThrowIfDuplicatedPhoneNumber(dto);
        await ThrowIfDuplicatedEmail(dto);

        DataValidatorHelper.ThrowIfInvalidInformation(DataType.Email, dto.Email);
        DataValidatorHelper.ThrowIfInvalidInformation(DataType.FiscalNumber, dto.TaxCode);
        DataValidatorHelper.ThrowIfInvalidInformation(DataType.VatNumber, dto.VatNumber);

        DateTimeOffset now = DateTimeOffset.UtcNow;
        var entity = new Customer
        {
            CustomerType = dto.CustomerType,
            Name = dto.Name,
            Surname = dto.Surname,
            Email = dto.Email,
            Phone = dto.Phone,
            Country = dto.Country,
            Region = dto.Region,
            City = dto.City,
            Province = dto.Province,
            Address = dto.Address,
            VatNumber = dto.VatNumber,
            CompanyName = dto.CompanyName,
            TaxCode = dto.TaxCode,
            Landline = dto.Landline,
            Lat = dto.Lat,
            Lon = dto.Lon,
            InsertDate = now,
            LastUpdateDate = now,
            Notes = dto.Notes
        };

        await context.Customers.AddAsync(entity);
        await context.SaveChangesAsync();

        var created = MapToDto(entity);

        await auditService.LogAsync("Create", nameof(Customer), entity.Id.ToString(), newValues: created);

        return created;
    }

    public async Task<CustomerResponseDTO> UpdateAsync(long id, CustomerRequestDTO dto)
    {
        var entity = await context.Customers
            .FirstOrDefaultAsync(x => x.Id == id) ?? throw new BusinessException("Customer not found");

        DataValidatorHelper.ThrowIfInvalidInformation(DataType.Email, dto.Email);
        DataValidatorHelper.ThrowIfInvalidInformation(DataType.FiscalNumber, dto.TaxCode);
        DataValidatorHelper.ThrowIfInvalidInformation(DataType.VatNumber, dto.VatNumber);

        await ThrowIfDuplicatedPhoneNumber(dto);
        await ThrowIfDuplicatedEmail(dto);

        var oldValues = MapToDto(entity);

        entity.CustomerType = dto.CustomerType;
        entity.Name = dto.Name;
        entity.Surname = dto.Surname;
        entity.Email = dto.Email;
        entity.Phone = dto.Phone;
        entity.Country = dto.Country;
        entity.Region = dto.Region;
        entity.City = dto.City;
        entity.Province = dto.Province;
        entity.Address = dto.Address;
        entity.VatNumber = dto.VatNumber;
        entity.CompanyName = dto.CompanyName;
        entity.TaxCode = dto.TaxCode;
        entity.Landline = dto.Landline;
        entity.Lat = dto.Lat;
        entity.Lon = dto.Lon;
        entity.Notes = dto.Notes;
        entity.LastUpdateDate = DateTimeOffset.UtcNow;

        await context.SaveChangesAsync();

        var (qCount, cCount) = await GetCountsAsync(id);
        var newValues = MapToDto(entity, qCount, cCount);

        await auditService.LogAsync("Update", nameof(Customer), entity.Id.ToString(), oldValues, newValues);

        return newValues;
    }

    public async Task DeleteAsync(long id)
    {
        var entity = await context.Customers
            .FirstOrDefaultAsync(x => x.Id == id) ?? throw new BusinessException("Customer not found");

        var oldValues = MapToDto(entity);

        entity.IsDisabled = true;
        entity.LastUpdateDate = DateTimeOffset.UtcNow;

        await context.SaveChangesAsync();

        await auditService.LogAsync("Delete", nameof(Customer), entity.Id.ToString(), oldValues: oldValues);
    }

    private async Task ThrowIfDuplicatedPhoneNumber(CustomerRequestDTO dto)
    {
         var existingNumber = await context.Customers
            .AnyAsync(x => x.Phone.Equals(dto.Phone));

        if (existingNumber && !string.IsNullOrWhiteSpace(dto.Phone))
            throw new BusinessException("Esiste già un cliente con questo numero associato");
    }

    private async Task ThrowIfDuplicatedEmail(CustomerRequestDTO dto)
    {
         var existingEmail = await context.Customers
            .AnyAsync(x => x.Email.Equals(dto.Email));

        if (existingEmail)
            throw new BusinessException("Questa email è già in uso da un'altro cliente");
    }

    private async Task<(int QuotationCount, int ContractCount)> GetCountsAsync(long customerId)
    {
        var activeThreshold = DateOnly.FromDateTime(DateTime.Today).AddDays(14);
        var qCount = await context.Quotations.CountAsync(q => q.CustomerId == customerId && !q.IsDisabled);
        var cCount = await context.Contracts.CountAsync(ct => ct.Quotation.CustomerId == customerId && ct.EndDate >= activeThreshold);
        return (qCount, cCount);
    }

    private static CustomerResponseDTO MapToDto(Customer c, int quotationCount = 0, int contractCount = 0)
        => new(
            c.Id,
            c.CustomerType,
            c.Name,
            c.Surname,
            c.Email,
            c.Phone,
            c.Country,
            c.Region,
            c.City,
            c.Province,
            c.Address,
            c.VatNumber,
            c.CompanyName,
            c.TaxCode,
            c.Landline,
            c.Lat,
            c.Lon,
            c.Notes,
            c.InsertDate,
            c.LastUpdateDate,
            c.IsDisabled,
            quotationCount,
            contractCount
        );
}
