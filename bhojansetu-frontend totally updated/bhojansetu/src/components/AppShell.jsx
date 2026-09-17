import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDemoMode } from '../context/DemoModeContext';
import { useTheme } from '../context/ThemeContext';
import { useHealth } from '../context/HealthContext';
import { formatRelative } from '../utils/format';

const NAV_BY_ROLE = {
  provider: [
    { to: '/provider', label: 'Donations', end: true },
    { to: '/provider/post', label: 'Post surplus' },
  ],
  ngo: [
    { to: '/ngo', label: 'Matches', end: true },
    { to: '/ngo/claims', label: 'Claims' },
  ],
  volunteer: [{ to: '/volunteer', label: 'Deliveries', end: true }],
};

const ROLES = [
  { id: 'provider', label: 'Provider', home: '/provider' },
  { id: 'ngo', label: 'NGO', home: '/ngo' },
  { id: 'volunteer', label: 'Volunteer', home: '/volunteer' },
];

function HealthDot() {
  const { status, lastOkAt } = useHealth();
  const { demoMode } = useDemoMode();

  const map = {
    live: { tone: 'ok', text: 'Backend live' },
    down: { tone: 'critical', text: demoMode ? 'Backend down — demo data' : 'Backend unreachable' },
    unknown: { tone: 'idle', text: 'Connecting' },
  };
  const s = map[status];

  return (
    <span
      className="inline-flex items-center gap-2 text-[11px]"
      style={{ color: 'var(--text-dim)' }}
      title={lastOkAt ? `Last successful request ${formatRelative(lastOkAt)}` : undefined}
    >
      <span
        className={`h-2 w-2 rounded-full ${status === 'live' ? 'beacon' : ''}`}
        style={{ background: `var(--${s.tone})`, color: `var(--${s.tone})` }}
        aria-hidden="true"
      />
      {s.text}
    </span>
  );
}

function RoleSwitcher() {
  const { session, login, accountsByRole } = useAuth();
  const { demoMode } = useDemoMode();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function switchTo(role) {
    if (role === session?.role || busy) return;
    setBusy(true);
    const home = ROLES.find((r) => r.id === role).home;
    // Switch into the first real seeded account for that role — never a
    // guessed id (see AuthContext's accountsByRole, backed by
    // GET /api/auth/demo-accounts).
    const targetId = accountsByRole(role)[0]?.userId;
    if (!targetId) {
      setBusy(false);
      if (demoMode) navigate(home);
      return;
    }
    try {
      await login(targetId, role);
      navigate(home);
    } catch {
      // Demo mode is an explicit opt-in for walking the flow with the API
      // down; outside it, a failed switch leaves the current session alone.
      if (demoMode) navigate(home);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="flex rounded-[3px] border p-0.5"
      style={{ borderColor: 'var(--line)', background: 'var(--surface-2)' }}
      role="group"
      aria-label="Switch workspace"
    >
      {ROLES.map((r) => {
        const active = session?.role === r.id;
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => switchTo(r.id)}
            disabled={busy}
            className="rounded-[2px] px-2.5 py-1 text-[12px] font-medium disabled:opacity-60"
            style={{
              background: active ? 'var(--text)' : 'transparent',
              color: active ? 'var(--bg)' : 'var(--text-dim)',
            }}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

export default function AppShell({ title, subtitle, actions, rail, children }) {
  const { session, logout } = useAuth();
  const { demoMode, setDemoMode } = useDemoMode();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const nav = NAV_BY_ROLE[session?.role] || [];

  const linkStyle = ({ isActive }) => ({
    background: isActive ? 'var(--surface-3)' : 'transparent',
    color: isActive ? 'var(--text)' : 'var(--text-dim)',
    fontWeight: isActive ? 600 : 500,
  });

  return (
    <div className="flex min-h-screen flex-col lg:flex-row" style={{ background: 'var(--bg)' }}>
      {/* Left rail */}
      <aside
        className="shrink-0 border-b lg:w-52 lg:border-b-0 lg:border-r"
        style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}
      >
        <div className="flex items-center justify-between gap-4 px-4 py-4 lg:block">
          <div>
            <div className="h-board flex items-center gap-1.5 text-[17px]">
              <span
                className="inline-block h-3 w-3 rounded-[1px]"
                style={{ background: 'var(--brand)' }}
                aria-hidden="true"
              />
              BhojanSetu
            </div>
            <p className="mt-0.5 text-[11px]" style={{ color: 'var(--text-faint)' }}>
              Vellore–Katpadi corridor
            </p>
          </div>

          <nav className="flex gap-1 lg:mt-5 lg:flex-col">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className="rounded-[3px] px-3 py-2 text-[13px]"
                style={linkStyle}
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink to="/impact" className="rounded-[3px] px-3 py-2 text-[13px]" style={linkStyle}>
              Impact
            </NavLink>
          </nav>
        </div>

        <div
          className="hidden gap-2 border-t px-4 py-3 lg:flex lg:flex-col"
          style={{ borderColor: 'var(--line)' }}
        >
          <label className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-dim)' }}>
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
            />
            Demo data if backend is down
          </label>
          {session && (
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="text-left text-[11px] underline"
              style={{ color: 'var(--text-faint)' }}
            >
              Sign out of {session.userId}
            </button>
          )}
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3"
          style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}
        >
          <RoleSwitcher />
          <div className="flex items-center gap-4">
            <HealthDot />
            <button
              type="button"
              onClick={toggle}
              className="btn btn-quiet px-2.5 py-1.5 text-[12px]"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </header>

        <div className="flex min-w-0 flex-1 flex-col xl:flex-row">
          <main className="min-w-0 flex-1 px-5 py-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="h-board text-[26px]">{title}</h1>
                {subtitle && (
                  <p className="mt-1 max-w-[62ch] text-[13px]" style={{ color: 'var(--text-dim)' }}>
                    {subtitle}
                  </p>
                )}
              </div>
              {actions}
            </div>
            {children}
          </main>

          {rail && (
            <div className="w-full shrink-0 px-5 pb-6 xl:w-[300px] xl:py-6 xl:pl-0">{rail}</div>
          )}
        </div>
      </div>
    </div>
  );
}
