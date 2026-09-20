'use client';

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import LeftPanel from "@/components/auth/LeftPanel";
import RightPanel from "@/components/auth/RightPanel";
import { VerifySVG } from "@/components/auth/GeoSVGs";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ;

export default function CheckEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const verificationToken = searchParams.get("token");
    if (verificationToken) {
      setToken(verificationToken);
      verifyEmail(verificationToken);
    }
  }, [searchParams]);

  const verifyEmail = async (verificationToken: string) => {
    setStatus("verifying");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/verify-email?token=${encodeURIComponent(verificationToken)}`
      );

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Votre email a été vérifié avec succès !");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(data.message || "Le lien de vérification est invalide ou a expiré.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Une erreur est survenue lors de la vérification. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (countdown > 0) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Impossible de renvoyer l'email");
      setMessage("");
    } catch (err: any) {
      setMessage(err.message || "Erreur lors de l'envoi de l'email.");
      setStatus("error");
    } finally {
      setLoading(false);
      setCountdown(60);
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const renderContent = () => {
    if (status === "verifying") {
      return (
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
          <h1 className="text-[20px] font-semibold mb-2">Vérification en cours...</h1>
          <p className="text-[13px] text-text-2">
            Veuillez patienter pendant que nous vérifions votre email.
          </p>
        </div>
      );
    }

    if (status === "success") {
      return (
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl mx-auto mb-5">
            ✓
          </div>
          <h1 className="text-[20px] font-semibold mb-2 text-green-600">Email vérifié !</h1>
          <p className="text-[13px] text-text-2 mb-6">{message}</p>
          <p className="text-[11px] text-text-3">
            Redirection vers la page de connexion...
          </p>
          <Link href="/login" className="inline-block mt-4 text-accent hover:text-accent/80 text-sm font-medium">
            Se connecter maintenant →
          </Link>
        </div>
      );
    }

    if (status === "error") {
      return (
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-2xl mx-auto mb-5">
            ⚠️
          </div>
          <h1 className="text-[20px] font-semibold mb-2 text-red-600">Vérification échouée</h1>
          <p className="text-[13px] text-text-2 mb-6">{message}</p>
          
          {email && (
            <div className="space-y-3">
              <button onClick={handleResendEmail} disabled={countdown > 0 || loading}
                className={cn( "w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all", countdown > 0 || loading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-accent text-white hover:bg-accent/90"
                )}
              >
                {loading
                  ? "Envoi en cours..."
                  : countdown > 0
                  ? `Renvoyer l'email (${countdown}s)`
                  : "Renvoyer l'email de vérification"}
              </button>
              
              <Link
                href="/register"
                className="block text-sm text-text-2 hover:text-accent transition-colors"
              >
                ← Retour à l'inscription
              </Link>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-2xl mx-auto mb-5">
          ✉️
        </div>
        
        <h1 className="text-[20px] font-semibold mb-2">Vérifiez votre email</h1>
        
        <p className="text-[13px] text-text-2 mb-4 leading-relaxed">
          Un lien de vérification a été envoyé à
          <br />
          <strong className="text-text block mt-1">{email || "votre adresse email"}</strong>
        </p>

        <div className="bg-bg rounded-lg p-4 mb-6 text-left">
          <p className="text-[12px] text-text-2 mb-2">📌 Instructions :</p>
          <ol className="text-[11px] text-text-2 space-y-1 list-decimal list-inside">
            <li>Ouvrez votre boîte de réception</li>
            <li>Cliquez sur le lien de vérification reçu</li>
            <li>Vous serez automatiquement redirigé vers la connexion</li>
          </ol>
        </div>

        {message && (
          <div className={cn(
            "mb-4 p-3 rounded-lg text-sm",
            message.includes("succès") 
              ? "bg-green-50 text-green-600 border border-green-200"
              : "bg-red-50 text-red-600 border border-red-200"
          )}>
            {message}
          </div>
        )}
        
        <div className="space-y-3">
          <button
            onClick={handleResendEmail}
            disabled={countdown > 0 || loading || !email}
            className={cn(
              "w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all",
              (countdown > 0 || loading || !email)
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-surface border border-border text-text-2 hover:bg-bg"
            )}
          >
            {loading
              ? "Envoi en cours..."
              : countdown > 0
              ? `Renvoyer l'email (${countdown}s)`
              : "Renvoyer l'email"}
          </button>
          
          <Link
            href="/register"
            className="block text-sm text-accent hover:text-accent/80 transition-colors"
          >
            Modifier mon email
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-[11px] text-text-3">
            Vous n'avez pas reçu l'email ? Vérifiez vos spams ou
            <button
              onClick={handleResendEmail}
              disabled={countdown > 0 || loading}
              className="ml-1 text-accent hover:underline disabled:text-gray-400"
            >
              renvoyez un nouveau lien
            </button>
          </p>
        </div>
      </div>
    );
  };

  return (
    <AuthShell
      left={
        <LeftPanel
          svgContent={<VerifySVG />}
          tag="Vérification"
          title="Confirmez votre adresse email"
          subtitle="Activez votre compte pour accéder à toutes les fonctionnalités de la plateforme."
        />
      }
      right={
        <RightPanel>
          <div className="max-w-md mx-auto w-full">
            {renderContent()}
          </div>
        </RightPanel>
      }
    />
  );
}