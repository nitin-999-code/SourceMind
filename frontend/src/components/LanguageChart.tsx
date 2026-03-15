import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

export function LanguageChart({ languages, totalFilesScanned }: { languages: Record<string, number> | undefined, totalFilesScanned?: number }) {
  const { data } = useMemo(() => {
    if (!languages || Object.keys(languages).length === 0) return { data: [] };
    
    let total = 0;
    const entries = Object.entries(languages).map(([name, value]) => {
      total += value;
      return { name, value };
    });

    const formattedData = entries.map(e => ({
      ...e,
      percentage: ((e.value / total) * 100).toFixed(1)
    })).sort((a, b) => b.value - a.value).slice(0, 10); // top 10
    
    return { data: formattedData };
  }, [languages]);

  if (data.length === 0) {
    return <div className="text-sm flex items-center h-48 justify-center rounded-xl" style={{ color: '#94A3B8', background: '#0F243D', border: '1px solid rgba(255,255,255,0.08)' }}>No language data detected.</div>;
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="text-sm px-4 py-2 rounded-xl flex justify-between items-center" style={{ color: '#94A3B8', background: '#0F243D', border: '1px solid rgba(255,255,255,0.08)' }}>
        <span>Based on repository language analysis.</span>
        {totalFilesScanned && <span className="font-medium" style={{ color: '#F1F5F9' }}>{totalFilesScanned} total files scanned</span>}
      </div>
      
      <div className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-xl h-full" style={{ background: '#0F243D', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="w-48 h-48 shrink-0 relative group">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                className="transition-all duration-300 group-hover:opacity-90"
              >
                {data.map((_e, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(_value: any, name: any, props: any) => [`${props.payload.percentage}%`, name]}
                contentStyle={{ backgroundColor: '#162B4A', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }} 
                itemStyle={{ color: '#F1F5F9' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex-1 w-full space-y-3 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-border pr-2">
          {data.map((lang, index) => (
            <div key={lang.name} className="flex items-center justify-between text-sm group p-2 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.03)]">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm transition-transform group-hover:scale-125" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="font-semibold">{lang.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground text-xs font-mono">{lang.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
