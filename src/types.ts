import { AllocationType } from "./constants";

export type AllocationFormat = {
  category: string;
  description: string;
  riskLevel: {
    description: string;
    bgColor: string;
    textColor: string;
  };
  editTitleName: string;
};

export interface AllocationItem {
  category: AllocationType;
  percentage: number;
  allocations: string[];
}

export type PortfolioState = AllocationItem[];

export type PortfolioAction = {
  type: "UPDATE_ALLOCATION";
  payload: {
    category: string;
    allocations: string[];
  };
};

export interface SmartAccountState {
  isLoading: boolean;
  smartAccount: any | null;
  smartAccountAddress: string | null;
  smartAccountClient: any | null;
  error: string | null;
}
