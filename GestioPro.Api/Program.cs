using GestioPro.Common.Exceptions;
using GestioPro.Common.Interfaces;
using GestioPro.Infrastructure.Data;
using GestioPro.Infrastructure.Services;
using GestioPro.Api.Exceptions;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ─── Entity Framework ────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// ─── Controllers + validazione automatica ────────────────────────────────────
builder.Services.AddControllers();

// ─── Exception handling globale ──────────────────────────────────────────────
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// ─── Dependency Injection: registra qui i tuoi servizi ───────────────────────
// TODO: decommentare man mano che implementi i servizi
// builder.Services.AddScoped<ICustomerService, CustomerService>();
// builder.Services.AddScoped<IProductService, ProductService>();
// builder.Services.AddScoped<IProductCategoryService, ProductCategoryService>();
// builder.Services.AddScoped<IQuotationService, QuotationService>();
// builder.Services.AddScoped<IUserService, UserService>();
// builder.Services.AddScoped<ISettingsService, SettingsService>();

// ─── CORS (come @CrossOrigin in Spring) ──────────────────────────────────────
builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

app.UseExceptionHandler();
app.UseCors();
app.UseHttpsRedirection();
app.MapControllers();

app.Run();
