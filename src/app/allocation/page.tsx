import AllocationSummaryBox from "@/components/allocation-summary-box";
import Navbar from "@/components/navbar";
import { Typography } from "@mui/material";
import { AllocationCategories } from "./constants";
import PrimaryButton from "@/components/primary-button";
import EastRoundedIcon from "@mui/icons-material/EastRounded";

export default function Allocation() {
  return (
    <div>
      <Navbar />

      <main className="p-8">
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
          <div className="flex flex-row gap-12 ">
            <AllocationSummaryBox
              percentage={25}
              category={AllocationCategories.SPOT.label}
              description={AllocationCategories.SPOT.description}
            />
            <AllocationSummaryBox
              percentage={25}
              category={AllocationCategories.VAULT.label}
              description={AllocationCategories.VAULT.description}
              hasButton={false}
            />
          </div>
          <div className="flex flex-row gap-12 ">
            <AllocationSummaryBox
              percentage={25}
              category={AllocationCategories.LENDING.label}
              description={AllocationCategories.LENDING.description}
            />
            <AllocationSummaryBox
              percentage={25}
              category={AllocationCategories.LP.label}
              description={AllocationCategories.LP.description}
            />
          </div>

          <div className="pt-12">
            <PrimaryButton className="pt-12" endIcon={<EastRoundedIcon />}>
              Continue
            </PrimaryButton>
          </div>
        </div>
      </main>
    </div>
  );
}
