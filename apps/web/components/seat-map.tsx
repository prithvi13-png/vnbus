"use client";

import { useState } from "react";
import Link from "next/link";
import { Armchair, CheckCircle2 } from "lucide-react";
import { Button, cn } from "@vnbus/ui";

const seats = Array.from({ length: 24 }, (_, index) => {
  const seatNumber = `${Math.floor(index / 4) + 1}${String.fromCharCode(65 + (index % 4))}`;

  return {
    seatNumber,
    blocked: ["2B", "3C", "5A", "6D"].includes(seatNumber),
  };
});

export function SeatMap(): React.JSX.Element {
  const [selectedSeats, setSelectedSeats] = useState<string[]>(["1A"]);

  const toggleSeat = (seatNumber: string): void => {
    setSelectedSeats((current) =>
      current.includes(seatNumber)
        ? current.filter((seat) => seat !== seatNumber)
        : [...current, seatNumber].slice(0, 6),
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="mb-5 flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <p className="text-sm font-semibold text-gray-950">Lower Deck</p>
            <p className="text-xs text-gray-500">AC Sleeper 2+1</p>
          </div>
          <span className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            Driver
          </span>
        </div>
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-3">
          {seats.map((seat) => {
            const selected = selectedSeats.includes(seat.seatNumber);

            return (
              <button
                key={seat.seatNumber}
                type="button"
                disabled={seat.blocked}
                onClick={() => toggleSeat(seat.seatNumber)}
                className={cn(
                  "flex aspect-[1.3] min-h-16 flex-col items-center justify-center rounded-md border text-xs font-semibold transition-colors",
                  seat.blocked && "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400",
                  !seat.blocked &&
                    !selected &&
                    "border-gray-300 bg-white text-gray-700 hover:border-gold-200 hover:bg-gold-50",
                  selected && "border-gold-600 bg-gold-600 text-white",
                )}
                aria-pressed={selected}
              >
                <Armchair className="mb-1 h-4 w-4" aria-hidden="true" />
                {seat.seatNumber}
              </button>
            );
          })}
        </div>
      </div>
      <aside className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-gray-950">Selection</h2>
        <div className="mt-4 grid gap-3 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Seats</span>
            <span className="font-medium text-gray-950">{selectedSeats.join(", ")}</span>
          </div>
          <div className="flex justify-between">
            <span>Fare</span>
            <span className="font-medium text-gray-950">
              INR {(selectedSeats.length * 1450).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
        <Button asChild className="mt-5 w-full" disabled={!selectedSeats.length}>
          <Link href="/passenger-details">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Continue
          </Link>
        </Button>
      </aside>
    </div>
  );
}
