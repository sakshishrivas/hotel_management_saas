'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Download, Printer, FileText } from 'lucide-react';
import { useHotelsForFilter } from '../hooks/use-reports';
import type { DatePreset } from '../utils/report-utils';

interface ReportFiltersProps {
  datePreset: DatePreset;
  onDatePresetChange: (preset: DatePreset) => void;
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
  hotelId?: string;
  onHotelChange?: (hotelId: string) => void;
  search?: string;
  onSearchChange?: (search: string) => void;
  showSearch?: boolean;
  showHotelFilter?: boolean;
  showDateFilter?: boolean;
  onExportCsv?: () => void;
  onExportPdf?: () => void;
  onPrint?: () => void;
}

export function ReportFilters({
  datePreset,
  onDatePresetChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  hotelId,
  onHotelChange,
  search,
  onSearchChange,
  showSearch = false,
  showHotelFilter = true,
  showDateFilter = true,
  onExportCsv,
  onExportPdf,
  onPrint,
}: ReportFiltersProps) {
  const { data: hotelsData } = useHotelsForFilter();
  const hotels = hotelsData?.data || [];

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        {showDateFilter && (
          <>
            <Select value={datePreset} onValueChange={(v) => onDatePresetChange(v as DatePreset)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            {datePreset === 'custom' && (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDate || ''}
                  onChange={(e) => onStartDateChange?.(e.target.value)}
                  className="w-[150px]"
                />
                <span className="text-muted-foreground text-sm">to</span>
                <Input
                  type="date"
                  value={endDate || ''}
                  onChange={(e) => onEndDateChange?.(e.target.value)}
                  className="w-[150px]"
                />
              </div>
            )}
          </>
        )}

        {showHotelFilter && hotels.length > 0 && (
          <Select value={hotelId || 'all'} onValueChange={(v) => onHotelChange?.(v === 'all' ? '' : (v || ''))}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Hotels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hotels</SelectItem>
              {hotels.map((hotel) => (
                <SelectItem key={hotel.id} value={hotel.id}>
                  {hotel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {showSearch && (
          <div className="relative flex-1 min-w-[200px] max-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search || ''}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search..."
              className="pl-9 pr-9"
            />
            {search && (
              <button
                onClick={() => onSearchChange?.('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-1 ml-auto">
          {onExportCsv && (
            <Button variant="outline" size="sm" onClick={onExportCsv} className="gap-1.5">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">CSV</span>
            </Button>
          )}
          {onExportPdf && (
            <Button variant="outline" size="sm" onClick={onExportPdf} className="gap-1.5">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
          )}
          {onPrint && (
            <Button variant="outline" size="sm" onClick={onPrint} className="gap-1.5">
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
