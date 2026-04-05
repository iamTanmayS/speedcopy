import { ISODateString, PaisaAmount } from "./shared";

export interface AdminOverviewDashboard {
    totalOrders: number;
    activeVendors: number;
    totalRevenue: PaisaAmount;
    generatedAt: ISODateString;
}
