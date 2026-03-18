import DiscordButtonAuth from "../components/DiscordButtonAuth/DiscordButtonAuth"
import { useAuth } from "../hooks/useAuth";

export const HomePage: React.FC = () => {

    return (
        <>
            <h1>HomePage</h1>
            <DiscordButtonAuth />
        </>
    )
}