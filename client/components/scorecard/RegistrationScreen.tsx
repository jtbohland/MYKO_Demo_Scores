import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import AgentAnalyticsLogo from "./AgentAnalyticsLogo";
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

const ROLES = [
  "[INSERT ROLE 1]",
  "[INSERT ROLE 2]",
  "[INSERT ROLE 3]",
  "[INSERT ROLE 4]",
  "[INSERT ROLE 5]",
  "[INSERT ROLE 6]",
  "[INSERT ROLE 7]",
  "[INSERT ROLE 8]",
];

type Props = {
  onRegister: (data: { firstName: string; lastName: string; role: string }) => void;
  loading: boolean;
};

export default function RegistrationScreen({ onRegister, loading }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");

  const canSubmit = firstName.trim() && lastName.trim() && role;

  const handleContinue = useCallback(() => {
    if (!canSubmit) return;
    onRegister({ firstName: firstName.trim(), lastName: lastName.trim(), role });
  }, [firstName, lastName, role, canSubmit, onRegister]);

  return (
    <div className="min-h-full flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100">
      <Card className="w-full max-w-md p-8 shadow-2xl border-0 bg-white rounded-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-5 shadow-lg">
            <AgentAnalyticsLogo size={48} />
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent tracking-tight">
            Agent Analytics Demo
          </h1>
          <p className="text-blue-500 mt-2 text-sm font-medium">
            🌲 MYKO26: Portland GTM Session 🦆
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-xs font-bold uppercase tracking-wider text-blue-600">
                First Name
              </Label>
              <Input
                id="firstName"
                placeholder="Type First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-blue-50/50 border-blue-200 focus:border-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Last Name
              </Label>
              <Input
                id="lastName"
                placeholder="Type Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-blue-50/50 border-blue-200 focus:border-blue-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Your Role
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="bg-blue-50/50 border-blue-200">
                <SelectValue placeholder="Select your role..." />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Continue Button */}
        <Button
          className="w-full mt-8 h-13 text-base font-bold shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl"
          disabled={!canSubmit || loading}
          onClick={handleContinue}
        >
          {loading ? "Registering..." : "💯 Continue to Scorecard"}
        </Button>

        <p className="text-center text-xs text-blue-400 mt-4 font-medium">
          Your name will appear on the leaderboard when scored 🏅
        </p>
      </Card>
    </div>
  );
}
