import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, differenceInDays, parseISO } from 'date-fns';

// --- Date Range Presets ---
export type DatePreset = 'today' | '7days' | '30days' | 'thisMonth' | 'thisYear' | 'custom';

export function getDateRange(preset: DatePreset): { startDate: string; endDate: string } {
  const today = new Date();
  switch (preset) {
    case 'today':
      return {
        startDate: format(today, 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
      };
    case '7days':
      return {
        startDate: format(subDays(today, 7), 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
      };
    case '30days':
      return {
        startDate: format(subDays(today, 30), 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
      };
    case 'thisMonth':
      return {
        startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(today), 'yyyy-MM-dd'),
      };
    case 'thisYear':
      return {
        startDate: format(startOfYear(today), 'yyyy-MM-dd'),
        endDate: format(endOfYear(today), 'yyyy-MM-dd'),
      };
    default:
      return {
        startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(today), 'yyyy-MM-dd'),
      };
  }
}

// --- Currency Formatting ---
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// --- Percentage Formatting ---
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// --- Number Formatting ---
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

// --- CSV Export ---
export function exportToCsv(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];

  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      const escaped = String(val ?? '').replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// --- PDF Export (Print-based) ---
export function exportToPdf(elementId: string, title: string): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const element = document.getElementById(elementId);
  if (!element) return;

  const styles = Array.from(document.styleSheets)
    .map(sheet => {
      try {
        return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
      } catch {
        return '';
      }
    })
    .join('\n');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        ${styles}
        @media print {
          body { padding: 20px; }
          .no-print { display: none !important; }
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 20px;
          color: #1a1a1a;
          background: white;
        }
        h1 { margin-bottom: 10px; font-size: 24px; }
        .print-header { margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .print-date { color: #6b7280; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th, td { padding: 8px 12px; border: 1px solid #e5e7eb; text-align: left; font-size: 13px; }
        th { background: #f9fafb; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="print-header">
        <h1>${title}</h1>
        <p class="print-date">Generated on ${format(new Date(), 'MMMM d, yyyy \'at\' h:mm a')}</p>
      </div>
      ${element.innerHTML}
    </body>
    </html>
  `);

  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
  }, 500);
}

// --- Print Friendly ---
export function printReport(elementId: string, title: string): void {
  exportToPdf(elementId, title);
}

// --- Compute Average Stay ---
export function computeAverageStay(bookings: { checkInDate: string; checkOutDate: string }[]): number {
  if (bookings.length === 0) return 0;
  const totalDays = bookings.reduce((sum, b) => {
    const diff = differenceInDays(parseISO(b.checkOutDate), parseISO(b.checkInDate));
    return sum + Math.max(diff, 1);
  }, 0);
  return totalDays / bookings.length;
}

// --- Group By Helper ---
export function groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

// --- Count By Helper ---
export function countBy<T>(array: T[], keyFn: (item: T) => string): Record<string, number> {
  return array.reduce((counts, item) => {
    const key = keyFn(item);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
}

// --- Sum By Helper ---
export function sumBy<T>(array: T[], valueFn: (item: T) => number): number {
  return array.reduce((sum, item) => sum + valueFn(item), 0);
}

// --- Today Check ---
export function isToday(dateStr: string): boolean {
  const today = format(new Date(), 'yyyy-MM-dd');
  return dateStr.startsWith(today);
}
