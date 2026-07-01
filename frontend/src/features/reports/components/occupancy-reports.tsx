'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { ReportFilters } from './report-filters';
import { PieChart, BarChart } from './charts';
import { useReportRooms } from '../hooks/use-reports';
import { printReport, exportToCsv } from '../utils/report-utils';

export function OccupancyReports() {
  const [hotelId, setHotelId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: roomsData, isLoading } = useReportRooms({
    hotelId,
    search,
    page,
    limit,
  });

  const rooms = roomsData?.data || [];
  const meta = roomsData?.meta;

  // Real occupancy requires date-range based calculations combining rooms and bookings.
  // For the current UI, we'll demonstrate using current room statuses
  const statusData = Object.entries(
    rooms.reduce((acc: any, r: any) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: name.replace('_', ' ').toUpperCase(), value }));

  const typeData = Object.entries(
    rooms.reduce((acc: any, r: any) => {
      const typeName = r.roomType?.name || 'Unknown';
      acc[typeName] = (acc[typeName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const columns = [
    {
      header: 'Room',
      accessorKey: 'roomNumber' as const,
      cell: (item: any) => <span className="font-medium">{item.roomNumber}</span>,
    },
    {
      header: 'Type',
      accessorKey: 'roomType' as const,
      cell: (item: any) => item.roomType?.name,
    },
    {
      header: 'Floor',
      accessorKey: 'floor' as const,
      cell: (item: any) => item.floor || '-',
    },
    {
      header: 'Status',
      accessorKey: 'status' as const,
      cell: (item: any) => <StatusBadge status={item.status} />,
    },
  ];

  const handleExportCsv = () => {
    const exportData = rooms.map((r: any) => ({
      'Room Number': r.roomNumber,
      'Type': r.roomType?.name || 'Unknown',
      'Floor': r.floor || '',
      'Status': r.status,
      'Active': r.isActive ? 'Yes' : 'No'
    }));
    exportToCsv(exportData, 'occupancy_report');
  };

  const totalRooms = meta?.total || 0;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length; // Mock metric for now
  const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6" id="occupancy-report">
      <ReportFilters
        datePreset="today"
        onDatePresetChange={() => {}}
        showDateFilter={false} // Occupancy is typically point-in-time for this view
        hotelId={hotelId}
        onHotelChange={setHotelId}
        search={search}
        onSearchChange={setSearch}
        showSearch={true}
        onExportCsv={handleExportCsv}
        onPrint={() => printReport('occupancy-report', 'Occupancy Report')}
      />

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRooms}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms.filter(r => r.status === 'available').length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-[350px]">
          <PieChart
            title="Room Status Distribution"
            data={statusData}
            dataKey="value"
            nameKey="name"
            format="number"
            isLoading={isLoading}
          />
        </div>
        <div className="h-[350px]">
          <BarChart
            title="Rooms by Type"
            data={typeData}
            dataKey="name"
            bars={[{ key: 'value', name: 'Count', format: 'number' }]}
            isLoading={isLoading}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room Status Details</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={rooms}
            isLoading={isLoading}
            pagination={meta ? {
              page: meta.page,
              limit: meta.limit,
              total: meta.total,
              onPageChange: setPage,
            } : undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}
