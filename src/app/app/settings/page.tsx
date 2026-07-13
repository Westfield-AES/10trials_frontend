"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  linkWithCredential,
  PhoneAuthProvider,
  RecaptchaVerifier,
} from "firebase/auth";
import {
  AlertTriangle,
  MessageCircle,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { auth } from "@/lib/firebase";
import type { AccountOverview, Language } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useI18n } from "@/components/providers/i18n-provider";
import { firebaseErrorMessage } from "@/lib/firebase-errors";

export default function SettingsPage() {
  const { t } = useI18n();
  const client = useQueryClient();
  const account = useQuery({
    queryKey: ["account"],
    queryFn: () => apiRequest<AccountOverview>("/api/v1/account/me"),
  });
  const [name, setName] = useState("");
  const [language, setLanguage] = useState<Language | "">("");
  const [reminders, setReminders] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [deleteType, setDeleteType] = useState<"soft" | "hard" | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const data = account.data;
  async function saveProfile() {
    setBusy(true);
    setError("");
    try {
      await apiRequest("/api/v1/account/me", {
        method: "PATCH",
        body: JSON.stringify({
          display_name: name || undefined,
          preferred_language: language || undefined,
        }),
      });
      await client.invalidateQueries({ queryKey: ["account"] });
      setMessage("Profile updated.");
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Could not update profile.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function saveReminders(value: boolean) {
    const previous = reminders;
    setReminders(value);
    setError("");
    try {
      await apiRequest("/api/v1/account/consents", {
        method: "POST",
        body: JSON.stringify({
          consent_type: "study_reminders",
          granted: value,
          policy_version: "v1-placeholder",
        }),
      });
    } catch (nextError) {
      setReminders(previous);
      setError(nextError instanceof Error ? nextError.message : "Could not save reminder preferences.");
    }
  }
  async function sendCode() {
    if (!phone.startsWith("+")) {
      setError("Use international format, for example +2348012345678.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const verifier = new RecaptchaVerifier(auth, "phone-recaptcha", {
        size: "invisible",
      });
      const provider = new PhoneAuthProvider(auth);
      const id = await provider.verifyPhoneNumber(phone, verifier);
      setVerificationId(id);
      setMessage("Verification code sent.");
    } catch (nextError) {
      setError(firebaseErrorMessage(nextError, "Could not send the verification code."));
    } finally {
      setBusy(false);
    }
  }
  async function verifyCode() {
    if (!auth.currentUser) return;
    setBusy(true);
    setError("");
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await linkWithCredential(auth.currentUser, credential);
      await auth.currentUser.getIdToken(true);
      await apiRequest("/api/v1/account/link-phone", { method: "POST" });
      await client.invalidateQueries({ queryKey: ["account"] });
      setMessage("WhatsApp number connected to this account.");
      setVerificationId("");
    } catch (nextError) {
      setError(firebaseErrorMessage(nextError, nextError instanceof Error ? nextError.message : "Could not verify the number."));
    } finally {
      setBusy(false);
    }
  }
  async function deleteAccount() {
    if (!deleteType) return;
    setBusy(true);
    setError("");
    try {
      const path =
        deleteType === "soft"
          ? "/api/v1/account/me/soft"
          : "/api/v1/account/me/hard";
      await apiRequest(path, {
        method: "DELETE",
        body: JSON.stringify({ confirmation }),
      });
      await auth.signOut();
      window.location.href = "/";
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Could not delete account.",
      );
      setBusy(false);
    }
  }
  return (
    <div className="mx-auto max-w-4xl">
      <p className="eyebrow">Account</p>
      <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-[#032e4d]">
        {t("settings")}
      </h1>
      <p className="mt-2 text-[#607282]">
        Manage your profile, communication, and data.
      </p>
      {message && (
        <p
          role="status"
          className="mt-5 rounded-xl bg-emerald-50 p-4 font-bold text-emerald-800"
        >
          {message}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-red-50 p-4 font-bold text-red-700"
        >
          {error}
        </p>
      )}
      <section className="card mt-7 p-6">
        <h2 className="text-xl font-black text-[#032e4d]">Profile</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label>
            <span className="field-label">Display name</span>
            <input
              className="field"
              placeholder={data?.user.display_name || "Your name"}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label>
            <span className="field-label">{t("studyLanguage")}</span>
            <select
              className="field"
              value={language || data?.user.preferred_language || "en"}
              onChange={(event) => setLanguage(event.target.value as Language)}
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="pt">Português</option>
            </select>
          </label>
        </div>
        <Button className="mt-5" onClick={saveProfile} disabled={busy}>
          Save changes
        </Button>
      </section>
      <section className="card mt-6 p-6">
        <div className="flex gap-4">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e9f8f0] text-[#17885b]">
            <MessageCircle />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-black text-[#032e4d]">
              Connect WhatsApp
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#607282]">
              Optional. Verify the number you use on WhatsApp so both interfaces
              share this account, usage, and history.
            </p>
            {data?.user.phone_verified ? (
              <p className="mt-4 font-black text-[#17885b]">
                Connected: {data.user.phone}
              </p>
            ) : (
              <div className="mt-5 max-w-md space-y-3">
                <label>
                  <span className="field-label">Phone number</span>
                  <input
                    className="field"
                    placeholder="+234…"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </label>
                {verificationId ? (
                  <>
                    <label>
                      <span className="field-label">Verification code</span>
                      <input
                        className="field"
                        inputMode="numeric"
                        value={code}
                        onChange={(event) => setCode(event.target.value)}
                      />
                    </label>
                    <Button onClick={verifyCode} disabled={busy || !code}>
                      Verify and connect
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={sendCode}
                    disabled={busy || !phone}
                  >
                    Send code
                  </Button>
                )}
                <div id="phone-recaptcha" />
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="card mt-6 p-6">
        <h2 className="text-xl font-black text-[#032e4d]">Email preferences</h2>
        <label className="mt-5 flex items-start gap-3 rounded-xl bg-[#f4f8fa] p-4">
          <input
            type="checkbox"
            checked={reminders}
            onChange={(event) => saveReminders(event.target.checked)}
          />
          <span>
            <strong>Study reminders</strong>
            <span className="mt-1 block text-sm text-[#607282]">
              Occasional encouragement and reminders through Brevo. You can
              unplug these anytime.
            </span>
          </span>
        </label>
      </section>
      <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex gap-4">
          <Trash2 className="shrink-0 text-red-700" />
          <div>
            <h2 className="text-xl font-black text-red-900">
              Account deletion
            </h2>
            <p className="mt-2 text-sm leading-6 text-red-800">
              Soft deletion gives you 30 days to restore the account. Hard
              deletion permanently removes identifiable learning data while
              retaining anonymous aggregates and required payment records.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setDeleteType("soft");
                  setConfirmation("");
                }}
              >
                Schedule deletion
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setDeleteType("hard");
                  setConfirmation("");
                }}
              >
                Delete permanently
              </Button>
            </div>
          </div>
        </div>
      </section>
      <Modal
        open={Boolean(deleteType)}
        title={
          deleteType === "hard"
            ? "Permanently delete account?"
            : "Schedule account deletion?"
        }
        onClose={() => setDeleteType(null)}
      >
        <div className="flex gap-3 rounded-xl bg-amber-50 p-4 text-amber-900">
          <AlertTriangle className="shrink-0" />
          <p className="text-sm leading-6">
            This action requires a recent login.{" "}
            {deleteType === "soft"
              ? "You can restore within 30 days."
              : "Permanent deletion cannot be undone."}
          </p>
        </div>
        <label className="mt-5 block">
          <span className="field-label">
            Type {deleteType === "hard" ? "DELETE MY ACCOUNT" : "DELETE"}
          </span>
          <input
            className="field"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </label>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteType(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={
              busy ||
              confirmation !==
                (deleteType === "hard" ? "DELETE MY ACCOUNT" : "DELETE")
            }
            onClick={deleteAccount}
          >
            Confirm deletion
          </Button>
        </div>
      </Modal>
      <div className="mt-6 flex items-center gap-2 text-xs text-[#607282]">
        <ShieldCheck size={16} />
        10Trials never stores your password or payment-card details.
      </div>
    </div>
  );
}
