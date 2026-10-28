"use client";

import { formatAED } from "@/lib/utils";

/** Code 39-style barcode: deterministic bars from the order id. */
function Barcode({ code, width = 220, height = 46 }: { code: string; width?: number; height?: number }) {
  const bars: number[] = [];
  for (const ch of code) {
    const v = ch.charCodeAt(0);
    bars.push(1 + (v % 3), 1 + ((v >> 2) % 2), 1 + ((v >> 4) % 3), 1);
  }
  const total = bars.reduce((a, b) => a + b, 0);
  const unit = width / total;
  let x = 0;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      {bars.map((w, i) => {
        const el = i % 2 === 0 ? <rect key={i} x={x} y={0} width={w * unit} height={height} fill="currentColor" /> : null;
        x += w * unit;
        return el;
      })}
    </svg>
  );
}

export interface Order {
  id: string;
  name: string;
  items: Array<{ title: string; detail: string; price: number }>;
  total: number;
  doorTime: string;
  date: string;
}

export function TicketStub({ order }: { order: Order }) {
  return (
    <div className="mx-auto max-w-[460px]">
      <div className="relative bg-[#f5efdf] text-ink shadow-[0_18px_40px_-18px_rgba(0,0,0,0.5)] rotate-[-1.2deg]">
        {/* perforation */}
        <div className="absolute inset-y-0 left-[118px] w-0 border-l-2 border-dashed border-ink/30" aria-hidden />
        <div className="absolute -left-[7px] top-[-7px] w-[14px] h-[14px] rounded-full bg-paper" style={{ left: 111 }} aria-hidden />
        <div className="absolute -left-[7px] bottom-[-7px] w-[14px] h-[14px] rounded-full bg-paper" style={{ left: 111 }} aria-hidden />
        <div className="flex">
          {/* stub */}
          <div className="w-[118px] shrink-0 p-4 flex flex-col items-center justify-between border-r border-transparent">
            <div className="font-display font-extrabold text-[18px] tracking-[0.28em] -mr-[0.28em]" style={{ fontVariationSettings: "'wdth' 78" }}>
              NOMAD
            </div>
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-center leading-relaxed">
              Admit<br />one
            </div>
            <div className="[writing-mode:vertical-rl] rotate-180 font-mono text-[9px] tracking-[0.16em] uppercase text-ink-soft">
              {order.id}
            </div>
            <div className="stamp stamp-box text-[9px]">Paid at door</div>
          </div>
          {/* main */}
          <div className="flex-1 p-5">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-soft">Receipt · demo</div>
                <div className="font-display font-extrabold text-[22px] leading-none mt-1" style={{ fontVariationSettings: "'wdth' 84" }}>
                  The Backroom
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] mt-1">NOMAD · 1am rack · Al Quoz</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-soft">Doors</div>
                <div className="font-display font-extrabold text-[22px] leading-none" style={{ fontVariationSettings: "'wdth' 84" }}>
                  {order.doorTime}
                </div>
                <div className="font-mono text-[10px] mt-1">{order.date}</div>
              </div>
            </div>
            <div className="my-3 border-t border-dashed border-ink/30" />
            <ul className="flex flex-col gap-1.5">
              {order.items.map((it, i) => (
                <li key={i} className="flex justify-between gap-3 font-mono text-[11px]">
                  <span>
                    <span className="uppercase">{it.title}</span>
                    <span className="block text-[9.5px] text-ink-soft">{it.detail}</span>
                  </span>
                  <span className="tabular-nums">{formatAED(it.price)}</span>
                </li>
              ))}
            </ul>
            <div className="my-3 border-t border-dashed border-ink/30" />
            <div className="flex justify-between items-baseline">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em]">Total · {order.name}</span>
              <span className="font-display font-extrabold text-[20px] tabular-nums">{formatAED(order.total)}</span>
            </div>
            <div className="mt-3 text-ink">
              <Barcode code={order.id} />
              <div className="font-mono text-[9px] tracking-[0.3em] mt-1">{order.id}</div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "url(#paperGrain)" }} aria-hidden />
      </div>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-soft text-center mt-6">
        Demo only. No payment was taken and nothing ships.
      </p>
    </div>
  );
}
