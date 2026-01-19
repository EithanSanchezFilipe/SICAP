"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { sensorService } from "@/services/sensorService";
import { Sensor, Measurements } from "@/types/sensor";
import { DateRangePicker } from "@/components/DateHourRangePicker";
import { DateRangeSchemaWithTransform } from "@/types/formSchemas";
import { SensorChart } from "@/components/Chart";

export default function SensorPage() {
  const params = useParams<{ sensorId: string }>();
  const router = useRouter();

  const [sensor, setSensor] = useState<Sensor | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    sensorService
      .getById(Number(params.sensorId))
      .then(setSensor)
      .catch(() => toast.error("Could not load sensor"));
  }, [params.sensorId]);

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setIsLoading(true);
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
      .then((sensor) => {
        setSensor(sensor);
        console.log(sensor);
      })
      .catch(() => toast.error("Could not load sensor"))
      .finally(() => setIsLoading(false));
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

      <DateRangePicker onChange={handleDateRangeChange} isLoading={isLoading} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
        <div className="md:col-span-1 border-r border-gray-200 overflow-y-auto max-h-[500px]">
          <table className="w-full table-auto border-collapse">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr>
                <th className="border-b px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="border-b px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...sensor.measurements]
                .reverse()
                .map((measurement: Measurements) => (
                  <tr key={measurement.time} className="transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-black whitespace-nowrap">
                      {new Date(measurement.time).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono">
                      {measurement.value}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="md:col-span-2 p-6 flex items-center justify-center bg-white">
          <div className="w-full h-full min-h-[400px]">
            <SensorChart
              data={sensor.measurements}
              title="Historique des mesures"
              type={sensor.type}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
