import "../HomePage/HomePage.css";
import "./DashboardPage.css";
import { Link } from "react-router";
import { useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";

export function DashboardPage() {
  const { servers } = useAuth();
  const isLoading = servers.length === 0;

  const stats = useMemo(() => {
    const total = servers.length;
    const owned = servers.filter((server) => server.owner).length;
    const active = servers.filter((server) => server.isBotActive).length;
    return {
      total,
      owned,
      active,
      inactive: Math.max(owned - active, 0),
      pending: Math.max(total - active, 0),
    };
  }, [servers]);

  const getInitials = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return "?";
    const parts = trimmed.split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]).join("").toUpperCase();
  };

  return (
    <>
      <nav className="guardian-nav guardian-container">
        <div className="nav-brand">Eldon.ai</div>
        <div className="nav-actions">
          <Link to="/" className="btn btn-secondary dashboard-button">
            <span className="material-symbols-outlined icon-filled">arrow_back</span>
            Voltar ao início
          </Link>
        </div>
      </nav>

      <main className="dashboard-main guardian-container">
        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <div>
              <h2 className="section-title">Servidores conectados</h2>
              <p className="hero-subtitle">
                Abra o painel de um servidor ou convide o bot para começar a proteger a comunidade.
              </p>
            </div>
            <div className="dashboard-filters">
              <span className="filter-chip">{stats.total} total</span>
              <span className="filter-chip filter-chip-active">{stats.active} ativos</span>
              <span className="filter-chip filter-chip-pending">{stats.pending} pendentes</span>
            </div>
          </div>

          {isLoading ? (
            <div className="dashboard-state glass-card">
              <div className="state-icon">
                <span className="material-symbols-outlined icon-filled">sync</span>
              </div>
              <h3 className="state-title">Carregando servidores...</h3>
              <p className="state-subtitle">Sincronizando com o Discord para trazer suas comunidades.</p>
            </div>
          ) : (
            <div className="servers-grid">
              {servers.map((server) => {
                const statusLabel = server.isBotActive ? "Bot ativo" : "Bot inativo";
                const statusIcon = server.isBotActive ? "verified" : "hourglass_top";
                const statusClass = server.isBotActive ? "status-pill-active" : "status-pill-pending";
                const cardClass = server.isBotActive ? "server-card-active" : "server-card-pending";

                return (
                  <div key={server.id} className={`server-card ${cardClass}`}>
                    <div className="server-card-header">
                      {server.icon_url ? (
                        <img
                          src={server.icon_url}
                          alt={`Ícone do servidor ${server.name}`}
                          width={64}
                          height={64}
                          className="server-avatar"
                        />
                      ) : (
                        <div className="server-avatar-fallback">
                          {getInitials(server.name)}
                        </div>
                      )}

                      <div className="server-meta">
                        <span className="server-name">{server.name}</span>
                        <span className="server-owner">
                          {server.owner ? "Você é dono" : "Você é membro"}
                        </span>
                      </div>

                      <span className={`status-pill server-status ${statusClass}`}>
                        <span className="material-symbols-outlined icon-filled">{statusIcon}</span>
                        {statusLabel}
                      </span>
                    </div>

                    <p className="server-desc">
                      {server.isBotActive
                        ? "Eldon já monitora este servidor em tempo real."
                        : "Ative o bot para começar a proteger as conversas de voz."}
                    </p>

                    <div className="server-actions">
                      {server.isBotActive ? (
                        <Link to={`/dashboard/${server.id}`} className="btn btn-dashboard btn-dashboard-primary">
                          <span className="btn-label">Abrir servidor</span>
                        </Link>
                      ) : (
                        <a
                          href={import.meta.env.VITE_DISCORD_BOT_INSTALL}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-dashboard btn-dashboard-ghost"
                        >
                          <span className="btn-label">Adicionar bot</span>
                        </a>
                      )}
                      <Link to={`/dashboard/${server.id}`} className="btn btn-dashboard btn-dashboard-outline">
                        <span className="btn-label">Ver detalhes</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="dashboard-hero editorial-grid">
          <div className="dashboard-hero-text">
            <div className="badge">
              <span className="material-symbols-outlined icon-filled" style={{ color: "var(--secondary)" }}>
                space_dashboard
              </span>
              <span className="badge-text">Painel do Guardian</span>
            </div>

            <h1 className="dashboard-title">
              Seus servidores com o <span className="text-tertiary">Eldon</span> no controle
            </h1>

            <p className="hero-subtitle">
              Centralize o monitoramento, descubra onde o bot já está ativo e finalize as configurações em segundos.
            </p>

            <div className="dashboard-hero-actions">
              <a
                className="btn btn-primary dashboard-primary-cta"
                href={import.meta.env.VITE_DISCORD_BOT_INSTALL}
                target="_blank"
                rel="noreferrer"
              >
                <span className="material-symbols-outlined icon-filled">add_circle</span>
                Convidar Eldon
              </a>
              <Link to="/" className="btn btn-secondary dashboard-secondary-cta">
                Ver página inicial
              </Link>
            </div>
          </div>

          <div className="dashboard-hero-panel">
            <div className="summary-grid">
              <div className="summary-card glass-card">
                <span className="summary-label">Servidores conectados</span>
                <span className="summary-value">{stats.total}</span>
                <span className="summary-meta">Total visível no Discord</span>
              </div>
              <div className="summary-card glass-card">
                <span className="summary-label">Bot ativo</span>
                <span className="summary-value summary-value-secondary">{stats.active}</span>
                <span className="summary-meta">Protegidos agora</span>
              </div>
              <div className="summary-card glass-card">
                <span className="summary-label">Pendentes</span>
                <span className="summary-value summary-value-tertiary">{stats.pending}</span>
                <span className="summary-meta">Prontos para ativação</span>
              </div>
              <div className="summary-card glass-card">
                <span className="summary-label">Você é dono</span>
                <span className="summary-value summary-value-primary">{stats.owned}</span>
                <span className="summary-meta">Gerenciáveis por você</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
