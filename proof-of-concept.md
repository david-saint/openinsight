# Proof of Concept

OpenInsight Chrome extension

## Design Philosophy

The design philosophy here is "Epistemic Minimalism".
It strips away the clutter of translation tools, focusing instead on clarity and truth.
The UI uses stark whites, deep ink blacks, and a single "verification" accent color (a calm teal) to establish a tone of authority and precision.

## How to use the prototype

How to use the prototype:

1.  Highlight any text in the article snippet provided.
2.  The OpenInsight logo icon will appear near your selection.
3.  Click the icon to open the "Insight" popup.
4.  Toggle between "Explain" (default) and "Fact Check" to see the different redesign states.

## Code

```jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  X,
  ChevronRight,
  Search,
  Settings,
  ArrowLeft,
  Moon,
  Sun,
  Key,
  Cpu,
  Palette,
  Zap,
} from "lucide-react";

// Color theme definitions for dynamic styling
const THEME_COLORS = {
  teal: {
    name: "Teal",
    highlight: "text-teal-400",
    btnText: "text-teal-600 hover:text-teal-700",
    border: "border-teal-500",
    badgeBg: "bg-teal-50",
    badgeText: "text-teal-700",
    badgeBorder: "border-teal-100",
    ring: "focus:ring-teal-500",
  },
  indigo: {
    name: "Indigo",
    highlight: "text-indigo-400",
    btnText: "text-indigo-600 hover:text-indigo-700",
    border: "border-indigo-500",
    badgeBg: "bg-indigo-50",
    badgeText: "text-indigo-700",
    badgeBorder: "border-indigo-100",
    ring: "focus:ring-indigo-500",
  },
  rose: {
    name: "Rose",
    highlight: "text-rose-400",
    btnText: "text-rose-600 hover:text-rose-700",
    border: "border-rose-500",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-700",
    badgeBorder: "border-rose-100",
    ring: "focus:ring-rose-500",
  },
  amber: {
    name: "Amber",
    highlight: "text-amber-400",
    btnText: "text-amber-600 hover:text-amber-700",
    border: "border-amber-500",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    badgeBorder: "border-amber-100",
    ring: "focus:ring-amber-500",
  },
};

const MODELS = [
  { id: "gpt-4o", name: "GPT-4o (OpenAI)" },
  { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet (Anthropic)" },
  { id: "llama-3-70b", name: "Llama 3 70B (Meta)" },
  { id: "mixtral-8x22b", name: "Mixtral 8x22B (Mistral)" },
];

const App = () => {
  // --- STATE ---
  const [selection, setSelection] = useState(null);
  const [popupState, setPopupState] = useState("closed"); // 'closed', 'trigger', 'open'
  const [triggerPos, setTriggerPos] = useState({ top: 0, left: 0 });
  const [activeTab, setActiveTab] = useState("explain");
  const [currentView, setCurrentView] = useState("main"); // 'main' | 'settings'
  const [isLoading, setIsLoading] = useState(false);

  // User Preferences / Settings State
  const [settings, setSettings] = useState({
    theme: "light", // 'light' | 'dark'
    accentColor: "teal",
    apiKey: "",
    explainModel: "gpt-4o",
    factCheckModel: "claude-3-5-sonnet",
    triggerMode: "icon", // 'icon' | 'immediate'
  });

  // Refs
  const articleRef = useRef(null);
  const popupRef = useRef(null);

  // --- HANDLERS ---

  useEffect(() => {
    const handleSelection = () => {
      const selectionObj = window.getSelection();

      if (!selectionObj || selectionObj.toString().trim().length === 0) {
        if (popupState === "trigger") {
          setPopupState("closed");
        }
        return;
      }

      if (popupState === "open") return;

      const range = selectionObj.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setTriggerPos({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right + window.scrollX - 20,
      });

      setSelection(selectionObj.toString());

      // Check settings for trigger behavior
      if (settings.triggerMode === "immediate") {
        setPopupState("open");
        setCurrentView("main");
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 800);
      } else {
        setPopupState("trigger");
      }
    };

    const articleElement = articleRef.current;
    if (articleElement) {
      articleElement.addEventListener("mouseup", handleSelection);
    }

    const handleClickOutside = (e) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target) &&
        !e.target.closest(".trigger-btn") &&
        popupState === "open"
      ) {
        setPopupState("closed");
        setCurrentView("main"); // Reset view on close
        window.getSelection().removeAllRanges();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      if (articleElement)
        articleElement.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupState, settings.triggerMode]);

  const handleTriggerClick = (e) => {
    e.stopPropagation();
    setIsLoading(true);
    setPopupState("open");
    setCurrentView("main");
    setTimeout(() => setIsLoading(false), 800);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 600);
  };

  // Helper to get current theme colors
  const C = THEME_COLORS[settings.accentColor];
  const isDark = settings.theme === "dark";

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-slate-900" : "bg-[#F5F5F7]"
      } transition-colors duration-300 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900 flex justify-center p-8 md:p-20 relative`}
    >
      {/* Background/Context: A mock article */}
      <div
        className={`max-w-2xl w-full ${
          isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
        } shadow-sm border p-12 rounded-xl relative transition-colors duration-300`}
      >
        <header
          className={`mb-10 border-b ${
            isDark ? "border-slate-700" : "border-slate-100"
          } pb-6`}
        >
          <span className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2 block">
            Architecture Daily
          </span>
          <h1
            className={`text-3xl font-serif font-medium ${
              isDark ? "text-slate-100" : "text-slate-800"
            } mb-2`}
          >
            The Hidden History of Modernism
          </h1>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>By Elena Rostova</span>
            <span>•</span>
            <span>4 min read</span>
          </div>
        </header>

        <div
          ref={articleRef}
          className={`prose prose-lg ${
            isDark
              ? "prose-invert text-slate-300"
              : "prose-slate text-slate-600"
          } font-serif leading-loose`}
        >
          <p className="mb-6">
            When we consider the trajectory of 20th-century design, we often
            overlook the subtle influences of the Bauhaus movement on
            contemporary digital interfaces.
            <span
              className={`${
                isDark
                  ? "bg-slate-700 text-slate-200"
                  : "bg-slate-50 text-slate-800"
              } px-1 rounded mx-1`}
            >
              Highlight any text in this paragraph to see the interaction.
            </span>
            The principle that "form follows function" was not merely an
            aesthetic choice but a moral imperative.
          </p>
          <p>
            Recent studies suggest that the Eiffel Tower was originally intended
            to be a temporary installation for the 1889 World's Fair, facing
            immense criticism from local artists who called it a "useless
            monstrosity." Today, it stands as an irrefutable icon of industrial
            prowess.
          </p>
        </div>
      </div>

      {/* --- STEP 1: THE TRIGGER BUTTON --- */}
      {popupState !== "closed" && (
        <button
          className={`trigger-btn absolute z-50 transition-all duration-300 ease-out transform shadow-lg flex items-center justify-center
            ${
              popupState === "open"
                ? "opacity-0 scale-90 pointer-events-none"
                : "opacity-100 scale-100"
            }
            bg-slate-900 hover:bg-black text-white rounded-full w-8 h-8 cursor-pointer border border-slate-700
          `}
          style={{ top: triggerPos.top, left: triggerPos.left }}
          onClick={handleTriggerClick}
          aria-label="Get Insight"
        >
          <Sparkles size={14} fill="currentColor" className={C.highlight} />
        </button>
      )}

      {/* --- STEP 2: THE POPUP --- */}
      {popupState === "open" && (
        <div
          ref={popupRef}
          className={`absolute z-50 w-[320px] rounded-xl shadow-2xl border overflow-hidden flex flex-col transition-all duration-300 animate-in fade-in zoom-in-95 slide-in-from-bottom-2
            ${
              isDark
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-100"
            }
          `}
          style={{
            top: triggerPos.top + 16,
            left: Math.min(
              window.innerWidth - 340,
              Math.max(20, triggerPos.left - 160)
            ),
          }}
        >
          {/* Header */}
          <div
            className={`${
              isDark
                ? "bg-slate-900 border-slate-700"
                : "bg-slate-50 border-slate-100"
            } border-b px-1 pt-1 flex justify-between items-center h-10`}
          >
            {currentView === "settings" ? (
              // Settings Header
              <div className="flex items-center w-full px-2">
                <button
                  onClick={() => setCurrentView("main")}
                  className={`p-1.5 rounded-md flex items-center gap-1 text-xs font-semibold ${
                    isDark
                      ? "text-slate-300 hover:bg-slate-800"
                      : "text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <span
                  className={`mx-auto text-xs font-bold uppercase tracking-wider ${
                    isDark ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  Settings
                </span>
                <div className="w-8"></div> {/* Spacer for alignment */}
              </div>
            ) : (
              // Main Header (Tabs)
              <>
                <div className="flex gap-1 ml-1">
                  <button
                    onClick={() => handleTabChange("explain")}
                    className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 
                        ${
                          activeTab === "explain"
                            ? `${
                                isDark
                                  ? "bg-slate-800 text-slate-100 border-slate-700"
                                  : "bg-white text-slate-800 border-slate-100"
                              } shadow-sm border-t border-x translate-y-[1px]`
                            : `${
                                isDark
                                  ? "text-slate-500 hover:text-slate-300"
                                  : "text-slate-500 hover:text-slate-700"
                              }`
                        }`}
                  >
                    <BookOpen size={12} />
                    Explain
                  </button>
                  <button
                    onClick={() => handleTabChange("factcheck")}
                    className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 
                        ${
                          activeTab === "factcheck"
                            ? `${
                                isDark
                                  ? "bg-slate-800 text-slate-100 border-slate-700"
                                  : "bg-white text-slate-800 border-slate-100"
                              } shadow-sm border-t border-x translate-y-[1px]`
                            : `${
                                isDark
                                  ? "text-slate-500 hover:text-slate-300"
                                  : "text-slate-500 hover:text-slate-700"
                              }`
                        }`}
                  >
                    <Search size={12} />
                    Fact Check
                  </button>
                </div>
                <div className="flex items-center gap-1 pr-2">
                  <button
                    onClick={() => setCurrentView("settings")}
                    className={`p-1.5 rounded-md transition-colors ${
                      isDark
                        ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    }`}
                    title="Settings"
                  >
                    <Settings size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setPopupState("closed");
                      window.getSelection().removeAllRanges();
                    }}
                    className={`p-1.5 rounded-md transition-colors ${
                      isDark
                        ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    }`}
                    title="Close"
                  >
                    <X size={14} />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Content Area */}
          <div
            className={`p-5 min-h-[180px] ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            {/* VIEW: SETTINGS */}
            {currentView === "settings" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                {/* Theme Section */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-2">
                    <Palette size={12} /> Appearance
                  </h3>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Theme Mode</span>
                    <div
                      className={`flex bg-opacity-20 rounded-lg p-1 ${
                        isDark ? "bg-slate-950" : "bg-slate-100"
                      }`}
                    >
                      <button
                        onClick={() =>
                          setSettings((s) => ({ ...s, theme: "light" }))
                        }
                        className={`p-1.5 rounded-md transition-all ${
                          !isDark
                            ? "bg-white shadow-sm text-amber-500"
                            : "text-slate-500"
                        }`}
                      >
                        <Sun size={14} />
                      </button>
                      <button
                        onClick={() =>
                          setSettings((s) => ({ ...s, theme: "dark" }))
                        }
                        className={`p-1.5 rounded-md transition-all ${
                          isDark
                            ? "bg-slate-700 shadow-sm text-indigo-400"
                            : "text-slate-400"
                        }`}
                      >
                        <Moon size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Accent Color</span>
                    <div className="flex gap-2">
                      {Object.entries(THEME_COLORS).map(([key, value]) => (
                        <button
                          key={key}
                          onClick={() =>
                            setSettings((s) => ({ ...s, accentColor: key }))
                          }
                          className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${
                            settings.accentColor === key
                              ? `${value.border} scale-110`
                              : "border-transparent"
                          }`}
                          style={{
                            backgroundColor:
                              key === "teal"
                                ? "#0d9488"
                                : key === "indigo"
                                ? "#4f46e5"
                                : key === "rose"
                                ? "#e11d48"
                                : "#d97706",
                          }}
                          aria-label={value.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Behavior Section */}
                <div
                  className={`space-y-3 pt-4 border-t ${
                    isDark ? "border-slate-700" : "border-slate-100"
                  }`}
                >
                  <h3 className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-2">
                    <Zap size={12} /> Behavior
                  </h3>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Trigger Action</span>
                    <div
                      className={`flex bg-opacity-20 rounded-lg p-1 ${
                        isDark ? "bg-slate-950" : "bg-slate-100"
                      }`}
                    >
                      <button
                        onClick={() =>
                          setSettings((s) => ({ ...s, triggerMode: "icon" }))
                        }
                        className={`px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all ${
                          settings.triggerMode === "icon"
                            ? !isDark
                              ? "bg-white shadow-sm text-slate-800"
                              : "bg-slate-700 text-white"
                            : "text-slate-400"
                        }`}
                      >
                        Icon
                      </button>
                      <button
                        onClick={() =>
                          setSettings((s) => ({
                            ...s,
                            triggerMode: "immediate",
                          }))
                        }
                        className={`px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all ${
                          settings.triggerMode === "immediate"
                            ? !isDark
                              ? "bg-white shadow-sm text-slate-800"
                              : "bg-slate-700 text-white"
                            : "text-slate-400"
                        }`}
                      >
                        Immediate
                      </button>
                    </div>
                  </div>
                </div>

                {/* API Section */}
                <div
                  className={`space-y-3 pt-4 border-t ${
                    isDark ? "border-slate-700" : "border-slate-100"
                  }`}
                >
                  <h3 className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-2">
                    <Cpu size={12} /> Intelligence
                  </h3>

                  <div className="space-y-2">
                    <label className="text-xs font-medium flex items-center gap-1.5">
                      <Key size={12} className="opacity-50" />
                      OpenRouter API Key
                    </label>
                    <input
                      type="password"
                      placeholder="sk-or-..."
                      value={settings.apiKey}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, apiKey: e.target.value }))
                      }
                      className={`w-full text-xs px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 ${
                        C.ring
                      } ${
                        isDark
                          ? "bg-slate-900 border-slate-600 text-white placeholder-slate-600"
                          : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium opacity-70">
                        Explain Model
                      </label>
                      <select
                        value={settings.explainModel}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            explainModel: e.target.value,
                          }))
                        }
                        className={`w-full text-[10px] px-2 py-2 rounded-lg border focus:outline-none focus:ring-1 ${
                          C.ring
                        } ${
                          isDark
                            ? "bg-slate-900 border-slate-600 text-white"
                            : "bg-slate-50 border-slate-200 text-slate-800"
                        }`}
                      >
                        {MODELS.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name.split(" ")[0]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium opacity-70">
                        Fact Check Model
                      </label>
                      <select
                        value={settings.factCheckModel}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            factCheckModel: e.target.value,
                          }))
                        }
                        className={`w-full text-[10px] px-2 py-2 rounded-lg border focus:outline-none focus:ring-1 ${
                          C.ring
                        } ${
                          isDark
                            ? "bg-slate-900 border-slate-600 text-white"
                            : "bg-slate-50 border-slate-200 text-slate-800"
                        }`}
                      >
                        {MODELS.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name.split(" ")[0]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: MAIN CONTENT */}
            {currentView === "main" && (
              <>
                {isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 py-8 opacity-50">
                    <div
                      className={`w-5 h-5 border-2 ${
                        isDark ? "border-slate-600" : "border-slate-200"
                      } ${C.border.replace(
                        "border-",
                        "border-t-"
                      )} rounded-full animate-spin`}
                    ></div>
                    <span className="text-xs font-medium animate-pulse">
                      Analyzing with{" "}
                      {activeTab === "explain"
                        ? MODELS.find(
                            (m) => m.id === settings.explainModel
                          ).name.split(" ")[0]
                        : MODELS.find(
                            (m) => m.id === settings.factCheckModel
                          ).name.split(" ")[0]}
                      ...
                    </span>
                  </div>
                ) : (
                  <>
                    {activeTab === "explain" && (
                      <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                        <div className="flex items-start gap-3 mb-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isDark ? "bg-slate-700" : "bg-slate-50"
                            }`}
                          >
                            <Sparkles
                              size={14}
                              className={
                                isDark ? "text-slate-400" : "text-slate-400"
                              }
                            />
                          </div>
                          <div>
                            <h3
                              className={`text-sm font-semibold mb-1 ${
                                isDark ? "text-slate-200" : "text-slate-900"
                              }`}
                            >
                              Contextual Analysis
                            </h3>
                            <p
                              className={`text-xs leading-normal ${
                                isDark ? "text-slate-400" : "text-slate-500"
                              }`}
                            >
                              Generating simplified explanation based on
                              architectural history context.
                            </p>
                          </div>
                        </div>

                        <p
                          className={`text-sm leading-relaxed border-l-2 pl-3 ${
                            C.border
                          } ${isDark ? "text-slate-300" : "text-slate-700"}`}
                        >
                          {selection && selection.length > 50
                            ? "This concept refers to the idea that the shape of a building or object should primarily relate to its intended function or purpose, rather than aesthetic appeal."
                            : "The selected text is too short for a full context analysis. Try selecting a complete sentence."}
                        </p>

                        <div
                          className={`mt-4 pt-4 border-t flex justify-between items-center ${
                            isDark ? "border-slate-700" : "border-slate-50"
                          }`}
                        >
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                            Source: Wikipedia API
                          </span>
                          <button
                            className={`text-xs font-medium flex items-center gap-1 ${C.btnText}`}
                          >
                            Read more <ChevronRight size={12} />
                          </button>
                        </div>
                      </div>
                    )}

                    {activeTab === "factcheck" && (
                      <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                        <div className="flex items-center gap-2 mb-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                              C.badgeBg
                            } ${C.badgeText} ${C.badgeBorder} ${
                              isDark ? "bg-opacity-20" : ""
                            }`}
                          >
                            <CheckCircle2 size={12} />
                            Verified
                          </span>
                          <span className="text-xs text-slate-400">
                            High Confidence
                          </span>
                        </div>

                        <p
                          className={`text-sm leading-relaxed mb-3 ${
                            isDark ? "text-slate-300" : "text-slate-700"
                          }`}
                        >
                          {selection && selection.includes("Eiffel")
                            ? "It is true that the Eiffel Tower was built as the entrance arch for the 1889 World's Fair and was initially criticized by Paris's artistic elite."
                            : "The statement appears consistent with general consensus, though specific nuances may vary depending on historical interpretation."}
                        </p>

                        <div
                          className={`rounded-lg p-3 border ${
                            isDark
                              ? "bg-slate-900 border-slate-700"
                              : "bg-slate-50 border-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-700">
                              B
                            </div>
                            <span
                              className={`text-xs font-semibold ${
                                isDark ? "text-slate-300" : "text-slate-700"
                              }`}
                            >
                              Britannica
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                            The tower was built for the International Exhibition
                            of Paris of 1889 commemorating the centenary of the
                            French Revolution.
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
```
