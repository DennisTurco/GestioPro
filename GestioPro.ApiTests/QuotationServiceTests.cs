using GestioPro.Infrastructure.Services;
using GestioPro.Common;

namespace GestioPro.ApiTests;

public class QuotationServiceTests
{
    private static ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task CalculateNextNumberAsync_FirstQuotation_ShouldCreateFirstQuotation()
    {
        await using var context = CreateContext();
        var service = new QuotationService(context);

        var result = await service.CalculateNextNumberAsync();

        Assert.Equal($"{DateTime.Today.Year}-001", result);
    }

    [Fact]
    public async Task CalculateNextNumberAsync_LastQuotationThisYear_ShouldIncrementCounter()
    {
        await using var context = CreateContext();
        var year = DateTime.Today.Year;
        context.Quotations.Add(new Quotation { Number = $"{year}-005" });
        await context.SaveChangesAsync();
        var service = new QuotationService(context);

        var result = await service.CalculateNextNumberAsync();

        Assert.Equal($"{year}-006", result);
    }

    [Fact]
    public async Task CalculateNextNumberAsync_LastQuotationLastYear_ResetTo001()
    {
        await using var context = CreateContext();
        var previousYear = DateTime.Today.Year - 1;
        context.Quotations.Add(new Quotation { Number = $"{previousYear}-042" });
        await context.SaveChangesAsync();
        var service = new QuotationService(context);

        var result = await service.CalculateNextNumberAsync();

        Assert.Equal($"{DateTime.Today.Year}-001", result);
    }

    [Fact]
    public async Task CalculateNextNumberAsync_ShouldTakeLastQuotationById()
    {
        await using var context = CreateContext();
        var year = DateTime.Today.Year;
        context.Quotations.AddRange(
            new Quotation { Number = $"{year}-010" },
            new Quotation { Number = $"{year}-002" }
        );
        await context.SaveChangesAsync();
        var service = new QuotationService(context);

        var result = await service.CalculateNextNumberAsync();

        Assert.Equal($"{year}-003", result);
    }

    [Fact]
    public async Task CalculateNextNumberAsync_NumberWithZeroes_ShouldBeEquals()
    {
        await using var context = CreateContext();
        var year = DateTime.Today.Year;
        context.Quotations.Add(new Quotation { Number = $"{year}-010" });
        await context.SaveChangesAsync();
        var service = new QuotationService(context);

        var result = await service.CalculateNextNumberAsync();

        Assert.Equal($"{year}-011", result);
    }
}
