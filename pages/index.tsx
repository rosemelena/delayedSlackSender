import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Home() {
  const [delayAmount, setDelayAmount] = useState<number>(0);
  const [delayUnit, setDelayUnit] = useState<string>("seconds");
  const [message, setMessage] = useState<string>("");
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [buttonText, setButtonText] = useState<string>("Send");
  const [isSending, setIsSending] = useState<boolean>(false);

  useEffect(() => {
    if (delayAmount && delayUnit) {
      setButtonText(`Send in ${delayAmount} ${delayUnit}`);
    } else {
      setButtonText("Send");
    }
  }, [delayAmount, delayUnit]);

  const calculateDelayMs = () => {
    if (delayUnit === "seconds") return delayAmount * 1000;
    if (delayUnit === "minutes") return delayAmount * 60 * 1000;
    if (delayUnit === "hours") return delayAmount * 60 * 60 * 1000;
    return 0;
  };

  const handleSendMessage = async () => {
    setIsSending(true);
    const delayMs = calculateDelayMs();

    await new Promise((resolve) => setTimeout(resolve, delayMs));

    const payload = {
      text: `From RMA's Slack Bot: ${message}`,
    };

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Slack API error: ${response.status} ${errorText}`);
      }

      alert("Message sent successfully!");
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const isButtonDisabled = !delayAmount || !message || !webhookUrl || isSending;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 flex flex-col gap-4">
          <h1 className="text-2xl font-bold mb-4 text-center">Delayed Slack Message Sender</h1>

          <div className="flex flex-col gap-2">
            <Label>Delay Amount</Label>
            <Input
              type="number"
              min="0"
              value={delayAmount}
              onChange={(e) => setDelayAmount(Number(e.target.value))}
              placeholder="Enter delay"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Delay Unit</Label>
            <Select value={delayUnit} onValueChange={(value) => setDelayUnit(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seconds">Seconds</SelectItem>
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Slack Message</Label>
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Slack Webhook URL</Label>
            <Input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="Paste Slack Webhook URL"
            />
          </div>

          <Button onClick={handleSendMessage} disabled={isButtonDisabled} className="mt-4">
            {isSending ? "Sending..." : buttonText}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
