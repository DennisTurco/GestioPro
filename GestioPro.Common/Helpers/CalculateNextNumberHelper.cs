namespace GestioPro.Common.Helpers;

public static class CalculateNextNumberHelper
{
    public static string GetNext(this string current)
    {
        var counter = int.Parse(current.PadLeft(3, '0')) + 1;
        string zeroes = "000".Substring(counter.ToString().Length);
        return zeroes + counter;
    }
}

