"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CATEGORIES } from "@/lib/categories";

type Transaction = {
  _id: string;
  userId: string;
  amount: number;
  currency: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function TransactionList({ refreshKey }: { refreshKey: number }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category !== "all") params.set("category", category);
    if (type !== "all") params.set("type", type);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return `/api/transactions?${params.toString()}`;
  }, [q, category, type, from, to, refreshKey]);

  const { data, error, mutate } = useSWR(query, fetcher);
  const items = data?.items || [];

  // Debug logging
  console.log("TransactionList - Current filters:", {
    q,
    category,
    type,
    from,
    to,
  });
  console.log("TransactionList - Query:", query);
  console.log("TransactionList - Data:", data);
  console.log("TransactionList - Items count:", items.length);

  async function remove(id: string) {
    try {
      await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      mutate();
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  }

  function clearFilters() {
    setQ("");
    setCategory("all");
    setType("all");
    setFrom("");
    setTo("");
    mutate(); // Re-fetch with no filters
  }

  return (
    <div className="space-y-4">
      {/* All filters in one row with optimized spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
        {/* Search - takes 2 columns on large screens */}
        <div className="sm:col-span-2 lg:col-span-2">
          <Label className="text-sm font-medium cursor-pointer">Search</Label>
          <Input
            placeholder="Search description/category"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="mt-1 cursor-text"
          />
        </div>

        {/* Category - compact column */}
        <div>
          <Label className="text-sm font-medium cursor-pointer">Category</Label>
          <Select onValueChange={(v) => setCategory(v)} value={category}>
            <SelectTrigger className="mt-1 cursor-pointer">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type - compact column */}
        <div>
          <Label className="text-sm font-medium cursor-pointer">Type</Label>
          <Select onValueChange={(v) => setType(v)} value={type}>
            <SelectTrigger className="mt-1 cursor-pointer">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date range - takes 2 columns for wider From and To fields */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-sm font-medium cursor-pointer">From</Label>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="mt-1 cursor-pointer"
              />
            </div>
            <div>
              <Label className="text-sm font-medium cursor-pointer">To</Label>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="mt-1 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Clear Filters Button */}
      {(q || category !== "all" || type !== "all" || from || to) && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-xs cursor-pointer"
          >
            Clear All Filters
          </Button>
        </div>
      )}

      <div className="rounded-md border divide-y">
        
        {error ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Unable to load transactions. Please check your connection and try
            again.
          </div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            <div>No transactions found.</div>
            <div className="mt-2 text-xs">
              {q || category !== "all" || type !== "all" || from || to ? (
                <>
                  {/* Active filters: {q && `Search: "${q}" `}
                  {category !== "all" && `Category: ${category} `}
                  {type !== "all" && `Type: ${type} `}
                  {from && `From: ${from} `}
                  {to && `To: ${to}`} */}
                </>
              ) : (
                "No filters applied. Check if transactions exist in database."
              )}
            </div>
          </div>
        ) : (
          <>
            {items.map((t: Transaction) => (
              <div
                key={t._id}
                className="m-3 rounded-lg border bg-background shadow-sm"
              >
                <div className="p-3 sm:p-4">
                  {/* Mobile layout - stacked */}
                  <div className="flex flex-col sm:hidden space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {t.description?.replace(/^"|"$/g, "") || t.category}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(t.date).toLocaleDateString()} • {t.category}
                        </div>
                      </div>
                      <div
                        className={`font-semibold text-right ${
                          t.type === "INCOME"
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {t.type === "INCOME" ? "+" : "-"}$
                        {Math.abs(t.amount).toFixed(2)}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs cursor-pointer"
                        onClick={() => setDeleteId(t._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  {/* Desktop layout - horizontal */}
                  <div className="hidden sm:flex items-center justify-between">
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="text-sm font-medium">
                        {t.description?.replace(/^"|"$/g, "") || t.category}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(t.date).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t.category}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div
                        className={`font-semibold ${
                          t.type === "INCOME"
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {t.type === "INCOME" ? "+" : "-"}$
                        {Math.abs(t.amount).toFixed(2)}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => setDeleteId(t._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Delete Confirmation Dialog */}
            <AlertDialog
              open={!!deleteId}
              onOpenChange={(open) => !open && setDeleteId(null)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                  <AlertDialogDescription>
                    {deleteId &&
                      items.find((t: Transaction) => t._id === deleteId) && (
                        <>
                          Are you sure you want to delete "
                          {items.find((t: Transaction) => t._id === deleteId)
                            ?.description ||
                            items.find((t: Transaction) => t._id === deleteId)
                              ?.category}
                          " for $
                          {items
                            .find((t: Transaction) => t._id === deleteId)
                            ?.amount.toFixed(2)}
                          ? This action cannot be undone.
                        </>
                      )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteId && remove(deleteId)}
                    className="bg-red-600 hover:bg-red-700 cursor-pointer"
                  >
                    Yes, Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </div>
  );
}
