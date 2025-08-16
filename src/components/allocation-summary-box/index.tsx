import { Button, Card, Typography } from "@mui/material";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import PrimaryButton from "../primary-button";

interface AllocationSummaryBoxProps {
  percentage: number;
  category: string;
  description: string;
  hasButton?: boolean;
}

export default function AllocationSummaryBox({
  percentage = 25,
  category = "Spot",
  description = "Add up to 5 assets.",
  hasButton = true,
}: AllocationSummaryBoxProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: "16px",
        p: 4,
        width: "100%",
        maxWidth: "325px",
      }}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between">
          <div>
            <Typography variant="h4" component="p" sx={{ lineHeight: 1.2 }}>
              {percentage}%
            </Typography>
            <Typography variant="h6">{category}</Typography>
          </div>

          {hasButton ? (
            <PrimaryButton endIcon={<AddCircleOutlineOutlinedIcon />}>
              Add
            </PrimaryButton>
          ) : null}
        </div>

        <div className="mt-auto pt-4">
          <Typography variant="subtitle1" color="text.secondary">
            {description}
          </Typography>
        </div>
      </div>
    </Card>
  );
}
