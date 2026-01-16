"use client";
import { sensorService } from "@/services/sensorService";
import { Sensor } from "@/types/sensor";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function SensorPage() {
  const params = useParams<{ id: string; sensorId: string }>();
  const [error, setError] = useState("");
  const [sensor, setSensor] = useState<Sensor>({
    id: 0,
    type: "",
    name: "",
    measurements: [],
  });
  const router = useRouter();
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await sensorService.getById(Number(params.sensorId));
        setSensor(data ? data : {});
        console.log(data);
      } catch (err: any) {
        const msg =
          err.response?.data?.message || "Could not load the machine.";
        setError(msg);
        toast.error(error);
      }
    };
    loadData();
  }, [params.sensorId]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <ArrowLeft onClick={router.back} className="cursor-pointer"></ArrowLeft>
        <h1 className="text-3xl font-bold tracking-tight">
          {sensor.name} {sensor.type}
        </h1>
        <p className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {sensor.measurements.length} Total Measurements
        </p>
      </div>
    </div>
  );
}
