import { Award, BookOpen, Target } from 'lucide-react';
import React from 'react';
import { CareerAnalysis, WeeklyPlan } from '../types';
import { ScoreGauge } from './ScoreGauge';

interface DashboardCardsProps {
  analysis: CareerAnalysis | null;
  plan: WeeklyPlan[] | null;
  targetRole: string;
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ analysis, plan, targetRole }) => {
  // Calculate completion stats
  const totalTasks = plan?.reduce((acc, week) => acc + week.tasks.length, 0) || 0;
  const completedTasks = plan?.reduce((acc, week) => acc + week.tasks.filter(t => t.completed).length, 0) || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate skills stats
  const acquiredSkills = analysis?.skills?.filter(s => s.status === 'acquired').length || 0;
  const totalSkills = analysis?.skills?.length || 0;
  const skillsProgress = totalSkills > 0 ? Math.round((acquiredSkills / totalSkills) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Career Readiness Card */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-[24px] border border-slate-700/50 shadow-2xl shadow-slate-900/30 hover:shadow-orange-500/10 transition-all duration-300 group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-[24px]"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-orange-500/20 rounded-2xl border border-orange-500/30">
              <Award className="w-6 h-6 text-orange-400" />
            </div>
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Readiness</span>
          </div>

          <div className="mb-4">
            <ScoreGauge score={analysis?.readinessScore || 0} />
          </div>

          <h3 className="text-lg font-bold text-white mb-2">Career Readiness</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your overall preparedness for {targetRole} roles based on skills analysis.
          </p>
        </div>
      </div>

      {/* Learning Progress Card */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-[24px] border border-slate-700/50 shadow-2xl shadow-slate-900/30 hover:shadow-emerald-500/10 transition-all duration-300 group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-[24px]"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
              <BookOpen className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Progress</span>
          </div>

          <div className="mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>{completedTasks} completed</span>
                  <span>{totalTasks} total</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{completionRate}%</div>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white mb-2">Learning Journey</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Track your progress through personalized learning plans and skill development.
          </p>
        </div>
      </div>

      {/* Skills Overview Card */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-[24px] border border-slate-700/50 shadow-2xl shadow-slate-900/30 hover:shadow-amber-500/10 transition-all duration-300 group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 rounded-[24px]"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/30">
              <Target className="w-6 h-6 text-amber-400" />
            </div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Skills</span>
          </div>

          <div className="mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${skillsProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>{acquiredSkills} acquired</span>
                  <span>{totalSkills} tracked</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{skillsProgress}%</div>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white mb-2">Skills Mastery</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Monitor your technical and soft skills development across different categories.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;