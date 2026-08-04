import * as React from "react";
import { Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type TimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

export function TimePicker({ value, onChange, placeholder = "Pick a time", className }: TimePickerProps) {
  const [hour, minute] = value ? value.split(":") : ["", ""];

  const setPart = (part: "hour" | "minute", val: string) => {
    const nextHour = part === "hour" ? val : hour || "00";
    const nextMinute = part === "minute" ? val : minute || "00";
    onChange(`${nextHour}:${nextMinute}`);
  };

  const display = value ? `${value} (24h)` : placeholder;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start rounded-lg border border-input bg-secondary/60 px-3 py-2 text-sm font-normal text-foreground hover:bg-secondary/80 hover:text-foreground",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <Clock className="mr-2 h-4 w-4 text-primary" />
          {display}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="pointer-events-auto flex gap-3 rounded-md border border-border bg-card p-3 shadow-glow">
          <div className="flex flex-col gap-1.5">
            <span className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">Hour</span>
            <div className="h-56 overflow-y-auto rounded-md border border-border bg-secondary/40 pr-1">
              <div className="flex flex-col p-1">
                {HOURS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setPart("hour", h)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm transition-colors text-left",
                      h === hour
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-secondary",
                    )}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">Min</span>
            <div className="h-56 overflow-y-auto rounded-md border border-border bg-secondary/40 pr-1">
              <div className="flex flex-col p-1">
                {MINUTES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPart("minute", m)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm transition-colors text-left",
                      m === minute
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-secondary",
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
