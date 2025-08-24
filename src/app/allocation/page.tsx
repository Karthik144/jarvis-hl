"use client";

import AllocationSummaryBox from "@/components/allocation-summary-box";
import Navbar from "@/components/navbar";
import { Typography } from "@mui/material";
import PrimaryButton from "@/components/primary-button";
import EastRoundedIcon from "@mui/icons-material/EastRounded";
import {
  LENDING_ALLOCATION_FORMAT,
  LP_ALLOCATION_FORMAT,
  SPOT_ALLOCATION_FORMAT,
  VAULT_ALLOCATION_FORMAT,
} from "./constants";
import { usePortfolio } from "@/providers/PortfolioProvider";
import { useRouter } from "next/navigation";

export default function Allocation() {
  const { state: portfolio } = usePortfolio();
  const router = useRouter();

  const handleContinue = () => {
    router.push("/preferences");
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />

      <main className="p-8 overflow-y-auto">
        <div className="flex flex-col gap-1">
          <Typography variant="h6" fontWeight={550}>
            Here’s the portfolio I designed for you...
          </Typography>
          <Typography variant="body1">
            Start adding assets, LP pools, or lending markets you prefer for
            each allocation category.
          </Typography>
        </div>
        <div className="flex flex-col gap-4 max-w-[40rem] pt-12">
          <div className="flex flex-row gap-12">
            <AllocationSummaryBox
              format={SPOT_ALLOCATION_FORMAT}
              allocation={portfolio[0]}
            />
            <AllocationSummaryBox
              format={VAULT_ALLOCATION_FORMAT}
              allocation={portfolio[1]}
              hasButton={false}
            />
          </div>
          <div className="flex flex-row gap-12">
            <AllocationSummaryBox
              format={LENDING_ALLOCATION_FORMAT}
              allocation={portfolio[2]}
            />
            <AllocationSummaryBox
              format={LP_ALLOCATION_FORMAT}
              allocation={portfolio[3]}
            />
          </div>

          <div className="pt-12">
            <PrimaryButton
              onClick={handleContinue}
              endIcon={<EastRoundedIcon />}
            >
              Continue
            </PrimaryButton>
          </div>
        </div>
      </main>
    </div>
  );
}
