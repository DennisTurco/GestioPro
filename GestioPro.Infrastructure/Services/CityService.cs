using GestioPro.Common.DTOs;
using GestioPro.Common.Interfaces;
using ItalianFiscalKit;
using ItalianFiscalKit.Entities;

namespace GestioPro.Infrastructure.Services;

public class CityService : ICityService
{
    public CityLookupDTO? GetByName(string city)
    {
        Municipality? municipality = city.GetMunicipalityByName();

        if (municipality == null) return null;

        return new CityLookupDTO(
            City: city,
            Province: municipality.Province.Name,
            Region: municipality.Province.Region,
            Lat: municipality.Coordinates.Lat,
            Lon: municipality.Coordinates.Lng
        );
    }
}
