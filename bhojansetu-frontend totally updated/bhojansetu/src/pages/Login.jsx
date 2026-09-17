import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDemoMode } from '../context/DemoModeContext';
import { useTheme } from '../context/ThemeContext';
import { NetworkUnavailableError } from '../services/api/client';

const ROLES = [
  {
    id: 'provider',
    label: 'Provider',
    hint: 'Restaurants, hotels, caterers, canteens and event kitchens',
    home: '/provider',
  },
  { id: 'ngo', label: 'NGO', hint: 'Claim matched surplus and confirm what arrives', home: '/ngo' },
  { id: 'volunteer', label: 'Volunteer', hint: 'Collect and run deliveries assigned to you', home: '/volunteer' },
];

// A genuine sequence, so it earns its numbering.
const FLOW = [
  'A kitchen posts surplus with a hard expiry time.',
  'The engine scores every NGO on distance, capacity, food type and time left.',
  'An NGO claims it, a volunteer runs it, the NGO confirms it landed.',
];

export default function Login() {
  const [role, setRole] = useState('provider');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [manualId, setManualId] = useState('');
  const [error, setError] = useState(null);
  const { login, loading, accounts, accountsLoading, accountsByRole } = useAuth();
  const { demoMode, setDemoMode } = useDemoMode();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  // Real seeded accounts for the selected role (actual Mongo _id values from
  // seed.py) — never a guessed/fake id. Falls back to manual entry only if
  // the backend has no seeded accounts for this role yet.
  const roleAccounts = accountsByRole(role);

  useEffect(() => {
    setSelectedUserId(roleAccounts.length > 0 ? roleAccounts[0].userId : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, accounts]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const home = ROLES.find((r) => r.id === role).home;
    const userId = selectedUserId || manualId.trim();
    if (!userId) {
      setError({ name: 'ValidationError', message: 'Pick a demo account, or paste a seeded user id.' });
      return;
    }
    try {
      await login(userId, role);
      navigate(home);
    } catch (err) {
      if (demoMode && err instanceof NetworkUnavailableError) {
        navigate(home);
        return;
      }
      setError(err);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2" style={{ background: 'var(--bg)' }}>
      {/* Statement side */}
      <div
        className="flex flex-col justify-between border-b p-8 lg:border-b-0 lg:border-r lg:p-12"
        style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}
      >
        <div className="flex items-center justify-between">
          <div className="h-board flex items-center gap-2 text-[19px]">
            <span
              className="inline-block h-3.5 w-3.5 rounded-[1px]"
              style={{ background: 'var(--brand)' }}
              aria-hidden="true"
            />
            BhojanSetu
          </div>
          <button type="button" onClick={toggle} className="btn btn-quiet px-2.5 py-1.5 text-[12px]">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>

        <div className="my-12 max-w-[34ch]">
          <h1 className="h-board text-[40px] lg:text-[52px]">
            Surplus food has a clock on it.
          </h1>
          <p className="mt-4 text-[15px]" style={{ color: 'var(--text-dim)' }}>
            BhojanSetu runs the Vellore–Katpadi corridor as a dispatch board: match, claim, collect,
            deliver — before the clock runs out.
          </p>
        </div>

        <ol className="space-y-3">
          {FLOW.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span
                className="mono mt-0.5 text-[12px] font-semibold"
                style={{ color: 'var(--brand-ink)' }}
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="max-w-[46ch] text-[13px]" style={{ color: 'var(--text-dim)' }}>
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Sign-in side */}
      <div className="flex items-center justify-center p-8 lg:p-12">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h2 className="h-board text-[20px]">Open a workspace</h2>
          <p className="mt-1 text-[13px]" style={{ color: 'var(--text-dim)' }}>
            Hackathon demo sign-in. No password — pick the role you want to walk through.
          </p>

          <fieldset className="mt-5 space-y-2">
            <legend className="sr-only">Role</legend>
            {ROLES.map((r) => {
              const active = role === r.id;
              return (
                <label
                  key={r.id}
                  className="flex cursor-pointer gap-3 rounded-[3px] border p-3"
                  style={{
                    borderColor: active ? 'var(--ok)' : 'var(--line)',
                    background: active ? 'var(--ok-bg)' : 'var(--surface)',
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    className="mt-1"
                    checked={active}
                    onChange={() => setRole(r.id)}
                  />
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold">{r.label}</span>
                    <span className="block text-[12px]" style={{ color: 'var(--text-dim)' }}>
                      {r.hint}
                    </span>
                  </span>
                </label>
              );
            })}
          </fieldset>

          {roleAccounts.length > 0 ? (
            <label className="mt-4 block">
              <span className="text-[12px] font-semibold">Demo account</span>
              <select
                className="field mt-1.5"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                {roleAccounts.map((a) => (
                  <option key={a.userId} value={a.userId}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="mt-4 block">
              <span className="text-[12px] font-semibold">Demo user ID</span>
              <span className="ml-2 text-[11px] font-normal" style={{ color: 'var(--text-faint)' }}>
                {accountsLoading
                  ? 'Loading seeded accounts…'
                  : 'No seeded accounts found — run seed.py, then paste an id here'}
              </span>
              <input
                className="field mono mt-1.5"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="Mongo _id printed by seed.py"
              />
            </label>
          )}

          <label
            className="mt-3 flex items-center gap-2 text-[12px]"
            style={{ color: 'var(--text-dim)' }}
          >
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
            />
            Fall back to demo data if the backend is down
          </label>

          {error && !(demoMode && error instanceof NetworkUnavailableError) && (
            <p className="mt-3 text-[12px] font-medium" style={{ color: 'var(--critical)' }}>
              {error.name === 'NetworkUnavailableError'
                ? 'No response from the API. Start the FastAPI server, or tick demo data above.'
                : error.message}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary mt-5 w-full py-2.5">
            {loading ? 'Opening…' : 'Open workspace'}
          </button>
        </form>
      </div>
    </div>
  );
}
