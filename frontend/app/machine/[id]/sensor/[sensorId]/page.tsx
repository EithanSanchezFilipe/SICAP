"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { sensorService } from "@/services/sensorService";
import { Sensor } from "@/types/sensor";
import { DateRangePicker } from "@/components/DateHourRangePicker";
import { DateRangeSchemaWithTransform } from "@/types/formSchemas";

export default function SensorPage() {
  const params = useParams<{ sensorId: string }>();
  const router = useRouter();

  const [sensor, setSensor] = useState<Sensor | null>(null);

  useEffect(() => {
    sensorService
      .getById(Number(params.sensorId))
      .then(setSensor)
      .catch(() => toast.error("Could not load sensor"));
  }, [params.sensorId]);

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    const pad = (n: number) => String(n).padStart(2, "0");

    const result = DateRangeSchemaWithTransform.safeParse({
      fromDate: range.from.toISOString().slice(0, 10),
      fromTime: `${pad(range.from.getHours())}:${pad(range.from.getMinutes())}`,
      toDate: range.to.toISOString().slice(0, 10),
      toTime: `${pad(range.to.getHours())}:${pad(range.to.getMinutes())}`,
    });

    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    const { from, to } = result.data;
    sensorService
      .getById(Number(params.sensorId), from.toISOString(), to.toISOString())
      .then(setSensor)
      .catch(() => toast.error("Could not load sensor"));
  };

  if (!sensor) return null;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <ArrowLeft onClick={router.back} className="cursor-pointer" />

        <h1 className="text-3xl font-bold">
          {sensor.name} {sensor.type}
        </h1>

        <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
          {sensor.measurements.length} measurements
        </span>
      </div>

      <DateRangePicker onChange={handleDateRangeChange} />
    </div>
  );
}
