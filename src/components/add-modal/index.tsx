import {
  Modal,
  Card,
  Typography,
  Chip,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { useState } from "react";
import PrimaryButton from "../primary-button";

interface AddModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddModal({ open, onClose }: AddModalProps) {
  const [rebalanceFrequency, setRebalanceFrequency] = useState("weekly");

  const handleFrequencyChange = (
    event: React.MouseEvent<HTMLElement>,
    newFrequency: string | null
  ) => {
    if (newFrequency !== null) {
      setRebalanceFrequency(newFrequency);
    }
  };

  const assetInputFields = Array.from({ length: 5 }, (_, i) => (
    <TextField
      key={i}
      variant="outlined"
      fullWidth
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "12px",
          "&.Mui-focused fieldset": {
            borderColor: "black",
          },
        },
      }}
    />
  ));

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="allocation-settings-modal-title"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Card
          sx={{
            borderRadius: "24px",
            p: 3,
            width: "100%",
            minWidth: "600px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
            outline: "none",
          }}
        >
          <div className="flex flex-col gap-6">
            <div>
              <Typography id="allocation-settings-modal-title" variant="h4">
                Spot
              </Typography>
              <div className="flex items-center gap-2 mt-2">
                <Chip
                  label="25% Allocation"
                  sx={{
                    backgroundColor: "#e3f2fd",
                    color: "#1565c0",
                    fontWeight: "500",
                  }}
                />
                <Chip
                  label="Risky"
                  sx={{
                    backgroundColor: "#ffebee",
                    color: "#c62828",
                    fontWeight: "500",
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Typography variant="h6">Assets</Typography>
              <div className="flex flex-col gap-2">{assetInputFields}</div>
            </div>

            <div className="flex flex-col gap-3">
              <Typography variant="h6">Rebalance</Typography>
              <ToggleButtonGroup
                value={rebalanceFrequency}
                exclusive
                onChange={handleFrequencyChange}
                aria-label="rebalance frequency"
              >
                <ToggleButton
                  value="everyday"
                  aria-label="everyday"
                  sx={{ borderRadius: "12px", textTransform: "none", px: 3 }}
                >
                  Everyday
                </ToggleButton>
                <ToggleButton
                  value="weekly"
                  aria-label="weekly"
                  sx={{ borderRadius: "12px", textTransform: "none", px: 3 }}
                >
                  Weekly
                </ToggleButton>
                <ToggleButton
                  value="monthly"
                  aria-label="monthly"
                  sx={{ borderRadius: "12px", textTransform: "none", px: 3 }}
                >
                  Monthly
                </ToggleButton>
              </ToggleButtonGroup>
            </div>

            <div className="flex justify-end">
              <PrimaryButton onClick={onClose}>Submit</PrimaryButton>
            </div>
          </div>
        </Card>
      </div>
    </Modal>
  );
}
