
export class GeoUtils {

    public static calculateMidpoint(lat1: number, lon1: number, lat2: number, lon2: number): { lat: number, lon: number } {
        return {
            lat: (lat1 + lat2) / 2,
            lon: (lon1 + lon2) / 2
        };
    }

}
