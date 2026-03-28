import { z } from 'zod';

const envSchema = z.object({
    EXPO_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
    EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
});

function getEnv() {
    const parsed = envSchema.safeParse({
        EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
        EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    });

    if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors;
        throw new Error(
            `Missing or invalid environment variables:\n${JSON.stringify(errors, null, 2)}`
        );
    }

    return parsed.data;
}

export const env = getEnv();
