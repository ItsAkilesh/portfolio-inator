/**
 * File: notices.tsx
 * Purpose: Short-lived notices ("Uploaded logo.webp", "Icon added") shown in the corner of the admin
 *          console and announced to screen readers. Each notice clears itself; timers are cleaned up.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import overlay from "./overlay.module.css";

export type NoticeTone = "info" | "error";

interface Notice {
  readonly id: number;
  readonly message: string;
  readonly tone: NoticeTone;
}

type Notify = (message: string, tone?: NoticeTone) => void;

const NOTICE_MS = 4000;
const MAX_NOTICES = 4;
const NoticeContext = createContext<Notify>(() => undefined);

export const useNotify = (): Notify => useContext(NoticeContext);

export function NoticeProvider({ children }: { readonly children: ReactNode }) {
  const [notices, setNotices] = useState<readonly Notice[]>([]);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const nextId = useRef(0);
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);
  const notify = useCallback<Notify>((message, tone = "info") => {
    nextId.current += 1;
    const id = nextId.current;
    setNotices((list) => [...list, { id, message, tone }].slice(-MAX_NOTICES));
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      setNotices((list) => list.filter((n) => n.id !== id));
    }, NOTICE_MS);
    timers.current.add(timer);
  }, []);
  const value = useMemo(() => notify, [notify]);
  return (
    <NoticeContext.Provider value={value}>
      {children}
      <div className={overlay.notices} role="status" aria-live="polite">
        {notices.map((n) => (
          <p key={n.id} className={overlay.notice} data-tone={n.tone}>
            {n.message}
          </p>
        ))}
      </div>
    </NoticeContext.Provider>
  );
}
