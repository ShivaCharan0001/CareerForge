import { AlertTriangle, CheckCircle, Circle, Target, TrendingUp } from 'lucide-react';
import React from 'react';
import { CareerAnalysis } from '../types';

interface SkillsContainerProps {
  analysis: CareerAnalysis | null;
  onGeneratePlan?: () => void;
  isGeneratingPlan?: boolean;
  planError?: string;
}

const SkillsContainer: React.FC<SkillsContainerProps> = ({
  analysis,
  onGeneratePlan,
  isGeneratingPlan,
  planError
}) => {
  if (!analysis) return null;

  const acquiredSkills = analysis.skills?.filter(s => s.status === 'acquired') || [];
  const missingSkills = analysis.skills?.filter(s => s.status === 'missing') || [];

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-[24px] border border-slate-700/50 shadow-2xl shadow-slate-900/30 overflow-hidden">
      {/* Header */}
      <div className="p-8 border-b border-slate-700/30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Skills Assessment</h2>
            <p className="text-slate-400">Comprehensive breakdown of your technical capabilities</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400">{analysis.skills?.length || 0}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Total Skills</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">{acquiredSkills.length}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Acquired</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">{missingSkills.length}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">To Learn</div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-lg font-bold text-emerald-400">{acquiredSkills.length}</div>
                <div className="text-sm text-emerald-500/70">Skills Mastered</div>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20">
            <div className="flex items-center space-x-3">
              <Target className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-lg font-bold text-amber-400">{missingSkills.length}</div>
                <div className="text-sm text-amber-500/70">Skills to Develop</div>
              </div>
            </div>
          </div>

          <div className="bg-orange-500/10 rounded-2xl p-4 border border-orange-500/20">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              <div>
                <div className="text-lg font-bold text-orange-400">
                  {analysis.skills?.length ? Math.round((acquiredSkills.length / analysis.skills.length) * 100) : 0}%
                </div>
                <div className="text-sm text-orange-500/70">Completion Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Acquired Skills */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-emerald-400">Acquired Skills</h3>
              <span className="text-sm text-slate-500">({acquiredSkills.length})</span>
            </div>
            <div className="space-y-3">
              {acquiredSkills.map(skill => (
                <div key={skill.name} className="flex items-center space-x-3 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-200 font-medium">{skill.name}</span>
                  <span className="text-xs text-emerald-500/70 bg-emerald-500/10 px-2 py-1 rounded-full ml-auto">
                    {skill.category}
                  </span>
                </div>
              ))}
              {acquiredSkills.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No acquired skills detected yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Missing Skills */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-amber-400">Skills to Learn</h3>
              <span className="text-sm text-slate-500">({missingSkills.length})</span>
            </div>
            <div className="space-y-3">
              {missingSkills.map(skill => (
                <div key={skill.name} className="flex items-center space-x-3 p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
                  <Circle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-slate-200 font-medium">{skill.name}</span>
                  <span className="text-xs text-amber-500/70 bg-amber-500/10 px-2 py-1 rounded-full ml-auto">
                    {skill.category}
                  </span>
                </div>
              ))}
              {missingSkills.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>All required skills acquired!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        {missingSkills.length > 0 && onGeneratePlan && (
          <div className="mt-8 pt-6 border-t border-slate-700/30">
            {planError && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm mb-2">{planError}</p>
                <button
                  onClick={onGeneratePlan}
                  className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                >
                  Retry
                </button>
              </div>
            )}
            <div className="flex justify-center">
              <button
                onClick={onGeneratePlan}
                disabled={isGeneratingPlan}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-8 py-4 rounded-2xl shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all flex items-center space-x-3 font-bold disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGeneratingPlan ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Learning Plan...</span>
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5" />
                    <span>Generate Learning Roadmap</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsContainer;