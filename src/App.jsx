import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileText,
  Filter,
  Flame,
  Gamepad2,
  GraduationCap,
  History,
  Layers3,
  Lightbulb,
  Lock,
  Map,
  RotateCcw,
  Save,
  Scale,
  Search,
  ScrollText,
  Sparkles,
  Target,
  Timer,
  Trophy,
  Wand2,
  XCircle,
} from "lucide-react";
import {
  CriterionFields,
  RubricResult,
  TheoryVisual,
  buildQuizQuestions,
  comparisons,
  flashcards,
  lessons,
  nextActivityStreak,
  philosophers,
  readStoredJson,
  texts,
  theoryByAuthor,
} from "./content.jsx";
import {
  DEFAULT_PROFILE_ID,
  PAU_PROFILES,
  TARGET_PAU_YEAR,
  createEmptyResponses,
  getProfile,
} from "./data/pauProfiles.js";
import { countWords, evaluateResponses, normalizeText } from "./lib/evaluation.js";

function Card({ children, className = "" }) {
  return <div className={`rounded-3xl border border-white/70 bg-white shadow-xl shadow-slate-200/60 ${className}`}>{children}</div>;
}

function Button({ children, onClick, className = "", disabled = false, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded-2xl px-4 py-2.5 font-semibold transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${className}`}
    >
      {children}
    </button>
  );
}

function Badge({ children, className = "" }) {
  return <span className={`inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm ${className}`}>{children}</span>;
}

function ProgressBar({ value = 0 }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-indigo-700 to-violet-500"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}

const skillDefinitions = [
  { keys: ["theme", "thesis"], label: "Identificar problema, tema y tesis" },
  { keys: ["vocabulary"], label: "Usar vocabulario filosófico" },
  { keys: ["context"], label: "Contextualizar y comparar autores" },
  { keys: ["knowledge"], label: "Desarrollar contenidos" },
  { keys: ["critical"], label: "Argumentar y valorar críticamente" },
];

function readStoredArray(key) {
  const value = readStoredJson(key, []);
  return Array.isArray(value) ? value : [];
}

function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function responseFingerprint(profileId, textId, responses) {
  const responseText = Object.entries(responses)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}:${normalizeText(value)}`)
    .join("|");
  return `${profileId}|${textId}|${responseText}`;
}

function getPracticeTexts(profile) {
  if (!profile.practiceTextIds?.length) return texts;
  const allowedIds = new Set(profile.practiceTextIds);
  return texts.filter((text) => allowedIds.has(text.id));
}

