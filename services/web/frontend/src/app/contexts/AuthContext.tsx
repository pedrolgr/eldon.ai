import { createContext, useState, useContext } from "react";

interface AuthContextType {
    token: string | null;
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
    const [token, setToken] = useState(null);
    const discordRedirectURl = import.meta.env.VITE_DISCORD_REDIRECT;

    function login(): void {
        window.location.replace(discordRedirectURl)
    }

    function logout(): void {
        setUser(null);
        setToken(null);
    }

    const userInformation: AuthContextType = {
        token,
        isLogged: !!token,
        login,
        logout
    }

    return (
        <AuthContext.Provider value={userInformation}>
            {children}
        </AuthContext.Provider>
    )

}