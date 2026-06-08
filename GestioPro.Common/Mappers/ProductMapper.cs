using GestioPro.Common.DTOs;
using GestioPro.Common.Models;

namespace GestioPro.Common.Mappers;

public static class ProductMapper
{
    // TODO: mappa Product -> ProductResponseDTO (includi CategoryName e StatusName)
    public static ProductResponseDTO ToResponseDto(Product p)
    {
        throw new NotImplementedException();
    }

    // TODO: mappa ProductRequestDTO -> Product (senza Id)
    public static Product ToEntity(ProductRequestDTO dto, ProductCategory category, ProductStatus status)
    {
        throw new NotImplementedException();
    }
}
