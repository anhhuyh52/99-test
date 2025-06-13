import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  slippage: number;
  setSlippage: (value: number) => void;
}
export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  slippage,
  setSlippage,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transaction Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-3">
              Slippage Tolerance
            </Label>
            <div className="flex gap-2 mb-3">
              {[0.1, 0.5, 1.0, 3.0].map((value) => (
                <Button
                  key={value}
                  onClick={() => setSlippage(value)}
                  variant={slippage === value ? "default" : "outline"}
                  className="flex-1"
                >
                  {value}%
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0.1"
                max="50"
                step="0.1"
                value={slippage}
                onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.5)}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Higher slippage tolerance increases the chance of your transaction
              succeeding but may result in worse prices.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
};
