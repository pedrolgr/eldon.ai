import { createContext, useState, useEffect } from "react";
import { validateToken } from "../services/validateToken";

interface AuthContextType {
    isLogged: boolean;
    login: () => void;
    logout: () => void;
}

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState(null);
    const discordRedirectURl = import.meta.env.VITE_DISCORD_REDIRECT;

    useEffect(() => {
        validateToken().then((userData) => {
            if (userData.isValid && userData.data) {
                setUser(userData.data.access_token);
            }
        }).catch(console.error);
    }, []);

    function login(): void {
        window.location.replace(discordRedirectURl)
    }

    function logout(): void {
        setUser(null);
    }

    const userInformation: AuthContextType = {
        isLogged: !!user,
        login,
        logout
    }

    return (
        <AuthContext.Provider value={userInformation}>
            {children}
        </AuthContext.Provider>
    )

}