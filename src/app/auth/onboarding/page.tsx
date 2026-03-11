"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleFinish() {
    setLoading(true);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-border">
        <CardHeader>
          <CardTitle>Welcome — Setup</CardTitle>
          <CardDescription>
            Step {step} of 4: Get your SEO dashboard ready
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <div className="space-y-2">
              <Label htmlFor="domain">Confirm your primary domain</Label>
              <Input
                id="domain"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
          )}
          {step === 2 && (
            <p className="text-sm text-muted-foreground">
              Add 5–10 seed keywords to track. (Coming soon — skip for now.)
            </p>
          )}
          {step === 3 && (
            <p className="text-sm text-muted-foreground">
              Add 1–3 competitor domains. (Coming soon — skip for now.)
            </p>
          )}
          {step === 4 && (
            <p className="text-sm text-muted-foreground">
              Run your first keyword search. (Coming soon — skip for now.)
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          ) : (
            <div />
          )}
          {step < 4 ? (
            <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
          ) : (
            <Button onClick={handleFinish} disabled={loading}>
              {loading ? "Redirecting…" : "Go to Dashboard"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
