import { useState, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterBar } from "../components/FilterBar";
import { MetricCard } from "../components/MetricCard";
import { DataTable } from "../components/DataTable";
import { ExportButton } from "../components/ExportButton";
import { ReportFilters, SiteInchargeReportRow } from "../types";
import { reportColumns } from "../utils/columns";
import { subDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Loader from "@/components/Loader";

export default function SiteInchargeReport() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: subDays(new Date(), 30),
    dateTo: new Date(),
    groupBy: "month",
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["site-incharge-report", filters],
    queryFn: async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}/api/reports/site-incharge`,
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

  const reportData: SiteInchargeReportRow[] = Array.isArray(data) ? data : [];

  const metrics = useMemo(() => {
    const totalProjects = reportData.reduce(
      (sum, row) => sum + row.projectsActive,
      0,
    );

    const totalVerified = reportData.reduce(
      (sum, row) => sum + row.tasksVerified,
      0,
    );

    const totalInspections = reportData.reduce(
      (sum, row) => sum + row.inspections,
      0,
    );

    const avgProgress =
      reportData.length > 0
        ? reportData.reduce((sum, row) => sum + row.avgProgressPercent, 0) /
          reportData.length
        : 0;

    return [
      {
        label: "Active Projects",
        value: totalProjects,
        format: "number" as const,
      },
      {
        label: "Tasks Verified",
        value: totalVerified,
        format: "number" as const,
      },
      {
        label: "Inspections Done",
        value: totalInspections,
        format: "number" as const,
      },
      { label: "Avg Progress", value: avgProgress, format: "percent" as const },
    ];
  }, [reportData]);

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <MainLayout>
        <div className="p-6 text-red-500 font-medium">
          Failed to load Site In-Charge report
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
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
            <h1 className="text-3xl font-bold">Site In-Charge Report</h1>
            <p className="text-muted-foreground">
              Project oversight, QC tasks, inspections and progress tracking
            </p>
          </div>

          <ExportButton
            reportTitle="Site In-Charge Report"
            data={reportData}
            columns={reportColumns["site-incharge"]}
            filters={filters}
          />
        </div>

        <FilterBar filters={filters} onFiltersChange={setFilters} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Site In-Charge Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={reportColumns["site-incharge"]}
              data={reportData}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
