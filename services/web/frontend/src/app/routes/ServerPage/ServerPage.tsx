import "../HomePage/HomePage.css";
import "./ServerPage.css";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "../../hooks/useAuth";

interface ServerChannel {
  id: string;
  name: string;
  type: number;
  position?: number | null;
  parentId?: string | null;
}

interface ServerFormState {
  name: string;
  discordServerId: string;
  discordChannelId: string;
  discordChannelName: string;
  botActive: boolean;
}

interface PersistedServerSettings {
  id: string;
  name: string;
  discordServerId: string;
  discordChannelId: string | null;
  discordChannelName: string | null;
  botActive: boolean;
  botAddedAt: string | null;
  updatedAt: string;
}

interface FlaggedMessage {
  id: string;
  discordUserId: string;
  discordUsername: string;
  discordChannelId: string;
  originalText: string;
  reason: string | null;
  reviewed: boolean;
  reviewedAt: string | null;
  createdAt: string;
}

type SaveStatus = "idle" | "saving" | "success" | "error";

function formatDateTime(value: string | null) {
  if (!value) return "Ainda não disponível";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function extractProfanityWords(text: string): string[] {
  const dictionary = [
    "arrombado",
    "buceta",
    "caralho",
    "cu",
    "desgraca",
    "foda",
    "foder",
    "idiota",
    "merda",
    "otario",
    "pau",
    "piranha",
    "porra",
    "puta",
    "vagabunda",
    "viado",
  ];

  const normalizedText = normalizeText(text);
  const found = dictionary.filter((word) => normalizedText.includes(word));
  return Array.from(new Set(found));
}

export function ServerPage() {
  const { serverId } = useParams();
  const { servers } = useAuth();
  const baseURL = import.meta.env.VITE_API_URL;

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

  const [channels, setChannels] = useState<ServerChannel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [channelsError, setChannelsError] = useState<string | null>(null);
  const [savedSettings, setSavedSettings] = useState<PersistedServerSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [flaggedMessages, setFlaggedMessages] = useState<FlaggedMessage[]>([]);
  const [flaggedLoading, setFlaggedLoading] = useState(false);
  const [flaggedError, setFlaggedError] = useState<string | null>(null);
  const [flaggedRefreshToken, setFlaggedRefreshToken] = useState(0);

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

  useEffect(() => {
    if (!serverId || !baseURL || !server) return;
    let isActive = true;

    const fetchServerSettings = async () => {
      setSettingsLoading(true);
      setSettingsError(null);

      try {
        const response = await fetch(`${baseURL}/api/server/${serverId}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch server settings");
        }

        const data = (await response.json()) as PersistedServerSettings | null;
        if (!isActive) return;

        setSavedSettings(data);
        setFormState({
          name: data?.name ?? server.name,
          discordServerId: data?.discordServerId ?? server.id,
          discordChannelId: data?.discordChannelId ?? "",
          discordChannelName: data?.discordChannelName ?? "",
          botActive: data?.botActive ?? server.isBotActive,
        });
      } catch (error) {
        if (!isActive) return;

        console.error("Failed to fetch server settings:", error);
        setSavedSettings(null);
        setSettingsError("Não foi possível carregar as configurações salvas do servidor.");
      } finally {
        if (isActive) {
          setSettingsLoading(false);
        }
      }
    };

    fetchServerSettings();

    return () => {
      isActive = false;
    };
  }, [baseURL, server, serverId]);

  useEffect(() => {
    if (!serverId || !baseURL) return;
    let isActive = true;

    const fetchChannels = async () => {
      setChannelsLoading(true);
      setChannelsError(null);
      try {
        const response = await fetch(`${baseURL}/api/server/${serverId}/channels`, {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch channels");
        }
        const data = await response.json();
        if (!isActive) return;
        setChannels(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!isActive) return;
        console.error("Failed to fetch channels:", error);
        setChannels([]);
        setChannelsError("Não foi possível carregar os canais do servidor.");
      } finally {
        if (isActive) {
          setChannelsLoading(false);
        }
      }
    };

    fetchChannels();

    return () => {
      isActive = false;
    };
  }, [baseURL, serverId]);

  useEffect(() => {
    if (!serverId || !baseURL) return;
    let isActive = true;

    const fetchFlaggedMessages = async () => {
      setFlaggedLoading(true);
      setFlaggedError(null);

      try {
        const response = await fetch(`${baseURL}/api/server/${serverId}/flagged-messages`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch flagged messages");
        }

        const data = await response.json();

        if (!isActive) {
          return;
        }

        setFlaggedMessages(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.error("Failed to fetch flagged messages:", error);
        setFlaggedMessages([]);
        setFlaggedError("Não foi possível carregar as mensagens sinalizadas.");
      } finally {
        if (isActive) {
          setFlaggedLoading(false);
        }
      }
    };

    fetchFlaggedMessages();

    return () => {
      isActive = false;
    };
  }, [baseURL, flaggedRefreshToken, serverId]);

  const handleChannelSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const channelId = event.target.value;
    const selected = channels.find((channel) => channel.id === channelId);
    setSaveStatus("idle");
    setSaveMessage(null);
    setFormState((prev) => ({
      ...prev,
      discordChannelId: channelId,
      discordChannelName: selected?.name ?? "",
    }));
  };

  const handleSaveSettings = async () => {
    if (!serverId || !baseURL) {
      setSaveStatus("error");
      setSaveMessage("A API do projeto não está configurada.");
      return;
    }

    setSaveStatus("saving");
    setSaveMessage(null);

    try {
      const response = await fetch(`${baseURL}/api/server/${serverId}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: formState.name,
          discordChannelId: formState.discordChannelId || null,
          discordChannelName: formState.discordChannelName || null,
        }),
      });

      const data = (await response.json().catch(() => null)) as PersistedServerSettings | { message?: string } | null;

      if (!response.ok) {
        const message = data && typeof data === "object" && "message" in data && typeof data.message === "string"
          ? data.message
          : "Não foi possível salvar as configurações do servidor.";

        throw new Error(message);
      }

      const nextSettings = data as PersistedServerSettings;

      setSavedSettings(nextSettings);
      setSettingsError(null);
      setFormState((prev) => ({
        ...prev,
        name: nextSettings.name ?? prev.name,
        discordServerId: nextSettings.discordServerId ?? prev.discordServerId,
        discordChannelId: nextSettings.discordChannelId ?? "",
        discordChannelName: nextSettings.discordChannelName ?? "",
        botActive: nextSettings.botActive,
      }));
      setSaveStatus("success");
      setSaveMessage(
        nextSettings.discordChannelId
          ? "Canal monitorado salvo com sucesso."
          : "Configuração do canal removida com sucesso.",
      );
    } catch (error) {
      console.error("Failed to save server settings:", error);
      setSaveStatus("error");
      setSaveMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar as configurações do servidor.",
      );
    }
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
  const botAddedAtLabel = savedSettings?.botAddedAt
    ? formatDateTime(savedSettings.botAddedAt)
    : formState.botActive
      ? "Aguardando sincronização"
      : "Ainda não ativado";
  const updatedAtLabel = savedSettings?.updatedAt
    ? formatDateTime(savedSettings.updatedAt)
    : "Nenhuma alteração salva";
  const internalIdLabel = savedSettings?.id ?? "Será criado ao salvar";
  const isSaving = saveStatus === "saving";
  const feedbackIsError = saveStatus === "error" || (!!settingsError && !saveMessage);
  const saveFeedbackClass = feedbackIsError
    ? "config-feedback is-error"
    : saveStatus === "success"
      ? "config-feedback is-success"
      : "config-feedback";
  const channelPlaceholder = channelsLoading
    ? "Carregando canais..."
    : channels.length === 0
      ? "Nenhum canal de voz disponível"
      : "Selecione um canal de voz";
  const channelHelperText = channelsLoading
    ? "Buscando canais de voz sincronizados pelo bot."
    : channelsError
      ? channelsError
      : channels.length === 0
        ? "Nenhum canal de voz foi encontrado para este servidor."
        : "Escolha o canal em que o Eldon deve entrar e monitorar.";

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
                  disabled
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="server-channel-name">Nome do canal monitorado</label>
                <div className={`select-shell ${channelsLoading ? "is-loading" : ""}`}>
                  <span className="material-symbols-outlined select-icon" aria-hidden="true">headset_mic</span>
                  <select
                    id="server-channel-name"
                    className="form-input select-input"
                    value={formState.discordChannelId}
                    onChange={handleChannelSelect}
                    disabled={channelsLoading || settingsLoading || channels.length === 0}
                  >
                    <option value="">{channelPlaceholder}</option>
                    {channels.map((channel) => (
                      <option key={channel.id} value={channel.id}>
                        {channel.name.startsWith("#") ? channel.name : `#${channel.name}`}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined select-chevron" aria-hidden="true">expand_more</span>
                </div>
                <span className="form-helper">{channelHelperText}</span>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="server-channel-id">Discord Channel ID</label>
                <input
                  id="server-channel-id"
                  className="form-input"
                  placeholder="Selecione um canal acima"
                  value={formState.discordChannelId}
                  disabled
                />
                <span className="form-helper">Use o ID do canal que será monitorado pelo bot.</span>
              </div>
            </div>
          </div>

          <div className="server-config-card">
            <h2 className="config-title">Status e acionamento do bot</h2>
            <div className="form-grid">
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
              <button
                className="btn btn-primary config-action-btn"
                type="button"
                onClick={handleSaveSettings}
                disabled={isSaving || settingsLoading || channelsLoading}
              >
                {isSaving ? "Salvando..." : "Salvar configurações"}
              </button>
            </div>
            {(saveMessage || settingsError) ? (
              <span className={saveFeedbackClass}>{saveMessage ?? settingsError}</span>
            ) : null}
            <span className="config-note">
              Depois de salvar, use o comando <code>!start</code> no servidor para o bot entrar no canal de voz
              configurado.
            </span>
          </div>
        </section>

        <section className="flagged-card">
          <div className="flagged-header">
            <div>
              <h2 className="config-title">Mensagens sinalizadas</h2>
              <p className="hero-subtitle">
                Consulte o que foi dito e classificado como inadequado
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary flagged-reload-btn"
              onClick={() => setFlaggedRefreshToken((previous) => previous + 1)}
              disabled={flaggedLoading || !baseURL || !serverId}
            >
              <span className="material-symbols-outlined icon-filled">refresh</span>
              {flaggedLoading ? "Atualizando..." : "Atualizar listagem"}
            </button>
          </div>

          {flaggedLoading ? (
            <div className="flagged-empty">Carregando mensagens sinalizadas...</div>
          ) : flaggedError ? (
            <div className="flagged-empty flagged-empty-error">{flaggedError}</div>
          ) : flaggedMessages.length === 0 ? (
            <div className="flagged-empty">Nenhuma mensagem sinalizada disponível.</div>
          ) : (
            <div className="flagged-table">
              <div className="flagged-row header">
                <span>Usuário</span>
                <span>Canal</span>
                <span>Palavrão / motivo</span>
                <span>Transcrição</span>
                <span>Áudio</span>
                <span>Criado em</span>
              </div>

              {flaggedMessages.map((message) => {
                const profanityWords = extractProfanityWords(message.originalText);
                const profanitySummary = profanityWords.length > 0
                  ? profanityWords.join(", ")
                  : "Não identificado";
                const audioSource = `${baseURL}/api/server/${serverId}/flagged-messages/${message.id}/audio`;

                return (
                  <div key={message.id} className="flagged-row">
                    <div className="flagged-user-cell">
                      <span className="flagged-user-name">{message.discordUsername}</span>
                      <span className="flagged-user-id">{message.discordUserId}</span>
                    </div>
                    <span className="flagged-channel-id">{message.discordChannelId}</span>
                    <div className="flagged-reason-cell">
                      <strong className="flagged-reason-word">{profanitySummary}</strong>
                      <span className="flagged-reason-text">{message.reason ?? "Motivo não informado."}</span>
                    </div>
                    <p className="flagged-original-text">{message.originalText || "Transcrição vazia."}</p>
                    <audio className="flagged-audio" controls preload="none" src={audioSource}>
                      Seu navegador não suporta reprodução de áudio.
                    </audio>
                    <span>{formatDateTime(message.createdAt)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
