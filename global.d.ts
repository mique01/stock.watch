declare module 'recharts' {
  import * as React from 'react';
  
  export interface LineProps {
    type?: 'basis' | 'basisClosed' | 'basisOpen' | 'linear' | 'linearClosed' | 'natural' | 'monotoneX' | 'monotoneY' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';
    dataKey: string;
    stroke?: string;
    strokeWidth?: number;
    dot?: boolean | React.ReactElement | ((props: any) => React.ReactNode);
    activeDot?: boolean | React.ReactElement | ((props: any) => React.ReactNode);
    legendType?: 'line' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye';
    [key: string]: any;
  }

  export interface XAxisProps {
    dataKey?: string;
    tick?: boolean | React.ReactElement | ((props: any) => React.ReactNode);
    axisLine?: boolean | object;
    tickLine?: boolean | object;
    interval?: number | 'preserveStart' | 'preserveEnd' | 'preserveStartEnd';
    [key: string]: any;
  }

  export interface YAxisProps {
    domain?: [number | string | ((dataMin: number) => number), number | string | ((dataMax: number) => number)];
    hide?: boolean;
    [key: string]: any;
  }

  export interface CartesianGridProps {
    strokeDasharray?: string;
    vertical?: boolean;
    opacity?: number;
    [key: string]: any;
  }

  export interface TooltipProps {
    formatter?: (value: any, name: string, props: any) => [string, string] | string;
    labelFormatter?: (label: any) => React.ReactNode;
    [key: string]: any;
  }

  export interface ResponsiveContainerProps {
    width?: number | string;
    height?: number | string;
    aspect?: number;
    children?: React.ReactNode;
    [key: string]: any;
  }

  export interface LineChartProps {
    data?: any[];
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    children?: React.ReactNode;
    [key: string]: any;
  }

  export const LineChart: React.FC<LineChartProps>;
  export const Line: React.FC<LineProps>;
  export const XAxis: React.FC<XAxisProps>;
  export const YAxis: React.FC<YAxisProps>;
  export const CartesianGrid: React.FC<CartesianGridProps>;
  export const Tooltip: React.FC<TooltipProps>;
  export const ResponsiveContainer: React.FC<ResponsiveContainerProps>;
}

declare module 'lucide-react' {
  import * as React from 'react';
  
  export interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    stroke?: string | number;
  }
  
  export const RefreshCw: React.FC<IconProps>;
  export const TrendingDown: React.FC<IconProps>;
  export const TrendingUp: React.FC<IconProps>;
} 