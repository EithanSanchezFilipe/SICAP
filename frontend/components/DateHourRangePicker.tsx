"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon, Loader2 } from "lucide-react"; // Loader2 imported here
import { Input } from "@/components/ui/input";

type DateRange = {
  from: Date;
  to: Date;
};

type Props = {
  onChange: (range: DateRange) => void;
  isLoading?: boolean;
};

export function DateRangePicker({ onChange, isLoading = false }: Props) {
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());

  const [fromTime, setFromTime] = useState("00:00");
  const [toTime, setToTime] = useState("23:59");

  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const buildDateTime = (date: Date, time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  };

  const handleSubmit = () => {
    if (!fromDate || !toDate) return;

    onChange({
      from: buildDateTime(fromDate, fromTime),
      to: buildDateTime(toDate, toTime),
    });
  };

  const DateTimePicker = ({
    label,
    date,
    setDate,
    time,
    setTime,
    open,
    setOpen,
    minDate,
  }: {
    label: string;
    date?: Date;
    setDate: (d: Date) => void;
    time: string;
    setTime: (t: string) => void;
    open: boolean;
    setOpen: (b: boolean) => void;
    minDate?: Date;
  }) => (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="flex gap-2 items-center">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-48 justify-between">
              {date
                ? date.toLocaleDateString()
                : `Select ${label.toLowerCase()} date`}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              disabled={(d) => (minDate ? d < minDate : false)}
              onSelect={(d) => {
                setDate(d!);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
        <Input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>
    </div>
  );

  return (
    <div className="flex gap-4 items-end">
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
        <DateTimePicker
          label="From"
          date={fromDate}
          setDate={setFromDate}
          time={fromTime}
          setTime={setFromTime}
          open={fromOpen}
          setOpen={setFromOpen}
        />
        <DateTimePicker
          label="To"
          date={toDate}
          setDate={setToDate}
          time={toTime}
          setTime={setToTime}
          open={toOpen}
          setOpen={setToOpen}
          minDate={fromDate}
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!fromDate || !toDate || isLoading}
        className="min-w-[120px]"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </>
        ) : (
          "Submit"
        )}
      </Button>
    </div>
  );
}
