import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import CountdownRing from '../../components/CountdownRing';
import { postFood } from '../../services/api/provider';
import { FOOD_TYPES, DEMO_LOCATIONS } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import { foodTypeLabel } from '../../utils/format';

function localIso(offsetMs = 0) {
  const d = new Date(Date.now() + offsetMs);
  d.setSeconds(0, 0);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

const PRESETS = [
  { label: '1 hour', ms: 3600e3 },
  { label: '3 hours', ms: 3 * 3600e3 },
  { label: '6 hours', ms: 6 * 3600e3 },
];

function Field({ label, error, hint, children }) {
  return (
    <label className="block">
      <span className="text-[12px] font-semibold">{label}</span>
      {hint && (
        <span className="ml-2 text-[11px] font-normal" style={{ color: 'var(--text-faint)' }}>
          {hint}
        </span>
      )}
      <div className="mt-1.5">{children}</div>
      {error && (
        <span className="mt-1 block text-[11px] font-medium" style={{ color: 'var(--critical)' }}>
          {error}
        </span>
      )}
    </label>
  );
}

export default function PostFood() {
  const { session } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    foodName: '',
    quantity: '',
    foodType: 'veg',
    description: '',
    preparedAt: localIso(),
    expiresAt: localIso(3 * 3600e3),
    locationLabel: DEMO_LOCATIONS[0].label,
    providerName: session?.userId || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const expiresIso = useMemo(() => {
    try {
      return new Date(form.expiresAt).toISOString();
    } catch {
      return null;
    }
  }, [form.expiresAt]);

  function validate() {
    const errs = {};
    if (!form.foodName.trim()) errs.foodName = 'Give the food a name NGOs will recognise.';
    if (!form.quantity || Number(form.quantity) <= 0) errs.quantity = 'How many servings?';
    if (!form.preparedAt) errs.preparedAt = 'Required.';
    if (!form.expiresAt) errs.expiresAt = 'Required.';
    if (form.preparedAt && form.expiresAt && new Date(form.expiresAt) <= new Date(form.preparedAt)) {
      errs.expiresAt = 'Expiry has to be after the prepared time.';
    }
    if (!form.providerName.trim()) errs.providerName = 'Enter the kitchen or business name.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const location =
      DEMO_LOCATIONS.find((l) => l.label === form.locationLabel) || DEMO_LOCATIONS[0];

    setSubmitting(true);
    setError(null);
    try {
      await postFood({
        foodName: form.foodName.trim(),
        quantity: Number(form.quantity),
        foodType: form.foodType,
        description: form.description.trim(),
        preparedAt: new Date(form.preparedAt).toISOString(),
        expiresAt: new Date(form.expiresAt).toISOString(),
        location: { lat: location.lat, lng: location.lng },
      });
      setSuccess(true);
      setTimeout(() => navigate('/provider'), 700);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell
      title="Post surplus food"
      subtitle="The expiry time drives everything downstream — urgency, ranking, and which NGO sees this first. Set it honestly."
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,560px)_260px]">
        <form onSubmit={handleSubmit} className="panel space-y-4 p-5" style={{ boxShadow: 'var(--shadow)' }}>
          <Field label="What's the food?" error={fieldErrors.foodName}>
            <input
              className="field"
              value={form.foodName}
              onChange={(e) => update('foodName', e.target.value)}
              placeholder="Rice and dal"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Servings" error={fieldErrors.quantity}>
              <input
                className="field mono"
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => update('quantity', e.target.value)}
                placeholder="75"
              />
            </Field>
            <Field label="Food type" hint="NGOs filter on this">
              <select
                className="field"
                value={form.foodType}
                onChange={(e) => update('foodType', e.target.value)}
              >
                {FOOD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {foodTypeLabel(t)}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field
            label="Describe the food"
            hint="Optional — helps NGOs judge fit at a glance"
          >
            <textarea
              className="field"
              rows={3}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="e.g. Sealed trays, still hot, no nuts, mildly spiced"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prepared at" error={fieldErrors.preparedAt}>
              <input
                className="field mono"
                type="datetime-local"
                value={form.preparedAt}
                onChange={(e) => update('preparedAt', e.target.value)}
              />
            </Field>
            <Field label="Safe until" error={fieldErrors.expiresAt}>
              <input
                className="field mono"
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => update('expiresAt', e.target.value)}
              />
              <div className="mt-2 flex gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    className="btn btn-quiet px-2 py-1 text-[11px]"
                    onClick={() => update('expiresAt', localIso(p.ms))}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <Field label="Pickup point" hint="Demo locations around Vellore–Katpadi">
            <select
              className="field"
              value={form.locationLabel}
              onChange={(e) => update('locationLabel', e.target.value)}
            >
              {DEMO_LOCATIONS.map((l) => (
                <option key={l.label} value={l.label}>
                  {l.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Posting as" error={fieldErrors.providerName}>
            <input
              className="field"
              value={form.providerName}
              onChange={(e) => update('providerName', e.target.value)}
              placeholder="Hotel Sri Lakshmi"
            />
          </Field>

          {error && (
            <p className="text-[12px] font-medium" style={{ color: 'var(--critical)' }}>
              {error.name === 'NetworkUnavailableError'
                ? 'No response from the API — the post was not saved. Check the FastAPI server.'
                : error.message}
            </p>
          )}
          {success && (
            <p className="text-[12px] font-semibold" style={{ color: 'var(--ok)' }}>
              Posted. Opening your donations…
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn btn-primary w-full py-2.5">
            {submitting ? 'Posting…' : 'Post to the rescue board'}
          </button>
        </form>

        {/* Live preview of the clock NGOs will see. */}
        <div className="panel h-fit p-4" style={{ boxShadow: 'var(--shadow)' }}>
          <h2 className="mb-3 text-[13px] font-semibold">What NGOs will see</h2>
          <div className="flex items-center gap-3">
            <CountdownRing expiresAt={expiresIso} preparedAt={new Date(form.preparedAt).toISOString()} />
            <div className="min-w-0">
              <p className="h-board truncate text-[15px]">{form.foodName || 'Untitled'}</p>
              <p className="mono text-[12px]" style={{ color: 'var(--text-dim)' }}>
                {form.quantity || '0'} servings · {foodTypeLabel(form.foodType)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-snug" style={{ color: 'var(--text-faint)' }}>
            Urgency and the match score are calculated by the backend once this is posted — this
            preview only shows the clock.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
