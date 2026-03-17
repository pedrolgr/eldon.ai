import { createContext, useState, useEffect } from "react";

interface Servers {
    id: string;
    name: string;
    owner: boolean;
    icon_url: string | null;
}

interface AuthContextType {
    isLogged: boolean;
    servers: Servers[];
    login: () => void;
    logout: () => void;
}

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState(null);
    const [servers, setServers] = useState<Servers[]>([]);
    const discordRedirectURl = import.meta.env.VITE_DISCORD_REDIRECT;

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/discord/servers', {
                    credentials: 'include'
                });
                const data = await response.json();
                setServers(data);
            } catch (error) {
                console.error("Failed to fetch servers:", error);
            }
        }

        fetchAll();

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
        logout,
        servers,
    }

    return (
        <AuthContext.Provider value={userInformation}>
            {children}
        </AuthContext.Provider>
    )

}