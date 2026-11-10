"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { apiRequest } from "@/lib/api";
import { toast } from "@/lib/toast";

const labels = {
  en: {
    title: "Report a problem",
    reason: "Problem",
    incorrect_answer: "Incorrect answer or explanation",
    unclear: "Unclear or ambiguous question",
    outdated: "Outdated information",
    other: "Another issue",
    comment: "Details (optional)",
    send: "Send report",
    sending: "Sending…",
    cancel: "Cancel",
    success: "Thanks—your report has been recorded.",
    duplicate: "You have already reported this question.",
    error: "Your report could not be sent. Please try again.",
    timer: "Your exam timer keeps running.",
  },
  fr: {
    title: "Signaler un problème",
    reason: "Problème",
    incorrect_answer: "Réponse ou explication incorrecte",
    unclear: "Question peu claire ou ambiguë",
    outdated: "Informations obsolètes",
    other: "Autre problème",
    comment: "Précisions (facultatif)",
    send: "Envoyer le signalement",
    sending: "Envoi…",
    cancel: "Annuler",
    success: "Merci, votre signalement a été enregistré.",
    duplicate: "Vous avez déjà signalé cette question.",
    error: "Le signalement n’a pas pu être envoyé. Veuillez réessayer.",
    timer: "Le chronomètre de l’examen continue.",
  },
  es: {
    title: "Informar de un problema",
    reason: "Problema",
    incorrect_answer: "Respuesta o explicación incorrecta",
    unclear: "Pregunta poco clara o ambigua",
    outdated: "Información desactualizada",
    other: "Otro problema",
    comment: "Detalles (opcional)",
    send: "Enviar informe",
    sending: "Enviando…",
    cancel: "Cancelar",
    success: "Gracias. Hemos registrado tu informe.",
    duplicate: "Ya has informado de esta pregunta.",
    error: "No se ha podido enviar el informe. Inténtalo de nuevo.",
    timer: "El cronómetro del examen sigue corriendo.",
  },
  pt: {
    title: "Comunicar um problema",
    reason: "Problema",
    incorrect_answer: "Resposta ou explicação incorreta",
    unclear: "Pergunta pouco clara ou ambígua",
    outdated: "Informações desatualizadas",
    other: "Outro problema",
    comment: "Detalhes (opcional)",
    send: "Enviar comunicação",
    sending: "A enviar…",
    cancel: "Cancelar",
    success: "Obrigado. A sua comunicação foi registada.",
    duplicate: "Já comunicou um problema nesta pergunta.",
    error: "Não foi possível enviar. Tente novamente.",
    timer: "O cronómetro do exame continua a contar.",
  },
};
type Reason = "incorrect_answer" | "unclear" | "outdated" | "other";

export function ReportQuestionButton({
  sessionId,
  questionIndex,
  timerRunning = false,
  disabled = false,
}: {
  sessionId: string;
  questionIndex: number;
  timerRunning?: boolean;
  disabled?: boolean;
}) {
  const { locale } = useI18n();
  const text = labels[locale];
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<Reason>("incorrect_answer");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reasonId = `question-report-reason-${sessionId}-${questionIndex}`;
  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await apiRequest<{
        id: string;
        already_reported: boolean;
      }>(`/api/v1/sessions/${sessionId}/question-reports`, {
        method: "POST",
        body: JSON.stringify({
          question_index: questionIndex,
          reason,
          comment: comment.trim(),
        }),
        toast: { error: false },
      });
      setOpen(false);
      setComment("");
      toast.success(result.already_reported ? text.duplicate : text.success);
    } catch {
      setError(text.error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-lg py-1.5 text-xs font-bold text-[#607282] underline-offset-4 hover:text-[#b94700] hover:underline disabled:opacity-50"
        disabled={disabled}
        aria-label={`${text.title} — Q${questionIndex}`}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        <AlertCircle size={14} />
        {text.title}
      </button>
      <Modal
        open={open}
        title={`${text.title} · Q${questionIndex}`}
        onClose={() => {
          if (!busy) setOpen(false);
        }}
      >
        <form onSubmit={send}>
          {timerRunning && (
            <p className="text-sm font-bold text-amber-800">{text.timer}</p>
          )}
          <label
            className="mt-4 block text-sm font-bold text-[#032e4d]"
            htmlFor={reasonId}
          >
            {text.reason}
          </label>
          <select
            id={reasonId}
            className="mt-2 w-full rounded-xl border border-[#c8d5dd] bg-white p-3 text-sm"
            value={reason}
            onChange={(event) => setReason(event.target.value as Reason)}
            disabled={busy}
          >
            {(
              ["incorrect_answer", "unclear", "outdated", "other"] as const
            ).map((value) => (
              <option key={value} value={value}>
                {text[value]}
              </option>
            ))}
          </select>
          <label
            className="mt-4 block text-sm font-bold text-[#032e4d]"
            htmlFor={`${reasonId}-details`}
          >
            {text.comment}
          </label>
          <textarea
            id={`${reasonId}-details`}
            className="mt-2 min-h-28 w-full rounded-xl border border-[#c8d5dd] p-3 text-sm"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={1000}
            disabled={busy}
          />
          {error && (
            <p className="mt-3 text-sm font-bold text-red-700" role="alert">
              {error}
            </p>
          )}
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => setOpen(false)}
            >
              {text.cancel}
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? text.sending : text.send}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
