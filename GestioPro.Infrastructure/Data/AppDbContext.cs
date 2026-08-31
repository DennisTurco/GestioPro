using GestioPro.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace GestioPro.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductCategory> ProductCategories => Set<ProductCategory>();
    public DbSet<Quotation> Quotations => Set<Quotation>();
    public DbSet<QuotationProduct> QuotationProducts => Set<QuotationProduct>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<Contract> Contracts => Set<Contract>();
    public DbSet<ContractRenewal> ContractRenewals => Set<ContractRenewal>();
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

        modelBuilder.Entity<Contract>()
            .HasIndex(q => q.Number).IsUnique();

        // default values
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
