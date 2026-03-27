import "../HomePage/HomePage.css";
import "./ServerPage.css";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "../../hooks/useAuth";

interface ServerFormState {
  name: string;
  discordServerId: string;
  discordChannelId: string;
  discordChannelName: string;
  botActive: boolean;
}

export function ServerPage() {
  const { serverId } = useParams();
  const { servers } = useAuth();

  const server = useMemo(() => {
    if (!serverId) return null;
    return servers.find((item) => item.id === serverId) ?? null;
  }, [serverId, servers]);

  const [formState, setFormState] = useState<ServerFormState>({
    name: "",
    discordServerId: "",
    discordChannelId: "",
    discordChannelName: "",
    botActive: false,
  });

  useEffect(() => {
    if (!server) return;
    setFormState({
      name: server.name,
      discordServerId: server.id,
      discordChannelId: "",
      discordChannelName: "",
      botActive: server.isBotActive,
    });
  }, [server]);

  const handleInputChange = (field: keyof ServerFormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const toggleBotActive = () => {
    setFormState((prev) => ({
      ...prev,
      botActive: !prev.botActive,
    }));
  };

  const renderState = (title: string, subtitle: string) => (
    <>
      <nav className="guardian-nav guardian-container">
        <div className="nav-brand">Eldon.ai</div>
        <div className="nav-actions">
          <Link to="/dashboard" className="btn btn-secondary dashboard-button">
            <span className="material-symbols-outlined icon-filled">arrow_back</span>
            Voltar ao dashboard
          </Link>
        </div>
      </nav>

      <main className="server-main guardian-container">
        <section className="server-state glass-card">
          <div className="badge">
            <span className="material-symbols-outlined icon-filled" style={{ color: "var(--secondary)" }}>
              settings
            </span>
            <span className="badge-text">Configuração do bot</span>
          </div>
          <h1 className="server-title">{title}</h1>
          <p className="hero-subtitle">{subtitle}</p>
          <Link to="/dashboard" className="btn btn-primary">
            Voltar para o dashboard
          </Link>
        </section>
      </main>
    </>
  );

  if (!serverId) {
    return renderState("Servidor inválido", "O identificador do servidor não foi informado.");
  }

  if (servers.length === 0) {
    return renderState("Carregando servidor...", "Buscando informações do servidor selecionado.");
  }

  if (!server) {
    return renderState("Servidor não encontrado", `Não foi possível localizar o servidor com id ${serverId}.`);
  }

  const statusLabel = formState.botActive ? "Bot ativo" : "Bot inativo";
  const statusClass = formState.botActive ? "active" : "inactive";
  const botAddedAtLabel = formState.botActive ? "Aguardando sincronização" : "Ainda não ativado";
  const updatedAtLabel = "Aguardando sincronização";
  const internalIdLabel = "Aguardando sincronização";

  return (
    <>
      <nav className="guardian-nav guardian-container">
        <div className="nav-brand">Eldon.ai</div>
        <div className="nav-actions">
          <Link to="/dashboard" className="btn btn-secondary dashboard-button">
            <span className="material-symbols-outlined icon-filled">arrow_back</span>
            Voltar ao dashboard
          </Link>
        </div>
      </nav>

      <main className="server-main guardian-container">
        <section className="server-hero editorial-grid">
          <div className="server-hero-text">
            <div className="badge">
              <span className="material-symbols-outlined icon-filled" style={{ color: "var(--secondary)" }}>
                tune
              </span>
              <span className="badge-text">Configuração do servidor</span>
            </div>

            <h1 className="server-title">
              Ajuste o <span className="text-tertiary">Eldon</span> para o seu servidor
            </h1>

            <p className="hero-subtitle">
              Defina o canal monitorado, acompanhe o status do bot e visualize as mensagens sinalizadas.
            </p>
          </div>

          <div className="server-hero-card glass-card">
            <div className="server-page-card-header">
              {server.icon_url ? (
                <img
                  className="server-page-avatar"
                  src={server.icon_url}
                  alt={`Ícone do servidor ${server.name}`}
                />
              ) : (
                <div className="server-page-avatar-fallback">{server.name.slice(0, 2).toUpperCase()}</div>
              )}
              <div className="server-page-card-meta">
                <span className="server-page-card-title">{server.name}</span>
                <span className="server-page-card-subtitle">ID Discord: {formState.discordServerId}</span>
              </div>
            </div>

            <span className={`server-page-status-pill ${statusClass}`}>
              <span className="material-symbols-outlined icon-filled">
                {formState.botActive ? "verified" : "hourglass_top"}
              </span>
              {statusLabel}
            </span>

            <div className="server-info-grid">
              <div className="server-info-item">
                <span className="server-info-label">Bot adicionado em</span>
                <span className="server-info-value">{botAddedAtLabel}</span>
              </div>
              <div className="server-info-item">
                <span className="server-info-label">Atualizado em</span>
                <span className="server-info-value">{updatedAtLabel}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="server-config-grid">
          <div className="server-config-card">
            <h2 className="config-title">Dados do servidor</h2>
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label" htmlFor="server-internal-id">ID interno</label>
                <input
                  id="server-internal-id"
                  className="form-input"
                  value={internalIdLabel}
                  disabled
                />
                <span className="form-helper">Gerado pelo backend após sincronização.</span>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="server-name">Nome do servidor</label>
                <input
                  id="server-name"
                  className="form-input"
                  value={formState.name}
                  onChange={handleInputChange("name")}
                  disabled
                />
                <span className="form-helper">Sincronizado com o Discord.</span>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="server-discord-id">Discord Server ID</label>
                <input
                  id="server-discord-id"
                  className="form-input"
                  value={formState.discordServerId}
                  onChange={handleInputChange("discordServerId")}
                  disabled
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="server-channel-name">Nome do canal monitorado</label>
                <input
                  id="server-channel-name"
                  className="form-input"
                  placeholder="Ex: #geral"
                  value={formState.discordChannelName}
                  onChange={handleInputChange("discordChannelName")}
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="server-channel-id">Discord Channel ID</label>
                <input
                  id="server-channel-id"
                  className="form-input"
                  placeholder="Ex: 123456789012345678"
                  value={formState.discordChannelId}
                  onChange={handleInputChange("discordChannelId")}
                />
                <span className="form-helper">Use o ID do canal que será monitorado pelo bot.</span>
              </div>
            </div>
          </div>

          <div className="server-config-card">
            <h2 className="config-title">Status e acionamento do bot</h2>
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">Bot ativo</label>
                <label className="toggle">
                  <input type="checkbox" checked={formState.botActive} onChange={toggleBotActive} />
                  <span className="toggle-track"></span>
                  <span className="toggle-text">
                    {formState.botActive ? "Monitoramento ativo" : "Monitoramento pausado"}
                  </span>
                </label>
                <span className="form-helper">Ative para que o Eldon monitore as mensagens de voz.</span>
              </div>

              <div className="form-field">
                <label className="form-label">Bot adicionado em</label>
                <input className="form-input" value={botAddedAtLabel} disabled />
              </div>

              <div className="form-field">
                <label className="form-label">Última atualização</label>
                <input className="form-input" value={updatedAtLabel} disabled />
              </div>
            </div>

            <div className="config-actions">
              <button className="btn btn-primary" type="button">
                Salvar configurações
              </button>
              <button className="btn btn-secondary" type="button">
                Testar conexão
              </button>
              <span className="config-note">Ação visual apenas. Integração com backend será feita depois.</span>
            </div>
          </div>
        </section>

        <section className="flagged-card">
          <div>
            <h2 className="config-title">Mensagens sinalizadas</h2>
            <p className="hero-subtitle">
              Consulte registros de mensagens sinalizadas pelo Eldon. Ainda não há dados sincronizados.
            </p>
          </div>

          <div className="flagged-table">
            <div className="flagged-row header">
              <span>Usuário</span>
              <span>ID Discord</span>
              <span>Canal</span>
              <span>Texto</span>
              <span>Motivo</span>
              <span>Revisado</span>
              <span>Revisado em</span>
              <span>Criado em</span>
            </div>
            <div className="flagged-empty">Nenhuma mensagem sinalizada disponível.</div>
          </div>
        </section>
      </main>
    </>
  );
}
