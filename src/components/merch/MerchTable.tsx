"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Trash2 } from "lucide-react";
import { useNomad } from "@/components/state/store";
import { TEE_BY_ID, bandOf } from "@/lib/data/tees";
import { COLOURWAYS } from "@/lib/data/colourways";
import { Garment } from "@/components/garment/Garment";
import { ageFactor, gradeFor } from "@/lib/ageing";
import { TicketStub, type Order } from "./TicketStub";
import { cn, formatAED } from "@/lib/utils";

type Step = "table" | "details" | "stub";

function stampOrder() {
  const now = new Date();
  const id = `NMD-${now.getTime().toString(36).toUpperCase().slice(-5)}-${Math.floor(Math.random() * 900 + 100)}`;
  const date = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  return { id, date };
}

export function MerchTable({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, removeFromTable, clearTable } = useNomad();
  const [step, setStep] = useState<Step>("table");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const total = cart.reduce((a, c) => a + TEE_BY_ID[c.teeId].price, 0);

  const placeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const { id, date } = stampOrder();
    const o: Order = {
      id,
      name: name.trim() || "Walk-in",
      items: cart.map((c) => {
        const t = TEE_BY_ID[c.teeId];
        return {
          title: `${bandOf(t).name} · ${bandOf(t).tour}`,
          detail: `${COLOURWAYS[c.colourway].name} · size ${c.size} · ${gradeFor(c.years)}`,
          price: t.price,
        };
      }),
      total,
      doorTime: "01:00",
      date,
    };
    setOrder(o);
    setStep("stub");
    clearTable();
  };

  const reset = () => {
    setStep("table");
    setOrder(null);
    setName("");
    setEmail("");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[70] bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} aria-hidden />
          <motion.aside
            className="fixed z-[71] inset-y-0 right-0 w-full sm:w-[520px] bg-paper flex flex-col shadow-[-20px_0_60px_-30px_rgba(0,0,0,0.5)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label="Merch table"
          >
            <header className="flex items-start justify-between px-6 pt-6 pb-4">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">{step === "stub" ? "Your stub" : "Merch table"}</div>
                <h2 className="font-display font-extrabold text-[28px] leading-none tracking-tight mt-1" style={{ fontVariationSettings: "'wdth' 84, 'opsz' 60" }}>
                  {step === "table" ? "On the table" : step === "details" ? "Hold at the door" : "See you at doors"}
                </h2>
              </div>
              <button type="button" onClick={onClose} aria-label="Close the merch table" className="w-11 h-11 rounded-full border border-ink/20 bg-paper-lit/80 flex items-center justify-center hover:bg-paper-lit cursor-pointer">
                <X size={18} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 pb-8 pt-3">
              {step === "table" && (
                <>
                  {/* the table surface */}
                  <div className="relative rounded-md bg-[#2a2420] p-4 pt-5 shadow-[inset_0_2px_12px_rgba(0,0,0,0.5)]" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 9px)" }}>
                    <div className="absolute -top-3 left-5 bg-[#f5efdf] text-ink font-mono text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 rotate-[-2deg] shadow">Merch · cash only · demo</div>
                    {cart.length === 0 ? (
                      <div className="h-[180px] flex flex-col items-center justify-center text-center text-[#cfc6b8]">
                        <p className="font-display font-semibold text-[18px]" style={{ fontVariationSettings: "'wdth' 88" }}>
                          Nothing on the table yet.
                        </p>
                        <p className="font-mono text-[11px] uppercase tracking-[0.14em] mt-2 opacity-70">Pick a tee from the rail and a size pass.</p>
                      </div>
                    ) : (
                      <ul className="grid grid-cols-3 gap-3">
                        {cart.map((c, i) => {
                          const t = TEE_BY_ID[c.teeId];
                          return (
                            <motion.li key={c.key} layout initial={{ opacity: 0, y: 12, rotate: -6 }} animate={{ opacity: 1, y: 0, rotate: ((i * 7) % 9) - 4 }} exit={{ opacity: 0, scale: 0.9 }} className="relative aspect-[3/4] rounded-sm bg-[#1f1a17] p-1 shadow-[0_6px_14px_-6px_rgba(0,0,0,0.8)]">
                              <Garment garment={t.garment} colourway={c.colourway} print={t.print} seed={t.seed} age={ageFactor(c.years)} quality="rail" noHanger />
                              <span className="absolute -top-1.5 -right-1.5 pricelabel text-[9px] rotate-6">{formatAED(t.price)}</span>
                            </motion.li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  <ul className="mt-5 flex flex-col divide-y divide-ink/10">
                    {cart.map((c) => {
                      const t = TEE_BY_ID[c.teeId];
                      return (
                        <li key={c.key} className="flex items-center gap-3 py-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-display font-semibold text-[15px] leading-tight truncate" style={{ fontVariationSettings: "'wdth' 90" }}>
                              {bandOf(t).name} <span className="text-ink-soft font-normal">· {bandOf(t).tour}</span>
                            </div>
                            <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-soft mt-0.5">
                              {COLOURWAYS[c.colourway].name} · {c.size} · {gradeFor(c.years)}
                            </div>
                          </div>
                          <span className="font-mono text-[12px] tabular-nums">{formatAED(t.price)}</span>
                          <button type="button" onClick={() => removeFromTable(c.key)} aria-label={`Take ${bandOf(t).name} off the table`} className="w-9 h-9 rounded-full hover:bg-ink/10 flex items-center justify-center cursor-pointer text-ink-soft hover:text-ink">
                            <Trash2 size={15} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  {cart.length > 0 && (
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">Total</div>
                        <div className="font-display font-extrabold text-[24px] tabular-nums leading-none">{formatAED(total)}</div>
                      </div>
                      <button type="button" onClick={() => setStep("details")} className="font-body font-semibold text-[13px] uppercase tracking-[0.1em] px-5 py-3 rounded-full bg-ink text-paper-lit hover:bg-stamp transition-colors cursor-pointer">
                        Hold at the door
                      </button>
                    </div>
                  )}
                </>
              )}

              {step === "details" && (
                <form onSubmit={placeOrder} className="flex flex-col gap-4 max-w-[420px]">
                  <p className="font-mono text-[12px] text-ink-soft leading-relaxed">We hold the tees at the merch table and you pay at the door. This is a demo: nothing is charged, nothing ships.</p>
                  <label className="flex flex-col gap-1">
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">Name on the list</span>
                    <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={cn("font-body text-[15px] px-3 py-2.5 rounded-md bg-paper-lit border border-ink/20 focus:border-stamp outline-none")} placeholder="Who's picking up" />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">Email for the stub</span>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" className="font-body text-[15px] px-3 py-2.5 rounded-md bg-paper-lit border border-ink/20 focus:border-stamp outline-none" placeholder="Optional, not sent anywhere" />
                  </label>
                  <div className="flex items-center justify-between pt-2">
                    <button type="button" onClick={() => setStep("table")} className="font-mono text-[11px] uppercase tracking-[0.14em] underline underline-offset-4 cursor-pointer">
                      Back
                    </button>
                    <button type="submit" className="font-body font-semibold text-[13px] uppercase tracking-[0.1em] px-5 py-3 rounded-full bg-ink text-paper-lit hover:bg-stamp transition-colors cursor-pointer">
                      Print my stub · {formatAED(total)}
                    </button>
                  </div>
                </form>
              )}

              {step === "stub" && order && (
                <div className="pt-4">
                  <TicketStub order={order} />
                  <div className="flex justify-center mt-6">
                    <button type="button" onClick={() => { reset(); onClose(); }} className="font-mono text-[11px] uppercase tracking-[0.14em] underline underline-offset-4 cursor-pointer">
                      Back to the rail
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
