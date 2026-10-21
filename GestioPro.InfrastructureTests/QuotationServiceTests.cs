using GestioPro.Infrastructure.Services;
using GestioPro.Common.DTOs;
using GestioPro.Common.Interfaces;
using GestioPro.Common.Models;
using Microsoft.EntityFrameworkCore;
using GestioPro.Infrastructure.Data;
using GestioPro.Common.Exceptions;
using GestioPro.Common.Enums;

namespace GestioPro.InfrastructureTests;

public class QuotationServiceTests
{
    private sealed class NoOpAuditService : IAuditService
    {
        public Task<List<AuditResponseDTO>> GetAuditsAsync() => Task.FromResult(new List<AuditResponseDTO>());
        public Task<AuditResponseDTO> GetAuditByIdAsync(long id) => throw new NotSupportedException();
        public Task LogAsync(string action, string entityType, string entityId, object? oldValues = null, object? newValues = null) => Task.CompletedTask;
    }

    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private static async Task<Customer> AddCustomerAsync(AppDbContext context)
    {
        var customer = new Customer { Name = "test", Surname = "test", Email = "test@test.it", Phone = "123" };
        context.Customers.Add(customer);
        await context.SaveChangesAsync();
        return customer;
    }

    // ----------------------------------------- CreateAsync
    [Fact]
    public async Task CreateAsync_ValidData_ShouldCreate()
    {
        await using var context = CreateContext();
        var customer = await AddCustomerAsync(context);
        var service = new QuotationService(context, new NoOpAuditService());

        var created = await service.CreateAsync(MockupQuotationDTO(customer.Id, "1234", "title"));
        var saved = await service.GetByIdAsync(created.Id);

        Assert.NotNull(saved);
        Assert.Equal("1234", saved.Number);
        Assert.Equal("title", saved.Title);
        Assert.Equal(customer.Id, saved.CustomerId);
    }

    [Fact]
    public async Task CreateAsync_DuplicatedNumber_ShouldRaiseException()
    {
        await using var context = CreateContext();
        var customer = await AddCustomerAsync(context);
        var service = new QuotationService(context, new NoOpAuditService());

        await service.CreateAsync(MockupQuotationDTO(customer.Id, "1234"));

        await Assert.ThrowsAsync<DuplicateEntityException>(() => service.CreateAsync(MockupQuotationDTO(customer.Id, "1234")));
    }

    [Fact]
    public async Task CreateAsync_ProductNotFound_ShouldRaiseException()
    {
        await using var context = CreateContext();
        var customer = await AddCustomerAsync(context);
        var service = new QuotationService(context, new NoOpAuditService());

        var dto = MockupQuotationDTO(customer.Id, "1234") with { Products = [new QuotationProductRequestDTO(999, 1)] };

        await Assert.ThrowsAsync<EntityNotFoundException>(() => service.CreateAsync(dto));
    }

    // ----------------------------------------- UpdateAsync
    [Fact]
    public async Task UpdateAsync_ValidUpdate_ShouldUpdate()
    {
        await using var context = CreateContext();
        var customer = await AddCustomerAsync(context);
        var service = new QuotationService(context, new NoOpAuditService());

        var created = await service.CreateAsync(MockupQuotationDTO(customer.Id, "1234", "old-title"));
        var updated = await service.UpdateAsync(created.Id, MockupQuotationDTO(customer.Id, "1234", "new-title"));

        Assert.Equal(created.Id, updated.Id);
        Assert.Equal("new-title", updated.Title);
        Assert.Equal("new-title", (await service.GetByIdAsync(created.Id))!.Title);
    }

    [Fact]
    public async Task UpdateAsync_NotExisting_ShouldRaiseException()
    {
        await using var context = CreateContext();
        var service = new QuotationService(context, new NoOpAuditService());

        await Assert.ThrowsAsync<EntityNotFoundException>(() => service.UpdateAsync(999, MockupQuotationDTO(1, "1234")));
    }

    // ----------------------------------------- CalculateNextNumberAsync
    [Fact]
    public async Task CalculateNextNumberAsync_FirstQuotation_ShouldCreateFirstQuotation()
    {
        await using var context = CreateContext();
        var service = new QuotationService(context, new NoOpAuditService());

        var result = await service.CalculateNextNumberAsync();

        Assert.Equal($"{DateTime.Today.Year}-001", result);
    }

    [Fact]
    public async Task CalculateNextNumberAsync_TwoDigits_ShouldCreateCorrectNext()
    {
        await using var context = CreateContext();

        var year = DateTime.Today.Year;
        context.Quotations.Add(MokupQuotation($"{year}-012"));
        await context.SaveChangesAsync();

        var service = new QuotationService(context, new NoOpAuditService());
        var result = await service.CalculateNextNumberAsync();

        Assert.Equal($"{year}-013", result);
    }

