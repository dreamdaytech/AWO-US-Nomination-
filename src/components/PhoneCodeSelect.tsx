/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { COUNTRY_CODES } from "../data";
import { Search, ChevronDown } from "lucide-react";

interface PhoneCodeSelectProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  id?: string;
}

export const PhoneCodeSelect: React.FC<PhoneCodeSelectProps> = ({
  value,
  onChange,
  disabled = false,
  id,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = COUNTRY_CODES.find((c) => c.code === value) ?? COUNTRY_CODES[0];

  const filtered = search.trim()
    ? COUNTRY_CODES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.code.includes(search)
      )
    : COUNTRY_CODES;

  // Position dropdown based on trigger button rect
  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: 220,
        zIndex: 9999,
      });
    }
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!open) {
      updatePosition();
    }
    setOpen((p) => !p);
  };

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const dropdownEl = document.getElementById("phone-code-dropdown-portal");
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !(dropdownEl && dropdownEl.contains(target))
      ) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Focus search when opened
  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  // Reposition on scroll/resize
  useEffect(() => {
    if (!open) return;
    const handler = () => updatePosition();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [open]);

  const dropdown = open
    ? ReactDOM.createPortal(
        <div
          id="phone-code-dropdown-portal"
          style={dropdownStyle}
          className="bg-[#0d1117] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Search bar inside dropdown */}
          <div className="p-2 border-b border-white/10">
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1.5">
              <Search size={12} className="text-white/40 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder-white/30 outline-none"
              />
            </div>
          </div>

          {/* Scrollable country list */}
          <ul
            role="listbox"
            className="max-h-52 overflow-y-auto"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#fbbf24 transparent" }}
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-xs text-white/40 text-center">No results</li>
            ) : (
              filtered.map((c, i) => (
                <li
                  key={`${c.code}-${i}`}
                  role="option"
                  aria-selected={c.code === value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange(c.code);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`flex items-center gap-2 px-3 py-2 text-xs cursor-pointer transition-colors ${
                    c.code === value
                      ? "bg-amber-400/15 text-amber-400"
                      : "text-white/80 hover:bg-white/5"
                  }`}
                >
                  <span className="shrink-0">{c.label}</span>
                  <span className="truncate text-white/60">{c.name}</span>
                </li>
              ))
            )}
          </ul>
        </div>,
        document.body
      )
    : null;

  return (
    <div ref={containerRef} className="relative shrink-0" id={id}>
      {/* Compact trigger button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className="flex items-center gap-1 bg-black/20 text-white/80 px-2 py-3 text-sm border-r border-white/10 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap h-full focus:outline-none hover:bg-white/5 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selected.label}</span>
        <ChevronDown
          size={11}
          className={`text-white/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {dropdown}
    </div>
  );
};
