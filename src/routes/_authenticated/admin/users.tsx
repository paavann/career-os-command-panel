import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { adminListUsers, adminAdjustUser, adminGrantRole } from "@/lib/admin.functions";
import { Search, Shield, ShieldOff } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Admin · Users — Bluechip CareerOS™" }] }),
  component: UsersAdmin,
});

function UsersAdmin() {
  const [search, setSearch] = useState("");
  const list = useServerFn(adminListUsers);
  const adjust = useServerFn(adminAdjustUser);
  const grant = useServerFn(adminGrantRole);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search],
    queryFn: () => list({ data: { search: search || undefined } }),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-users"] });

  const onAdjust = async (userId: string, patch: any) => {
    try {
      await adjust({ data: { userId, ...patch } });
      toast.success("Updated");
      refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const onRole = async (userId: string, role: "admin", action: "grant" | "revoke") => {
    try {
      await grant({ data: { userId, role, action } });
      toast.success(action === "grant" ? "Admin granted" : "Admin revoked");
      refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 glass rounded-xl border px-4 py-2">
        <Search className="size-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by display name…"
          className="flex-1 bg-transparent text-sm focus:outline-none" />
      </div>

      <div className="glass rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3">Operator</th>
              <th className="text-left px-4 py-3">Tier</th>
              <th className="text-right px-4 py-3">XP</th>
              <th className="text-right px-4 py-3">Coins</th>
              <th className="text-left px-4 py-3">Roles</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="px-4 py-6 text-muted-foreground">Loading…</td></tr>}
            {(data ?? []).map((u: any) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium">{u.display_name}</div>
                  <div className="text-xs text-muted-foreground">{u.headline || "—"}</div>
                </td>
                <td className="px-4 py-3">
                  <select defaultValue={u.tier} onChange={(e) => onAdjust(u.id, { tier: e.target.value })}
                    className="bg-background border border-border rounded px-2 py-1 text-xs">
                    <option value="L1">L1</option><option value="L2">L2</option><option value="L3">L3</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <input type="number" defaultValue={u.xp} onBlur={(e) => {
                    const v = Number(e.target.value);
                    if (v !== u.xp) onAdjust(u.id, { xp: v });
                  }} className="bg-background border border-border rounded px-2 py-1 text-xs w-24 text-right font-mono" />
                </td>
                <td className="px-4 py-3 text-right">
                  <input type="number" defaultValue={u.coins} onBlur={(e) => {
                    const v = Number(e.target.value);
                    if (v !== u.coins) onAdjust(u.id, { coins: v });
                  }} className="bg-background border border-border rounded px-2 py-1 text-xs w-20 text-right font-mono" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {(u.roles ?? []).map((r: string) => (
                      <span key={r} className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${r === "admin" ? "bg-gold/20 text-gold" : "bg-muted text-muted-foreground"}`}>{r}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  {u.roles?.includes("admin") ? (
                    <button onClick={() => onRole(u.id, "admin", "revoke")} className="text-xs inline-flex items-center gap-1 text-destructive hover:underline">
                      <ShieldOff className="size-3" /> Revoke
                    </button>
                  ) : (
                    <button onClick={() => onRole(u.id, "admin", "grant")} className="text-xs inline-flex items-center gap-1 text-gold hover:underline">
                      <Shield className="size-3" /> Make admin
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
