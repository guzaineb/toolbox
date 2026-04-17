"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// Composant Button simple intégré
const Button = ({
  children,
  variant = "primary",
  fullWidth = false,
  onClick,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  onClick?: () => void;
}) => {
  const baseStyle =
    "py-2.5 px-4 rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50";
  const variants = {
    primary: "bg-accent text-white hover:bg-accent/90",
    secondary: "bg-surface border border-border text-text-2 hover:bg-bg",
  };
  const width = fullWidth ? "w-full" : "";
  return (
    <button className={`${baseStyle} ${variants[variant]} ${width}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default function CheckEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "votre email"; // Dynamique depuis l'URL

  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0) return;

    setLoading(true);
    // Appel API NestJS à remplacer
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Exemple d'appel réel :
    await fetch("/api/auth/resend-confirmation", { method: "POST", body: JSON.stringify({ email }) });

    setLoading(false);
    setCountdown(60);
    alert("Un nouvel email a été envoyé !");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="w-full max-w-[420px] bg-surface border border-border rounded-[14px] p-9 shadow-md text-center">
        <div className="font-display text-[22px] text-text mb-7 text-center">
          Project<span className="text-accent">Struct</span>
        </div>

        <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-2xl mx-auto mb-5">
          ✉️
        </div>

        <h1 className="text-[20px] font-semibold mb-1">Vérifiez votre email</h1>

        <p className="text-[13px] text-text-2 mb-5 leading-relaxed">
          Un lien de confirmation a été envoyé à
          <br />
          <strong className="text-text">{email}</strong>
        </p>

        
        <div className="mt-5 space-y-3">
          <button
            onClick={handleResendEmail}
            disabled={countdown > 0 || loading}
            className={`text-[12px] block w-full transition-colors ${
              countdown > 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-text-2 hover:text-accent"
            }`}
          >
            {loading
              ? "Envoi en cours..."
              : countdown > 0
              ? `Renvoyer l'email (${countdown}s)`
              : "Renvoyer l'email"}
          </button>

          
        </div>
      </div>
    </div>
  );
}