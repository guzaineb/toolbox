"use client";

import { Lang } from "@/i18n/auth";
import { COUNTRIES, Country, DEFAULT_COUNTRY } from "@/lib/countries";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  label: string;
  value: string;
  onChange: (fullPhone: string) => void;
  error?: string;
  lang: Lang;
  searchPlaceholder: string;
  className?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label, value, onChange, error, lang, searchPlaceholder, className,
}) => {
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [localNumber, setLocalNumber] = useState("");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);

  const filtered = COUNTRIES.filter((c) => {
    const q = search.toLowerCase();
    return c.name[lang]?.toLowerCase().includes(q) || c.dialCode.includes(q) || c.iso.toLowerCase().includes(q);
  });

  // Initialisation depuis value prop (uniquement au montage ou quand value change de l'extérieur)
  useEffect(() => {
    if (value) {
      const matchedCountry = COUNTRIES.find(c => value.startsWith(c.dialCode));
      if (matchedCountry && matchedCountry.iso !== country.iso) {
        setCountry(matchedCountry);
        const newLocalNumber = value.replace(matchedCountry.dialCode, '');
        if (newLocalNumber !== localNumber) {
          setLocalNumber(newLocalNumber);
        }
      } else if (!matchedCountry && value !== localNumber) {
        setLocalNumber(value);
      }
    } else if (value === "" && localNumber !== "") {
      setLocalNumber("");
    }
  }, [value]); // Dépendance uniquement à value

  // Envoyer les changements au parent (uniquement quand localNumber ou country change)
  useEffect(() => {
    // Skip sur le premier mount pour éviter double appel
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    const digits = localNumber.replace(/\s/g, "");
    const fullPhone = digits ? `${country.dialCode}${digits}` : "";
    
    // Éviter les appels inutiles
    if (fullPhone !== value) {
      onChange(fullPhone);
    }
  }, [localNumber, country]); // Dépendances uniquement localNumber et country

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

  // Gestionnaire pour le changement de numéro local
  const handleLocalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/\s/g, '');
    setLocalNumber(newNumber);
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label className="text-[10px] sm:text-[11px] font-semibold tracking-wide text-ink2 mb-1.5 uppercase">
        {label}
      </label>
      <div className="flex gap-2">
        {/* Country selector */}
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={toggleOpen}
            className={`flex items-center gap-1.5 h-full bg-cream border rounded-xl px-3 py-2.5 text-sm transition-all cursor-pointer
              ${open ? "border-accent ring-2 ring-accent/20" : "border-border hover:border-border-strong"}
            `}
          >
            <span className="text-base leading-none">{country.flag}</span>
            <span className="font-mono text-xs text-text-2">{country.dialCode}</span>
            <svg className={`w-3 h-3 text-text-3 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 12 8" fill="none">
              <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {open && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-surface border border-border rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="p-2 border-b border-border">
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-accent"
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="text-xs text-text-3 text-center py-4">Aucun résultat</p>
                ) : filtered.map((c) => (
                  <button
                    key={c.iso}
                    type="button"
                    onClick={() => selectCountry(c)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-bg transition-colors text-left
                      ${c.iso === country.iso ? "bg-accent-light text-accent" : "text-text-1"}
                    `}
                  >
                    <span className="text-base w-5 text-center leading-none">{c.flag}</span>
                    <span className="flex-1 text-xs truncate">{c.name[lang] ?? c.name.fr}</span>
                    <span className="font-mono text-xs text-text-3 ml-auto flex-shrink-0">{c.dialCode}</span>
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
          onChange={handleLocalNumberChange}
          placeholder="XX XXX XXX"
          className={`flex-1 bg-cream border rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-text-3 outline-none transition-all
            ${error ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-border focus:border-accent focus:ring-2 focus:ring-accent/20 hover:border-border-strong"}
          `}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
};
