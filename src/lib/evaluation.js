const STOP_WORDS = new Set([
  "a", "al", "algo", "ante", "como", "con", "contra", "cual", "cuando", "de", "del", "desde",
  "donde", "el", "ella", "ellas", "ellos", "en", "entre", "es", "esa", "ese", "esta", "este",
  "esto", "ha", "hacia", "hasta", "la", "las", "lo", "los", "más", "muy", "no", "o", "para",
  "pero", "por", "porque", "que", "se", "según", "ser", "si", "sin", "sobre", "son", "su", "sus",
  "también", "tiene", "un", "una", "uno", "y", "ya",
]);

const PREDICATE_MARKERS = [
  "aborda", "afirma", "analiza", "consiste", "defiende", "explica", "mantiene", "muestra", "plantea",
  "propone", "rechaza", "se ocupa", "sostiene", "trata",
];

const ARGUMENT_MARKERS = [
  "además", "aunque", "así", "de este modo", "en cambio", "en consecuencia", "por ejemplo", "por tanto",
  "puesto que", "sin embargo", "ya que",
];

const COMPARISON_MARKERS = [
  "a diferencia", "al igual", "coincide", "comparte", "difiere", "en cambio", "frente a", "mientras que",
  "por el contrario", "se asemeja", "supera", "critica",
];

const DEFINITION_MARKERS = [
  "designa", "es", "hace referencia", "puede definirse", "se define", "se entiende", "significa",
];

const AUTHOR_NAMES = [
  "agustín", "aquino", "arendt", "aristóteles", "beauvoir", "descartes", "hume", "kant", "locke", "luxemburg", "marx",
  "nietzsche", "ortega", "platón", "rousseau", "sartre", "sócrates", "tomás", "wollstonecraft",
];

