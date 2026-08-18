"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { RAISON_REFUS_LABELS, type ResultatVerification } from "@/lib/services/verification-rules";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface VerificationResponse {
  resultat: ResultatVerification;
  vehicule: { immatriculation: string; marque: string; modele: string } | null;
  client: { nom: string } | null;
  derogeParNom: string | null;
}

const RETOUR_AUTO_MS = 8000;

export function VerificationScanner() {
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [resultat, setResultat] = useState<VerificationResponse | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const derniereScanRef = useRef<{ code: string; at: number } | null>(null);

  const verifier = useCallback(async (rawCode: string) => {
    const trimmed = rawCode.trim();
    if (!trimmed || pending) return;

    setPending(true);
    setErreur(null);
    try {
      const response = await fetch("/api/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setErreur(body?.error ?? "Erreur de vérification");
        setPending(false);
        return;
      }
      const data = (await response.json()) as VerificationResponse;
      setResultat(data);
    } catch {
      setErreur("Connexion au serveur impossible");
    } finally {
      setPending(false);
      setCode("");
    }
  }, [pending]);

  const reinitialiser = useCallback(() => {
    setResultat(null);
    setErreur(null);
    setCode("");
    derniereScanRef.current = null;
    inputRef.current?.focus();
  }, []);

  // Retour automatique au scan après un résultat
  useEffect(() => {
    if (!resultat) return;
    const timeout = setTimeout(reinitialiser, RETOUR_AUTO_MS);
    return () => clearTimeout(timeout);
  }, [resultat, reinitialiser]);

  // Auto-focus permanent du champ de saisie manuelle
  useEffect(() => {
    if (!resultat) {
      inputRef.current?.focus();
    }
  }, [resultat]);

  // Scanner caméra
  useEffect(() => {
    if (resultat) return;
    let cancelled = false;

    import("html5-qrcode").then(({ Html5Qrcode }) => {
      if (cancelled) return;
      const instance = new Html5Qrcode("verification-camera");
      scannerRef.current = instance;

      instance
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            const now = Date.now();
            const derniere = derniereScanRef.current;
            if (derniere && derniere.code === decodedText && now - derniere.at < RETOUR_AUTO_MS) {
              return;
            }
            derniereScanRef.current = { code: decodedText, at: now };
            void verifier(decodedText);
          },
          () => {
            // ignoré : absence de QR dans la frame courante
          },
        )
        .catch(() => {
          // pas de caméra disponible : la saisie manuelle reste utilisable
        });
    });

    return () => {
      cancelled = true;
      const instance = scannerRef.current;
      if (instance) {
        instance
          .stop()
          .then(() => instance.clear())
          .catch(() => {});
        scannerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultat]);

  if (resultat) {
    return <ResultatPleinEcran resultat={resultat} onRetour={reinitialiser} />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6 text-center">
      <h1 className="text-3xl font-semibold">Vérification de sortie</h1>
      <p className="text-muted-foreground">Scannez le QR code du bon de sortie ou saisissez son numéro</p>

      <form
        className="w-full max-w-sm space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          void verifier(code);
        }}
      >
        <Input
          ref={inputRef}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Numéro du bon (ex. BS-2026-0001)"
          autoFocus
          className="h-14 text-center text-xl"
          disabled={pending}
        />
        <Button type="submit" className="h-12 w-full text-lg" disabled={pending || !code.trim()}>
          {pending ? "Vérification..." : "Vérifier"}
        </Button>
        {erreur && <p className="text-sm text-destructive">{erreur}</p>}
      </form>

      <div id="verification-camera" className="w-full max-w-sm overflow-hidden rounded-lg" />
    </div>
  );
}

function ResultatPleinEcran({
  resultat,
  onRetour,
}: {
  resultat: VerificationResponse;
  onRetour: () => void;
}) {
  const { resultat: verdict, vehicule, client, derogeParNom } = resultat;

  const couleur =
    verdict.type === "AUTORISE" ? (verdict.derogation ? "bg-orange-500" : "bg-emerald-600") : "bg-red-600";

  return (
    <button
      type="button"
      onClick={onRetour}
      className={`flex min-h-screen w-full flex-col items-center justify-center gap-6 p-10 text-center text-white ${couleur}`}
    >
      {verdict.type === "AUTORISE" ? (
        <>
          <p className="text-5xl font-bold uppercase tracking-wide">
            Sortie autorisée{verdict.derogation ? " — dérogation" : ""}
          </p>
          {vehicule && <p className="text-8xl font-extrabold">{vehicule.immatriculation}</p>}
          {vehicule && (
            <p className="text-3xl">
              {vehicule.marque} {vehicule.modele}
            </p>
          )}
          {client && <p className="text-2xl">{client.nom}</p>}
          {verdict.derogation && (
            <p className="text-2xl font-medium">
              Non payé — autorisé par {derogeParNom ?? "un administrateur"}
            </p>
          )}
        </>
      ) : (
        <>
          <p className="text-5xl font-bold uppercase tracking-wide">Sortie refusée</p>
          <p className="text-3xl">{RAISON_REFUS_LABELS[verdict.raison]}</p>
          {vehicule && (
            <p className="text-xl opacity-90">
              {vehicule.immatriculation} — {vehicule.marque} {vehicule.modele}
            </p>
          )}
        </>
      )}
      <p className="mt-4 text-lg opacity-80">Touchez l&apos;écran pour scanner un autre bon</p>
      <p className="text-sm opacity-60">
        Retour automatique dans quelques secondes — {format(new Date(), "HH:mm:ss", { locale: fr })}
      </p>
    </button>
  );
}
