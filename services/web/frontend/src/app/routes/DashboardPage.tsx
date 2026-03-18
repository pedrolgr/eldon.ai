import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";

export function DashboardPage() {
  const { servers } = useAuth();

  if (servers.length === 0) {
    return (
      <>
        <h1>Dashboard</h1>
        <p>Carregando servidores...</p>
      </>
    );
  }

  return (
    <>
      <h1>Dashboard</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "16px",
          marginTop: "16px",
        }}
      >
        {servers.map((server) => (
          <div
            key={server.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "16px",
              textAlign: "center",
              background: "#000000",
              color: "#ffffff",
            }}
          >
            {server.icon_url ? (
              <img
                src={server.icon_url}
                alt={`Ícone do servidor ${server.name}`}
                width={80}
                height={80}
                style={{ borderRadius: "16px", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "16px",
                  background: "#1f2937",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#e5e7eb",
                  fontSize: "12px",
                }}
              >
                Sem foto
              </div>
            )}
            <h3 style={{ marginTop: "12px", marginBottom: "12px" }}>
              {server.name}
            </h3>
            <Link to={`/dashboard/${server.id}`}>
              <button
                type="button"
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #ffffff",
                  background: "#ffffff",
                  color: "#000000",
                  cursor: "pointer",
                }}
              >
                Abrir servidor
              </button>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
