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
    }
}
