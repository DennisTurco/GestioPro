using GestioPro.Common.DTOs;
using GestioPro.Common.Enums;
using GestioPro.Common.Exceptions;
using GestioPro.Common.Helpers;
using GestioPro.Common.Interfaces;
using GestioPro.Common.Models;
using GestioPro.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GestioPro.Infrastructure.Services;

public class CustomerService(AppDbContext context) : ICustomerService
{
    public async Task<List<CustomerResponseDTO>> GetAllAsync()
    {
        return await context.Customers
            .AsNoTracking()
            .Select(c => MapToDto(c))
            .ToListAsync();
    }

    public async Task<CustomerResponseDTO?> GetByIdAsync(long id)
    {
        var customer = await context.Customers
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        return customer is null ? null : MapToDto(customer);
    }

    public async Task CreateAsync(CustomerRequestDTO dto)
    {
        DateTimeOffset now = DateTimeOffset.UtcNow;

        var exist = await context.Customers
            .AnyAsync(x => x.Email.Equals(dto.Email));

        if (exist)
            throw new BusinessException("Customer with this email already exists");

        DataValidatorHelper.ThrowIfInvalidInformation(DataType.Email, dto.Email);
        DataValidatorHelper.ThrowIfInvalidInformation(DataType.FiscalNumber, dto.TaxCode);
        DataValidatorHelper.ThrowIfInvalidInformation(DataType.VatNumber, dto.VatNumber);

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
    }

    public async Task<CustomerResponseDTO> UpdateAsync(long id, CustomerRequestDTO dto)
    {
        var entity = await context.Customers
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            throw new BusinessException("Customer not found");

        DataValidatorHelper.ThrowIfInvalidInformation(DataType.Email, dto.Email);
        DataValidatorHelper.ThrowIfInvalidInformation(DataType.FiscalNumber, dto.TaxCode);
        DataValidatorHelper.ThrowIfInvalidInformation(DataType.VatNumber, dto.VatNumber);

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
        return MapToDto(entity);
    }

    public async Task DeleteAsync(long id)
    {
        var entity = await context.Customers
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity is null)
            throw new BusinessException("Customer not found");

        context.Customers.Remove(entity);
        await context.SaveChangesAsync();
    }

    private static CustomerResponseDTO MapToDto(Customer c)
        => new(
            c.Id,
            c.CustomerType = c.CustomerType,
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
            c.LastUpdateDate
        );
}