export default function AppV2() {
  const [profileId, setProfileId] = useState(() => {
    const storedProfile = localStorage.getItem("pauProfile");
    return PAU_PROFILES[storedProfile] ? storedProfile : DEFAULT_PROFILE_ID;
  });
  const profile = useMemo(() => getProfile(profileId), [profileId]);
  const availableTexts = useMemo(() => getPracticeTexts(profile), [profile]);
  const [tab, setTab] = useState("comentario");
  const [selectedTextId, setSelectedTextId] = useState(texts[0].id);
  const selectedText = useMemo(
    () => availableTexts.find((text) => text.id === selectedTextId) || availableTexts[0] || texts[0],
    [availableTexts, selectedTextId],
  );
  const [theoryText, setTheoryText] = useState(texts[0]);
  const [answers, setAnswers] = useState(() => createEmptyResponses(getProfile(localStorage.getItem("pauProfile") || DEFAULT_PROFILE_ID).commentCriteria));
  const [showSolution, setShowSolution] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [rubricResult, setRubricResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [authorFilter, setAuthorFilter] = useState("Todos");
  const [difficultyFilter, setDifficultyFilter] = useState("Todas");

  const [xp, setXp] = useState(() => Number(localStorage.getItem("xp")) || 0);
  const [streak, setStreak] = useState(() => Number(localStorage.getItem("streak")) || 0);
  const [history, setHistory] = useState(() => readStoredArray("history"));
  const [completedLessons, setCompletedLessons] = useState(() => readStoredArray("completedLessons"));
  const [rewardedAttempts, setRewardedAttempts] = useState(() => readStoredArray("rewardedAttempts"));

  const quizQuestions = useMemo(() => buildQuizQuestions(), []);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizDone, setQuizDone] = useState(false);
  const [quizStreak, setQuizStreak] = useState(0);
  const [quizCorrect, setQuizCorrect] = useState(() => Number(localStorage.getItem("quizCorrect")) || 0);
  const [quizWrong, setQuizWrong] = useState(() => Number(localStorage.getItem("quizWrong")) || 0);
  const [wrongQuestions, setWrongQuestions] = useState(() => readStoredArray("wrongQuestions"));
  const [reviewMode, setReviewMode] = useState(false);

  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [examTime, setExamTime] = useState(profile.durationSeconds);
  const [examText, setExamText] = useState(availableTexts[1] || availableTexts[0] || texts[0]);
  const [examResponses, setExamResponses] = useState(() => createEmptyResponses(getProfile(localStorage.getItem("pauProfile") || DEFAULT_PROFILE_ID).examCriteria));
  const [examResult, setExamResult] = useState(null);
  const [hasSavedDraft, setHasSavedDraft] = useState(() => Boolean(localStorage.getItem(`examDraft:${localStorage.getItem("pauProfile") || DEFAULT_PROFILE_ID}`)));

  const [flashIndex, setFlashIndex] = useState(0);
  const [showFlashAnswer, setShowFlashAnswer] = useState(false);

  const level = Math.floor(xp / 150) + 1;
  const levelProgress = xp % 150;
  const activeQuizQuestions = reviewMode && wrongQuestions.length > 0 ? wrongQuestions : quizQuestions;
  const currentQuestion = activeQuizQuestions[quizIndex % activeQuizQuestions.length];
  const lessonProgress = Math.round((completedLessons.length / lessons.length) * 100);
  const theory = theoryByAuthor[theoryText.philosopher] || {
    title: `Teoría de ${theoryText.philosopher}`,
    visual: "default",
    blocks: [{ heading: "Ideas para estudiar", points: [theoryText.thesis, theoryText.solution] }],
  };

  const authors = useMemo(() => [...new Set(availableTexts.map((text) => text.philosopher))].sort(), [availableTexts]);
  const filteredTexts = useMemo(() => {
    const query = normalizeText(searchQuery);
    return availableTexts.filter((text) => {
      const haystack = normalizeText(`${text.title} ${text.philosopher} ${text.work} ${text.theme} ${text.concepts.join(" ")}`);
      return (!query || haystack.includes(query))
        && (authorFilter === "Todos" || text.philosopher === authorFilter)
        && (difficultyFilter === "Todas" || text.difficulty === difficultyFilter);
    });
  }, [authorFilter, availableTexts, difficultyFilter, searchQuery]);

  const commentProgress = useMemo(() => {
    const ratios = profile.commentCriteria.map((criterion) => Math.min(countWords(answers[criterion.id] || "") / criterion.minWords, 1));
    return Math.round((ratios.reduce((total, ratio) => total + ratio, 0) / ratios.length) * 100);
  }, [answers, profile.commentCriteria]);

  const competencyData = useMemo(() => skillDefinitions.map((definition) => {
    const values = history.flatMap((attempt) => definition.keys
      .map((key) => attempt.skills?.[key])
      .filter((value) => Number.isFinite(value)));
    return {
      ...definition,
      attempts: values.length,
      value: values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null,
    };
  }), [history]);

  useEffect(() => localStorage.setItem("pauProfile", profileId), [profileId]);
  useEffect(() => localStorage.setItem("xp", String(xp)), [xp]);
  useEffect(() => localStorage.setItem("streak", String(streak)), [streak]);
  useEffect(() => localStorage.setItem("history", JSON.stringify(history)), [history]);
  useEffect(() => localStorage.setItem("completedLessons", JSON.stringify(completedLessons)), [completedLessons]);
  useEffect(() => localStorage.setItem("rewardedAttempts", JSON.stringify(rewardedAttempts)), [rewardedAttempts]);
  useEffect(() => localStorage.setItem("quizCorrect", String(quizCorrect)), [quizCorrect]);
  useEffect(() => localStorage.setItem("quizWrong", String(quizWrong)), [quizWrong]);
  useEffect(() => localStorage.setItem("wrongQuestions", JSON.stringify(wrongQuestions)), [wrongQuestions]);

  useEffect(() => {
    if (!examStarted || examFinished) return;
    localStorage.setItem(`examDraft:${profile.id}`, JSON.stringify({
      profileId: profile.id,
      textId: examText.id,
      responses: examResponses,
      remainingSeconds: examTime,
      savedAt: Date.now(),
    }));
  }, [examFinished, examResponses, examStarted, examText.id, examTime, profile.id]);

  const recordActivity = useCallback(() => {
    setStreak((previous) => nextActivityStreak(previous));
  }, []);

  const gainXP = useCallback((amount) => {
    setXp((previous) => previous + Math.max(0, Math.round(amount)));
    recordActivity();
  }, [recordActivity]);

  const finishExam = useCallback((timedOut = false) => {
    if (!examStarted || examFinished) return;
    const result = evaluateResponses({
      responses: examResponses,
      criteria: profile.examCriteria,
      selectedText: examText,
    });
    setExamFinished(true);
    setExamResult({ ...result, timedOut });
    gainXP(result.total * 10);
    setHistory((previous) => [{
      id: Date.now(),
      type: "Simulacro",
      title: examText.title,
      author: examText.philosopher,
      score: result.total,
      maxScore: result.maximum,
      percentage: result.percentage,
      profile: profile.shortLabel,
      skills: result.skills,
      date: formatDate(),
    }, ...previous].slice(0, 30));
    localStorage.removeItem(`examDraft:${profile.id}`);
    setHasSavedDraft(false);
  }, [examFinished, examResponses, examStarted, examText, gainXP, profile]);

  useEffect(() => {
    if (!examStarted || examFinished) return undefined;
    const timer = window.setTimeout(() => {
      if (examTime <= 1) {
        setExamTime(0);
        finishExam(true);
      } else {
        setExamTime(examTime - 1);
      }
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [examFinished, examStarted, examTime, finishExam]);

  const resetComment = useCallback((criteria = profile.commentCriteria) => {
    setAnswers(createEmptyResponses(criteria));
    setShowSolution(false);
    setShowHints(false);
    setRubricResult(null);
  }, [profile.commentCriteria]);

  const handleProfileChange = (nextProfileId) => {
    const nextProfile = getProfile(nextProfileId);
    const nextTexts = getPracticeTexts(nextProfile);
    const firstText = nextTexts[0] || texts[0];
    setProfileId(nextProfile.id);
    setSelectedTextId(firstText.id);
    setTheoryText(firstText);
    setSearchQuery("");
    setAuthorFilter("Todos");
    setDifficultyFilter("Todas");
    resetComment(nextProfile.commentCriteria);
    setExamStarted(false);
    setExamFinished(false);
    setExamTime(nextProfile.durationSeconds);
    setExamResponses(createEmptyResponses(nextProfile.examCriteria));
    setExamResult(null);
    setHasSavedDraft(Boolean(localStorage.getItem(`examDraft:${nextProfile.id}`)));
  };

  const selectText = (text) => {
    setSelectedTextId(text.id);
    setTheoryText(text);
    resetComment();
  };

  const correctComment = () => {
    const result = evaluateResponses({ responses: answers, criteria: profile.commentCriteria, selectedText });
    setRubricResult(result);
    setShowSolution(true);
    const hasContent = Object.values(answers).some((answer) => countWords(answer) >= 3);
    const fingerprint = responseFingerprint(profile.id, selectedText.id, answers);
    if (!hasContent || rewardedAttempts.includes(fingerprint)) return;
    gainXP(result.total * 10);
    setRewardedAttempts((previous) => [fingerprint, ...previous].slice(0, 100));
    setHistory((previous) => [{
      id: Date.now(),
      type: "Comentario",
      title: selectedText.title,
      author: selectedText.philosopher,
      score: result.total,
      maxScore: result.maximum,
      percentage: result.percentage,
      profile: profile.shortLabel,
      skills: result.skills,
      date: formatDate(),
    }, ...previous].slice(0, 30));
  };

  const startExam = () => {
    const randomText = availableTexts[Math.floor(Math.random() * availableTexts.length)] || texts[0];
    setExamText(randomText);
    setExamResponses(createEmptyResponses(profile.examCriteria));
    setExamTime(profile.durationSeconds);
    setExamStarted(true);
    setExamFinished(false);
    setExamResult(null);
    setHasSavedDraft(true);
  };

  const resumeExam = () => {
    const draft = readStoredJson(`examDraft:${profile.id}`, null);
    const draftText = texts.find((text) => text.id === draft?.textId);
    if (!draft || !draftText) return;
    setExamText(draftText);
    setExamResponses({ ...createEmptyResponses(profile.examCriteria), ...draft.responses });
    setExamTime(Math.min(Number(draft.remainingSeconds) || profile.durationSeconds, profile.durationSeconds));
    setExamStarted(true);
    setExamFinished(false);
    setExamResult(null);
  };

  const discardExamDraft = () => {
    localStorage.removeItem(`examDraft:${profile.id}`);
    setHasSavedDraft(false);
  };

  const submitQuiz = () => {
    if (selectedOption === null || quizDone) return;
    const isCorrect = selectedOption === currentQuestion.answer;
    setQuizDone(true);
    if (isCorrect) {
      const bonus = quizStreak >= 4 ? 20 : quizStreak >= 2 ? 10 : 0;
      gainXP(30 + bonus);
      setQuizCorrect((previous) => previous + 1);
      setQuizStreak((previous) => previous + 1);
      if (reviewMode) setWrongQuestions((previous) => previous.filter((question) => question.q !== currentQuestion.q));
    } else {
      setQuizWrong((previous) => previous + 1);
      setQuizStreak(0);
      setWrongQuestions((previous) => previous.some((question) => question.q === currentQuestion.q)
        ? previous
        : [currentQuestion, ...previous].slice(0, 30));
    }
    recordActivity();
  };

  const nextQuiz = () => {
    setSelectedOption(null);
    setQuizDone(false);
    setQuizIndex((previous) => (previous + 1) % (activeQuizQuestions.length || 1));
  };

  const completeLesson = (lesson, index) => {
    if (index > completedLessons.length || completedLessons.includes(lesson.id)) return;
    setCompletedLessons((previous) => [...previous, lesson.id]);
    gainXP(lesson.xp);
  };

  const nextFlashcard = () => {
    setShowFlashAnswer(false);
    setFlashIndex((previous) => (previous + 1) % flashcards.length);
  };

  const resetProgress = () => {
    if (!window.confirm("¿Quieres borrar tu XP, racha, historial, lecciones y errores guardados en este navegador?")) return;
    ["xp", "streak", "history", "completedLessons", "rewardedAttempts", "quizCorrect", "quizWrong", "wrongQuestions", "lastActivityDate"]
      .forEach((key) => localStorage.removeItem(key));
    setXp(0);
    setStreak(0);
    setHistory([]);
    setCompletedLessons([]);
    setRewardedAttempts([]);
    setQuizCorrect(0);
    setQuizWrong(0);
    setWrongQuestions([]);
    setQuizStreak(0);
  };

  const minutes = Math.floor(examTime / 60);
  const seconds = examTime % 60;
  const nav = [
    { id: "comentario", label: "Práctica", icon: ScrollText },
    { id: "programa", label: "Programa", icon: GraduationCap },
    { id: "teoria", label: "Teoría", icon: Brain },
    { id: "filosofos", label: "Autores", icon: BookOpen },
    { id: "retos", label: "Retos", icon: Gamepad2 },
    { id: "comparador", label: "Comparador", icon: Scale },
    { id: "flashcards", label: "Tarjetas", icon: Layers3 },
    { id: "lecciones", label: "Itinerario", icon: Map },
    { id: "examen", label: "Simulacro", icon: ClipboardCheck },
    { id: "progreso", label: "Progreso", icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 text-slate-900">
      <header className="border-b border-slate-200/80 bg-slate-950 text-white">
        <div className="mx-auto max-w-[1500px] px-4 py-5 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-600 shadow-lg shadow-indigo-950/40">
                <span className="font-serif text-3xl font-black italic">N</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-300">Del texto a la idea</p>
                <h1 className="text-2xl font-black tracking-tight md:text-3xl">NOESIS <span className="text-indigo-300">PAU {TARGET_PAU_YEAR}</span></h1>
                <p className="mt-0.5 text-xs text-slate-400">Piensa · Argumenta · Avanza</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-white/10 text-white"><Flame className="mr-1 h-4 w-4 text-orange-400" />{streak} días</Badge>
              <Badge className="bg-white/10 text-white"><Trophy className="mr-1 h-4 w-4 text-amber-300" />{xp} XP</Badge>
              <Badge className="bg-white/10 text-white">Nivel {level}</Badge>
            </div>
          </div>
          <div className="mt-4"><ProgressBar value={(levelProgress / 150) * 100} /></div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-5 md:px-8 md:py-7">
        <Card className="mb-5 overflow-hidden bg-gradient-to-r from-indigo-50 to-violet-50">
          <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Target className="h-5 w-5 text-indigo-700" />
                <span className="text-sm font-bold text-indigo-900">Perfil de preparación activo</span>
              </div>
              <h2 className="mt-1 text-xl font-black">{profile.label}</h2>
              <p className="mt-1 text-sm text-slate-600">{profile.summary} Duración de referencia: {profile.durationSeconds / 60} minutos.</p>
              <p className={`mt-2 inline-flex rounded-xl border px-3 py-1.5 text-xs font-semibold ${profile.isOfficial ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>{profile.status}</p>
              <a href={profile.officialUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center text-sm font-semibold text-indigo-700 hover:underline">
                {profile.isOfficial ? "Consultar modelo oficial" : "Consultar modelo oficial de referencia"} ({profile.sourceYear}) <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </div>
            <label className="min-w-72 text-sm font-semibold text-slate-700">
              Comunidad / perfil
              <select value={profileId} onChange={(event) => handleProfileChange(event.target.value)} className="mt-1 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-semibold outline-none focus:border-indigo-600">
                {Object.values(PAU_PROFILES).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
          </div>
        </Card>

        <nav className="mb-5 flex gap-2 overflow-x-auto rounded-3xl border border-slate-200 bg-white p-2 shadow-sm" aria-label="Secciones principales">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition ${tab === item.id ? "bg-slate-950 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`}>
                <Icon className="h-4 w-4" />{item.label}
              </button>
            );
          })}
        </nav>

        <AnimatePresence mode="wait">
          {tab === "comentario" && (
            <motion.section key="comentario" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid gap-5 xl:grid-cols-[390px_1fr]">
              <Card className="h-fit xl:sticky xl:top-5">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="text-sm font-bold text-indigo-700">Banco de práctica</p><h2 className="text-2xl font-black">Fragmentos únicos</h2></div>
                    <Badge>{filteredTexts.length}/{availableTexts.length}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{profile.practiceTextIds?.length ? "Selección compatible con los conjuntos oficiales del perfil activo. " : ""}Adaptaciones didácticas para entrenar; no son ediciones críticas ni reproducciones de exámenes oficiales.</p>
                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Buscar autor, obra o concepto" className="w-full rounded-2xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-600" />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <label className="relative"><Filter className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><select aria-label="Filtrar por autor" value={authorFilter} onChange={(event) => setAuthorFilter(event.target.value)} className="w-full rounded-2xl border border-slate-200 py-2.5 pl-9 pr-2 text-xs outline-none"><option>Todos</option>{authors.map((author) => <option key={author}>{author}</option>)}</select></label>
                    <select aria-label="Filtrar por dificultad" value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)} className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-xs outline-none"><option>Todas</option><option>Media</option><option>Alta</option></select>
                  </div>
                  <div className="mt-4 max-h-[620px] space-y-2 overflow-y-auto pr-1">
                    {filteredTexts.map((text) => (
                      <button key={text.id} type="button" onClick={() => selectText(text)} className={`w-full rounded-2xl border p-3.5 text-left transition hover:border-indigo-300 hover:shadow-sm ${selectedText.id === text.id ? "border-indigo-600 bg-indigo-50" : "border-slate-200 bg-white"}`}>
                        <p className="font-bold">{text.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{text.philosopher} · {text.work}</p>
                        <div className="mt-2 flex gap-2"><Badge>{text.difficulty}</Badge><Badge>{text.period.replace("Filosofía ", "")}</Badge></div>
                      </button>
                    ))}
                    {filteredTexts.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No hay resultados con estos filtros.</p>}
                  </div>
                </div>
              </Card>

              <div className="space-y-5">
                <Card>
                  <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-indigo-700">{selectedText.philosopher} · {selectedText.work}</p>
                        <h2 className="text-3xl font-black">{selectedText.title}</h2>
                      </div>
                      <Badge><FileText className="mr-1 h-3.5 w-3.5" />{selectedText.sourceType}</Badge>
                    </div>
                    <blockquote className="mt-5 rounded-3xl bg-slate-100 p-5 text-lg font-medium leading-relaxed text-slate-800">“{selectedText.quote}”</blockquote>
                    <div className="mt-4 flex flex-wrap gap-2">{selectedText.concepts.map((concept) => <Badge key={concept}>{concept}</Badge>)}</div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button onClick={() => { setTheoryText(selectedText); setTab("teoria"); }} className="border border-slate-300 bg-white text-slate-800"><Brain className="mr-2 inline h-4 w-4" />Repasar teoría</Button>
                      <Button onClick={() => setShowHints((previous) => !previous)} className="border border-amber-300 bg-amber-50 text-amber-900"><Lightbulb className="mr-2 inline h-4 w-4" />{showHints ? "Ocultar pistas" : "Ver pistas"}</Button>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <div><p className="text-sm font-bold text-indigo-700">Entrenamiento guiado · {profile.shortLabel}</p><h2 className="text-2xl font-black">Comentario según la rúbrica</h2></div>
                      <Badge>{commentProgress}% orientativo completado</Badge>
                    </div>
                    <ProgressBar value={commentProgress} />
                    <div className="mt-5">
                      <CriterionFields criteria={profile.commentCriteria} responses={answers} onChange={(id, value) => setAnswers((previous) => ({ ...previous, [id]: value }))} showHints={showHints} />
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button onClick={correctComment} className="bg-slate-950 text-white"><Wand2 className="mr-2 inline h-4 w-4" />Corregir con la rúbrica</Button>
                      <Button onClick={() => resetComment()} className="border border-slate-300 bg-white text-slate-800"><RotateCcw className="mr-2 inline h-4 w-4" />Reiniciar respuesta</Button>
                    </div>
                    <RubricResult result={rubricResult} title={`Resultado · máximo ${rubricResult?.maximum || 0} puntos`} />
                    {showSolution && rubricResult && (
                      <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                        <h3 className="flex items-center text-lg font-black text-emerald-950"><CheckCircle2 className="mr-2 h-5 w-5" />Guía para contrastar tu respuesta</h3>
                        <p className="mt-3 text-sm"><strong>Tema:</strong> {selectedText.theme}</p>
                        <p className="mt-2 text-sm"><strong>Tesis:</strong> {selectedText.thesis}</p>
                        <p className="mt-2 text-sm"><strong>Explicación:</strong> {selectedText.solution}</p>
                        <p className="mt-2 text-sm"><strong>Posible relación:</strong> {selectedText.comparison}</p>
                        <p className="mt-3 text-xs text-emerald-800">Es una orientación de contenido, no una respuesta única para memorizar.</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </motion.section>
          )}

          {tab === "programa" && (
            <motion.section key="programa" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
              <Card className="overflow-hidden bg-gradient-to-br from-indigo-50 to-violet-50">
                <div className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-indigo-700">Programa activo</p>
                      <h2 className="mt-1 flex items-center text-3xl font-black"><GraduationCap className="mr-3 h-8 w-8" />{profile.label}</h2>
                      <p className="mt-2 max-w-4xl text-slate-600">{profile.summary}</p>
                      {profile.examDates && <p className="mt-3 rounded-2xl border border-indigo-200 bg-white/70 px-4 py-3 text-sm font-semibold text-indigo-950">{profile.examDates}</p>}
                    </div>
                    <Badge>{profile.isOfficial ? "Documentación oficial 2027" : `Referencia ${profile.sourceYear}`}</Badge>
                  </div>
                  <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {profile.examCriteria.map((criterion) => (
                      <div key={criterion.id} className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3"><h3 className="text-sm font-black">{criterion.label}</h3><Badge>{criterion.max} p.</Badge></div>
                        <p className="mt-2 text-xs leading-relaxed text-slate-600">{criterion.recommendedWords}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {profile.programBlocks?.length ? (
                <div className="grid gap-5 lg:grid-cols-3">
                  {profile.programBlocks.map((block) => (
                    <Card key={block.title}>
                      <div className="p-6">
                        <h2 className="text-xl font-black">{block.title}</h2>
                        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
                          {block.topics.map((topic) => <li key={topic}>{topic}</li>)}
                        </ul>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card><div className="p-6"><h2 className="text-xl font-black">Estructura de preparación</h2><p className="mt-2 text-sm text-slate-600">Este perfil reproduce los apartados y ponderaciones del último modelo oficial de referencia disponible. El programa territorial detallado se incorporará cuando su comisión publique la documentación específica de 2027.</p></div></Card>
              )}

              {profile.referenceTexts?.length && (
                <Card>
                  <div className="p-6">
                    <p className="text-sm font-bold text-indigo-700">Lecturas prescritas</p>
                    <h2 className="mt-1 text-2xl font-black">Conjuntos oficiales de textos</h2>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      {profile.referenceTexts.map((group) => (
                        <div key={group.title} className="rounded-3xl bg-slate-100 p-5">
                          <h3 className="font-black">{group.title}</h3>
                          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-700">{group.works.map((work) => <li key={work}>{work}</li>)}</ul>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-xs text-slate-500">El banco de práctica ofrece adaptaciones didácticas identificadas como tales; consulta siempre las ediciones indicadas por la comisión para estudiar los textos completos.</p>
                  </div>
                </Card>
              )}

              <Card>
                <div className="p-6">
                  <h2 className="text-2xl font-black">Fuentes oficiales</h2>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {(profile.officialResources || [{ label: `Modelo oficial de referencia (${profile.sourceYear})`, url: profile.officialUrl }]).map((resource) => (
                      <a key={resource.url} href={resource.url} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-800 transition hover:border-indigo-400 hover:bg-indigo-100">
                        {resource.label}<ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.section>
          )}

          {tab === "teoria" && (
            <motion.section key="teoria" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card><div className="p-6">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-bold text-indigo-700">Teoría vinculada al fragmento</p><h2 className="text-3xl font-black">{theory.title}</h2><p className="mt-1 text-slate-600">{theoryText.title}</p></div><Button onClick={() => setTab("comentario")} className="border border-slate-300 bg-white">Volver a la práctica</Button></div>
                <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]"><TheoryVisual type={theory.visual} /><blockquote className="rounded-3xl bg-slate-100 p-5 text-lg font-medium leading-relaxed">“{theoryText.quote}”</blockquote></div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">{theory.blocks.map((block) => <div key={block.heading} className="rounded-3xl bg-indigo-50 p-5"><h3 className="text-xl font-black">{block.heading}</h3><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">{block.points.map((point) => <li key={point}>{point}</li>)}</ul></div>)}</div>
              </div></Card>
            </motion.section>
          )}

          {tab === "filosofos" && (
            <motion.section key="filosofos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {philosophers.map((philosopher) => <Card key={philosopher.id} className={`overflow-hidden bg-gradient-to-br ${philosopher.color}`}><div className="p-5"><div className="flex items-center justify-between"><Brain className="h-8 w-8" /><Badge>{philosopher.pau}</Badge></div><h2 className="mt-3 text-2xl font-black">{philosopher.name}</h2><p className="text-sm font-bold text-slate-600">{philosopher.current}</p><p className="mt-3 text-sm text-slate-700">{philosopher.summary}</p><div className="mt-4 flex flex-wrap gap-2">{philosopher.concepts.map((concept) => <Badge key={concept}>{concept}</Badge>)}</div><p className="mt-4 rounded-2xl bg-white/60 p-3 text-sm"><strong>Obras:</strong> {philosopher.works.join(" · ")}</p><Button onClick={() => { setTheoryText(texts.find((text) => text.philosopher === philosopher.name) || texts[0]); setTab("teoria"); }} className="mt-4 bg-slate-950 text-white">Ver esquema</Button></div></Card>)}
            </motion.section>
          )}

          {tab === "retos" && currentQuestion && (
            <motion.section key="retos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid gap-5 lg:grid-cols-[1fr_360px]">
              <Card><div className="p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-bold text-indigo-700">Práctica de recuperación activa</p><h2 className="text-2xl font-black">Reto de conceptos</h2></div><Badge>{reviewMode ? "Repaso de errores" : `${quizQuestions.length} preguntas`}</Badge></div><div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">{[["Aciertos", quizCorrect], ["Fallos", quizWrong], ["Racha", quizStreak], ["Por repasar", wrongQuestions.length]].map(([label, value]) => <div key={label} className="rounded-2xl bg-slate-100 p-4"><p className="text-xs text-slate-500">{label}</p><p className="text-2xl font-black">{value}</p></div>)}</div><div className="mt-5 rounded-3xl bg-slate-100 p-5"><p className="text-xs font-bold text-slate-500">Pregunta {(quizIndex % activeQuizQuestions.length) + 1} de {activeQuizQuestions.length}</p><h3 className="mt-2 text-xl font-black">{currentQuestion.q}</h3><div className="mt-4 grid gap-3">{currentQuestion.options.map((option, index) => { const selected = selectedOption === index; const correct = index === currentQuestion.answer; return <button key={option} type="button" disabled={quizDone} onClick={() => setSelectedOption(index)} className={`rounded-2xl border p-4 text-left font-medium transition ${selected ? "border-indigo-700 bg-white shadow-md" : "border-slate-200 bg-white/70"} ${quizDone && correct ? "border-emerald-500 bg-emerald-50" : ""} ${quizDone && selected && !correct ? "border-red-400 bg-red-50" : ""}`}>{option}</button>; })}</div></div><div className="mt-5 flex flex-wrap gap-3"><Button onClick={submitQuiz} disabled={quizDone || selectedOption === null} className="bg-slate-950 text-white">Comprobar</Button><Button onClick={nextQuiz} className="border border-slate-300 bg-white">Siguiente</Button>{reviewMode ? <Button onClick={() => { setReviewMode(false); setQuizIndex(0); setQuizDone(false); setSelectedOption(null); }} className="border border-slate-300 bg-white">Salir del repaso</Button> : <Button onClick={() => { setReviewMode(true); setQuizIndex(0); setQuizDone(false); setSelectedOption(null); }} disabled={wrongQuestions.length === 0} className="border border-red-200 bg-red-50 text-red-700">Repasar fallos</Button>}</div>{quizDone && <div className={`mt-4 rounded-2xl p-4 ${selectedOption === currentQuestion.answer ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900"}`}><p className="font-black">{selectedOption === currentQuestion.answer ? "Respuesta correcta" : "Respuesta incorrecta"}</p><p className="mt-1 text-sm">{currentQuestion.explanation}</p></div>}</div></Card>
              <Card><div className="p-6"><Sparkles className="h-7 w-7 text-indigo-700" /><h2 className="mt-3 text-2xl font-black">Repaso inteligente</h2><p className="mt-2 text-sm text-slate-600">Los fallos quedan guardados en este navegador para poder repetirlos. Los aciertos suman XP y la actividad diaria mantiene la racha real.</p><div className="mt-5 rounded-2xl bg-indigo-50 p-4 text-sm"><strong>Bonus:</strong> desde tres aciertos seguidos se incrementa la recompensa.</div></div></Card>
            </motion.section>
          )}

          {tab === "comparador" && (
            <motion.section key="comparador" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid gap-5 md:grid-cols-2">
              {comparisons.map((comparison) => <Card key={comparison.title}><div className="p-6"><h2 className="flex items-center text-xl font-black"><Scale className="mr-2 h-5 w-5 text-indigo-700" />{comparison.title}</h2><div className="mt-4 grid gap-3"><div className="rounded-2xl bg-slate-100 p-4 text-sm">{comparison.a}</div><div className="rounded-2xl bg-indigo-50 p-4 text-sm">{comparison.b}</div></div></div></Card>)}
            </motion.section>
          )}

          {tab === "flashcards" && (
            <motion.section key="flashcards" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid gap-5 lg:grid-cols-[1fr_360px]">
              <Card><div className="p-6"><p className="text-sm font-bold text-indigo-700">Tarjeta {flashIndex + 1} de {flashcards.length}</p><div className="mt-4 min-h-64 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 p-8 text-center"><Badge>{flashcards[flashIndex].author}</Badge><h2 className="mt-12 text-2xl font-black">{showFlashAnswer ? flashcards[flashIndex].back : flashcards[flashIndex].front}</h2></div><div className="mt-5 flex flex-wrap gap-3"><Button onClick={() => setShowFlashAnswer((previous) => !previous)} className="bg-slate-950 text-white">{showFlashAnswer ? "Ver pregunta" : "Mostrar respuesta"}</Button><Button onClick={() => { gainXP(15); nextFlashcard(); }} className="border border-emerald-300 bg-emerald-50 text-emerald-800">La sabía (+15 XP)</Button><Button onClick={nextFlashcard} className="border border-slate-300 bg-white">Siguiente</Button></div></div></Card>
              <Card><div className="p-6"><Layers3 className="h-7 w-7 text-indigo-700" /><h2 className="mt-3 text-2xl font-black">Cómo usarlas</h2><p className="mt-2 text-sm text-slate-600">Intenta responder antes de girar la tarjeta. Después emplea el concepto en una oración filosófica propia.</p></div></Card>
            </motion.section>
          )}

          {tab === "lecciones" && (
            <motion.section key="lecciones" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card><div className="p-6"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-bold text-indigo-700">Secuencia cronológica</p><h2 className="text-2xl font-black">Itinerario de estudio</h2></div><Badge>{lessonProgress}% completado</Badge></div><div className="mt-4"><ProgressBar value={lessonProgress} /></div></div></Card>
              <div className="mt-5 grid gap-5 md:grid-cols-2">{lessons.map((lesson, index) => { const completed = completedLessons.includes(lesson.id); const unlocked = index <= completedLessons.length; return <Card key={lesson.id} className={`overflow-hidden bg-gradient-to-br ${lesson.color} ${unlocked ? "" : "opacity-60"}`}><div className="p-6"><div className="flex items-center justify-between"><Badge>Unidad {index + 1}</Badge>{completed ? <CheckCircle2 className="h-7 w-7 text-emerald-700" /> : unlocked ? <BookOpen className="h-7 w-7" /> : <Lock className="h-7 w-7" />}</div><h2 className="mt-3 text-2xl font-black">{lesson.title}</h2><p className="text-sm font-bold text-slate-600">{lesson.authors}</p><p className="mt-3 text-sm">{lesson.goal}</p><div className="mt-4 rounded-2xl bg-white/70 p-4">{lesson.authorSections.map((section) => <div key={section.author} className="mb-4 last:mb-0"><h3 className="font-black">{section.author}</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">{section.points.map((point) => <li key={point}>{point}</li>)}</ul></div>)}</div><Button disabled={!unlocked || completed} onClick={() => completeLesson(lesson, index)} className={`mt-5 ${completed ? "bg-emerald-100 text-emerald-800" : "bg-slate-950 text-white"}`}>{completed ? "Completada" : unlocked ? `Completar (+${lesson.xp} XP)` : "Bloqueada"}</Button></div></Card>; })}</div>
            </motion.section>
          )}

          {tab === "examen" && (
            <motion.section key="examen" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid gap-5 xl:grid-cols-[1fr_390px]">
              <Card><div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-bold text-indigo-700">{profile.label}</p><h2 className="flex items-center text-2xl font-black"><ClipboardCheck className="mr-2 h-6 w-6" />Simulacro completo</h2></div><Badge className={examTime < 600 ? "text-red-700" : ""}><Timer className="mr-1 h-4 w-4" />{minutes}:{seconds.toString().padStart(2, "0")}</Badge></div>
                {!examStarted ? <div className="mt-5 rounded-3xl bg-slate-100 p-5"><p className="text-slate-700">Dispondrás de {profile.durationSeconds / 60} minutos. El formulario reproduce los apartados y la puntuación máxima del modelo seleccionado. Tus respuestas se guardan localmente mientras el tiempo está en marcha.</p><div className="mt-5 flex flex-wrap gap-3"><Button onClick={startExam} className="bg-slate-950 text-white">Empezar un simulacro nuevo</Button>{hasSavedDraft && <Button onClick={resumeExam} className="border border-indigo-300 bg-indigo-50 text-indigo-800"><Save className="mr-2 inline h-4 w-4" />Continuar borrador</Button>}{hasSavedDraft && <Button onClick={discardExamDraft} className="border border-slate-300 bg-white text-slate-700">Descartar borrador</Button>}</div></div> : <><div className="mt-5 rounded-3xl bg-slate-100 p-5"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-bold text-slate-600">{examText.philosopher} · {examText.work}</p>{!examFinished && <Badge><Save className="mr-1 h-3.5 w-3.5" />Guardado local automático</Badge>}</div><blockquote className="mt-3 text-lg font-medium leading-relaxed">“{examText.quote}”</blockquote></div><div className="mt-5"><CriterionFields criteria={profile.examCriteria} responses={examResponses} onChange={(id, value) => setExamResponses((previous) => ({ ...previous, [id]: value }))} disabled={examFinished} /></div><div className="mt-5 flex flex-wrap gap-3"><Button onClick={() => finishExam(false)} disabled={examFinished} className="bg-slate-950 text-white">Entregar examen</Button><Button onClick={startExam} className="border border-slate-300 bg-white">Nuevo simulacro</Button></div></>}
                {examResult?.timedOut && <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><AlertTriangle className="mr-2 inline h-4 w-4" />Se agotó el tiempo y el intento se entregó automáticamente.</div>}
                <RubricResult result={examResult} title="Resultado del simulacro" />
              </div></Card>
              <div className="space-y-5"><Card><div className="p-6"><h2 className="text-2xl font-black">Rúbrica activa</h2><p className="mt-1 text-sm text-slate-500">Total: 10 puntos</p><div className="mt-4 space-y-3">{profile.examCriteria.map((criterion) => <div key={criterion.id} className="rounded-2xl bg-slate-100 p-4"><div className="flex items-start justify-between gap-3"><span className="text-sm font-bold">{criterion.label}</span><Badge>{criterion.max} p.</Badge></div><p className="mt-2 text-xs text-slate-500">{criterion.recommendedWords}</p></div>)}</div><a href={profile.officialUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center text-sm font-bold text-indigo-700 hover:underline">Modelo oficial de referencia <ExternalLink className="ml-1 h-4 w-4" /></a></div></Card><Card><div className="p-6"><h3 className="font-black">Antes de entregar</h3><ul className="mt-3 space-y-2 text-sm text-slate-600"><li>✓ Revisa que todos los apartados estén respondidos.</li><li>✓ Distingue explicar de enumerar conceptos.</li><li>✓ Usa comparaciones explícitas y justificadas.</li><li>✓ Reserva tiempo para ortografía y cohesión.</li></ul></div></Card></div>
            </motion.section>
          )}

          {tab === "progreso" && (
            <motion.section key="progreso" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid gap-5 xl:grid-cols-[1fr_430px]">
              <div className="space-y-5"><Card><div className="p-6"><h2 className="text-2xl font-black">Panel del alumno</h2><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-3xl bg-slate-100 p-5"><p className="text-sm text-slate-500">XP real acumulada</p><p className="text-4xl font-black">{xp}</p></div><div className="rounded-3xl bg-slate-100 p-5"><p className="text-sm text-slate-500">Racha de actividad</p><p className="text-4xl font-black">{streak}</p></div><div className="rounded-3xl bg-slate-100 p-5"><p className="text-sm text-slate-500">Itinerario</p><p className="text-4xl font-black">{lessonProgress}%</p></div></div><h3 className="mt-6 font-black">Competencias calculadas desde tus correcciones</h3><div className="mt-4 space-y-4">{competencyData.map((competency) => <div key={competency.label}><div className="mb-1 flex items-center justify-between gap-3 text-sm"><span>{competency.label}</span><span className="font-bold">{competency.value === null ? "Sin datos" : `${competency.value}%`}</span></div><ProgressBar value={competency.value || 0} /></div>)}</div><Button onClick={resetProgress} className="mt-6 border border-red-300 bg-red-50 text-red-700"><RotateCcw className="mr-2 inline h-4 w-4" />Borrar mi progreso</Button></div></Card><Card><div className="p-6"><h2 className="flex items-center text-2xl font-black"><Award className="mr-2 h-6 w-6" />Logros verificables</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{[["Primer comentario", history.some((item) => item.type === "Comentario")], ["Primer simulacro", history.some((item) => item.type === "Simulacro")], ["Racha de 4 días", streak >= 4], ["Itinerario completo", completedLessons.length === lessons.length]].map(([name, unlocked]) => <div key={name} className={`flex items-center justify-between rounded-2xl p-4 ${unlocked ? "bg-emerald-100 text-emerald-900" : "bg-slate-100 text-slate-400"}`}><span className="font-bold">{name}</span>{unlocked ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}</div>)}</div></div></Card></div>
              <Card className="h-fit"><div className="p-6"><h2 className="flex items-center text-2xl font-black"><History className="mr-2 h-6 w-6" />Historial de intentos</h2><div className="mt-4 max-h-[820px] space-y-3 overflow-y-auto">{history.length === 0 && <p className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-500">Aún no hay datos inventados: tu historial empezará con la primera corrección.</p>}{history.map((attempt) => <div key={attempt.id} className="rounded-2xl bg-slate-100 p-4"><div className="flex items-start justify-between gap-3"><div><Badge>{attempt.type || "Práctica"}</Badge><p className="mt-2 font-black">{attempt.title}</p></div><span className="font-black text-indigo-800">{attempt.score}/{attempt.maxScore || 10}</span></div><p className="mt-2 text-xs text-slate-500">{attempt.author} · {attempt.profile || "Modelo anterior"} · {attempt.date}</p></div>)}</div></div></Card>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
      <footer className="border-t border-slate-200 bg-white/70 px-4 py-6 text-center text-xs text-slate-500">
        <strong className="text-slate-700">NOESIS PAU {TARGET_PAU_YEAR}</strong> · Entrenamiento formativo de Historia de la Filosofía
      </footer>
    </div>
  );
}
