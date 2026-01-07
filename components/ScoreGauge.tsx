import React from 'react';
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';

interface ScoreGaugeProps {
  score: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
  // Always show a "Potential" that is higher than current score to encourage growth
  // If score is 0-50, potential is +40. If 50-80, potential is +15.
  let potential = score < 60 ? score + 40 : score + 15;
  if (potential > 100) potential = 100;

  const data = [
    { 
      name: 'Future Potential', 
      value: potential, 
      fill: '#fb923c', // Orange 400 (lighter, background track)
      opacity: 0.2
    },
    { 
      name: 'Starting Point', 
      value: score, 
      fill: score > 75 ? '#10b981' : '#f97316', // Green if high, else Orange
      opacity: 1
    }
  ];

  return (
    <div className="relative w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="70%" 
          outerRadius="100%" 
          barSize={15} 
          data={data} 
          startAngle={180} 
          endAngle={0}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background={{ fill: '#1e293b' }}
            dataKey="value"
            cornerRadius={10}
            label={false}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/4 text-center pointer-events-none w-full">
        <div className="text-4xl font-bold text-white tracking-tight">{score}%</div>
        <div className="text-xs text-orange-200 font-medium uppercase tracking-wide mt-1">Match Potential</div>
        
        {score < 100 && (
          <div className="inline-block mt-2 px-2 py-0.5 rounded bg-orange-500/20 text-[10px] text-orange-300 border border-orange-500/30">
            Aiming for {potential}%
          </div>
        )}
      </div>
    </div>
  );
};