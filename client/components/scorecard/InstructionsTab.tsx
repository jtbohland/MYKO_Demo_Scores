import { Card } from "@/components/ui/card";

export default function InstructionsTab() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Welcome Section */}
      <Card className="p-6 border-0 shadow-lg bg-white rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
            <span className="text-xl">🏁</span>
          </div>
          <h2 className="text-xl font-extrabold text-blue-800">Welcome to the Demo Derby!</h2>
        </div>
        <p className="text-slate-600 leading-relaxed">
          You and a partner are going to practice demoing Agent Analytics to one another. You&apos;ll
          score your peer using the <strong>SCORECARD</strong> tab. Each of you gets{" "}
          <strong>5 minutes</strong> to present and <strong>1 minute</strong> to give feedback.
          A timer and scorecard are built right in.
        </p>
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800 leading-relaxed">
            💙 This is a <strong>safe space</strong> to practice. Give honest, constructive feedback.
            Focus on what went well and one area to improve. Remember: we&apos;re all here to
            learn and get better together!
          </p>
        </div>
      </Card>

      {/* How It Works */}
      <Card className="p-6 border-0 shadow-lg bg-white rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
            <span className="text-xl">⚙️</span>
          </div>
          <h2 className="text-xl font-extrabold text-blue-800">How It Works</h2>
        </div>
        <div className="space-y-4 text-slate-600">
          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm shrink-0 shadow-sm">1</span>
            <p className="pt-1">
              <strong>Pair up.</strong> Designate a presenter and a scorer. The presenter demos
              Agent Analytics while the scorer uses the <strong>SCORECARD</strong> tab on their laptop.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm shrink-0 shadow-sm">2</span>
            <p className="pt-1">
              <strong>Set up.</strong> On the Scorecard, enter the presenter&apos;s name and role.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold text-sm shrink-0 shadow-sm animate-pulse">3</span>
            <div className="pt-1">
              <p>
                <span className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white font-extrabold px-3 py-1 rounded-lg text-sm shadow-md mr-1">
                  WHEN READY
                </span>{" "}
                click <strong>BEGIN TIMER</strong> to start the <strong>5:00</strong> countdown.
                The timer turns <span className="text-yellow-600 font-bold">yellow at 2:00</span> and{" "}
                <span className="text-red-600 font-bold">red at 1:00</span>.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm shrink-0 shadow-sm">4</span>
            <p className="pt-1">
              <strong>Score & coach.</strong> Rate each topic and provide constructive feedback
              on successes and areas for improvement.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm shrink-0 shadow-sm">5</span>
            <p className="pt-1">
              <strong>Feedback round.</strong> After the demo, the scorer has{" "}
              <strong>1 minute</strong> to deliver feedback — the timer resets automatically.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold text-sm shrink-0 shadow-sm">6</span>
            <p className="pt-1">
              <strong>Swap & repeat!</strong> Switch roles and run through the process again
              for the second presenter.
            </p>
          </div>
        </div>
      </Card>

      {/* Participants & Roles */}
      <Card className="p-6 border-0 shadow-lg bg-white rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
            <span className="text-xl">👥</span>
          </div>
          <h2 className="text-xl font-extrabold text-blue-800">Participants & Roles</h2>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800 leading-relaxed">
            🚧 The participant list and role assignments are still in the works — we&apos;ll
            have those ready soon! In the meantime, you can use the manual entry option on the
            Scorecard to type in any name.
          </p>
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
        <p className="text-slate-500 text-sm italic">
          Demo scripts, product docs, and supporting materials will be linked here.
        </p>
      </Card>
    </div>
  );
}
