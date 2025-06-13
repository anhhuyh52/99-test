import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowUpDown,
  AlertCircle,
  CheckCircle,
  Loader2,
  TrendingUp,
  Wallet,
  Settings,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { TokenSelector } from "./TokenSelector";
import { SettingsModal } from "./SettingsModal";

// Types and Interfaces (unchanged)
interface Token {
  currency: string;
  date: string;
  price: number;
}

interface ErrorState {
  amount?: string;
  balance?: string;
  tokens?: string;
  same?: string;
  api?: string;
}

// Token configuration (unchanged)
const TOKEN_CONFIG: { [key: string]: { balance: number } } = {
  ETH: { balance: 10.5 },
  USDC: { balance: 245.8 },
  WBTC: { balance: 0.025 },
  BLUR: { balance: 1200 },
  GMX: { balance: 5.2 },
  ATOM: { balance: 150 },
  OSMO: { balance: 890 },
  OKB: { balance: 15.8 },
  OKT: { balance: 45.2 },
  ZIL: { balance: 5000 },
};

// Main Component
const EnhancedTokenSwap: React.FC = () => {
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ErrorState>({});
  const [success, setSuccess] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [slippage, setSlippage] = useState<number>(0.5);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loadingPrices, setLoadingPrices] = useState<boolean>(true);

  useEffect(() => {
    const fetchPrices = async (): Promise<void> => {
      try {
        const response = await fetch(
          "https://interview.switcheo.com/prices.json"
        );
        const pricesData: Token[] = await response.json();

        // Deduplicate tokens by currency
        const uniqueTokensMap = new Map<string, Token>();
        for (const token of pricesData) {
          if (!uniqueTokensMap.has(token.currency)) {
            uniqueTokensMap.set(token.currency, token);
          }
        }

        const uniqueTokens = Array.from(uniqueTokensMap.values());

        // Optional: Sort ETH and USDC to the top
        uniqueTokens.sort((a, b) => {
          const order = ["ETH", "USDC"];
          const aIndex = order.indexOf(a.currency);
          const bIndex = order.indexOf(b.currency);
          if (aIndex !== -1 || bIndex !== -1) return aIndex - bIndex;
          return 0;
        });

        setTokens(uniqueTokens);

        const ethToken = uniqueTokens.find((t) => t.currency === "ETH") ?? null;
        const usdcToken =
          uniqueTokens.find((t) => t.currency === "USDC") ?? null;

        setFromToken(ethToken);
        setToToken(usdcToken);
      } catch (error) {
        console.error("Error fetching prices:", error);
        setErrors({
          api: "Failed to load token prices. Please refresh the page.",
        });
      } finally {
        setLoadingPrices(false);
      }
    };

    fetchPrices();
  }, []);

  useEffect(() => {
    if (
      fromAmount &&
      !isNaN(parseFloat(fromAmount)) &&
      parseFloat(fromAmount) > 0 &&
      fromToken &&
      toToken
    ) {
      const rate = fromToken.price / toToken.price;
      const calculatedAmount = (parseFloat(fromAmount) * rate).toFixed(8);
      setToAmount(calculatedAmount);
    } else {
      setToAmount("");
    }
  }, [fromAmount, fromToken, toToken]);

  const handleFromAmountChange = useCallback((value: string): void => {
    setFromAmount(value);
    setErrors({});
  }, []);

  const handleSwapTokens = useCallback((): void => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  }, [fromToken, toToken, fromAmount, toAmount]);

  const validateSwap = (): ErrorState => {
    const newErrors: ErrorState = {};
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }
    if (fromToken && TOKEN_CONFIG[fromToken.currency]) {
      const balance = TOKEN_CONFIG[fromToken.currency].balance;
      if (parseFloat(fromAmount) > balance) {
        newErrors.balance = `Insufficient ${fromToken.currency} balance`;
      }
    }
    if (!fromToken || !toToken) {
      newErrors.tokens = "Please select both tokens";
    }
    if (fromToken?.currency === toToken?.currency) {
      newErrors.same = "Cannot swap the same token";
    }
    return newErrors;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    e.preventDefault();
    const validationErrors = validateSwap();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsLoading(true);
    setErrors({});
    setSuccess(false);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSuccess(true);
      setFromAmount("");
      setToAmount("");
    } catch (error) {
      console.error("Swap failed:", error);
      setErrors({ api: "Swap failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const exchangeRate =
    fromToken && toToken ? fromToken.price / toToken.price : 0;
  const priceImpact = 0.03;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-2 m-auto">
        <div className="max-w-md mx-auto pt-4">
          {/* Header */}
          <Card className="bg-transparent border-none shadow-none">
            <CardHeader className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                Token Exchange
              </h1>
              <p className="text-muted-foreground">
                Trade tokens with zero slippage and MEV protection
              </p>
            </CardHeader>
            <CardContent>
              {/* Loading State */}
              {loadingPrices && (
                <Card className="mb-6">
                  <CardContent className="p-8 text-center">
                    <Skeleton className="w-8 h-8 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                  </CardContent>
                </Card>
              )}

              {/* Error State */}
              {errors.api && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-5 w-5" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errors.api}</AlertDescription>
                </Alert>
              )}

              {/* Success Message */}
              {success && (
                <Alert variant="default" className="mb-6 bg-green-50">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    Swap executed successfully! 🎉
                  </AlertDescription>
                </Alert>
              )}

              {/* Main Form */}
              {!loadingPrices && !errors.api && fromToken && toToken && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-end mb-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowSettings(true)}
                          >
                            <Settings className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Transaction Settings</TooltipContent>
                      </Tooltip>
                    </div>

                    {/* From Token Section */}
                    <div className="space-y-3 border border-gray-200 p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="from-amount"
                          className="text-sm font-medium"
                        >
                          From
                        </Label>
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Wallet className="w-3 h-3" />
                          Balance:{" "}
                          {TOKEN_CONFIG[fromToken.currency]?.balance || 0}{" "}
                          {fromToken.currency}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-4">
                        <div className="w-1/2">
                          <TokenSelector
                            tokens={tokens}
                            onSelect={setFromToken}
                            current={fromToken}
                          />
                        </div>
                        <div className="w-1/2">
                        <Input
                          id="from-amount"
                          placeholder="Type token number"
                          value={fromAmount}
                          onChange={(e) => {
                            handleFromAmountChange(e.target.value);
                          }}
                          className="text-right text-xl font-semibold bg-transparent border-none"
                          step="any"
                        />
                        </div>
                      </div>
                    </div>

                    {/* Swap Button */}
                    <div className="flex justify-center my-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handleSwapTokens}
                            className="w-12 h-12 rounded-full"
                          >
                            <ArrowUpDown className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Swap Tokens</TooltipContent>
                      </Tooltip>
                    </div>

                    {/* To Token Section */}
                    <div className="space-y-3 border border-gray-200 p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="to-amount"
                          className="text-sm font-medium"
                        >
                          To
                        </Label>
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Wallet className="w-3 h-3" />
                          Balance:{" "}
                          {TOKEN_CONFIG[toToken.currency]?.balance || 0}{" "}
                          {toToken.currency}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-4">
                        <div className="w-1/2">
                          <TokenSelector
                            tokens={tokens}
                            onSelect={setToToken}
                            current={toToken}
                          />
                        </div>
                        <div className="w-1/2">
                          <Input
                            id="to-amount"
                            placeholder="0"
                            value={toAmount}
                            disabled
                            className="text-right text-xl font-semibold bg-transparent border-none"
                            step="any"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Exchange Info */}
                    {fromAmount && toAmount && fromToken && toToken && (
                      <div className="mt-4">
                        <Separator className="my-4" />
                        <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Exchange Rate
                            </span>
                            <span className="font-medium">
                              1 {fromToken.currency} = {exchangeRate.toFixed(6)}{" "}
                              {toToken.currency}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Price Impact
                            </span>
                            <span className="font-medium text-green-600">
                              &lt; {priceImpact}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Network Fee
                            </span>
                            <span className="font-medium">~$2.50</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error Messages */}
                    {Object.keys(errors).length > 0 && (
                      <div className="mt-4 space-y-2">
                        {Object.values(errors).map((error, index) => (
                          <Alert key={index} variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      onClick={handleSubmit}
                      disabled={
                        isLoading ||
                        !fromAmount ||
                        !toAmount ||
                        Object.keys(errors).length > 0
                      }
                      className="w-full mt-6"
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Executing Swap...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-5 h-5 mr-2" />
                          Swap Tokens
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Footer */}
              <div className="text-center mt-8 text-xs text-muted-foreground">
                Powered by DeSwap Protocol v2.0 • Zero MEV • Institutional Grade
                Security
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Modal */}
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          slippage={slippage}
          setSlippage={setSlippage}
        />
      </div>
    </TooltipProvider>
  );
};

export default EnhancedTokenSwap;
