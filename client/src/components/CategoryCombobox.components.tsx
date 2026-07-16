'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ReloadIcon } from '@radix-ui/react-icons';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { IApiResponse } from '@/api/client.api';

export function CategoryCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);

  // Fetch category options
  const { data: catOptionsData, isLoading: catIsLoading } = useQuery<
    IApiResponse<{ _id: string; name: string }[]>
  >({
    queryKey: ['categories', 'all'],
    queryFn: async () => {
      const response =
        await axios.get<IApiResponse<{ _id: string; name: string }[]>>(
          `/api/categories/`
        );
      return response.data;
    },
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={catIsLoading}
          className="w-full justify-between capitalize"
        >
          {value
            ? catOptionsData?.data.find((cat) => cat._id === value)?.name
            : 'Select category...'}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          {catIsLoading ? (
            <div className="flex h-20 items-center justify-center text-gray-500">
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            </div>
          ) : (
            <>
              <CommandInput placeholder="Search category..." className="h-9" />
              <CommandList>
                <CommandEmpty>No category found.</CommandEmpty>
                <CommandGroup>
                  {catOptionsData?.data.map((category) => (
                    <CommandItem
                      key={category._id}
                      value={category.name}
                      onSelect={() => {
                        onChange(category._id);
                        setOpen(false);
                      }}
                      className="capitalize"
                    >
                      {category.name}
                      <Check
                        className={cn(
                          'ml-auto',
                          value === category._id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
