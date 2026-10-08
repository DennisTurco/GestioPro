namespace GestioPro.Infrastructure.Extensions;

public static class ServiceExtensions
{
    public static bool HasChanged<TDto, TModel>(this TDto dto, TModel? existing, Func<TModel, TDto> mapToDto)
        where TDto : class
        where TModel : class
        => existing is null || !EqualityComparer<TDto>.Default.Equals(dto, mapToDto(existing));
}
