using GestioPro.Infrastructure.Services;
using GestioPro.Common.DTOs;
using GestioPro.Common.Enums;
using GestioPro.Common.Exceptions;
using GestioPro.Common.Interfaces;
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

    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
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
            StartDate: new DateOnly(2026, 1, 15)
        );

    [Fact]
    public async Task CreateAsync_ContractCreation_ShouldCreateContract()
    {
        await using var context = CreateContext();
        var service = CreateService(context);

        await service.CreateAsync(CreateRequest());

        var contract = await context.Contracts.Include(c => c.Renewals).SingleAsync();
        Assert.Equal("2026-001-001", contract.Number);
        Assert.Equal("Contratto di test", contract.Title);
        Assert.Equal(1200, contract.Amount);
        Assert.Equal(new DateOnly(2026, 1, 15), contract.StartDate);
        Assert.Equal(new DateOnly(2027, 1, 15), contract.EndDate);

        var renewal = Assert.Single(contract.Renewals);
        Assert.Equal(contract.Amount, renewal.Amount);
        Assert.Equal(contract.StartDate, renewal.StartDate);
        Assert.Equal(contract.EndDate, renewal.EndDate);
    }

    [Theory]
    [InlineData(ContractType.MONTHLY, 2026, 2, 15)]
    [InlineData(ContractType.QUATERLY, 2026, 4, 15)]
    [InlineData(ContractType.SEMESTRAL, 2026, 7, 15)]
    [InlineData(ContractType.ANNUAL, 2027, 1, 15)]
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
}
