using GestioPro.Common.Enums;
using GestioPro.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace GestioPro.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<CustomerType> CustomerTypes => Set<CustomerType>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductCategory> ProductCategories => Set<ProductCategory>();
    public DbSet<ProductStatus> ProductStatuses => Set<ProductStatus>();
    public DbSet<Quotation> Quotations => Set<Quotation>();
    public DbSet<QuotationStatus> QuotationStatuses => Set<QuotationStatus>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<Contract> Contracts => Set<Contract>();
    public DbSet<ContractType> ContractTypes => Set<ContractType>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Settings> Settings => Set<Settings>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Unique constraints
        modelBuilder.Entity<Customer>()
            .HasIndex(c => c.Email).IsUnique();

        modelBuilder.Entity<Customer>()
            .HasIndex(c => c.Phone).IsUnique();

        modelBuilder.Entity<Product>()
            .HasIndex(p => p.Code).IsUnique();

        modelBuilder.Entity<Quotation>()
            .HasIndex(q => q.Number).IsUnique();

        // default values
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Username = "Admin",
                Name = "admin",
                Surname = "admin",
                Email = "admin@gmail.com",
                Password = "asdasd123",
                CreatedDate = new DateTimeOffset(2026, 06, 11, 0, 0, 0, TimeSpan.Zero)
            }
        );
        modelBuilder.Entity<CustomerType>().HasData(
            Enum.GetValues<CustomerTypeEnum>()
                .Select(e => new CustomerType
                {
                    Id = (long)e,
                    Name = e
                })
                .ToArray()
        );
        modelBuilder.Entity<ContractType>().HasData(
            Enum.GetValues<ContractTypeEnum>()
                .Select(e => new ContractType
                {
                    Id = (long)e,
                    Name = e
                })
                .ToArray()
        );
        modelBuilder.Entity<ProductStatus>().HasData(
            Enum.GetValues<ProductStatusEnum>()
                .Select(e => new ProductStatus
                {
                    Id = (long)e,
                    Name = e
                })
                .ToArray()
        );
        modelBuilder.Entity<QuotationStatus>().HasData(
            Enum.GetValues<QuotationStatusEnum>()
                .Select(e => new QuotationStatus
                {
                    Id = (long)e,
                    Name = e
                })
                .ToArray()
        );
        modelBuilder.Entity<Settings>().HasData(
            new Settings
            {
                Code = "CompanyName",
                Value = null,
                Description = "company name",
                LastUpdateDate = null
            },
            new Settings
            {
                Code = "VatNumber",
                Value = null,
                Description = "company vat number",
                LastUpdateDate = null
            },
            new Settings
            {
                Code = "VatPercentage",
                Value = "22",
                Description = "default vat percentage value",
                LastUpdateDate = null
            },
            new Settings
            {
                Code = "Email",
                Value = null,
                Description = "company email",
                LastUpdateDate = null
            },
            new Settings
            {
                Code = "Phone",
                Value = null,
                Description = "phone number",
                LastUpdateDate = null
            },
            new Settings
            {
                Code = "Address",
                Value = null,
                Description = "company address",
                LastUpdateDate = null
            },
            new Settings
            {
                Code = "Website",
                Value = null,
                Description = "company public website",
                LastUpdateDate = null
            },
            new Settings
            {
                Code = "ExpirationDays",
                Value = "30",
                Description = "quotation expiration days",
                LastUpdateDate = null
            },
            new Settings
            {
                Code = "Prefix",
                Value = null,
                Description = "default quotation prefix",
                LastUpdateDate = null
            },
            new Settings
            {
                Code = "QuotationNotes",
                Value = "",
                Description = "default quotation notes",
                LastUpdateDate = null
            }
        );
    }
}
