/**
 * Team state — loads the persisted overrides once, merges them over the
 * static roadmap defaults, and exposes effective status/assignee plus an
 * optimistic updater. If the tracker API is unreachable the app still
 * renders (read-only) from the static defaults.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { fetchState, patchDeliverable, type OverrideMap, type Status } from './api';
import { defaultEngineerForDomain } from './model/team';
import { ROADMAP, type Deliverable } from './model/roadmap';

type Conn = 'loading' | 'online' | 'offline';

interface TeamState {
  conn: Conn;
  /** Effective status — override wins over the roadmap default. */
  statusOf: (d: Deliverable) => Status;
  /** Effective assignee — override wins over the domain-derived default. */
  assigneeOf: (d: Deliverable) => string;
  /** Persist a change; updates locally first, reverts if the API rejects. */
  update: (id: string, patch: { status?: Status; assignee?: string; ticket?: string }) => void;
  /** Id of the deliverable whose detail drawer is open, or null. */
  detailId: string | null;
  openDetail: (id: string) => void;
  closeDetail: () => void;
}

const Ctx = createContext<TeamState | null>(null);

/** Defaults indexed by id, computed once from the static roadmap. */
const DEFAULTS: Record<string, { status: Status; assignee: string }> = Object.fromEntries(
  ROADMAP.flatMap((p) =>
    p.items.map((d) => [d.id, { status: d.status, assignee: defaultEngineerForDomain(d.domain) }]),
  ),
);

export function TeamStateProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<OverrideMap>({});
  const [conn, setConn] = useState<Conn>('loading');
  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetchState(ac.signal)
      .then((o) => {
        setOverrides(o);
        setConn('online');
      })
      .catch((e) => {
        if (e?.name !== 'AbortError') setConn('offline');
      });
    return () => ac.abort();
  }, []);

  const statusOf = useCallback(
    (d: Deliverable): Status => overrides[d.id]?.status ?? DEFAULTS[d.id]?.status ?? d.status,
    [overrides],
  );

  const assigneeOf = useCallback(
    (d: Deliverable): string => overrides[d.id]?.assignee ?? DEFAULTS[d.id]?.assignee ?? defaultEngineerForDomain(d.domain),
    [overrides],
  );

  const update = useCallback<TeamState['update']>(
    (id, patch) => {
      const prev = overrides[id];
      // Optimistic local apply.
      setOverrides((o) => ({ ...o, [id]: { ...o[id], ...patch } }));
      if (conn === 'offline') return;
      patchDeliverable(id, patch)
        .then((saved) => {
          setOverrides((o) => ({ ...o, [id]: { ...o[id], ...saved } }));
          setConn('online');
        })
        .catch(() => {
          // Revert on failure and flag offline.
          setOverrides((o) => ({ ...o, [id]: prev ?? {} }));
          setConn('offline');
        });
    },
    [overrides, conn],
  );

  const openDetail = useCallback((id: string) => setDetailId(id), []);
  const closeDetail = useCallback(() => setDetailId(null), []);

  const value = useMemo<TeamState>(
    () => ({ conn, statusOf, assigneeOf, update, detailId, openDetail, closeDetail }),
    [conn, statusOf, assigneeOf, update, detailId, openDetail, closeDetail],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTeamState(): TeamState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTeamState must be used within TeamStateProvider');
  return v;
}
