import { useMemo } from 'react';
import { URGENCY_TONE } from '../utils/status';
import { formatDistance } from '../utils/format';

/**
 * A distance view of the live board, drawn as plain SVG.
 *
 * The spec rules out external map APIs, so this is not a tile map. It plots
 * every open item against real distanceKm from the backend on concentric
 * range rings — which is the number a dispatcher actually acts on.
 *
 * If the backend also sends coordinates, the bearing is computed from them
 * and the plot becomes a true relative-position view. When it doesn't, the
 * angle is only a deterministic spread so dots don't overlap, and the widget
 * says so rather than implying a direction it doesn't know.
 */

function hashAngle(id = '') {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) % 360;
  return (h * Math.PI) / 180;
}

export default function RescueRadar({ items = [], centreLabel = 'Your centre', onSelect }) {
  const SIZE = 260;
  const C = SIZE / 2;
  const PAD = 18;

  const { points, maxKm, hasBearing } = useMemo(() => {
    const withDistance = items.filter(
      (it) => it.distanceKm !== null && it.distanceKm !== undefined,
    );
    const bearingAvailable =
      withDistance.length > 0 &&
      withDistance.every((it) => it.location?.lat != null && it.location?.lng != null);

    const max = Math.max(1, ...withDistance.map((it) => it.distanceKm));
    const scale = (C - PAD) / max;

    const pts = withDistance.map((it) => {
      const angle = bearingAvailable
        ? Math.atan2(it.location.lat, it.location.lng)
        : hashAngle(it.foodId || it.foodName || '');
      const r = it.distanceKm * scale;
      return {
        ...it,
        x: C + Math.cos(angle) * r,
        y: C + Math.sin(angle) * r,
        tone: URGENCY_TONE[it.urgency] || 'idle',
      };
    });

    return { points: pts, maxKm: max, hasBearing: bearingAvailable };
  }, [items]);

  const rings = [0.33, 0.66, 1];

  return (
    <div className="panel p-4" style={{ boxShadow: 'var(--shadow)' }}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-[13px] font-semibold">Range view</h2>
        <span className="mono text-[11px]" style={{ color: 'var(--text-faint)' }}>
          {points.length} open
        </span>
      </div>

      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full" role="img"
           aria-label={`${points.length} open items plotted by distance from ${centreLabel}`}>
        {rings.map((f, i) => (
          <g key={f}>
            <circle
              cx={C} cy={C} r={(C - PAD) * f}
              fill="none" stroke="var(--line)" strokeWidth="1"
              strokeDasharray={i === rings.length - 1 ? '0' : '3 4'}
            />
            <text
              x={C + 3} y={C - (C - PAD) * f + 10}
              className="mono" fontSize="9" fill="var(--text-faint)"
            >
              {(maxKm * f).toFixed(1)} km
            </text>
          </g>
        ))}

        <circle cx={C} cy={C} r="5" fill="var(--text)" />
        <text x={C + 9} y={C + 4} fontSize="10" fill="var(--text-dim)">
          {centreLabel}
        </text>

        {points.map((p) => (
          <g
            key={p.foodId}
            onClick={() => onSelect?.(p)}
            style={{ cursor: onSelect ? 'pointer' : 'default' }}
          >
            <title>{`${p.foodName} — ${formatDistance(p.distanceKm)}, ${p.urgency || 'unknown'} urgency`}</title>
            <line x1={C} y1={C} x2={p.x} y2={p.y} stroke="var(--line)" strokeWidth="1" />
            <circle cx={p.x} cy={p.y} r="6" fill={`var(--${p.tone})`} />
            <circle cx={p.x} cy={p.y} r="6" fill="none" stroke="var(--surface)" strokeWidth="1.5" />
          </g>
        ))}
      </svg>

      <p className="mt-2 text-[11px] leading-snug" style={{ color: 'var(--text-faint)' }}>
        {hasBearing
          ? 'Ring distance and direction both come from the backend.'
          : 'Ring distance is the backend’s distanceKm. Direction is spacing only — the backend doesn’t send a bearing.'}
      </p>
    </div>
  );
}
