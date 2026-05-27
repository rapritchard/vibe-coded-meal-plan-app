interface ParallelTasksPanelProps {
  tasks: string[];
}

export function ParallelTasksPanel({ tasks }: ParallelTasksPanelProps) {
  return (
    <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 space-y-1">
      <div className="text-xs font-bold text-sky-800 mb-1">
        Do these simultaneously
      </div>
      {tasks.map((t, i) => (
        <div key={i} className="text-xs text-sky-700 flex gap-2">
          <span>–</span>
          <span>{t}</span>
        </div>
      ))}
    </div>
  );
}
