"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  linkWithCredential,
  PhoneAuthProvider,
  RecaptchaVerifier,
} from "firebase/auth";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { auth } from "@/lib/firebase";
import type { AccountOverview, Language } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useI18n } from "@/components/providers/i18n-provider";
import { firebaseErrorMessage } from "@/lib/firebase-errors";
import { CONSENT_POLICY_VERSION } from "@/lib/policy";
import { toast } from "@/lib/toast";

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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const data = account.data;
  async function saveProfile() {
    setBusy(true);
    try {
      await apiRequest("/api/v1/account/me", {
        method: "PATCH",
        body: JSON.stringify({
          display_name: name || undefined,
          preferred_language: language || undefined,
        }),
        toast: { success: "Profile updated." },
      });
      await client.invalidateQueries({ queryKey: ["account"] });
    } catch (nextError) {
      toast.error(
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
    try {
      await apiRequest("/api/v1/account/consents", {
        method: "POST",
        body: JSON.stringify({
          consent_type: "study_reminders",
          granted: value,
          policy_version: CONSENT_POLICY_VERSION,
        }),
        toast: {
          success: value
            ? "Study reminders enabled."
            : "Study reminders disabled.",
        },
      });
    } catch (nextError) {
      setReminders(previous);
      toast.error(
        nextError instanceof Error
          ? nextError.message
          : "Could not save reminder preferences.",
      );
    }
  }
  async function sendCode() {
    if (!phone.startsWith("+")) {
      toast.error("Use international format, for example +2348012345678.");
      return;
    }
    setBusy(true);
    try {
      const verifier = new RecaptchaVerifier(auth, "phone-recaptcha", {
        size: "invisible",
      });
      const provider = new PhoneAuthProvider(auth);
      const id = await provider.verifyPhoneNumber(phone, verifier);
      setVerificationId(id);
      toast.success("Verification code sent.");
    } catch (nextError) {
      toast.error(
        firebaseErrorMessage(
          nextError,
          "Could not send the verification code.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  async function verifyCode() {
    if (!auth.currentUser) return;
    setBusy(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await linkWithCredential(auth.currentUser, credential);
      await auth.currentUser.getIdToken(true);
      await apiRequest("/api/v1/account/link-phone", {
        method: "POST",
        toast: {
          success: "WhatsApp number connected to this account.",
        },
      });
      await client.invalidateQueries({ queryKey: ["account"] });
      setVerificationId("");
    } catch (nextError) {
      toast.error(
        firebaseErrorMessage(
          nextError,
          nextError instanceof Error
            ? nextError.message
            : "Could not verify the number.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  async function deleteAccount() {
    setBusy(true);
    try {
      await apiRequest("/api/v1/account/me/soft", {
        method: "DELETE",
        body: JSON.stringify({ confirmation }),
        toast: { success: "Account deleted." },
      });
      await auth.signOut();
      window.location.href = "/";
    } catch (nextError) {
      toast.error(
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
        <h2 className="text-xl font-black text-[#032e4d]">Connect WhatsApp</h2>
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
              <div className="pt-2">
                <Button
                  className="w-full sm:w-auto"
                  onClick={sendCode}
                  disabled={busy || !phone}
                >
                  Send code
                </Button>
              </div>
            )}
            <div id="phone-recaptcha" />
          </div>
        )}
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
        <h2 className="text-xl font-black text-red-900">Account deletion</h2>
        <p className="mt-2 text-sm leading-6 text-red-800">
          Deleting your account signs you out and removes access to 10Trials.
          You can restore it later if you change your mind.
        </p>
        <div className="mt-5">
          <Button
            variant="danger"
            onClick={() => {
              setDeleteOpen(true);
              setConfirmation("");
            }}
          >
            Delete account
          </Button>
        </div>
      </section>
      <Modal
        open={deleteOpen}
        title="Delete account?"
        onClose={() => setDeleteOpen(false)}
      >
        <div className="flex gap-3 rounded-xl bg-amber-50 p-4 text-amber-900">
          <AlertTriangle className="shrink-0" />
          <p className="text-sm leading-6">
            You’ll be signed out after confirming. You can restore your account
            by signing in again.
          </p>
        </div>
        <label className="mt-5 block">
          <span className="field-label">Type DELETE to confirm</span>
          <input
            className="field"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </label>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={busy || confirmation !== "DELETE"}
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
