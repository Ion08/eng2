'use client';

import { useEffect, useMemo, useState } from 'react';

function format(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function Timer({
  minutes,
  running,
  onExpire
}: {
  minutes: number;
  running: boolean;
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(minutes * 60);

  useEffect(() => {
    setRemaining(minutes * 60);
  }, [minutes]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) return 0;
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (running && remaining === 0) onExpire();
  }, [remaining, running, onExpire]);

  const danger = remaining <= 60;
  const display = useMemo(() => format(remaining), [remaining]);

  return (
    <div className="kpi">
      <div className="k">Timer</div>
      <div className="v" style={{ color: danger ? 'var(--danger)' : 'var(--text)' }}>{display}</div>
    </div>
  );
}
