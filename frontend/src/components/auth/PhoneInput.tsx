"use client";

import { Lang } from "@/i18n/auth";
import { COUNTRIES, Country, DEFAULT_COUNTRY } from "@/lib/countries ";
import React, { useState, useRef, useEffect, useCallback } from "react";



interface PhoneInputProps {
  label: string;
  value: string;
  onChange: (fullPhone: string) => void;
  error?: string;
  lang: Lang;
  searchPlaceholder: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label, value, onChange, error, lang, searchPlaceholder,
}) => {
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [localNumber, setLocalNumber] = useState("");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = COUNTRIES.filter((c) => {
    const q = search.toLowerCase();
    return c.name[lang]?.toLowerCase().includes(q) || c.dialCode.includes(q) || c.iso.toLowerCase().includes(q);
  });

  // Sync full phone value upward
  useEffect(() => {
    const digits = localNumber.replace(/\s/g, "");
    onChange(digits ? `${country.dialCode}${digits}` : "");
  }, [localNumber, country]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectCountry = useCallback((c: Country) => {
    setCountry(c);
    setOpen(false);
    setSearch("");
  }, []);

  const toggleOpen = () => {
    setOpen((v) => !v);
    setSearch("");
    setTimeout(() => searchRef.current?.focus(), 50);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <div className="flex gap-2">
        {/* Country selector */}
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={toggleOpen}
            className={`flex items-center gap-1.5 h-full bg-gray-50 border rounded-xl px-3 py-2.5 text-sm transition-all cursor-pointer
              ${open ? "border-violet-500 ring-2 ring-violet-100" : "border-gray-200 hover:border-gray-300"}
            `}
          >
            <span className="text-base leading-none">{country.flag}</span>
            <span className="font-mono text-xs text-gray-500">{country.dialCode}</span>
            <svg className={`w-3 h-3 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 12 8" fill="none">
              <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {open && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="p-2 border-b border-gray-100">
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-violet-400"
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">Aucun résultat</p>
                ) : filtered.map((c) => (
                  <button
                    key={c.iso}
                    type="button"
                    onClick={() => selectCountry(c)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-left
                      ${c.iso === country.iso ? "bg-violet-50 text-violet-700" : "text-gray-700"}
                    `}
                  >
                    <span className="text-base w-5 text-center leading-none">{c.flag}</span>
                    <span className="flex-1 text-xs truncate">{c.name[lang] ?? c.name.fr}</span>
                    <span className="font-mono text-xs text-gray-400 ml-auto flex-shrink-0">{c.dialCode}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Number input */}
        <input
          type="tel"
          value={localNumber}
          onChange={(e) => setLocalNumber(e.target.value)}
          placeholder="XX XXX XXX"
          className={`flex-1 bg-gray-50 border rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 outline-none transition-all
            ${error ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 hover:border-gray-300"}
          `}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
