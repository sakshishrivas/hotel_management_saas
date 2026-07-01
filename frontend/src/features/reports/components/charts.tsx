'use client';

import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '../utils/report-utils';

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#eab308', '#9333ea', '#db2777', '#ea580c', '#0891b2'];

interface BaseChartProps {
  data: any[];
  title?: string;
  description?: string;
  height?: number;
  isLoading?: boolean;
}

interface LineChartProps extends BaseChartProps {
  dataKey: string;
  lines: { key: string; name: string; color?: string; format?: 'currency' | 'number' }[];
  xAxisFormat?: (val: any) => string;
}

export function LineChart({ data, title, description, height = 300, dataKey, lines, xAxisFormat, isLoading }: LineChartProps) {
  return (
    <Card className="h-full">
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        {isLoading ? (
          <div className="flex h-full min-h-[300px] items-center justify-center text-muted-foreground">
            Loading chart...
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full min-h-[300px] items-center justify-center text-muted-foreground">
            No data available
          </div>
        ) : (
          <div style={{ height }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey={dataKey}
                  tickFormatter={xAxisFormat}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => {
                    if (lines[0]?.format === 'currency') return `$${val}`;
                    return val;
                  }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: any, name: any) => {
                    const line = lines.find((l) => l.name === name || l.key === name);
                    if (line?.format === 'currency') return formatCurrency(value);
                    return formatNumber(value);
                  }}
                  labelFormatter={xAxisFormat}
                />
                <Legend iconType="circle" />
                {lines.map((line, i) => (
                  <Line
                    key={line.key}
                    type="monotone"
                    dataKey={line.key}
                    name={line.name}
                    stroke={line.color || COLORS[i % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface BarChartProps extends BaseChartProps {
  dataKey: string;
  bars: { key: string; name: string; color?: string; format?: 'currency' | 'number' }[];
  xAxisFormat?: (val: any) => string;
}

export function BarChart({ data, title, description, height = 300, dataKey, bars, xAxisFormat, isLoading }: BarChartProps) {
  return (
    <Card className="h-full">
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        {isLoading ? (
          <div className="flex h-full min-h-[300px] items-center justify-center text-muted-foreground">
            Loading chart...
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full min-h-[300px] items-center justify-center text-muted-foreground">
            No data available
          </div>
        ) : (
          <div style={{ height }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey={dataKey}
                  tickFormatter={xAxisFormat}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => {
                    if (bars[0]?.format === 'currency') return `$${val}`;
                    return val;
                  }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: any, name: any) => {
                    const bar = bars.find((b) => b.name === name || b.key === name);
                    if (bar?.format === 'currency') return formatCurrency(value);
                    return formatNumber(value);
                  }}
                  labelFormatter={xAxisFormat}
                  cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Legend iconType="circle" />
                {bars.map((bar, i) => (
                  <Bar
                    key={bar.key}
                    dataKey={bar.key}
                    name={bar.name}
                    fill={bar.color || COLORS[i % COLORS.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface PieChartProps extends BaseChartProps {
  nameKey: string;
  dataKey: string;
  format?: 'currency' | 'number' | 'percentage';
}

export function PieChart({ data, title, description, height = 300, nameKey, dataKey, format = 'number', isLoading }: PieChartProps) {
  return (
    <Card className="h-full">
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        {isLoading ? (
          <div className="flex h-full min-h-[300px] items-center justify-center text-muted-foreground">
            Loading chart...
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full min-h-[300px] items-center justify-center text-muted-foreground">
            No data available
          </div>
        ) : (
          <div style={{ height }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: any) => {
                    if (format === 'currency') return formatCurrency(value);
                    if (format === 'percentage') return `${value.toFixed(1)}%`;
                    return formatNumber(value);
                  }}
                />
                <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" />
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey={dataKey}
                  nameKey={nameKey}
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AreaChart({ data, title, description, height = 300, dataKey, lines, xAxisFormat, isLoading }: LineChartProps) {
  return (
    <Card className="h-full">
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        {isLoading ? (
          <div className="flex h-full min-h-[300px] items-center justify-center text-muted-foreground">
            Loading chart...
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full min-h-[300px] items-center justify-center text-muted-foreground">
            No data available
          </div>
        ) : (
          <div style={{ height }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  {lines.map((line, i) => (
                    <linearGradient key={`color-${line.key}`} id={`color-${line.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={line.color || COLORS[i % COLORS.length]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={line.color || COLORS[i % COLORS.length]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey={dataKey}
                  tickFormatter={xAxisFormat}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => {
                    if (lines[0]?.format === 'currency') return `$${val}`;
                    return val;
                  }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: any, name: any) => {
                    const line = lines.find((l) => l.name === name || l.key === name);
                    if (line?.format === 'currency') return formatCurrency(value);
                    return formatNumber(value);
                  }}
                  labelFormatter={xAxisFormat}
                />
                <Legend iconType="circle" />
                {lines.map((line, i) => (
                  <Area
                    key={line.key}
                    type="monotone"
                    dataKey={line.key}
                    name={line.name}
                    stroke={line.color || COLORS[i % COLORS.length]}
                    fillOpacity={1}
                    fill={`url(#color-${line.key})`}
                  />
                ))}
              </RechartsAreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
