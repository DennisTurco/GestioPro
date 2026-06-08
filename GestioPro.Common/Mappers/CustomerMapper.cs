using GestioPro.Common.DTOs;
using GestioPro.Common.Models;

namespace GestioPro.Common.Mappers;

public static class CustomerMapper
{
    // TODO: mappa Customer -> CustomerResponseDTO
    public static CustomerResponseDTO ToResponseDto(Customer c)
    {
        throw new NotImplementedException();
    }

    // TODO: mappa CustomerRequestDTO -> Customer (senza Id, senza date)
    public static Customer ToEntity(CustomerRequestDTO dto, CustomerType customerType)
    {
        throw new NotImplementedException();
    }
}
