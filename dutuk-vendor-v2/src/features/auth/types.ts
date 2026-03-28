export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
}

export interface OnboardingData {
    companyName: string;
    categories: string[];
    location: {
        address: string;
        city: string;
        state: string;
        country: string;
        latitude: number;
        longitude: number;
    };
}
