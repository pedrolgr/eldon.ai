import { createContext, useState, useEffect } from "react";

interface Servers {
    id: string;
    name: string;
    owner: boolean;
    icon_url: string | null;
    isBotActive: boolean;
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
    const baseURL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const response = await fetch(`${baseURL}/api/discord/servers`, {
                    credentials: 'include'
                });
                const data = await response.json();

                const discordServers = Array.isArray(data) ? data : [];
                const activeServerIds = new Set<string>();

                if (discordServers.length > 0) {
                    const serverIds = discordServers.map((server) => server.id);
                    const serverResponse = await fetch(`${baseURL}/api/server/search`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify(serverIds),
                    });

                    const apiServers = await serverResponse.json();
                    console.log(apiServers)
                    if (Array.isArray(apiServers)) {
                        apiServers.forEach((server) => {
                            const serverId = server.discordServerId ?? server.id;
                            if (serverId) {
                                activeServerIds.add(serverId);
                            }
                        });
                    }
                }

                const serversWithBotStatus = discordServers.map((server) => ({
                    ...server,
                    isBotActive: server.owner && activeServerIds.has(server.id),
                }));

                setServers(serversWithBotStatus);
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
