using GestioPro.Infrastructure.Services;
using GestioPro.Common.DTOs;
using GestioPro.Common.Enums;
using GestioPro.Common.Exceptions;
using GestioPro.Common.Interfaces;
using GestioPro.Common.Models;
using Microsoft.EntityFrameworkCore;
using GestioPro.Infrastructure.Data;

namespace GestioPro.InfrastructureTests;

public class ContractServiceTests
{
    private sealed class NoOpAuditService : IAuditService
    {
        public Task<List<AuditResponseDTO>> GetAuditsAsync() => Task.FromResult(new List<AuditResponseDTO>());
        public Task<AuditResponseDTO> GetAuditByIdAsync(long id) => throw new NotSupportedException();
        public Task LogAsync(string action, string entityType, string entityId, object? oldValues = null, object? newValues = null) => Task.CompletedTask;
    }

    private sealed class NoOpNotificationService : INotificationService
    {
        public Task<int> CountByDateAndDescriptionAsync(DateTimeOffset date, string description) => Task.FromResult(0);
        public Task<List<NotificationResponseDTO>> GetAllByUserIdAsync(Guid userId) => Task.FromResult(new List<NotificationResponseDTO>());
        public Task<List<NotificationResponseDTO>> CreateAsync(NotificationRequestDTO dto) => Task.FromResult(new List<NotificationResponseDTO>());
        public Task<NotificationResponseDTO> CreateByUserIdAsync(NotificationRequestDTO dto, Guid userId) => throw new NotSupportedException();
        public Task<NotificationResponseDTO> MarkAsReadAsync(long id) => throw new NotSupportedException();
        public Task DeleteAsync(long id) => Task.CompletedTask;
        public Task<List<PendingEmailNotificationDTO>> GetPendingEmailsAsync(DateTimeOffset since) => Task.FromResult(new List<PendingEmailNotificationDTO>());
        public Task<bool> TryClaimEmailAsync(long id) => Task.FromResult(false);
        public Task ReleaseEmailClaimAsync(long id) => Task.CompletedTask;
    }

    // Quotation is a required navigation: queries that Include it drop contracts without one
    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var context = new AppDbContext(options);

        context.Quotations.AddRange(
            new Quotation { Id = 1, CustomerId = 1, Number = "2026-001", Title = "Preventivo 1" },
            new Quotation { Id = 2, CustomerId = 1, Number = "2026-002", Title = "Preventivo 2" });
        context.SaveChanges();

