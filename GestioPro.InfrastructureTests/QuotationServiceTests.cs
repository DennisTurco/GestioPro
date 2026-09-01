using GestioPro.Infrastructure.Services;
using GestioPro.Common.DTOs;
using GestioPro.Common.Interfaces;
using GestioPro.Common.Models;
using Microsoft.EntityFrameworkCore;
using GestioPro.Infrastructure.Data;

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

    private static Quotation MokupQuotation(string number)
        => new() { Title = "test", Number = number };
}
