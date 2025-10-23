import React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { month: "Jan", sales: 42000 },
  { month: "Feb", sales: 48000 },
  { month: "Mar", sales: 51000 },
  { month: "Apr", sales: 47000 },
  { month: "May", sales: 55000 },
  { month: "Jun", sales: 62000 },
  { month: "Jul", sales: 59000 },
  { month: "Aug", sales: 68000 },
  { month: "Sep", sales: 72000 },
  { month: "Oct", sales: 78000 },
  { month: "Nov", sales: 85000 },
  { month: "Dec", sales: 92000 },
];

const SalesTrendChart = () => {
  return (
    <div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="month" 
              stroke="#cbd5e1"
              fontSize={12}
            />
            <YAxis 
              stroke="#cbd5e1"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000)}k`}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div style={{
                      backgroundColor: '#1a1f2e',
                      border: '1px solid #2e3650',
                      borderRadius: '8px',
                      padding: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', margin: '0 0 4px 0' }}>
                        {payload[0].payload.month}
                      </p>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#3b82f6', margin: '0' }}>
                        ${payload[0].value?.toLocaleString()}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="sales" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fill="url(#salesGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
    </div>
  );
};

export default SalesTrendChart;