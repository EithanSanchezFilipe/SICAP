"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { machineService } from "@/services/machineService";
import { toast } from "sonner";
import { Machine } from "@/types/machine";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
export default function MachinePage() {
  const [machine, setMachine] = useState<Machine>({
    name: "",
    id: 0,
    location: "",
    createdAt: "",
    sensors: [],
  });
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useParams<{ id: string }>();
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await machineService.getById(Number(params.id));
        setMachine(data ? data : {});
        console.log(data);
      } catch (err: any) {
        const msg =
          err.response?.data?.message || "Could not load the machine.";
        setError(msg);
        toast.error(error);
      }
    };
    loadData();
  }, [params.id]);
  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <ArrowLeft onClick={router.back} className="cursor-pointer"></ArrowLeft>
        <h1 className="text-3xl font-bold tracking-tight">
          {machine.name} sensors
        </h1>
        <p className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {machine.sensors.length} Total Sensors
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full table-auto border-collapse bg-white">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Name
              </th>
              <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Type
              </th>
              <th className="border-b px-6 py-4 text-center text-sm font-semibold text-gray-900">
                Data in the last minute
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {machine.sensors.map((sensor) => (
              <tr
                key={sensor.id}
                className="hover:bg-blue-50/40 cursor-pointer transition-all"
                onClick={() =>
                  router.push(`/machine/${machine.id}/sensor/${sensor.id}`)
                }
              >
                <td className="px-6 py-4 text-sm font-medium text-blue-600">
                  {sensor.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {sensor.type}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                    {sensor.measurements.length}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
