type Props = {
  participantName: string;
  participantRole: string;
};

export default function AppHeader({ participantName, participantRole }: Props) {
  return (
    <header className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 px-6 py-5 shadow-xl">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <span className="text-2xl">🎯</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Agent Analytics Demo
            </h1>
            <p className="text-blue-100 text-xs font-medium">
              🌲 MYKO26: Portland GTM Session 🦆
            </p>
          </div>
        </div>
        <div className="text-right bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm">
          <p className="text-white font-semibold text-sm">
            👋 {participantName}
          </p>
          <p className="text-blue-200 text-xs">{participantRole}</p>
        </div>
      </div>
    </header>
  );
}
