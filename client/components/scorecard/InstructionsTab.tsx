import { Card } from "@/components/ui/card";

export default function InstructionsTab() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Welcome Section */}
      <Card className="p-6 border-0 shadow-lg bg-white rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
            <span className="text-xl">👋</span>
          </div>
          <h2 className="text-xl font-extrabold text-blue-800">Welcome to the Demo Pit!</h2>
        </div>
        <p className="text-slate-600 leading-relaxed">
          [INSERT WELCOME MESSAGE — overview of today's session, what to expect, and how peer-to-peer demos work]
        </p>
      </Card>

      {/* How It Works */}
      <Card className="p-6 border-0 shadow-lg bg-white rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
            <span className="text-xl">⚙️</span>
          </div>
          <h2 className="text-xl font-extrabold text-blue-800">How It Works</h2>
        </div>
        <div className="space-y-3 text-slate-600">
          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm shrink-0 shadow-sm">1</span>
            <p className="pt-1">[INSERT STEP 1 — e.g., Pair up with a partner]</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm shrink-0 shadow-sm">2</span>
            <p className="pt-1">[INSERT STEP 2 — e.g., One person demos, the other coaches]</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm shrink-0 shadow-sm">3</span>
            <p className="pt-1">[INSERT STEP 3 — e.g., Fill out the scorecard and submit]</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm shrink-0 shadow-sm">4</span>
            <p className="pt-1">[INSERT STEP 4 — e.g., Switch roles and repeat!]</p>
          </div>
        </div>
      </Card>

      {/* Resources */}
      <Card className="p-6 border-0 shadow-lg bg-white rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-md">
            <span className="text-xl">📚</span>
          </div>
          <h2 className="text-xl font-extrabold text-blue-800">Resources</h2>
        </div>
        <p className="text-slate-600 leading-relaxed">
          [INSERT RESOURCES — links to demo scripts, product docs, talk tracks, or any supporting material]
        </p>
      </Card>
    </div>
  );
}
