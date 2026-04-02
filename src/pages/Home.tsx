import { Link } from "react-router-dom";
import TodayLesson from "../components/TodayLesson";
import { useProgressStore, calcStreak } from "../store/progress";

// ── Weekly activity grid ───────────────────────────────────────────────────

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toISOString().slice(0, 10),
      label: DAY_LABELS[d.getDay()],
      isToday: i === 6,
    };
  });
}

function WeeklyGrid({ studiedDates }: { studiedDates: string[] }) {
  const studied = new Set(studiedDates);
  const days = getLast7Days();
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-2.5">This week</p>
      <div className="flex gap-1.5">
        {days.map(({ date, label, isToday }) => {
          const done = studied.has(date);
          return (
            <div key={date} className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                  done && isToday
                    ? "bg-indigo-600 text-white shadow-sm"
                    : done
                    ? "bg-indigo-200 text-indigo-700"
                    : isToday
                    ? "bg-gray-100 ring-2 ring-indigo-300 ring-offset-1 text-gray-300"
                    : "bg-gray-100 text-gray-200"
                }`}
              >
                {done ? "✓" : ""}
              </div>
              <span
                className={`text-xs leading-none ${
                  isToday ? "font-semibold text-gray-700" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Stat box ───────────────────────────────────────────────────────────────

function StatBox({
  value,
  label,
  sublabel,
  colorClass,
  bgClass,
}: {
  value: string | number;
  label: string;
  sublabel?: string;
  colorClass: string;
  bgClass: string;
}) {
  return (
    <div className={`${bgClass} rounded-2xl p-3.5 flex flex-col gap-0.5`}>
      <span className={`text-2xl font-bold leading-none ${colorClass}`}>{value}</span>
      <span className="text-xs text-gray-500 leading-tight mt-1">{label}</span>
      {sublabel && <span className={`text-xs font-medium ${colorClass} opacity-70`}>{sublabel}</span>}
    </div>
  );
}

// ── Progress dashboard ─────────────────────────────────────────────────────

function ProgressDashboard() {
  const { studiedDates, dueCount, learnedCount, masteredLetterCount } =
    useProgressStore();

  const streak = calcStreak(studiedDates);
  const lettersCount = masteredLetterCount();
  const lettersPct = Math.round((lettersCount / 38) * 100);
  const words = learnedCount();
  const due = dueCount();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-5">
      {/* Streak row */}
      <div className="flex items-center gap-3">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${
            streak > 0 ? "bg-amber-50" : "bg-gray-50"
          }`}
        >
          {streak > 0 ? "🔥" : "⚡"}
        </div>
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-gray-900 leading-none">
              {streak}
            </span>
            <span className="text-sm text-gray-500 font-medium">
              {streak === 1 ? "day" : "days"} in a row
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {streak === 0
              ? "Study today to start a streak!"
              : streak < 3
              ? "Keep going — you've got this!"
              : streak < 7
              ? "Building momentum! 💪"
              : "On fire! Don't break the chain! 🌟"}
          </p>
        </div>
      </div>

      {/* Three stat boxes */}
      <div className="grid grid-cols-3 gap-3">
        <StatBox
          value={`${lettersPct}%`}
          label="Letters mastered"
          sublabel={`${lettersCount} / 38`}
          colorClass="text-blue-600"
          bgClass="bg-blue-50"
        />
        <StatBox
          value={words}
          label="Words learned"
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50"
        />
        <StatBox
          value={due}
          label="Due today"
          colorClass={due > 0 ? "text-amber-600" : "text-gray-400"}
          bgClass={due > 0 ? "bg-amber-50" : "bg-gray-50"}
        />
      </div>

      {/* Weekly grid */}
      <WeeklyGrid studiedDates={studiedDates} />
    </div>
  );
}

// ── Feature nav cards ──────────────────────────────────────────────────────

const features = [
  {
    to: "/alphabet",
    title: "Alphabet",
    subtitle: "Այբուբեն",
    description: "Learn all 38 letters of the Armenian script",
    icon: "Ա",
    color: "from-blue-500 to-indigo-600",
  },
  {
    to: "/quiz",
    title: "Quiz",
    subtitle: "Քննարկ",
    description: "Test yourself on the letters you've studied",
    icon: "🎯",
    color: "from-sky-500 to-blue-600",
  },
  {
    to: "/vocabulary",
    title: "Vocabulary",
    subtitle: "Բառապաշար",
    description: "Build your word bank with flashcards",
    icon: "📚",
    color: "from-emerald-500 to-teal-600",
  },
  {
    to: "/translate",
    title: "Translator",
    subtitle: "Թարգմանիչ",
    description: "Speak English, hear it in Armenian",
    icon: "🎙️",
    color: "from-orange-500 to-rose-600",
  },
  {
    to: "/tutor",
    title: "AI Tutor",
    subtitle: "Դasavandich",
    description: "Chat with Ara, your personal Armenian tutor",
    icon: "🤖",
    color: "from-violet-500 to-purple-600",
  },
];

// ── Home page ──────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="pb-24 px-4">
      {/* Compact hero */}
      <div className="pt-8 pb-5 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Հայերեն</h1>
        <p className="text-gray-400 mt-1 text-base">Learn Armenian from scratch</p>
      </div>

      {/* Progress dashboard */}
      <ProgressDashboard />

      {/* Feature nav cards */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {features.map(({ to, title, subtitle, description, icon, color }) => (
          <Link
            key={to}
            to={to}
            className={`rounded-2xl bg-gradient-to-br ${color} text-white p-4 shadow-sm active:scale-95 transition-transform block`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-base font-bold leading-tight">{title}</div>
                <div className="text-xs opacity-75 mt-0.5">{subtitle}</div>
              </div>
              <span className="text-2xl leading-none">{icon}</span>
            </div>
            <p className="text-xs opacity-80 leading-snug">{description}</p>
          </Link>
        ))}
      </div>

      {/* Today's lesson */}
      <div className="mt-6">
        <TodayLesson />
      </div>

      {/* Quick tip */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <p className="text-sm font-semibold text-amber-800">Tip: Start with the Alphabet</p>
        <p className="text-xs text-amber-700 mt-1">
          Eastern Armenian uses a unique 38-letter script called the Aybuben (Այբուբեն), created
          in 405 AD.
        </p>
      </div>
    </div>
  );
}
