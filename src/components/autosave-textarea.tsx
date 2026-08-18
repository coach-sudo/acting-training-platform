"use client";
import { useRef, useState, useTransition } from "react";
export function AutosaveTextarea({
  name,
  initialValue,
  sessionId,
  action,
  label,
}: {
  name: string;
  initialValue: string;
  sessionId: string;
  action: (data: FormData) => Promise<void>;
  label: string;
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    [pending, start] = useTransition(),
    [status, setStatus] = useState<"saved" | "unsaved" | "error">("saved");
  return (
    <label>
      {label}
      <textarea
        name={name}
        defaultValue={initialValue}
        onChange={(e) => {
          setStatus("unsaved");
          if (timer.current) clearTimeout(timer.current);
          const value = e.currentTarget.value;
          timer.current = setTimeout(() => {
            const data = new FormData();
            data.set("sessionId", sessionId);
            data.set(name, value);
            start(async () => {
              try {
                await action(data);
                setStatus("saved");
              } catch {
                setStatus("error");
              }
            });
          }, 700);
        }}
      />
      <span className="save-status" aria-live="polite">
        {pending
          ? "Saving…"
          : status === "saved"
            ? "Saved"
            : status === "error"
              ? "Save failed—your text remains here"
              : "Unsaved changes"}
      </span>
    </label>
  );
}
