
export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  ARRIVED = 'ARRIVED',
  COMPLETED = 'COMPLETED'
}

export interface Supermarket {
  id: string;
  name: string;
  logo: string;
  tin: string;
  email: string;
  phone: string;
  regCode: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  branchesCount: number;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalCommission: number;
  totalServiceFees: number;
  totalOrders: number;
  activeSupermarkets: number;
  growthRate: number;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  commission: number;
}

export type AuthView = 'LOGIN' | 'FORGOT' | 'OTP' | 'RESET';

export interface Ad {
  id: string;
  description: string;
  type: 'video' | 'image';
  media_url: string;
  duration_hours: number;
  is_active: boolean;
  status_derived: string;
  expires_at: string;
  created_at: string;
}
