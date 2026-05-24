import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save, X } from "lucide-react";
import { adminListMissions, adminUpsertMission, adminDeleteMission } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/missions")({
  head: () => ({ meta: [{ title: "Admin · Missions — Bluechip CareerOS™" }] }),
  component: MissionsAdmin,
});

type MissionForm = {
  id?: string;
  title: string;
  description: string;
  xp_reward: number;
  coin_reward: number;
  category: string;
  active: boolean;
};

const empty: MissionForm = { title: "", description: "", xp_reward: 25, coin_reward: 5, category: "daily", active: true };

function MissionsAdmin() {
  const list = useServerFn(adminListMissions);
  const upsert = useServerFn(adminUpsertMission);
  const del = useServerFn(adminDeleteMission);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["admin-missions"], queryFn: () => list() });
  const [editing, setEditing] = useState<MissionForm | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-missions"] });

  const save = async () => {
    if (!editing || !editing.title.trim()) { toast.error("Title required"); return; }
    try {
      await upsert({ data: { ...editing, description: editing.description || null } });
      toast.success("Saved");
      setEditing(null);
      refresh();
    } catch (e: any) { toast.error(e.message); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this mission?")) return;
    try {
      await del({ data: { id } });
      toast.success("Deleted");
      refresh();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage daily, weekly, and one-off missions.</p>
        <button onClick={() => setEditing({ ...empty })}
          className="bg-gradient-brand text-white rounded-xl px-4 py-2 text-sm font-bold inline-flex items-center gap-2">
          <Plus className="size-4" /> New mission
        </button>
      </div>

      {editing && (
        <div className="glass rounded-2xl border p-5 space-y-3">
          <h3 className="font-display font-bold">{editing.id ? "Edit mission" : "New mission"}</h3>
          <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            placeholder="Title" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
          <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            placeholder="Description" rows={3} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <label className="text-xs">XP reward
              <input type="number" value={editing.xp_reward} onChange={(e) => setEditing({ ...editing, xp_reward: Number(e.target.value) })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm mt-1" />
            </label>
            <label className="text-xs">Coin reward
              <input type="number" value={editing.coin_reward} onChange={(e) => setEditing({ ...editing, coin_reward: Number(e.target.value) })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm mt-1" />
            </label>
            <label className="text-xs">Category
              <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm mt-1">
                <option value="daily">daily</option>
                <option value="weekly">weekly</option>
                <option value="oneoff">oneoff</option>
              </select>
            </label>
            <label className="text-xs">Active
              <select value={editing.active ? "1" : "0"} onChange={(e) => setEditing({ ...editing, active: e.target.value === "1" })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm mt-1">
                <option value="1">Yes</option><option value="0">No</option>
              </select>
            </label>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm border border-border rounded-lg inline-flex items-center gap-2">
              <X className="size-3" /> Cancel
            </button>
            <button onClick={save} className="bg-gradient-brand text-white px-4 py-2 text-sm rounded-lg inline-flex items-center gap-2">
              <Save className="size-3" /> Save
            </button>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-right px-4 py-3">XP</th>
              <th className="text-right px-4 py-3">Coins</th>
              <th className="text-center px-4 py-3">Active</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="px-4 py-6 text-muted-foreground">Loading…</td></tr>}
            {(data ?? []).map((m: any) => (
              <tr key={m.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium">{m.title}</div>
                  {m.description && <div className="text-xs text-muted-foreground truncate max-w-md">{m.description}</div>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{m.category}</td>
                <td className="px-4 py-3 text-right font-mono text-electric">{m.xp_reward}</td>
                <td className="px-4 py-3 text-right font-mono text-gold">{m.coin_reward}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${m.active ? "bg-electric/20 text-electric" : "bg-muted text-muted-foreground"}`}>{m.active ? "Live" : "Off"}</span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => setEditing({
                    id: m.id, title: m.title, description: m.description ?? "", xp_reward: m.xp_reward,
                    coin_reward: m.coin_reward, category: m.category, active: m.active,
                  })} className="text-xs text-electric hover:underline">Edit</button>
                  <button onClick={() => remove(m.id)} className="text-xs text-destructive hover:underline inline-flex items-center gap-1">
                    <Trash2 className="size-3" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