    [Fact]
    public async Task CalculateNextNumberAsync_ThreeDigits_ShouldCreateCorrectNext()
    {
        await using var context = CreateContext();

        var year = DateTime.Today.Year;
        context.Quotations.Add(MokupQuotation($"{year}-123"));
        await context.SaveChangesAsync();

        var service = new QuotationService(context, new NoOpAuditService());
        var result = await service.CalculateNextNumberAsync();

        Assert.Equal($"{year}-124", result);
    }

    [Fact]
    public async Task CalculateNextNumberAsync_LastQuotationThisYear_ShouldIncrementCounter()
    {
        await using var context = CreateContext();
        var year = DateTime.Today.Year;
        context.Quotations.Add(MokupQuotation($"{year}-005"));
        await context.SaveChangesAsync();
        var service = new QuotationService(context, new NoOpAuditService());

        var result = await service.CalculateNextNumberAsync();

        Assert.Equal($"{year}-006", result);
    }

    [Fact]
    public async Task CalculateNextNumberAsync_LastQuotationLastYear_ResetTo001()
    {
        await using var context = CreateContext();
        var previousYear = DateTime.Today.Year - 1;
        context.Quotations.Add(MokupQuotation($"{previousYear}-042"));
        await context.SaveChangesAsync();
        var service = new QuotationService(context, new NoOpAuditService());

        var result = await service.CalculateNextNumberAsync();

        Assert.Equal($"{DateTime.Today.Year}-001", result);
    }

    [Fact]
    public async Task CalculateNextNumberAsync_ShouldTakeLastQuotationById()
    {
        await using var context = CreateContext();
        var year = DateTime.Today.Year;
        context.Quotations.AddRange(
            MokupQuotation($"{year}-010"),
            MokupQuotation($"{year}-002")
        );
        await context.SaveChangesAsync();
        var service = new QuotationService(context, new NoOpAuditService());

        var result = await service.CalculateNextNumberAsync();

        Assert.Equal($"{year}-003", result);
    }

    [Fact]
    public async Task CalculateNextNumberAsync_NumberWithZeroes_ShouldBeEquals()
    {
        await using var context = CreateContext();
        var year = DateTime.Today.Year;
        context.Quotations.Add(MokupQuotation($"{year}-010"));
        await context.SaveChangesAsync();
        var service = new QuotationService(context, new NoOpAuditService());

        var result = await service.CalculateNextNumberAsync();

        Assert.Equal($"{year}-011", result);
    }


    // ----------------------------------------- UpdateStatusAsync

    [Fact]
    public async Task UpdateStatusAsync_NewStatus_ShouldUpdate()
    {
        await using var context = CreateContext();
        var customer = await AddCustomerAsync(context);
        var service = new QuotationService(context, new NoOpAuditService());

        var created = await service.CreateAsync(MockupQuotationDTO(customer.Id, "1234"));
        var updated = await service.UpdateStatusAsync(created.Id, QuotationStatus.REJECTED);

        Assert.Equal(created.Id, updated.Id);
        Assert.Equal(QuotationStatus.REJECTED, updated.QuotationStatus);
    }

    [Fact]
    public async Task UpdateStatusAsync_QuoatationNotFound_ShouldRaiseException()
    {
        await using var context = CreateContext();
        var customer = await AddCustomerAsync(context);
        var service = new QuotationService(context, new NoOpAuditService());

        await Assert.ThrowsAsync<EntityNotFoundException>(() => service.UpdateStatusAsync(-1, QuotationStatus.REJECTED));
    }


    // ----------------------------------------- DisableAsync

    [Fact]
    public async Task DisableAsync_ExistingEntity_ShouldSoftDelete()
    {
        await using var context = CreateContext();
        var customer = await AddCustomerAsync(context);
        var service = new QuotationService(context, new NoOpAuditService());

        var created = await service.CreateAsync(MockupQuotationDTO(customer.Id, "1234"));
        await service.DisableAsync(created.Id);

        Assert.Empty(await service.GetAllAsync());
    }

    [Fact]
    public async Task DisableAsync_QuoatationNotFound_ShouldRaiseException()
    {
        await using var context = CreateContext();
        var customer = await AddCustomerAsync(context);
        var service = new QuotationService(context, new NoOpAuditService());

        await Assert.ThrowsAsync<EntityNotFoundException>(() => service.DisableAsync(-1));
    }

    private static Quotation MokupQuotation(string number)
        => new() { Title = "test", Number = number };
    private static QuotationRequestDTO MockupQuotationDTO(long customerId, string number, string title = "")
        => new(customerId, QuotationStatus.ACCEPTED, number, title, 0f, 0, 0, string.Empty, string.Empty, DateOnly.FromDateTime(DateTime.UtcNow), DateOnly.FromDateTime(DateTime.UtcNow), new List<QuotationProductRequestDTO>());
}
