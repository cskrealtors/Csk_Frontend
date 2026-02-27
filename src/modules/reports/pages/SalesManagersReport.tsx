import { useState, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterBar } from "../components/FilterBar";
import { MetricCard } from "../components/MetricCard";
import { DataTable } from "../components/DataTable";
import { ExportButton } from "../components/ExportButton";
import { ReportFilters, SalesManagerReportRow } from "../types";
import { reportColumns } from "../utils/columns";
import { subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Loader from "@/components/Loader";

export default function SalesManagersReport() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: subDays(new Date(), 30),
    dateTo: new Date(),
    groupBy: "month",
    search: "",
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["sales-managers-report", filters],
    queryFn: async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}/api/reports/sales-managers`,
        {
          params: {
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
            groupBy: filters.groupBy,
          },
          withCredentials: true,
        },
      );

      return res.data?.data || [];
    },
  });

  const reportData: SalesManagerReportRow[] = Array.isArray(data) ? data : [];

  const filteredData = useMemo(() => {
    if (!filters.search) return reportData;

    return reportData.filter((row) =>
      row.managerName?.toLowerCase().includes(filters.search!.toLowerCase()),
    );
  }, [reportData, filters.search]);

  const metrics = useMemo(() => {
    const totalBookings = filteredData.reduce(
      (sum, row) => sum + row.bookings,
      0,
    );

    const totalDeals = filteredData.reduce((sum, row) => sum + row.dealsWon, 0);

    const totalRevenue = filteredData.reduce(
      (sum, row) => sum + (row.revenue || 0),
      0,
    );

    const avgDealSize =
      filteredData.length > 0 ? totalRevenue / filteredData.length : 0;
    return [
      {
        label: "Total Revenue",
        value: totalRevenue,
        format: "currency" as const,
      },
      {
        label: "Avg Deal Size",
        value: avgDealSize,
        format: "currency" as const,
      },
    ];
  }, [filteredData]);

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <MainLayout>
        <div className="p-6 text-red-500 font-medium">
          Failed to load Sales Manager report
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/reports")}
              className="mb-4"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Reports
            </Button>
            <h1 className="text-3xl font-bold">Sales Manager Report</h1>
            <p className="text-muted-foreground">
              Overall sales performance and revenue metrics
            </p>
          </div>

          <ExportButton
            reportTitle="Sales Manager Report"
            data={filteredData}
            columns={reportColumns["sales-managers"]}
            filters={filters}
          />
        </div>

        <FilterBar filters={filters} onFiltersChange={setFilters} showSearch />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sales Manager Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={reportColumns["sales-managers"]}
              data={filteredData}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
