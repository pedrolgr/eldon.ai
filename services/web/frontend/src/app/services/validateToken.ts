interface UserData {
    isValid: boolean;
    data: any;
}

export async function validateToken(): Promise<UserData> {

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/validate`, {
        method: "GET",
        credentials: "include"
    });

    const data = await response.json();

    return data;

}