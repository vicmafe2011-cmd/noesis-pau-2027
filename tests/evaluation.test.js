import assert from "node:assert/strict";
import test from "node:test";
import { PAU_PROFILES, createEmptyResponses, getMaximumScore } from "../src/data/pauProfiles.js";
import { countWords, evaluateResponses } from "../src/lib/evaluation.js";

const selectedText = {
  id: "platon-test",
  philosopher: "Platón",
  theme: "El paso de la ignorancia al conocimiento verdadero.",
  thesis: "La educación filosófica permite abandonar la apariencia sensible y alcanzar el conocimiento de las Ideas y del Bien.",
  concepts: ["mundo sensible", "mundo inteligible", "Idea de Bien", "educación"],
  solution: "La caverna representa la opinión y el exterior simboliza el conocimiento racional de las Ideas.",
  period: "Filosofía antigua",
  context: "Dualismo ontológico y teoría platónica del conocimiento.",
  comparison: "Aristóteles critica que las Ideas estén separadas de las sustancias concretas.",
};

test("los perfiles de referencia suman 4 puntos en comentario y 10 en examen", () => {
  for (const profile of Object.values(PAU_PROFILES)) {
    assert.equal(getMaximumScore(profile.commentCriteria), 4);
    assert.equal(getMaximumScore(profile.examCriteria), 10);
    assert.equal(profile.durationSeconds, 90 * 60);
    assert.equal(profile.targetYear, 2027);
    assert.equal(profile.sourceYear, 2026);
  }
});

test("una respuesta vacía obtiene cero y feedback por cada criterio", () => {
  const criteria = PAU_PROFILES["valenciana-2026"].commentCriteria;
  const result = evaluateResponses({
    responses: createEmptyResponses(criteria),
    criteria,
    selectedText,
  });

  assert.equal(result.total, 0);
  assert.equal(result.maximum, 4);
  assert.equal(result.percentage, 0);
  assert.ok(result.sections.every((section) => section.improvements.length > 0));
});

test("enumerar palabras clave no produce una nota alta", () => {
  const criteria = PAU_PROFILES["valenciana-2026"].commentCriteria;
  const result = evaluateResponses({
    responses: {
      theme: "mundo sensible mundo inteligible Idea de Bien educación",
      thesis: "mundo sensible mundo inteligible Idea de Bien educación conocimiento verdad caverna",
      context: "Platón Aristóteles mundo sensible mundo inteligible Idea de Bien educación filosofía antigua",
    },
    criteria,
    selectedText,
  });

  assert.ok(result.total <= 1.25, `la enumeración obtuvo ${result.total}/4`);
  assert.ok(result.warnings.some((warning) => warning.includes("palabras clave")));
});

test("una respuesta desarrollada recibe una valoración claramente superior", () => {
  const criteria = PAU_PROFILES["valenciana-2026"].commentCriteria;
  const result = evaluateResponses({
    responses: {
      theme: "El fragmento plantea cómo la educación permite pasar de la ignorancia y la apariencia sensible al conocimiento verdadero.",
      thesis: "Platón sostiene que quien permanece en el mundo sensible solo conoce sombras y opiniones. La liberación del prisionero explica, por tanto, un proceso educativo: la razón comprende progresivamente el mundo inteligible y sus Ideas. Además, el ascenso culmina en la Idea de Bien, fundamento de la verdad y del conocimiento, de modo que educar no consiste en introducir datos sino en orientar el alma.",
      context: "El texto se sitúa en la filosofía antigua y desarrolla el dualismo ontológico y epistemológico de Platón. El mundo sensible es cambiante y se conoce mediante opinión, mientras que el mundo inteligible contiene las Ideas universales y se alcanza racionalmente. La caverna representa esa diferencia y la educación transforma la mirada del prisionero. Aristóteles coincide en que el conocimiento debe explicar lo universal, pero critica que las Ideas estén separadas: frente a Platón, sostiene que la realidad primera son las sustancias concretas compuestas de materia y forma. Así, ambos buscan conocimiento verdadero, aunque difieren en dónde sitúan la esencia. Esta comparación aclara por qué Platón describe el aprendizaje como salida hacia otra realidad y Aristóteles parte de la experiencia de las cosas.",
    },
    criteria,
    selectedText,
  });

  assert.ok(result.total >= 3.25, `la respuesta desarrollada obtuvo ${result.total}/4`);
  assert.ok(result.sections.every((section) => section.evidence.length > 0));
  assert.equal(result.warnings.length, 0);
});

test("un texto largo pero ajeno al fragmento no aprueba el comentario", () => {
  const criteria = PAU_PROFILES["valenciana-2026"].commentCriteria;
  const unrelated = "La tecnología contemporánea ofrece ventajas para empresas y personas. Por ejemplo, facilita la comunicación entre grupos y permite trabajar con rapidez. Sin embargo, cada proyecto necesita organización porque los resultados dependen de decisiones prácticas. Por tanto, conviene analizar los recursos disponibles, establecer objetivos y revisar las consecuencias de cada alternativa antes de llegar a una conclusión razonable y equilibrada para todos los participantes del proceso.";
  const result = evaluateResponses({
    responses: { theme: unrelated, thesis: unrelated, context: unrelated },
    criteria,
    selectedText,
  });

  assert.ok(result.total < 2, `el texto irrelevante obtuvo ${result.total}/4`);
  assert.ok(result.sections.some((section) => section.improvements.some((item) => item.includes("fragmento"))));
});

test("el contador de palabras ignora espacios repetidos y líneas vacías", () => {
  assert.equal(countWords("  Idea   de Bien\n\n y educación "), 5);
});
