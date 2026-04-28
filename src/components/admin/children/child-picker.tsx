"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchChildrenAction } from "@/server/actions/children/search";

type ChildOption = {
  id: string;
  fullName: string;
  age: number | null;
};

type Props = {
  value: string | null;
  onChange: (childId: string | null, fullName: string | null, age: number | null) => void;
  placeholder?: string;
  initialName?: string | null;
  initialAge?: number | null;
};

export function ChildPicker({
  value,
  onChange,
  placeholder,
  initialName,
  initialAge,
}: Props) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<ChildOption[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(
    initialName ?? null,
  );
  const [selectedAge, setSelectedAge] = useState<number | null>(initialAge ?? null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      searchChildrenAction(q).then((r) => {
        if (r.ok)
          setResults(
            r.data.map((c) => ({ id: c.id, fullName: c.fullName, age: c.age })),
          );
      });
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  function pick(child: ChildOption) {
    onChange(child.id, child.fullName, child.age);
    setSelectedName(child.fullName);
    setSelectedAge(child.age);
    setQ("");
    setResults([]);
    setOpen(false);
  }

  function clear() {
    onChange(null, null, null);
    setSelectedName(null);
    setSelectedAge(null);
    setQ("");
  }

  if (value && selectedName) {
    return (
      <div className="flex items-center justify-between rounded-md border px-3 py-2">
        <div className="flex flex-col">
          <span className="text-sm font-medium">{selectedName}</span>
          {selectedAge != null ? (
            <span className="text-xs text-muted-foreground">
              {selectedAge} thn
            </span>
          ) : null}
        </div>
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
          placeholder={placeholder ?? "Cari anak…"}
          className="pl-9"
        />
      </div>
      {open && q.trim().length >= 2 && results.length > 0 ? (
        <ul className="flex flex-col gap-1 rounded-md border p-1">
          {results.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => pick(c)}
                className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <span className="font-medium">{c.fullName}</span>
                <span className="text-xs text-muted-foreground">
                  {c.age != null ? `${c.age} thn` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
