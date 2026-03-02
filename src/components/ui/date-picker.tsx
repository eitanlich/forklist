"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useI18n } from "@/lib/i18n";

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  maxDate?: Date;
  placeholder?: string;
}

export function DatePicker({ value, onChange, maxDate, placeholder = "Pick a date" }: DatePickerProps) {
  const { locale } = useI18n();
  const dateLocale = locale === "es" ? es : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal rounded-xl border-border bg-secondary px-4 py-6 text-sm hover:bg-secondary/80 hover:text-foreground",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP", { locale: dateLocale }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 min-h-[350px]" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={(date) => maxDate ? date > maxDate : false}
          locale={dateLocale}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