export function normalizeText(value = "") {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[“”«»]/g, '"')
    .replace(/[^a-z0-9áéíóúüñ\s-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function countWords(value = "") {
  return normalizeText(value).split(/\s+/).filter(Boolean).length;
}

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function roundQuarter(value) {
  return Math.round(value * 4) / 4;
}

function significantTokens(value) {
  return normalizeText(value)
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function includesMarker(clean, markers) {
  return markers.some((marker) => clean.includes(normalizeText(marker)));
}

function getReferenceText(kind, text) {
  const common = [text.theme, text.thesis, text.solution, ...(text.concepts || [])].filter(Boolean).join(" ");
  const context = [text.period, text.context, text.comparison, text.philosopher].filter(Boolean).join(" ");

  switch (kind) {
    case "theme":
      return text.theme;
    case "thesis":
      return [text.thesis, text.solution].filter(Boolean).join(" ");
    case "context":
    case "relation":
      return `${common} ${context}`;
    case "concept":
      return `${(text.concepts || []).join(" ")} ${text.thesis}`;
    case "current":
    case "dissertation":
      return `${text.theme} ${(text.concepts || []).join(" ")} ${text.comparison || ""}`;
    case "essay":
    case "topic":
    case "analysis":
    default:
      return `${common} ${context}`;
  }
}

function getEvidence(answer, referenceTokens) {
  const sentences = answer
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const best = sentences.find((sentence) => {
    const clean = normalizeText(sentence);
    return referenceTokens.some((token) => clean.includes(token));
  }) || sentences[0];

  if (!best) return "";
  return best.length > 180 ? `${best.slice(0, 177)}…` : best;
}

function authorSignals(clean, selectedAuthor) {
  const selected = normalizeText(selectedAuthor || "");
  const mentioned = AUTHOR_NAMES.filter((author) => clean.includes(normalizeText(author)));
  const otherAuthors = mentioned.filter((author) => !selected.includes(normalizeText(author)));
  return { mentioned, otherAuthors };
}

function evaluateCriterion(answer, criterion, text) {
  const clean = normalizeText(answer);
  const words = countWords(answer);
  if (!clean) {
    return {
      ...criterion,
      score: 0,
      words: 0,
      status: "Sin responder",
      evidence: "",
      positives: [],
      improvements: ["Este apartado está vacío."],
      feedback: "Este apartado está vacío.",
      warnings: [],
    };
  }

  const answerTokens = significantTokens(answer);
  const uniqueTokens = new Set(answerTokens);
  const lexicalDiversity = answerTokens.length ? uniqueTokens.size / answerTokens.length : 0;
  const referenceTokens = [...new Set(significantTokens(getReferenceText(criterion.kind, text)))];
  const sharedTokens = referenceTokens.filter((token) => uniqueTokens.has(token));
  const overlapTarget = criterion.kind === "theme" ? 3 : criterion.kind === "concept" ? 5 : 9;
  const semanticCoverage = clamp(sharedTokens.length / Math.min(overlapTarget, Math.max(referenceTokens.length, 1)));
  const conceptHits = (text.concepts || []).filter((concept) => clean.includes(normalizeText(concept)));
  const conceptCoverage = clamp(conceptHits.length / Math.max(Math.min((text.concepts || []).length, 3), 1));
  const predicate = includesMarker(clean, PREDICATE_MARKERS);
  const argument = includesMarker(clean, ARGUMENT_MARKERS);
  const comparison = includesMarker(clean, COMPARISON_MARKERS);
  const definition = includesMarker(clean, DEFINITION_MARKERS);
  const { otherAuthors } = authorSignals(clean, text.philosopher);
  const sentenceCount = answer.split(/[.!?]+|\n+/).map((item) => item.trim()).filter(Boolean).length;
  const developedSentences = sentenceCount >= (criterion.kind === "theme" ? 1 : 2);
  const lengthScore = clamp(words / Math.max(criterion.minWords, 1));
  const structureScore = clamp(
    (developedSentences ? 0.35 : 0) +
      (predicate ? 0.25 : 0) +
      (argument ? 0.25 : 0) +
      (lexicalDiversity >= 0.55 ? 0.15 : lexicalDiversity >= 0.42 ? 0.08 : 0),
  );

  let quality;
  switch (criterion.kind) {
    case "theme":
      quality = semanticCoverage * 0.65 + (predicate ? 0.2 : 0) + lengthScore * 0.15;
      break;
    case "context":
    case "relation":
      quality = semanticCoverage * 0.3 + conceptCoverage * 0.15 + lengthScore * 0.2 + (comparison ? 0.15 : 0) + (otherAuthors.length ? 0.15 : 0) + structureScore * 0.05;
      break;
    case "concept":
      quality = conceptCoverage * 0.4 + semanticCoverage * 0.25 + (definition ? 0.15 : 0) + lengthScore * 0.15 + structureScore * 0.05;
      break;
    case "current":
    case "dissertation":
      quality = semanticCoverage * 0.2 + conceptCoverage * 0.15 + lengthScore * 0.25 + (argument ? 0.2 : 0) + structureScore * 0.2;
      break;
    case "essay":
    case "topic":
      quality = semanticCoverage * 0.3 + conceptCoverage * 0.25 + lengthScore * 0.25 + structureScore * 0.2;
      break;
    case "analysis":
      quality = semanticCoverage * 0.35 + conceptCoverage * 0.25 + lengthScore * 0.2 + structureScore * 0.2;
      break;
    case "thesis":
    default:
      quality = semanticCoverage * 0.4 + conceptCoverage * 0.2 + lengthScore * 0.2 + structureScore * 0.2;
      break;
  }

  const likelyKeywordStuffing =
    (conceptHits.length >= 2 && words < Math.max(criterion.minWords * 0.6, 12) && !predicate) ||
    (words >= 12 && lexicalDiversity < 0.38);
  if (likelyKeywordStuffing) quality *= 0.35;
  if (criterion.requiresComparison && (!comparison || otherAuthors.length === 0)) quality = Math.min(quality, 0.62);
  if (criterion.requiresArgument && !argument) quality = Math.min(quality, 0.68);
  if (words < criterion.minWords * 0.45) quality = Math.min(quality, 0.45);

  const score = Math.min(criterion.max, roundQuarter(criterion.max * clamp(quality)));
  const positives = [];
  const improvements = [];
  const warnings = [];

  if (semanticCoverage >= 0.55) positives.push("La respuesta se mantiene centrada en el problema del fragmento.");
  if (conceptHits.length >= 2) positives.push(`Emplea vocabulario pertinente: ${conceptHits.slice(0, 3).join(", ")}.`);
  if (argument) positives.push("Utiliza conectores que desarrollan el razonamiento.");
  if (comparison && otherAuthors.length) positives.push("Establece una comparación filosófica explícita.");

  if (words < criterion.minWords) improvements.push(`Falta desarrollo: has escrito ${words} palabras; la orientación de este apartado es ${criterion.recommendedWords}.`);
  if (semanticCoverage < 0.35) improvements.push("Relaciona de forma más precisa la respuesta con las ideas concretas del fragmento.");
  if (["theme", "thesis", "analysis"].includes(criterion.kind) && !predicate) improvements.push("Formula una afirmación completa: indica qué plantea, sostiene o defiende el autor.");
  if (!["theme", "current"].includes(criterion.kind) && conceptHits.length === 0) improvements.push("Introduce y explica vocabulario técnico del autor, no solo expresiones generales.");
  if (criterion.requiresComparison && !comparison) improvements.push("Explicita la relación con conectores de semejanza, diferencia, crítica o superación.");
  if (criterion.requiresComparison && otherAuthors.length === 0) improvements.push("Nombra y desarrolla otra posición filosófica pertinente.");
  if (criterion.requiresArgument && !argument) improvements.push("Añade razones, objeciones, ejemplos y una conclusión conectada con la tesis.");
  if (likelyKeywordStuffing) {
    warnings.push("Posible enumeración de palabras clave sin desarrollo argumentado.");
    improvements.unshift("Convierte la lista de términos en oraciones razonadas que expliquen la relación entre las ideas.");
  }

  const ratio = criterion.max ? score / criterion.max : 0;
  const status = ratio >= 0.85 ? "Logrado" : ratio >= 0.55 ? "En desarrollo" : "Inicial";
  return {
    ...criterion,
    score,
    words,
    status,
    evidence: getEvidence(answer, referenceTokens),
    positives,
    improvements,
    feedback: improvements[0] || "Respuesta pertinente y suficientemente desarrollada.",
    warnings,
  };
}

export function evaluateResponses({ responses, criteria, selectedText }) {
  const sections = criteria.map((criterion) =>
    evaluateCriterion(responses[criterion.id] || "", criterion, selectedText),
  );
  const maximum = criteria.reduce((total, criterion) => total + criterion.max, 0);
  const total = roundQuarter(sections.reduce((sum, section) => sum + section.score, 0));
  const percentage = maximum ? Math.round((total / maximum) * 100) : 0;
  const warnings = [...new Set(sections.flatMap((section) => section.warnings))];
  const skillGroups = sections.reduce((groups, section) => {
    const values = groups[section.skill] || [];
    values.push((section.score / Math.max(section.max, 1)) * 100);
    return { ...groups, [section.skill]: values };
  }, {});
  const skills = Object.fromEntries(Object.entries(skillGroups).map(([skill, values]) => [
    skill,
    Math.round(values.reduce((sum, value) => sum + value, 0) / values.length),
  ]));
  const globalFeedback =
    percentage >= 85
      ? "Respuesta sólida: conserva esta estructura y afina los matices señalados."
      : percentage >= 60
        ? "Base adecuada, pero todavía hay criterios concretos que desarrollar."
        : "La respuesta necesita más precisión conceptual, desarrollo y conexión con el fragmento.";

  return { total, maximum, percentage, sections, warnings, skills, globalFeedback };
}
