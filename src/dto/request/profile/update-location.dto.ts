import { z } from "zod";

export const updateLocationSchema = z.object({
    latitude: z.number().min(-90, { message: 'Latitude must be greator than or equal to -90' }).max(90, { message: 'Latitude must be less than or equal to 90' }),
    longitude: z.number().min(-180, { message: 'Longitude must be greator than or equal to -180' }).max(180, { message: 'Longitude must be less than or equal to 180' })
});

export type UpdateLocationDto = z.infer<typeof updateLocationSchema>;
