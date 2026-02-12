'use client';

import { useEffect, useState } from 'react';
import { getTasks, Task } from '@/lib/api';
import useApi from '@/lib/useApi';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { CheckCircle2, Circle, Clock, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
    const tasksApi = useApi<Task[]>();
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        tasksApi.execute(() => getTasks());
    }, []);

    useEffect(() => {
        if (tasksApi.data) {
            setTasks(tasksApi.data);
        }
    }, [tasksApi.data]);

    // Calculate stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.is_completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const highPriorityTasks = tasks.filter(t => t.priority === 'high' && !t.is_completed).length;

    // Chart Data
    const statusData = [
        { name: 'Completed', value: completedTasks },
        { name: 'Pending', value: pendingTasks },
    ];

    const priorityData = [
        { name: 'High', value: tasks.filter(t => t.priority === 'high').length },
        { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length },
        { name: 'Low', value: tasks.filter(t => t.priority === 'low').length },
    ];

    const COLORS = ['#00f3ff', '#bc13fe', '#ff007f', '#0ea5e9'];

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                    <span className="text-neon-cyan">Neural</span> Core <span className="text-neon-purple opacity-50">v3.0</span>
                </h1>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mt-2">
                    Workspace State: <span className="text-neon-cyan animate-flicker">Synchronized</span>
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-panel p-6 border-white/5 hover:border-neon-cyan/30 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-medium group-hover:text-neon-cyan transition-colors">Total Tasks</h3>
                        <div className="p-2 bg-neon-cyan/10 text-neon-cyan rounded-lg shadow-[0_0_10px_rgba(0,243,255,0.2)]">
                            <Circle className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-white">{totalTasks}</p>
                </div>

                <div className="glass-panel p-6 border-white/5 hover:border-neon-purple/30 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-medium group-hover:text-neon-purple transition-colors">Completed</h3>
                        <div className="p-2 bg-neon-purple/10 text-neon-purple rounded-lg shadow-[0_0_10px_rgba(188,19,254,0.2)]">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-white">{completedTasks}</p>
                </div>

                <div className="glass-panel p-6 border-white/5 hover:border-neon-blue/30 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-medium group-hover:text-neon-blue transition-colors">Pending</h3>
                        <div className="p-2 bg-neon-blue/10 text-neon-blue rounded-lg shadow-[0_0_10px_rgba(14,165,233,0.2)]">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-white">{pendingTasks}</p>
                </div>

                <div className="glass-panel p-6 border-white/5 hover:border-neon-pink/30 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-medium group-hover:text-neon-pink transition-colors">High Priority</h3>
                        <div className="p-2 bg-neon-pink/10 text-neon-pink rounded-lg shadow-[0_0_10px_rgba(255,0,127,0.2)]">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-white">{highPriorityTasks}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Status Chart */}
                <div className="glass-panel p-8 border-white/5">
                    <h3 className="text-xl font-semibold text-white mb-8 border-b border-white/5 pb-4">Task Status Distribution</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                            style={{ filter: `drop-shadow(0 0 8px ${COLORS[index % COLORS.length]}80)` }}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(5, 5, 10, 0.8)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#fff', paddingTop: '20px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Priority Chart */}
                <div className="glass-panel p-8 border-white/5">
                    <h3 className="text-xl font-semibold text-white mb-8 border-b border-white/5 pb-4">Tasks by Priority Level</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={priorityData}>
                                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(5, 5, 10, 0.8)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar
                                    dataKey="value"
                                    fill="url(#neonGradient)"
                                    radius={[6, 6, 0, 0]}
                                    barSize={40}
                                />
                                <defs>
                                    <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#00f3ff" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#bc13fe" stopOpacity={0.3} />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