        return context;
    }

    private static ContractService CreateService(AppDbContext context)
        => new(context, new NoOpAuditService(), new NoOpNotificationService());

    private static ContractRequestDTO CreateRequest(string number = "2026-001-001", ContractType type = ContractType.ANNUAL)
        => new(
            QuotationId: 1,
            ContractType: type,
            Number: number,
            Title: "Contratto di test",
            Amount: 1200,
            VatPercentage: 22,
            Description: null,
            Notes: null,
            FilePath: null,
            StartDate: new DateOnly(2026, 1, 1)
        );

    // ----------------------------------------- GetAllAsync

    [Fact]
    public async Task GetAllAsync_NoContracts_ShouldReturnEmpty()
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        Assert.Empty(await service.GetAllAsync());
    }

    [Fact]
    public async Task GetAllAsync_ExistingContracts_ShouldReturnAll()
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        await service.CreateAsync(CreateRequest("2026-001-001"));
        await service.CreateAsync(CreateRequest("2026-001-002"));

        var contracts = await service.GetAllAsync();

        Assert.Equal(2, contracts.Count);
    }

    // ----------------------------------------- GetByIdAsync

    [Fact]
    public async Task GetByIdAsync_Existing_ShouldReturnContract()
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        var created = await service.CreateAsync(CreateRequest());
        var found = await service.GetByIdAsync(created.Id);

        Assert.NotNull(found);
        Assert.Equal(created.Id, found.Id);
        Assert.Equal("2026-001-001", found.Number);
    }

    [Fact]
    public async Task GetByIdAsync_NotExisting_ShouldReturnNull()
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        Assert.Null(await service.GetByIdAsync(-1));
    }

    // ----------------------------------------- CreateAsync

    [Fact]
    public async Task CreateAsync_ContractCreation_ShouldCreateContract()
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        var created = await service.CreateAsync(CreateRequest());

        var contract = await context.Contracts.Include(c => c.Renewals).SingleAsync();
        Assert.Equal(contract.Id, created.Id);
        Assert.Equal("2026-001-001", contract.Number);
        Assert.Equal("Contratto di test", contract.Title);
        Assert.Equal(1200, contract.Amount);
        Assert.Equal(new DateOnly(2026, 1, 1), contract.StartDate);
        Assert.Equal(new DateOnly(2027, 1, 1), contract.EndDate);

        var renewal = Assert.Single(contract.Renewals);
        Assert.Equal(contract.Amount, renewal.Amount);
        Assert.Equal(contract.StartDate, renewal.StartDate);
        Assert.Equal(contract.EndDate, renewal.EndDate);
    }

    [Theory]
    [InlineData(ContractType.MONTHLY, 2026, 2, 1)]
    [InlineData(ContractType.QUATERLY, 2026, 4, 1)]
    [InlineData(ContractType.SEMESTRAL, 2026, 7, 1)]
    [InlineData(ContractType.ANNUAL, 2027, 1, 1)]
    public async Task CreateAsync_ByContractType_ShouldSetEndDate(ContractType type, int year, int month, int day)
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        await service.CreateAsync(CreateRequest(type: type));

        var contract = await context.Contracts.SingleAsync();
        Assert.Equal(new DateOnly(year, month, day), contract.EndDate);
    }

    [Fact]
    public async Task CreateAsync_DuplicateNumber_ShouldThrow()
    {
        await using var context = CreateContext();
        var service = CreateService(context);
        await service.CreateAsync(CreateRequest());

        await Assert.ThrowsAsync<DuplicateEntityException>(() => service.CreateAsync(CreateRequest()));
        Assert.Equal(1, await context.Contracts.CountAsync());
    }

    // ----------------------------------------- UpdateAsync

    [Fact]
    public async Task UpdateAsync_ValidUpdate_ShouldUpdate()
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        var created = await service.CreateAsync(CreateRequest());
        var updated = await service.UpdateAsync(created.Id, CreateRequest() with { Title = "Titolo aggiornato", Amount = 1500 });

        Assert.Equal(created.Id, updated.Id);
        var saved = await service.GetByIdAsync(created.Id);
        Assert.NotNull(saved);
        Assert.Equal("Titolo aggiornato", saved.Title);
        Assert.Equal(1500, saved.Amount);
    }

    [Fact]
    public async Task UpdateAsync_NoChanges_ShouldReturnUnchanged()
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        var created = await service.CreateAsync(CreateRequest());
        var updated = await service.UpdateAsync(created.Id, CreateRequest());

        Assert.Equal(created.LastUpdateDate, updated.LastUpdateDate);
    }

    [Fact]
    public async Task UpdateAsync_NotExisting_ShouldRaiseException()
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        await Assert.ThrowsAsync<EntityNotFoundException>(() => service.UpdateAsync(-1, CreateRequest()));
    }

    // ----------------------------------------- RenewalAsync

    [Fact]
    public async Task RenewalAsync_ValidRenewal_ShouldExtendEndDate()
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        var created = await service.CreateAsync(CreateRequest(type: ContractType.SEMESTRAL));
        var renewed = await service.RenewalAsync(created.Id);

        Assert.Equal(new DateOnly(2026, 7, 1), created.EndDate);
        Assert.Equal(new DateOnly(2027, 1, 1), renewed.EndDate);
        Assert.Equal(created.StartDate, renewed.StartDate);
    }

    [Fact]
    public async Task RenewalAsync_ValidRenewal_ShouldAddRenewal()
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        var created = await service.CreateAsync(CreateRequest(type: ContractType.SEMESTRAL));
        await service.RenewalAsync(created.Id);

        var renewals = await context.ContractRenewals
            .Where(r => r.ContractId == created.Id)
            .OrderBy(r => r.StartDate)
            .ToListAsync();
        Assert.Equal(2, renewals.Count);
        Assert.Equal(created.EndDate, renewals[1].StartDate);
        Assert.Equal(new DateOnly(2027, 1, 1), renewals[1].EndDate);
    }

    [Fact]
    public async Task RenewalAsync_NotExisting_ShouldRaiseException()
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        await Assert.ThrowsAsync<EntityNotFoundException>(() => service.RenewalAsync(-1));
    }

    // ----------------------------------------- DeleteAsync

    [Fact]
    public async Task DeleteAsync_ExistingContract_ShouldDelete()
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        var created = await service.CreateAsync(CreateRequest());
        await service.DeleteAsync(created.Id);

        Assert.Null(await service.GetByIdAsync(created.Id));
        Assert.Equal(0, await context.Contracts.CountAsync());
    }

    [Fact]
    public async Task DeleteAsync_NotExisting_ShouldRaiseException()
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        await Assert.ThrowsAsync<EntityNotFoundException>(() => service.DeleteAsync(-1));
    }

    // ----------------------------------------- CalculateNextNumberAsync

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task CalculateNextNumberAsync_EmptyNumber_ShouldRaiseException(string quotationNumber)
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        await Assert.ThrowsAsync<ArgumentException>(() => service.CalculateNextNumberAsync(1, quotationNumber));
    }

    [Fact]
    public async Task CalculateNextNumberAsync_NoContracts_ShouldReturnFirstNumber()
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        Assert.Equal("2026-001-001", await service.CalculateNextNumberAsync(1, "2026-001"));
    }

    [Fact]
    public async Task CalculateNextNumberAsync_ExistingContracts_ShouldReturnNextNumber()
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        await service.CreateAsync(CreateRequest("2026-001-001"));
        await service.CreateAsync(CreateRequest("2026-001-002"));

        Assert.Equal("2026-001-003", await service.CalculateNextNumberAsync(1, "2026-001"));
    }

    [Fact]
    public async Task CalculateNextNumberAsync_ContractsOfOtherQuotation_ShouldBeIgnored()
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        await service.CreateAsync(CreateRequest("2026-001-001"));

        Assert.Equal("2026-002-001", await service.CalculateNextNumberAsync(2, "2026-002"));
    }
}
