using GestioPro.Infrastructure.Data;
using GestioPro.Common.DTOs;
using GestioPro.Common.Exceptions;
using GestioPro.Common.Interfaces;
using GestioPro.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace GestioPro.Infrastructure.Services;

public class CustomerService(AppDbContext context) : ICustomerService
{
    // TODO: usa LINQ + async per restituire tutti i clienti mappati su CustomerResponseDTO
    public async Task<List<CustomerResponseDTO>> GetAllAsync()
    {
        throw new NotImplementedException();
    }

    // TODO: trova il cliente per id (restituisci null se non trovato), poi mappalo su DTO
    public async Task<CustomerResponseDTO?> GetByIdAsync(long id)
    {
        throw new NotImplementedException();
    }

    // TODO: controlla duplicati su email, imposta InsertDate e LastUpdateDate, salva
    public async Task CreateAsync(CustomerRequestDTO dto)
    {
        throw new NotImplementedException();
    }

    // TODO: trova l'esistente, aggiorna i campi dal dto, aggiorna LastUpdateDate, salva e ritorna il DTO
    public async Task<CustomerResponseDTO> UpdateAsync(long id, CustomerRequestDTO dto)
    {
        throw new NotImplementedException();
    }

    // TODO: trova ed elimina, oppure lancia BusinessException se non esiste
    public async Task DeleteAsync(long id)
    {
        throw new NotImplementedException();
    }

    // Suggerimento: crea un metodo privato MapToDto(Customer c) => new CustomerResponseDTO(...)
}
