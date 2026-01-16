"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { machineService } from "@/services/machineService";
import { toast } from "sonner";
import { MachineHome } from "@/types/machine";

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [machines, setMachines] = useState<MachineHome[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await machineService.getAll();
        // Ensure data is an array before setting state
        setMachines(Array.isArray(data) ? data : []);
        console.log(data);
      } catch (err: any) {
        const msg = err.response?.data?.message || "Could not load machines.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredMachines = machines.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.location.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading machines...</div>
    );
  if (error)
    return (
      <div className="p-8 text-red-500 text-center font-semibold">{error}</div>
    );

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Machines Dashboard
        </h1>
        <p className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {machines.length} Total Machines
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search by name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm shadow-sm"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full table-auto border-collapse bg-white">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Name
              </th>
              <th className="border-b px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Location
              </th>
              <th className="border-b px-6 py-4 text-center text-sm font-semibold text-gray-900">
                Sensors
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredMachines.map((machine: MachineHome) => (
              <tr
                key={machine.id}
                className="hover:bg-blue-50/40 cursor-pointer transition-all"
                onClick={() => router.push(`/machine/${machine.id}`)}
              >
                <td className="px-6 py-4 text-sm font-medium text-blue-600">
                  {machine.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {machine.location}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                    {machine.sensorCount}
                  </span>
                </td>
              </tr>
            ))}

            {filteredMachines.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="text-center py-12 text-gray-400 text-sm"
                >
                  No machines found matching{" "}
                  <span className="font-semibold">"{search}"</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
