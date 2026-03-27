import "../HomePage/HomePage.css";
import "./DashboardPage.css";
import { Link } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";

type DashboardLocale = "pt-BR" | "en";

const copyByLocale: Record<DashboardLocale, {
  nav: { backHome: string };
  section: { title: string; subtitle: string };
  filters: { total: (value: number) => string; active: (value: number) => string; pending: (value: number) => string };
  states: { loadingTitle: string; loadingSubtitle: string };
  card: {
    owner: string;
    member: string;
    statusActive: string;
    statusInactive: string;
    descActive: string;
    descInactive: string;
    actionOpen: string;
    actionAdd: string;
    actionDetails: string;
  };
  hero: {
    badge: string;
    titleBefore: string;
    titleHighlight: string;
    titleAfter: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  summary: {
    totalLabel: string;
    totalMeta: string;
    activeLabel: string;
    activeMeta: string;
    pendingLabel: string;
    pendingMeta: string;
    ownedLabel: string;
    ownedMeta: string;
  };
}> = {
  "pt-BR": {
    nav: { backHome: "Voltar ao início" },
    section: {
      title: "Servidores conectados",
      subtitle: "Abra o painel de um servidor ou convide o bot para começar a proteger a comunidade.",
    },
    filters: {
      total: (value) => `${value} total`,
      active: (value) => `${value} ativos`,
      pending: (value) => `${value} pendentes`,
    },
    states: {
      loadingTitle: "Carregando servidores...",
      loadingSubtitle: "Sincronizando com o Discord para trazer suas comunidades.",
    },
    card: {
      owner: "Você é dono",
      member: "Você é membro",
      statusActive: "Bot ativo",
      statusInactive: "Bot inativo",
      descActive: "Eldon já monitora este servidor em tempo real.",
      descInactive: "Ative o bot para começar a proteger as conversas de voz.",
      actionOpen: "Abrir servidor",
      actionAdd: "Adicionar bot",
      actionDetails: "Ver detalhes",
    },
    hero: {
      badge: "Painel do Guardian",
      titleBefore: "Seus servidores com o",
      titleHighlight: "Eldon",
      titleAfter: "no controle",
      subtitle: "Centralize o monitoramento, descubra onde o bot já está ativo e finalize as configurações em segundos.",
      primaryCta: "Convidar Eldon",
      secondaryCta: "Ver página inicial",
    },
    summary: {
      totalLabel: "Servidores conectados",
      totalMeta: "Total visível no Discord",
      activeLabel: "Bot ativo",
      activeMeta: "Protegidos agora",
      pendingLabel: "Pendentes",
      pendingMeta: "Prontos para ativação",
      ownedLabel: "Você é dono",
      ownedMeta: "Gerenciáveis por você",
    },
  },
  en: {
    nav: { backHome: "Back to home" },
    section: {
      title: "Connected servers",
      subtitle: "Open a server panel or invite the bot to start protecting the community.",
    },
    filters: {
      total: (value) => `${value} total`,
      active: (value) => `${value} active`,
      pending: (value) => `${value} pending`,
    },
    states: {
      loadingTitle: "Loading servers...",
      loadingSubtitle: "Syncing with Discord to bring your communities.",
    },
    card: {
      owner: "You're the owner",
      member: "You're a member",
      statusActive: "Bot active",
      statusInactive: "Bot inactive",
      descActive: "Eldon is already monitoring this server in real time.",
      descInactive: "Enable the bot to start protecting voice conversations.",
      actionOpen: "Open server",
      actionAdd: "Add bot",
      actionDetails: "View details",
    },
    hero: {
      badge: "Guardian Panel",
      titleBefore: "Your servers with",
      titleHighlight: "Eldon",
      titleAfter: "in control",
      subtitle: "Centralize monitoring, see where the bot is active, and finalize settings in seconds.",
      primaryCta: "Invite Eldon",
      secondaryCta: "View homepage",
    },
    summary: {
      totalLabel: "Connected servers",
      totalMeta: "Total visible in Discord",
      activeLabel: "Bot active",
      activeMeta: "Protected now",
      pendingLabel: "Pending",
      pendingMeta: "Ready for activation",
      ownedLabel: "You own",
      ownedMeta: "Managed by you",
    },
  },
};

export function DashboardPage() {
  const { servers } = useAuth();
  const isLoading = servers.length === 0;
  const [locale, setLocale] = useState<DashboardLocale>(() => {
    if (typeof window === "undefined") return "pt-BR";
    const stored = window.localStorage.getItem("dashboard-locale");
    if (stored === "pt-BR" || stored === "en") return stored;
    return navigator.language.toLowerCase().startsWith("pt") ? "pt-BR" : "en";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("dashboard-locale", locale);
  }, [locale]);

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

  const copy = copyByLocale[locale];

  const handleLocaleSelect = (nextLocale: DashboardLocale) => (event: React.MouseEvent<HTMLButtonElement>) => {
    setLocale(nextLocale);
    const details = event.currentTarget.closest("details");
    if (details) {
      details.removeAttribute("open");
    }
  };

  return (
    <>
      <nav className="guardian-nav guardian-container">
        <div className="nav-brand">Eldon.ai</div>
        <div className="nav-actions">
          <details className="locale-dropdown">
            <summary className="locale-trigger" aria-label="Selecionar idioma">
              <span className="locale-trigger-flag" aria-hidden="true">
                {locale === "pt-BR" ? "🇧🇷" : "🇺🇸"}
              </span>
              <span className="locale-trigger-text">{locale === "pt-BR" ? "Português (BR)" : "English"}</span>
              <span className="material-symbols-outlined locale-chevron">expand_more</span>
            </summary>
            <ul className="locale-list" role="listbox">
              <li>
                <button
                  type="button"
                  className={`locale-item ${locale === "pt-BR" ? "locale-item-active" : ""}`}
                  onClick={handleLocaleSelect("pt-BR")}
                  aria-selected={locale === "pt-BR"}
                  role="option"
                >
                  <span className="locale-item-flag" aria-hidden="true">🇧🇷</span>
                  <span className="locale-item-text">Português (BR)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`locale-item ${locale === "en" ? "locale-item-active" : ""}`}
                  onClick={handleLocaleSelect("en")}
                  aria-selected={locale === "en"}
                  role="option"
                >
                  <span className="locale-item-flag" aria-hidden="true">🇺🇸</span>
                  <span className="locale-item-text">English</span>
                </button>
              </li>
            </ul>
          </details>
          <Link to="/" className="btn btn-secondary dashboard-button">
            <span className="material-symbols-outlined icon-filled">arrow_back</span>
            {copy.nav.backHome}
          </Link>
        </div>
      </nav>

      <main className="dashboard-main guardian-container">
        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <div>
              <h2 className="section-title">{copy.section.title}</h2>
              <p className="hero-subtitle">
                {copy.section.subtitle}
              </p>
            </div>
            <div className="dashboard-filters">
              <span className="filter-chip">{copy.filters.total(stats.total)}</span>
              <span className="filter-chip filter-chip-active">{copy.filters.active(stats.active)}</span>
              <span className="filter-chip filter-chip-pending">{copy.filters.pending(stats.pending)}</span>
            </div>
          </div>

          {isLoading ? (
            <div className="dashboard-state glass-card">
              <div className="state-icon">
                <span className="material-symbols-outlined icon-filled">sync</span>
              </div>
              <h3 className="state-title">{copy.states.loadingTitle}</h3>
              <p className="state-subtitle">{copy.states.loadingSubtitle}</p>
            </div>
          ) : (
            <div className="servers-grid">
              {servers.map((server) => {
                const statusLabel = server.isBotActive ? copy.card.statusActive : copy.card.statusInactive;
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
                          {server.owner ? copy.card.owner : copy.card.member}
                        </span>
                      </div>

                      <span className={`status-pill server-status ${statusClass}`}>
                        <span className="material-symbols-outlined icon-filled">{statusIcon}</span>
                        {statusLabel}
                      </span>
                    </div>

                    <p className="server-desc">
                      {server.isBotActive ? copy.card.descActive : copy.card.descInactive}
                    </p>

                    <div className="server-actions">
                      {server.isBotActive ? (
                        <Link to={`/dashboard/${server.id}`} className="btn btn-dashboard btn-dashboard-primary">
                          <span className="btn-label">{copy.card.actionOpen}</span>
                        </Link>
                      ) : (
                        <a
                          href={import.meta.env.VITE_DISCORD_BOT_INSTALL}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-dashboard btn-dashboard-ghost"
                        >
                          <span className="btn-label">{copy.card.actionAdd}</span>
                        </a>
                      )}
                      <Link to={`/dashboard/${server.id}`} className="btn btn-dashboard btn-dashboard-outline">
                        <span className="btn-label">{copy.card.actionDetails}</span>
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
              <span className="badge-text">{copy.hero.badge}</span>
            </div>

            <h1 className="dashboard-title">
              {copy.hero.titleBefore} <span className="text-tertiary">{copy.hero.titleHighlight}</span> {copy.hero.titleAfter}
            </h1>

            <p className="hero-subtitle">
              {copy.hero.subtitle}
            </p>

            <div className="dashboard-hero-actions">
              <a
                className="btn btn-primary dashboard-primary-cta"
                href={import.meta.env.VITE_DISCORD_BOT_INSTALL}
                target="_blank"
                rel="noreferrer"
              >
                <span className="material-symbols-outlined icon-filled">add_circle</span>
                {copy.hero.primaryCta}
              </a>
              <Link to="/" className="btn btn-secondary dashboard-secondary-cta">
                {copy.hero.secondaryCta}
              </Link>
            </div>
          </div>

          <div className="dashboard-hero-panel">
            <div className="summary-grid">
              <div className="summary-card glass-card">
                <span className="summary-label">{copy.summary.totalLabel}</span>
                <span className="summary-value">{stats.total}</span>
                <span className="summary-meta">{copy.summary.totalMeta}</span>
              </div>
              <div className="summary-card glass-card">
                <span className="summary-label">{copy.summary.activeLabel}</span>
                <span className="summary-value summary-value-secondary">{stats.active}</span>
                <span className="summary-meta">{copy.summary.activeMeta}</span>
              </div>
              <div className="summary-card glass-card">
                <span className="summary-label">{copy.summary.pendingLabel}</span>
                <span className="summary-value summary-value-tertiary">{stats.pending}</span>
                <span className="summary-meta">{copy.summary.pendingMeta}</span>
              </div>
              <div className="summary-card glass-card">
                <span className="summary-label">{copy.summary.ownedLabel}</span>
                <span className="summary-value summary-value-primary">{stats.owned}</span>
                <span className="summary-meta">{copy.summary.ownedMeta}</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
