'use client';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";

interface Token {
  currency: string;
  date: string;
  price: number;
}

interface TokenSelectorProps {
  tokens: Token[];
  onSelect: (token: Token | null) => void;
  current?: Token | null;
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({
  tokens,
  onSelect,
  current,
}) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Token | null>(current || null);
  const [query, setQuery] = useState("");

  const filteredTokens =
    query === ""
      ? tokens
      : tokens.filter((token) =>
          token.currency.toLowerCase().includes(query.toLowerCase())
        );

  const getTokenIconPath = (symbol: string) =>
    `/src/assets/${symbol}.svg`;

  useEffect(() => {
    onSelect(selected);
  }, [selected]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected ? (
            <div className="flex items-center gap-2">
              <img
                src={getTokenIconPath(selected.currency)}
                alt={selected.currency}
                className="w-5 h-5 rounded-full"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              {selected.currency}
            </div>
          ) : (
            "Select token"
          )}
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search tokens..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>No tokens found.</CommandEmpty>
            <CommandGroup>
              {filteredTokens.map((token) => (
                <CommandItem
                  key={token.currency}
                  value={token.currency}
                  onSelect={() => {
                    setSelected(token);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <div className="flex items-center gap-2 w-full">
                    <img
                      src={getTokenIconPath(token.currency)}
                      alt={token.currency}
                      className="w-5 h-5 rounded-full"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    {token.currency}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selected?.currency === token.currency
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
