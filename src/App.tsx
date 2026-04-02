import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import Onboarding from "./components/Onboarding";
import Home from "./pages/Home";
import Alphabet from "./pages/Alphabet";
import Vocabulary from "./pages/Vocabulary";
import Quiz from "./pages/Quiz";
import Translator from "./pages/Translator";
import Tutor from "./pages/Tutor";

const ONBOARD_KEY = "hayeren-onboarded";

export default function App() {
  const [onboarded, setOnboarded] = useState(
    () => localStorage.getItem(ONBOARD_KEY) === "1"
  );

  function completeOnboarding() {
    localStorage.setItem(ONBOARD_KEY, "1");
    setOnboarded(true);
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 max-w-lg mx-auto relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/alphabet" element={<Alphabet />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/vocabulary" element={<Vocabulary />} />
          <Route path="/translate" element={<Translator />} />
          <Route path="/tutor" element={<Tutor />} />
        </Routes>
        <BottomNav />
        {!onboarded && <Onboarding onComplete={completeOnboarding} />}
      </div>
    </BrowserRouter>
  );
}
