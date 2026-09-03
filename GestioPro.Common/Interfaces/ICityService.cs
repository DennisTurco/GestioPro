using GestioPro.Common.DTOs;

namespace GestioPro.Common.Interfaces;

public interface ICityService
{
    CityLookupDTO? GetByName(string city);
}
