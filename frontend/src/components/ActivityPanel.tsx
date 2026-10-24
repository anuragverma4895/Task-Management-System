import { useEffect, useState } from "react";
import { Activity as ActivityIcon, CheckCircle2, CirclePlus, Clock3, Pencil, Trash2 } from "lucide-react";
import api from "../api/client";

interface ActivityRecord {
  _id: string;
  action: "created" | "updated" | "status_changed" | "completed" | "deleted";
  taskTitle: string;
  summary: string;
  createdAt: string;
}

const actionIcons = {
  created: CirclePlus,
  updated: Pencil,
  status_changed: ActivityIcon,
  completed: CheckCircle2,
  deleted: Trash2
};

export default function ActivityPanel() {
  const [items, setItems] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get<{ data: ActivityRecord[] }>("/activity", { params: { limit: 100 } })
      .then(response => { if (active) setItems(response.data.data); })
      .catch(requestError => { if (active) setError(requestError instanceof Error ? requestError.message : "Could not load activity."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return <section className="panel activity-panel">
    <div className="panel-heading"><div><h2>Recent activity</h2><p>A history of changes made in your account.</p></div><span className="count-pill">{items.length}</span></div>
    {loading ? <div className="activity-empty"><Clock3 size={22}/> Loading your activity…</div>
      : error ? <div className="activity-empty activity-error">{error}</div>
      : items.length === 0 ? <div className="activity-empty"><ActivityIcon size={24}/><strong>No activity yet</strong><span>Create or update a task and your history will appear here.</span></div>
      : <div className="activity-list">{items.map(item => { const Icon = actionIcons[item.action]; return <article className="activity-entry" key={item._id}><span className="activity-entry-icon"><Icon size={16}/></span><div className="activity-entry-copy"><strong>{item.summary}</strong><p>{item.taskTitle}</p><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time></div></article>; })}</div>}
  </section>;
}
