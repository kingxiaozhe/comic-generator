"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Key, CheckCircle, AlertCircle } from "lucide-react";
import { ActivationService } from "@/lib/activation";

interface ActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ActivationModal({
  isOpen,
  onClose,
  onSuccess,
}: ActivationModalProps) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleActivate = () => {
    if (!code.trim()) {
      setMessage("请输入激活码");
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);

    // 模拟验证延迟
    setTimeout(() => {
      const result = ActivationService.activateCode(code);
      setMessage(result.message);
      setIsSuccess(result.success);

      if (result.success) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }

      setIsLoading(false);
    }, 1000);
  };

  const handleClose = () => {
    setCode("");
    setMessage("");
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 bg-white shadow-xl">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-500" />
              输入激活码
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* 激活码输入区域 */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="activation-code">激活码</Label>
              <div className="mt-1.5 relative">
                <Input
                  id="activation-code"
                  type="text"
                  placeholder="请输入激活码"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="pr-8"
                />
                <Key className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg ${
                  isSuccess ? "bg-green-50" : "bg-red-50"
                }`}
              >
                <div className="flex items-center">
                  {isSuccess ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                  )}
                  <p
                    className={`text-sm ${
                      isSuccess ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {message}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleClose}>
                取消
              </Button>
              <Button
                onClick={handleActivate}
                disabled={!code.trim() || isLoading}
              >
                {isLoading ? "激活中..." : "激活"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
