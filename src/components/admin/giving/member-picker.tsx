"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchMembersAction } from "@/server/actions/members/search";

type Props = {
  value: string | null;
  onChange: (memberId: string | null, fullName: string | null) => void;
  placeholder?: string;
  initialName?: string | null;
};

export function MemberPicker({ value, onChange, placeholder, initialName }: Props) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<
    Array<{ id: string; fullName: string; phone: string | null }>
  >([]);
  const [selectedName, setSelectedName] = useState<string | null>(initialName ?? null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      searchMembersAction(q).then((r) => {
        if (r.ok) setResults(r.data);
      });
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  function pick(memberId: string, fullName: string) {
    onChange(memberId, fullName);
    setSelectedName(fullName);
    setQ("");
    setResults([]);
    setOpen(false);
  }

  function clear() {
    onChange(null, null);
    setSelectedName(null);
    setQ("");
  }

  if (value && selectedName) {
    return (
      <div className="flex items-center justify-between rounded-md border px-3 py-2">
        <span className="text-sm font-medium">{selectedName}</span>
        <Button type="button" variant="ghost" size="icon" onClick={clear}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder ?? "Cari jemaat…"}
          className="pl-9"
        />
      </div>
      {open && q.trim().length >= 2 && results.length > 0 ? (
        <ul className="flex flex-col gap-1 rounded-md border p-1">
          {results.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => pick(m.id, m.fullName)}
                className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <span className="font-medium">{m.fullName}</span>
                <span className="text-xs text-muted-foreground">
                  {m.phone ?? ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
