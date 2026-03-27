import { useMemo } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "../../hooks/useAuth";

export function ServerPage() {
  const { serverId } = useParams();
  const { servers } = useAuth();

  const server = useMemo(() => {
    if (!serverId) return null;
    return servers.find((item) => item.id === serverId) ?? null;
  }, [serverId, servers]);

  if (!serverId) {
    return (
      <>
        <h1>Servidor inválido</h1>
        <p>O identificador do servidor não foi informado.</p>
        <Link to="/dashboard">Voltar ao dashboard</Link>
      </>
    );
  }

  if (servers.length === 0) {
    return (
      <>
        <h1>Carregando servidor...</h1>
        <p>Buscando informações do servidor selecionado.</p>
      </>
    );
  }

  if (!server) {
    return (
      <>
        <h1>Servidor não encontrado</h1>
        <p>Não foi possível localizar o servidor com id {serverId}.</p>
        <Link to="/dashboard">Voltar ao dashboard</Link>
      </>
    );
  }

  return (
    <>
      <h1>{server.name}</h1>
      <p>ID: {server.id}</p>
      <p>Dono: {server.owner ? "Sim" : "Não"}</p>
      {server.icon_url ? (
        <img
          src={server.icon_url}
          alt={`Ícone do servidor ${server.name}`}
          width={96}
          height={96}
        />
      ) : (
        <p>Servidor sem ícone.</p>
      )}
    </>
  );
}
