import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import React from 'react';
import { Skill } from '../types';

interface SkillCardProps {
  skill: Skill;
}

export const SkillCard: React.FC<SkillCardProps> = ({ skill }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'acquired': return 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50';
      case 'missing': return 'bg-rose-900/30 text-rose-400 border-rose-800/50';
      case 'in-progress': return 'bg-amber-900/30 text-amber-400 border-amber-800/50';
      default: return 'bg-slate-800 text-slate-300';
    }
  };

  const getIcon = (status: string) => {
    switch (status) {
      case 'acquired': return <CheckCircle2 className="w-4 h-4" />;
      case 'missing': return <XCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center space-x-2 ${getStatusColor(skill.status)}`}>
      {getIcon(skill.status)}
      <span>{skill.name}</span>
    </div>
  );
};