"use client";

import { useId, useState } from "react";
import { ArrowRight, Check, CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const options = [
  ["A", "One larger EC2 instance in a single Availability Zone"],
  [
    "B",
    "An Auto Scaling group across multiple Availability Zones behind an Application Load Balancer",
  ],
  [
    "C",
    "Multiple EC2 instances in one Availability Zone with nightly snapshots",
  ],
  ["D", "One EC2 instance with two attached EBS volumes"],
];

export function PracticePreview() {
  const name = useId();
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div
        aria-hidden="true"
        className="absolute -inset-3 rotate-2 rounded-[2rem] border border-[#dce5eb] bg-[#eaf0f4] sm:-inset-4"
      />
      <section
        aria-label="Interactive practice preview"
        className="relative overflow-hidden rounded-3xl border border-[#dce5eb] bg-white shadow-[0_20px_60px_-20px_rgba(3,46,77,0.22)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#dce5eb] bg-[#032e4d] px-5 py-4 text-white sm:px-6">
          <span className="text-sm font-bold">
            A little practice, right here.
          </span>
          <span className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-[#dcebf4]">
            Interactive preview
          </span>
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-[#607282]">
              AWS Solutions Architect
            </span>
            <span className="shrink-0 rounded-full bg-[#edf3f6] px-2.5 py-1 font-semibold text-[#07436c]">
              Learn mode
            </span>
          </div>
          <div aria-hidden="true" className="mt-4 flex gap-1.5">
            {Array.from({ length: 10 }, (_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full ${i < 3 ? "bg-[#ff6b00]" : "bg-[#e7eef3]"}`}
              />
            ))}
          </div>
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#b94700]">
            Resilient architectures · Question 3 of 10
          </p>
          <h2 className="mt-2 text-base font-semibold leading-7 text-[#032e4d]">
            A web app must stay available if one Availability Zone fails. Which
            architecture works best?
          </h2>
          <fieldset className="mt-4 space-y-2">
            <legend className="sr-only">Try choosing an answer</legend>
            {options.map(([letter, text]) => (
              <label
                key={letter}
                className={`answer-option flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${answer === letter ? "border-[#e85b00] bg-[#fff0e5]" : "border-[#dce5eb] hover:bg-[#f7f9fb]"}`}
              >
                <input
                  type="radio"
                  name={name}
                  value={letter}
                  checked={answer === letter}
                  onChange={() => {
                    setAnswer(letter);
                    setChecked(false);
                  }}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`grid size-6 shrink-0 place-items-center rounded-md text-xs font-bold ${answer === letter ? "bg-[#e85b00] text-white" : "bg-[#edf3f6] text-[#526877]"}`}
                >
                  {checked && letter === "B" && answer === "B" ? (
                    <Check size={14} />
                  ) : (
                    letter
                  )}
                </span>
                <span className="text-xs leading-5 text-[#435766]">{text}</span>
              </label>
            ))}
          </fieldset>
          {checked ? (
            <div
              role="status"
              className={`mt-4 rounded-xl p-4 ${answer === "B" ? "bg-[#e9f8f0] text-[#13734d]" : "bg-[#fff0e5] text-[#a94100]"}`}
            >
              <p className="flex items-center gap-2 text-sm font-bold">
                <CheckCircle2 size={16} />
                {answer === "B"
                  ? "You’ve got it!"
                  : "A chance to learn. The answer is B."}
              </p>
              <p className="mt-2 text-xs leading-5">
                Multiple Availability Zones remove a single-zone failure point.
                The load balancer routes traffic to healthy instances.
              </p>
              <button
                type="button"
                onClick={() => {
                  setAnswer("");
                  setChecked(false);
                }}
                className="mt-2 inline-flex min-h-11 items-center gap-2 text-xs font-bold"
              >
                <RotateCcw size={13} /> Try again
              </button>
            </div>
          ) : (
            <Button
              onClick={() => setChecked(true)}
              disabled={!answer}
              className="mt-4 w-full"
            >
              Check answer <ArrowRight size={16} />
            </Button>
          )}
          <p className="mt-4 text-center text-[10px] text-[#607282]">
            A sample question. Your sessions are tailored to your exam.
          </p>
        </div>
      </section>
    </div>
  );
}
