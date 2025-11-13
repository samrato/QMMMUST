"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AddDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeviceAdded: () => void;
}

export function AddDeviceModal({
  open,
  onOpenChange,
  onDeviceAdded,
}: AddDeviceModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    device_name: "",
    device_type: "Laptop",
    rfid_tag: "",
    manual_type: "",
    useManualType: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalType = formData.useManualType
      ? formData.manual_type
      : formData.device_type;

    if (
      !formData.device_name ||
      !formData.rfid_tag ||
      (formData.useManualType && !formData.manual_type)
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const res = await fetch("/api/student/devices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, device_type: finalType }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add device");

      toast.success("Device registered successfully!");
      setFormData({
        device_name: "",
        device_type: "Laptop",
        rfid_tag: "",
        manual_type: "",
        useManualType: false,
      });
      onOpenChange(false);
      onDeviceAdded();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to register device"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Register New Device</DialogTitle>
          <DialogDescription>
            Add a new device to your account for gate pass tracking
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="device_name">Device Name *</Label>
            <Input
              id="device_name"
              placeholder="e.g., Dell Inspiron 15"
              value={formData.device_name}
              onChange={(e) =>
                setFormData({ ...formData, device_name: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="device_type">Device Type</Label>
            {!formData.useManualType ? (
              <Select
                value={formData.device_type}
                onValueChange={(value) => {
                  if (value === "Manual")
                    setFormData({
                      ...formData,
                      useManualType: true,
                      manual_type: "",
                    });
                  else setFormData({ ...formData, device_type: value });
                }}
              >
                <SelectTrigger id="device_type" disabled={isLoading}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laptop">Laptop</SelectItem>
                  <SelectItem value="Desktop">Desktop</SelectItem>
                  <SelectItem value="Projector">Projector</SelectItem>
                  <SelectItem value="Lab PC">Lab PC</SelectItem>
                  <SelectItem value="Server">Server</SelectItem>
                  <SelectItem value="Guitar">Guitar</SelectItem>
                  <SelectItem value="Mic">Mic</SelectItem>
                  <SelectItem value="Manual">Enter Manually</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="manual_type"
                placeholder="Enter device type"
                value={formData.manual_type}
                onChange={(e) =>
                  setFormData({ ...formData, manual_type: e.target.value })
                }
                disabled={isLoading}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rfid_tag">Reg NO *</Label>
            <Input
              id="rfid_tag"
              placeholder="e.g., RFID001A"
              value={formData.rfid_tag}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  rfid_tag: e.target.value.toUpperCase(),
                })
              }
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Register Device
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
