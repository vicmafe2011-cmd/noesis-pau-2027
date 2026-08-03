/* eslint-disable react-refresh/only-export-components */
import { motion } from "framer-motion";
import { AlertTriangle, Award, Lightbulb } from "lucide-react";
import { countWords } from "./lib/evaluation.js";

function Badge({ children }) {
  return <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">{children}</span>;
}

function ProgressBar({ value }) {
  return (
    <div className="h-3 w-full rounded-full bg-slate-200">
      <motion.div className="h-3 rounded-full bg-slate-900" initial={{ width: 0 }} animate={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

export function CriterionFields({ criteria, responses, onChange, disabled = false, showHints = false }) {
  return (
    <div className="grid gap-4">
      {criteria.map((criterion) => {
        const words = countWords(responses[criterion.id] || "");
        return (
          <label key={criterion.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <span className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-slate-900">{criterion.label}</span>
              <Badge>{criterion.max} {criterion.max === 1 ? "punto" : "puntos"}</Badge>
            </span>
            <span className="mt-1 block text-xs text-slate-500">
              Orientación: {criterion.recommendedWords} · {words} palabras escritas
            </span>
            {showHints && criterion.help && (
              <span className="mt-2 block rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
                <Lightbulb className="mr-1 inline h-3.5 w-3.5" />{criterion.help}
              </span>
            )}
            <textarea
              value={responses[criterion.id] || ""}
              onChange={(event) => onChange(criterion.id, event.target.value)}
              disabled={disabled}
              placeholder={criterion.placeholder}
              className="mt-3 min-h-32 w-full resize-y rounded-2xl border border-slate-200 bg-white p-3 text-sm leading-relaxed outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
            />
          </label>
        );
      })}
    </div>
  );
}

export function RubricResult({ result, title = "Corrección por criterios" }) {
  if (!result) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-3xl border border-indigo-200 bg-indigo-50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-indigo-700">{title}</p>
          <h3 className="flex items-center text-2xl font-black text-indigo-950">
            <Award className="mr-2 h-6 w-6" />{result.total}/{result.maximum}
          </h3>
        </div>
        <Badge>{result.percentage}% de la rúbrica</Badge>
      </div>
      <p className="mt-3 text-sm text-slate-700">{result.globalFeedback}</p>
      {result.warnings.length > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          <AlertTriangle className="mr-2 inline h-4 w-4" />{result.warnings.join(" ")}
        </div>
      )}
      <div className="mt-4 space-y-3">
        {result.sections.map((section) => (
          <div key={section.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 font-semibold">
              <span>{section.label}</span>
              <span>{section.score}/{section.max} · {section.status}</span>
            </div>
            <div className="mt-2"><ProgressBar value={(section.score / section.max) * 100} /></div>
            {section.evidence && (
              <p className="mt-3 border-l-2 border-indigo-300 pl-3 text-xs italic text-slate-600">
                Evidencia detectada: “{section.evidence}”
              </p>
            )}
            {section.positives.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm text-emerald-800">
                {section.positives.map((positive) => <li key={positive}>✓ {positive}</li>)}
              </ul>
            )}
            {section.improvements.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm text-slate-700">
                {section.improvements.map((improvement) => <li key={improvement}>→ {improvement}</li>)}
              </ul>
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Evaluación formativa y orientativa. La calificación oficial depende del tribunal corrector.
      </p>
    </motion.div>
  );
}

function TheoryBox({ children, className = "" }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white p-3 text-center text-sm shadow-sm ${className}`}>{children}</div>;
}

function TheoryArrow() {
  return <div className="flex items-center justify-center text-2xl font-bold text-slate-400">→</div>;
}

function TheoryDown() {
  return <div className="flex justify-center text-2xl font-bold text-slate-400">↓</div>;
}

export function TheoryVisual({ type }) {

  if (type === "platon") return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-center text-lg font-bold">Platón · Alegoría de la caverna</h3>
      <div className="grid gap-3 md:grid-cols-5">
        <TheoryBox className="bg-slate-900 text-white">Prisioneros encadenados<p className="mt-1 text-xs text-slate-300">condición humana</p></TheoryBox>
        <TheoryArrow />
        <TheoryBox className="bg-slate-100">Sombras<p className="mt-1 text-xs text-slate-500">opinión / apariencia</p></TheoryBox>
        <TheoryArrow />
        <TheoryBox className="bg-orange-100">Fuego<p className="mt-1 text-xs text-slate-500">mundo visible</p></TheoryBox>
      </div>
      <TheoryDown />
      <div className="grid gap-3 md:grid-cols-5">
        <TheoryBox className="bg-blue-50">Liberación<p className="mt-1 text-xs text-slate-500">educación filosófica</p></TheoryBox>
        <TheoryArrow />
        <TheoryBox className="bg-indigo-50">Salida de la caverna<p className="mt-1 text-xs text-slate-500">ascenso racional</p></TheoryBox>
        <TheoryArrow />
        <TheoryBox className="bg-amber-100">Sol<p className="mt-1 text-xs text-slate-500">Idea de Bien</p></TheoryBox>
      </div>
      <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">El comentario debe explicar el paso desde la opinión sensible hasta el conocimiento verdadero de las Ideas.</p>
    </div>
  );

  if (type === "aristoteles") return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-center text-lg font-bold">Aristóteles · Cambio y finalidad</h3>
      <div className="grid gap-3 md:grid-cols-5">
        <TheoryBox className="bg-yellow-50">Potencia<p className="mt-1 text-xs text-slate-500">lo que puede llegar a ser</p></TheoryBox>
        <TheoryArrow />
        <TheoryBox className="bg-orange-50">Cambio<p className="mt-1 text-xs text-slate-500">proceso natural</p></TheoryBox>
        <TheoryArrow />
        <TheoryBox className="bg-emerald-50">Acto<p className="mt-1 text-xs text-slate-500">realización</p></TheoryBox>
      </div>
      <TheoryDown />
      <div className="grid gap-3 md:grid-cols-4"><TheoryBox>Causa material</TheoryBox><TheoryBox>Causa formal</TheoryBox><TheoryBox>Causa eficiente</TheoryBox><TheoryBox>Causa final</TheoryBox></div>
      <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">Para Aristóteles, la realidad no está separada como en Platón: se encuentra en las sustancias concretas.</p>
    </div>
  );

  if (type === "agustin") return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-center text-lg font-bold">San Agustín · Interioridad e iluminación</h3>
      <div className="grid gap-3 md:grid-cols-5">
        <TheoryBox className="bg-slate-50">Mundo exterior<p className="mt-1 text-xs text-slate-500">búsqueda insuficiente</p></TheoryBox>
        <TheoryArrow />
        <TheoryBox className="bg-purple-50">Interioridad<p className="mt-1 text-xs text-slate-500">alma</p></TheoryBox>
        <TheoryArrow />
        <TheoryBox className="bg-amber-100">Dios ilumina<p className="mt-1 text-xs text-slate-500">verdad eterna</p></TheoryBox>
      </div>
      <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">El comentario debe mostrar que la verdad no depende solo de los sentidos, sino de la iluminación divina en el alma.</p>
    </div>
  );

  if (type === "tomas") return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-center text-lg font-bold">Tomás de Aquino · Razón, fe y cinco vías</h3>
      <div className="grid gap-3 md:grid-cols-5">
        <TheoryBox className="bg-emerald-50">Mundo sensible<p className="mt-1 text-xs text-slate-500">punto de partida</p></TheoryBox>
        <TheoryArrow />
        <TheoryBox className="bg-lime-50">Razón<p className="mt-1 text-xs text-slate-500">argumenta</p></TheoryBox>
        <TheoryArrow />
        <TheoryBox className="bg-amber-100">Dios<p className="mt-1 text-xs text-slate-500">fundamento último</p></TheoryBox>
      </div>
      <TheoryDown />
      <div className="grid gap-3 md:grid-cols-5"><TheoryBox>Movimiento</TheoryBox><TheoryBox>Causalidad</TheoryBox><TheoryBox>Contingencia</TheoryBox><TheoryBox>Perfección</TheoryBox><TheoryBox>Finalidad</TheoryBox></div>
      <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">Tomás no opone razón y fe: la razón puede demostrar algunas verdades, y la fe completa lo que la razón no alcanza.</p>
    </div>
  );

  if (type === "descartes") return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-center text-lg font-bold">Descartes · Duda metódica y cogito</h3>
      <div className="grid gap-3 md:grid-cols-7"><TheoryBox className="bg-blue-50">Duda de los sentidos</TheoryBox><TheoryArrow /><TheoryBox className="bg-blue-50">Duda del mundo</TheoryBox><TheoryArrow /><TheoryBox className="bg-blue-50">Genio maligno</TheoryBox><TheoryArrow /><TheoryBox className="bg-slate-900 text-white">Cogito</TheoryBox></div>
      <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">El objetivo no es quedarse en la duda, sino encontrar una certeza absolutamente indudable: el sujeto pensante.</p>
    </div>
  );

  if (type === "hume") return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-center text-lg font-bold">Hume · Empirismo y causalidad</h3>
      <div className="grid gap-3 md:grid-cols-5"><TheoryBox className="bg-sky-50">Impresiones<p className="mt-1 text-xs text-slate-500">experiencia viva</p></TheoryBox><TheoryArrow /><TheoryBox className="bg-sky-50">Ideas<p className="mt-1 text-xs text-slate-500">copias débiles</p></TheoryBox><TheoryArrow /><TheoryBox className="bg-red-50">Causalidad<p className="mt-1 text-xs text-slate-500">no es conexión necesaria</p></TheoryBox></div>
      <TheoryDown /><TheoryBox className="bg-amber-50">Repetición de hechos → hábito mental → creemos que hay causa</TheoryBox>
      <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">Hume no niega que usemos la causalidad: niega que podamos demostrar racionalmente una conexión necesaria.</p>
    </div>
  );

  if (type === "rousseau") return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-center text-lg font-bold">Rousseau · Desigualdad y contrato social</h3>
      <div className="grid gap-3 md:grid-cols-7"><TheoryBox className="bg-green-50">Estado natural</TheoryBox><TheoryArrow /><TheoryBox className="bg-red-50">Propiedad privada</TheoryBox><TheoryArrow /><TheoryBox className="bg-orange-50">Desigualdad</TheoryBox><TheoryArrow /><TheoryBox className="bg-emerald-50">Contrato social</TheoryBox></div>
      <TheoryDown /><TheoryBox className="bg-indigo-50">Voluntad general → bien común → libertad política</TheoryBox>
      <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">En Rousseau, la libertad no consiste en hacer lo que uno quiere, sino en obedecer leyes que expresan la voluntad general.</p>
    </div>
  );

  if (type === "kant") return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-center text-lg font-bold">Kant · Las tres críticas</h3>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-indigo-50 p-4"><h4 className="font-bold">1. Crítica de la razón pura</h4><p className="mt-2 text-sm">Pregunta: ¿qué puedo conocer?</p><div className="mt-3 space-y-2 text-xs"><TheoryBox>Sensibilidad: espacio y tiempo</TheoryBox><TheoryBox>Entendimiento: categorías</TheoryBox><TheoryBox>Fenómeno / noúmeno</TheoryBox></div></div>
        <div className="rounded-2xl border bg-emerald-50 p-4"><h4 className="font-bold">2. Crítica de la razón práctica</h4><p className="mt-2 text-sm">Pregunta: ¿qué debo hacer?</p><div className="mt-3 space-y-2 text-xs"><TheoryBox>Deber</TheoryBox><TheoryBox>Imperativo categórico</TheoryBox><TheoryBox>Autonomía moral</TheoryBox></div></div>
        <div className="rounded-2xl border bg-amber-50 p-4"><h4 className="font-bold">3. Crítica del juicio</h4><p className="mt-2 text-sm">Pregunta: ¿cómo juzgo lo bello?</p><div className="mt-3 space-y-2 text-xs"><TheoryBox>Juicio de gusto</TheoryBox><TheoryBox>Universalidad sin concepto</TheoryBox><TheoryBox>Finalidad sin fin</TheoryBox></div></div>
      </div>
      <TheoryDown /><TheoryBox className="bg-slate-50">Naturaleza conocida por la razón pura ↔ libertad moral de la razón práctica ↔ mediación del juicio</TheoryBox>
      <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">En un comentario de Kant, primero identifica si el texto pertenece al conocimiento, la moral o la estética.</p>
    </div>
  );

  if (type === "marx") return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-center text-lg font-bold">Marx · Capitalismo y alienación</h3>
      <div className="grid gap-3 md:grid-cols-7"><TheoryBox className="bg-red-50">Trabajador</TheoryBox><TheoryArrow /><TheoryBox className="bg-orange-50">Trabajo en fábrica</TheoryBox><TheoryArrow /><TheoryBox className="bg-yellow-50">Producto ajeno</TheoryBox><TheoryArrow /><TheoryBox className="bg-slate-900 text-white">Alienación</TheoryBox></div>
      <TheoryDown /><div className="grid gap-3 md:grid-cols-3"><TheoryBox>Burguesía</TheoryBox><TheoryBox>Proletariado</TheoryBox><TheoryBox>Lucha de clases</TheoryBox></div>
      <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">Marx explica las ideas desde las condiciones materiales: economía, trabajo, propiedad y clase social.</p>
    </div>
  );

  if (type === "nietzsche") return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-center text-lg font-bold">Nietzsche · Muerte de Dios y nuevos valores</h3>
      <div className="grid gap-3 md:grid-cols-7"><TheoryBox className="bg-slate-100">Moral tradicional</TheoryBox><TheoryArrow /><TheoryBox className="bg-red-50">Muerte de Dios</TheoryBox><TheoryArrow /><TheoryBox className="bg-rose-50">Nihilismo</TheoryBox><TheoryArrow /><TheoryBox className="bg-slate-900 text-white">Superhombre</TheoryBox></div>
      <TheoryDown /><TheoryBox className="bg-amber-50">Voluntad de poder → afirmación de la vida → creación de nuevos valores</TheoryBox>
      <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">La muerte de Dios no es literal: significa la pérdida de autoridad de los valores absolutos.</p>
    </div>
  );

  if (type === "ortega") return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-center text-lg font-bold">Ortega y Gasset · Yo y circunstancia</h3>
      <div className="grid gap-3 md:grid-cols-5"><TheoryBox className="bg-orange-50">Yo<p className="mt-1 text-xs text-slate-500">proyecto vital</p></TheoryBox><TheoryArrow /><TheoryBox className="bg-yellow-50">Circunstancia<p className="mt-1 text-xs text-slate-500">mundo concreto</p></TheoryBox><TheoryArrow /><TheoryBox className="bg-emerald-50">Vida<p className="mt-1 text-xs text-slate-500">realidad radical</p></TheoryBox></div>
      <TheoryDown /><TheoryBox className="bg-indigo-50">Perspectivismo: cada vida aporta un punto de vista necesario sobre la realidad</TheoryBox>
      <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">Ortega no defiende relativismo total: cada perspectiva aporta una parte de la verdad.</p>
    </div>
  );

  if (type === "arendt") return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-center text-lg font-bold">Hannah Arendt · Banalidad del mal</h3>
      <div className="grid gap-3 md:grid-cols-7"><TheoryBox className="bg-slate-100">Sistema burocrático</TheoryBox><TheoryArrow /><TheoryBox className="bg-red-50">Obediencia acrítica</TheoryBox><TheoryArrow /><TheoryBox className="bg-orange-50">Ausencia de pensamiento</TheoryBox><TheoryArrow /><TheoryBox className="bg-violet-50">Banalidad del mal</TheoryBox></div>
      <TheoryDown /><TheoryBox className="bg-emerald-50">Pensar + juzgar + asumir responsabilidad → vida política libre</TheoryBox>
      <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">Arendt no dice que el mal sea pequeño, sino que puede surgir de personas que renuncian a pensar críticamente.</p>
    </div>
  );

  return <div className="rounded-3xl border bg-white p-5 shadow-sm"><p className="text-sm text-slate-600">Esquema visual no disponible.</p></div>;
}

export const philosophers = [
  { id: "platon", name: "Platón", current: "Idealismo", pau: "Muy frecuente en PAU", color: "from-amber-100 to-orange-50", concepts: ["Ideas", "mundo sensible", "mundo inteligible", "Idea de Bien"], works: ["República", "Fedón"], summary: "La realidad verdadera está en el mundo inteligible de las Ideas. La educación filosófica permite ascender hacia la Idea de Bien." },
  { id: "aristoteles", name: "Aristóteles", current: "Realismo", pau: "Muy frecuente en PAU", color: "from-yellow-100 to-stone-50", concepts: ["sustancia", "acto", "potencia", "felicidad", "virtud"], works: ["Metafísica", "Ética a Nicómaco"], summary: "La realidad está en las sustancias concretas. El cambio se explica mediante acto y potencia." },
  { id: "agustin", name: "San Agustín", current: "Cristianismo platónico", pau: "Habitual en PAU", color: "from-purple-100 to-indigo-50", concepts: ["interioridad", "Dios", "verdad", "iluminación"], works: ["Confesiones", "La ciudad de Dios"], summary: "La verdad se busca en el interior del alma, iluminada por Dios." },
  { id: "tomas", name: "Tomás de Aquino", current: "Escolástica", pau: "Frecuente en PAU", color: "from-emerald-100 to-lime-50", concepts: ["razón", "fe", "cinco vías", "ley natural"], works: ["Suma Teológica"], summary: "Razón y fe son compatibles. Dios puede demostrarse racionalmente a partir del mundo." },
  { id: "descartes", name: "René Descartes", current: "Racionalismo", pau: "Muy frecuente en PAU", color: "from-blue-100 to-cyan-50", concepts: ["duda", "cogito", "razón", "certeza"], works: ["Discurso del método"], summary: "La duda metódica conduce al cogito: pienso, luego existo." },
  { id: "hume", name: "David Hume", current: "Empirismo", pau: "Frecuente en PAU", color: "from-sky-100 to-slate-50", concepts: ["impresiones", "ideas", "causalidad", "costumbre"], works: ["Investigación sobre el entendimiento humano"], summary: "Todo conocimiento procede de la experiencia. La causalidad es costumbre." },
  { id: "rousseau", name: "Rousseau", current: "Contractualismo", pau: "Frecuente en PAU", color: "from-green-100 to-teal-50", concepts: ["contrato social", "voluntad general", "libertad", "soberanía"], works: ["El contrato social"], summary: "La legitimidad política se funda en la voluntad general y el bien común." },
  { id: "kant", name: "Immanuel Kant", current: "Idealismo trascendental", pau: "Muy frecuente en PAU", color: "from-indigo-100 to-slate-100", concepts: ["a priori", "fenómeno", "imperativo categórico", "juicio de gusto", "finalidad sin fin"], works: ["Crítica de la razón pura", "Crítica de la razón práctica", "Crítica de la facultad de juzgar"], summary: "Kant organiza su filosofía alrededor de las tres críticas: conocimiento, moral y juicio estético/teleológico." },
  { id: "marx", name: "Karl Marx", current: "Materialismo histórico", pau: "Muy frecuente en PAU", color: "from-red-100 to-orange-50", concepts: ["alienación", "capitalismo", "trabajo", "clase social"], works: ["Manuscritos", "El capital"], summary: "El capitalismo genera explotación y alienación del trabajador." },
  { id: "nietzsche", name: "Nietzsche", current: "Vitalismo", pau: "Muy frecuente en PAU", color: "from-rose-100 to-red-50", concepts: ["nihilismo", "muerte de Dios", "superhombre", "valores"], works: ["La gaya ciencia", "Zaratustra"], summary: "La muerte de Dios expresa la crisis de los valores tradicionales." },
  { id: "ortega", name: "Ortega y Gasset", current: "Raciovitalismo", pau: "Frecuente en PAU", color: "from-orange-100 to-yellow-50", concepts: ["yo", "circunstancia", "vida", "razón vital"], works: ["Meditaciones del Quijote"], summary: "El ser humano es inseparable de su circunstancia." },
  { id: "arendt", name: "Hannah Arendt", current: "Filosofía política", pau: "Actual", color: "from-violet-100 to-fuchsia-50", concepts: ["banalidad del mal", "acción", "pluralidad", "responsabilidad"], works: ["Eichmann en Jerusalén"], summary: "El mal puede surgir de la obediencia acrítica y de la incapacidad de pensar." },
];

const baseTexts = [
  {id: "platon1", philosopher: "Platón", work: "República, libro VII", title: "Alegoría de la caverna", difficulty: "Media", quote: "Imagina unos hombres que viven en una especie de caverna subterránea, encadenados desde niños de tal modo que solo pueden mirar hacia el fondo. Detrás de ellos hay un fuego y entre el fuego y los prisioneros pasan objetos cuya sombra se proyecta en la pared. Los prisioneros creen que esas sombras son la realidad. Si uno de ellos se libera y sale al exterior, al principio se sentirá confundido, pero poco a poco comprenderá que lo verdadero no son las sombras sino los objetos y, finalmente, el sol que ilumina todo.", theme: "El paso de la ignorancia al conocimiento verdadero.", thesis: "La educación filosófica permite al alma abandonar el mundo sensible y alcanzar el conocimiento del mundo inteligible.", concepts: ["mundo sensible", "mundo inteligible", "Idea de Bien", "educación"], solution: "La caverna representa el mundo sensible, mientras que el exterior simboliza el mundo inteligible. El proceso de liberación es la educación filosófica, que conduce al conocimiento verdadero culminando en la Idea de Bien."},
  {id: "aristoteles1", philosopher: "Aristóteles", work: "Ética a Nicómaco", title: "La felicidad como fin", difficulty: "Media", quote: "Toda acción y toda elección parecen tender hacia algún bien; por ello se ha dicho que el bien es aquello a lo que todas las cosas tienden. Sin embargo, no todos los fines son iguales, pues algunos los elegimos por sí mismos y otros como medios. La felicidad es aquello que elegimos siempre por sí mismo y nunca por otra cosa, y por ello es el bien supremo.", theme: "La felicidad como fin último de la vida humana.", thesis: "La felicidad es el bien supremo porque es el fin último de todas las acciones humanas.", concepts: ["felicidad", "fin último", "virtud", "ética"], solution: "Aristóteles distingue entre fines medios y fines últimos. La felicidad es el fin último porque no se busca como medio sino por sí misma."},
  {id: "agustin1", philosopher: "San Agustín", work: "Confesiones", title: "La verdad interior", difficulty: "Media", quote: "No quieras salir fuera; vuelve a ti mismo, porque en el interior del ser humano habita la verdad. Pero incluso cuando el alma descubre esa verdad, reconoce que no procede de ella misma, sino de una luz superior que la ilumina. El ser humano encuentra la verdad cuando se vuelve hacia su interior y descubre allí la presencia de Dios como fundamento de toda certeza.", theme: "La búsqueda interior de la verdad.", thesis: "La verdad se encuentra en la interioridad del alma iluminada por Dios.", concepts: ["interioridad", "verdad", "Dios", "iluminación"], solution: "San Agustín entiende la verdad como una búsqueda interior. El alma no crea la verdad, sino que la recibe por iluminación divina."},
  {id: "tomas1", philosopher: "Tomás de Aquino", work: "Suma Teológica", title: "Las cinco vías", difficulty: "Media", quote: "Observamos en el mundo que las cosas se mueven, cambian y son causadas por otras. Pero no es posible proceder al infinito en una serie de motores o causas, porque entonces no habría explicación última del movimiento ni de la existencia. Por ello es necesario llegar a un primer motor inmóvil y a una primera causa, a la que todos llaman Dios.", theme: "La demostración racional de la existencia de Dios.", thesis: "La existencia de Dios puede demostrarse racionalmente partiendo de la experiencia del mundo.", concepts: ["Dios", "primer motor", "causalidad", "cinco vías"], solution: "Tomás parte de hechos observables como el movimiento y la causalidad para concluir que debe existir un fundamento primero identificado con Dios."},
  {id: "descartes1", philosopher: "René Descartes", work: "Meditaciones metafísicas", title: "La duda metódica", difficulty: "Alta", quote: "Consideraré como falso todo aquello en lo que pueda imaginar la menor duda. Así, rechazaré los conocimientos basados en los sentidos, pues a veces engañan. También dudaré del mundo exterior, porque podría estar soñando, e incluso de las matemáticas, suponiendo que un genio maligno podría inducirme al error. Sin embargo, hay algo de lo que no puedo dudar: que estoy dudando. Y si dudo, pienso; y si pienso, existo.", theme: "La búsqueda de una certeza absoluta.", thesis: "El cogito es la primera verdad indudable sobre la que se puede construir el conocimiento.", concepts: ["duda metódica", "cogito", "certeza", "racionalismo"], solution: "Descartes utiliza la duda como método para eliminar todo conocimiento inseguro hasta encontrar una verdad absolutamente cierta: la existencia del sujeto pensante."},
  {id: "hume1", philosopher: "David Hume", work: "Investigación sobre el entendimiento humano", title: "Crítica de la causalidad", difficulty: "Alta", quote: "Cuando observamos que un acontecimiento sigue regularmente a otro, creemos que el primero es la causa del segundo. Sin embargo, nunca percibimos una conexión necesaria entre ambos, sino únicamente una sucesión constante. La idea de causalidad no procede de la razón, sino de la costumbre que se forma en nuestra mente al ver repetirse ciertos hechos.", theme: "La crítica empirista de la causalidad.", thesis: "La causalidad no es una conexión necesaria conocida por la razón, sino una creencia basada en la costumbre.", concepts: ["causalidad", "costumbre", "experiencia", "empirismo"], solution: "Hume sostiene que la causalidad no es un conocimiento racional de una conexión necesaria, sino una expectativa psicológica derivada de la experiencia repetida."},
  {id: "rousseau1", philosopher: "Rousseau", work: "El contrato social", title: "La voluntad general", difficulty: "Media", quote: "Cada uno de nosotros pone en común su persona y todo su poder bajo la suprema dirección de la voluntad general. Al hacer esto, no pierde su libertad, sino que la transforma en libertad civil, porque obedece a una ley que expresa el bien común y de la que él mismo participa como ciudadano.", theme: "La legitimidad política basada en la voluntad general.", thesis: "La comunidad política legítima nace del contrato social y se funda en la voluntad general.", concepts: ["contrato social", "voluntad general", "libertad", "soberanía"], solution: "Rousseau defiende que la libertad política no consiste en obedecer intereses particulares, sino leyes que expresan la voluntad general y el bien común."},
  {id: "kant1", philosopher: "Immanuel Kant", work: "Crítica de la razón pura", title: "Condiciones del conocimiento", difficulty: "Alta", quote: "Aunque todo nuestro conocimiento comienza con la experiencia, no por eso procede todo de la experiencia. Existen formas a priori del conocimiento que hacen posible la experiencia misma. El espacio y el tiempo ordenan lo que recibimos por la sensibilidad, mientras que las categorías del entendimiento estructuran los fenómenos que conocemos.", theme: "Las condiciones de posibilidad del conocimiento.", thesis: "El conocimiento es posible gracias a estructuras a priori del sujeto.", concepts: ["a priori", "fenómeno", "noúmeno", "categorías"], solution: "Kant combina empirismo y racionalismo: el conocimiento empieza con la experiencia, pero el sujeto la organiza mediante formas y categorías a priori."},
  {id: "kant2", philosopher: "Immanuel Kant", work: "Crítica de la razón práctica", title: "Imperativo categórico", difficulty: "Alta", quote: "Una acción no posee valor moral por sus consecuencias ni por la inclinación que la acompaña, sino por haber sido realizada por deber. La voluntad moral actúa según una ley que ella misma reconoce como universal. Por eso, obra solo según una máxima que puedas querer al mismo tiempo que se convierta en ley universal.", theme: "La fundamentación racional de la moral.", thesis: "Una acción es moral cuando se realiza por deber y puede universalizarse racionalmente.", concepts: ["imperativo categórico", "deber", "ley moral", "autonomía"], solution: "Kant fundamenta la moral en la razón práctica: la acción moral depende del deber y de la universalidad de la máxima, no de sus consecuencias."},
  {id: "kant3", philosopher: "Immanuel Kant", work: "Crítica de la facultad de juzgar", title: "Juicio de gusto", difficulty: "Media", quote: "El juicio de gusto no es un juicio de conocimiento; no es lógico, sino estético. Cuando llamamos bello a un objeto, no afirmamos una propiedad objetiva demostrable, sino que expresamos un sentimiento de placer. Sin embargo, quien juzga algo como bello pretende que los demás estén de acuerdo, aunque no pueda demostrarlo mediante conceptos.", theme: "La diferencia entre juicio de conocimiento y juicio estético.", thesis: "El juicio de gusto es subjetivo, pero pretende una validez universal sin concepto.", concepts: ["juicio de gusto", "belleza", "sensus communis", "placer"], solution: "Kant explica que el juicio estético se basa en el sentimiento, no en conceptos objetivos, pero aun así reclama una universalidad subjetiva."},
  {id: "kant4", philosopher: "Immanuel Kant", work: "Crítica de la facultad de juzgar", title: "Finalidad sin fin", difficulty: "Alta", quote: "La belleza es la forma de la finalidad de un objeto en cuanto es percibida sin la representación de un fin. Al contemplar algo bello, lo percibimos como si estuviera ordenado y organizado de manera armónica, aunque no podamos señalar una utilidad concreta ni un propósito externo que explique esa armonía.", theme: "La finalidad sin fin en el juicio estético.", thesis: "Lo bello parece tener finalidad, aunque no sirva a ningún fin concreto.", concepts: ["finalidad sin fin", "belleza", "forma", "juicio reflexionante"], solution: "Kant sostiene que lo bello produce placer porque parece organizado con sentido, aunque no responda a una utilidad determinada."},
  {id: "marx1", philosopher: "Karl Marx", work: "Manuscritos económico-filosóficos", title: "Alienación del trabajador", difficulty: "Alta", quote: "El trabajador se convierte en tanto más pobre cuanto más riqueza produce. El objeto que produce se enfrenta a él como algo ajeno, como un poder independiente. Su trabajo no es la realización de su esencia humana, sino una actividad impuesta que lo separa de sí mismo, del producto, de los demás y de su propia humanidad.", theme: "La alienación en el trabajo capitalista.", thesis: "El capitalismo genera alienación al separar al trabajador de su producto, de su actividad y de sí mismo.", concepts: ["alienación", "trabajo", "capitalismo", "explotación"], solution: "Marx critica que el trabajador no se reconoce en su trabajo porque produce una riqueza que pertenece a otro. Esto provoca deshumanización y explotación."},
  {id: "nietzsche1", philosopher: "Nietzsche", work: "La gaya ciencia", title: "La muerte de Dios", difficulty: "Alta", quote: "Dios ha muerto. Y nosotros lo hemos matado. ¿Cómo nos consolaremos? La desaparición de Dios implica la pérdida de los valores absolutos que sostenían nuestra cultura. Al caer ese fundamento, el ser humano se enfrenta al nihilismo, pero también a la posibilidad de crear nuevos valores afirmadores de la vida.", theme: "La crisis de los valores tradicionales.", thesis: "La muerte de Dios provoca la pérdida del fundamento absoluto de la moral occidental.", concepts: ["muerte de Dios", "nihilismo", "valores", "superhombre"], solution: "Nietzsche no habla de una muerte literal, sino de la caída de los valores absolutos. Esto abre el peligro del nihilismo y la posibilidad de crear nuevos valores."},
  {id: "ortega1", philosopher: "Ortega y Gasset", work: "Meditaciones del Quijote", title: "Yo y circunstancia", difficulty: "Media", quote: "Yo soy yo y mi circunstancia, y si no la salvo a ella no me salvo yo. La vida humana no es una cosa hecha de una vez para siempre, sino un proyecto que se realiza en un mundo concreto. El ser humano debe decidir qué hacer con su vida dentro de las circunstancias que le han tocado.", theme: "La vida humana como realidad situada.", thesis: "El ser humano no puede entenderse separado de su circunstancia.", concepts: ["yo", "circunstancia", "vida", "razón vital"], solution: "Ortega afirma que la vida es la realidad radical y que el yo siempre está situado en una circunstancia concreta que debe asumir y transformar."},
  {id: "arendt1", philosopher: "Hannah Arendt", work: "Eichmann en Jerusalén", title: "La banalidad del mal", difficulty: "Alta", quote: "Lo más inquietante en Eichmann no era una maldad demoníaca, sino su incapacidad para pensar desde el punto de vista de los otros. Cumplía órdenes y utilizaba frases hechas sin examinar críticamente el sentido de sus actos. Así, el mal puede aparecer cuando los individuos renuncian a juzgar y se limitan a obedecer.", theme: "La relación entre mal, obediencia y ausencia de pensamiento crítico.", thesis: "El mal puede surgir de la obediencia acrítica y de la incapacidad de juzgar.", concepts: ["banalidad del mal", "pensamiento", "obediencia", "responsabilidad"], solution: "Arendt muestra que el mal puede producirse cuando las personas renuncian a pensar y juzgar por sí mismas dentro de sistemas burocráticos."},
];

const periodByAuthor = {
  "Platón": "Filosofía antigua",
  "Aristóteles": "Filosofía antigua",
  "San Agustín": "Filosofía medieval",
  "Tomás de Aquino": "Filosofía medieval",
  "René Descartes": "Filosofía moderna",
  "David Hume": "Filosofía moderna",
  Rousseau: "Filosofía moderna",
  "Immanuel Kant": "Filosofía moderna",
  "Karl Marx": "Filosofía contemporánea",
  Nietzsche: "Filosofía contemporánea",
  "Ortega y Gasset": "Filosofía contemporánea",
  "Hannah Arendt": "Filosofía contemporánea",
};

const comparisonByAuthor = {
  "Platón": "Aristóteles critica la separación platónica entre Ideas y sustancias concretas.",
  "Aristóteles": "Platón sitúa la verdad en Ideas separadas, mientras Aristóteles parte de la sustancia.",
  "San Agustín": "Tomás de Aquino concede mayor autonomía a la razón y parte del mundo sensible.",
  "Tomás de Aquino": "San Agustín subraya la interioridad y la iluminación de raíz platónica.",
  "René Descartes": "Hume rechaza las ideas innatas y hace depender el conocimiento de la experiencia.",
  "David Hume": "Kant responde al empirismo situando causalidad y categorías en el sujeto.",
  Rousseau: "Hobbes concibe el pacto desde el temor, mientras Rousseau lo vincula con la voluntad general.",
  "Immanuel Kant": "Hume limita el conocimiento a la experiencia; Kant introduce estructuras a priori.",
  "Karl Marx": "Nietzsche también critica la cultura occidental, pero desde la genealogía de los valores.",
  Nietzsche: "Marx explica la dominación desde las condiciones materiales y la lucha de clases.",
  "Ortega y Gasset": "Descartes parte de un yo pensante aislado; Ortega lo sitúa siempre en su circunstancia.",
  "Hannah Arendt": "Kant vincula autonomía y juicio racional con la responsabilidad moral.",
};

export const texts = baseTexts.map((text) => ({
  ...text,
  sourceType: "Adaptación didáctica",
  period: periodByAuthor[text.philosopher] || "Historia de la filosofía",
  context: `${text.philosopher} se sitúa en ${periodByAuthor[text.philosopher] || "la historia de la filosofía"} y aborda ${text.theme.toLowerCase()}`,
  comparison: comparisonByAuthor[text.philosopher] || "Puede relacionarse con otra posición filosófica del programa.",
}));

const quizSeed = [
  { q: "¿Qué autor defiende el mundo inteligible de las Ideas?", options: ["Aristóteles", "Platón", "Hume", "Marx"], answer: 1, explanation: "Platón distingue entre mundo sensible y mundo inteligible." },
  { q: "¿Qué autor formula el cogito?", options: ["Descartes", "Kant", "Nietzsche", "Arendt"], answer: 0, explanation: "Descartes afirma: pienso, luego existo." },
  { q: "¿Qué autor critica la causalidad como hábito?", options: ["Tomás de Aquino", "Hume", "Rousseau", "Ortega"], answer: 1, explanation: "Hume entiende la causalidad como costumbre." },
  { q: "¿Qué autor habla de alienación?", options: ["Marx", "Platón", "Aristóteles", "San Agustín"], answer: 0, explanation: "Marx analiza la alienación del trabajador." },
  { q: "¿Qué obra kantiana trata los límites del conocimiento?", options: ["Crítica de la razón pura", "El contrato social", "La gaya ciencia", "El capital"], answer: 0, explanation: "La Crítica de la razón pura responde a la pregunta: ¿qué puedo conocer?" },
  { q: "¿Qué obra kantiana fundamenta la moral?", options: ["Crítica de la razón práctica", "República", "Confesiones", "Meditaciones del Quijote"], answer: 0, explanation: "La Crítica de la razón práctica se ocupa de la moral y el deber." },
  { q: "¿Qué obra kantiana analiza el juicio estético?", options: ["Crítica de la facultad de juzgar", "Metafísica", "Discurso del método", "La condición humana"], answer: 0, explanation: "La tercera crítica estudia el juicio estético y teleológico." },
  { q: "¿Qué autor afirma que el ser humano es 'yo y circunstancia'?", options: ["Ortega", "Nietzsche", "Platón", "Rousseau"], answer: 0, explanation: "La expresión pertenece a Ortega y Gasset." },
  { q: "¿Qué autora habla de banalidad del mal?", options: ["Arendt", "Ortega", "Platón", "Tomás de Aquino"], answer: 0, explanation: "Arendt analiza la banalidad del mal en Eichmann en Jerusalén." },
  { q: "¿Qué autor une razón y fe?", options: ["Tomás de Aquino", "Hume", "Marx", "Nietzsche"], answer: 0, explanation: "Tomás defiende compatibilidad entre razón y fe." },
];

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function makeQuestion(question, correct, wrongOptions, explanation) {
  const cleanWrong = [...new Set(wrongOptions)].filter((x) => x && x !== correct);
  const options = shuffleArray([...cleanWrong.slice(0, 3), correct]);
  return { q: question, options, answer: options.indexOf(correct), explanation };
}

export function buildQuizQuestions() {
  const allConcepts = [...new Set(philosophers.flatMap((p) => p.concepts))];
  const allWorks = [...new Set(philosophers.flatMap((p) => p.works))];
  const allCurrents = [...new Set(philosophers.map((p) => p.current))];
  const allAuthors = philosophers.map((p) => p.name);
  const questions = [...quizSeed];

  philosophers.forEach((p) => {
    p.concepts.forEach((concept) => {
      questions.push(makeQuestion(`¿Qué concepto pertenece a ${p.name}?`, concept, allConcepts.filter((c) => !p.concepts.includes(c)), `"${concept}" es un concepto clave de ${p.name}.`));
      questions.push(makeQuestion(`¿A qué autor pertenece el concepto "${concept}"?`, p.name, allAuthors.filter((name) => name !== p.name), `"${concept}" pertenece al pensamiento de ${p.name}.`));
    });
    p.works.forEach((work) => {
      questions.push(makeQuestion(`¿Qué obra pertenece a ${p.name}?`, work, allWorks.filter((w) => !p.works.includes(w)), `"${work}" es una obra asociada a ${p.name}.`));
      questions.push(makeQuestion(`¿Quién escribió o está asociado a "${work}"?`, p.name, allAuthors.filter((name) => name !== p.name), `"${work}" corresponde a ${p.name}.`));
    });
    questions.push(makeQuestion(`¿Cuál es la corriente filosófica de ${p.name}?`, p.current, allCurrents.filter((current) => current !== p.current), `${p.name} se asocia con ${p.current}.`));
    questions.push(makeQuestion(`¿Qué autor encaja mejor con esta idea: "${p.summary}"?`, p.name, allAuthors.filter((name) => name !== p.name), `La descripción resume el pensamiento de ${p.name}.`));
  });
  baseTexts.forEach((t) => {
    questions.push(makeQuestion(`¿A qué autor pertenece este texto: "${t.title}"?`, t.philosopher, allAuthors.filter((name) => name !== t.philosopher), `"${t.title}" pertenece al bloque de ${t.philosopher}.`));
    t.concepts.forEach((concept) => {
      questions.push(makeQuestion(`En el texto "${t.title}", ¿qué concepto es clave?`, concept, allConcepts.filter((c) => !t.concepts.includes(c)), `"${concept}" es clave para comentar "${t.title}".`));
    });
  });
  return shuffleArray(questions);
}

export const comparisons = [
  { title: "Platón vs Aristóteles", a: "Platón sitúa la verdad en las Ideas separadas.", b: "Aristóteles sitúa la realidad en sustancias concretas." },
  { title: "Descartes vs Hume", a: "Descartes busca certezas racionales.", b: "Hume reduce el conocimiento a experiencia." },
  { title: "Hume vs Kant", a: "Hume reduce la causalidad a costumbre.", b: "Kant la entiende como categoría a priori." },
  { title: "Kant: razón pura vs razón práctica", a: "La razón pura pregunta qué podemos conocer.", b: "La razón práctica pregunta qué debemos hacer." },
  { title: "Kant: razón práctica vs juicio", a: "La razón práctica fundamenta la moral en el deber.", b: "El juicio analiza belleza, finalidad y gusto." },
  { title: "Marx vs Nietzsche", a: "Marx critica el capitalismo.", b: "Nietzsche critica la moral tradicional." },
  { title: "Ortega vs Arendt", a: "Ortega analiza la vida desde la circunstancia.", b: "Arendt analiza la política desde la acción." },
  { title: "San Agustín vs Tomás", a: "Agustín busca la verdad interior iluminada por Dios.", b: "Tomás armoniza razón, fe y Aristóteles." },
];

export const flashcards = [
  { front: "¿Qué es el mundo inteligible?", back: "La realidad verdadera de las Ideas en Platón.", author: "Platón" },
  { front: "¿Qué es acto y potencia?", back: "Potencia es posibilidad; acto es realización.", author: "Aristóteles" },
  { front: "¿Qué es la iluminación en San Agustín?", back: "La ayuda divina que permite al alma conocer la verdad.", author: "San Agustín" },
  { front: "¿Qué son las cinco vías?", back: "Argumentos racionales de Tomás para demostrar la existencia de Dios.", author: "Tomás de Aquino" },
  { front: "¿Qué es el cogito?", back: "La primera certeza cartesiana: si pienso, existo.", author: "Descartes" },
  { front: "¿Qué critica Hume de la causalidad?", back: "Que no percibimos conexión necesaria, solo costumbre.", author: "Hume" },
  { front: "¿Qué estudia la Crítica de la razón pura?", back: "Los límites y condiciones del conocimiento.", author: "Kant" },
  { front: "¿Qué estudia la Crítica de la razón práctica?", back: "La moral, el deber y el imperativo categórico.", author: "Kant" },
  { front: "¿Qué estudia la Crítica del juicio?", back: "El juicio estético, la belleza y la finalidad.", author: "Kant" },
  { front: "¿Qué es la alienación?", back: "Separación del trabajador respecto a producto, trabajo y humanidad.", author: "Marx" },
  { front: "¿Qué significa la muerte de Dios?", back: "La caída de los valores absolutos tradicionales.", author: "Nietzsche" },
  { front: "¿Qué es la banalidad del mal?", back: "El mal por obediencia acrítica e incapacidad de pensar.", author: "Arendt" },
];

export const lessons = [
  { id: "antigua", title: "Filosofía antigua", authors: "Platón y Aristóteles", xp: 120, color: "from-amber-200 to-orange-100", goal: "Dominar realidad, conocimiento y ética clásica.", authorSections: [{ author: "Platón", points: ["Dualismo ontológico: mundo sensible y mundo inteligible.", "El mundo sensible es cambiante, imperfecto y conocido por los sentidos.", "El mundo inteligible contiene las Ideas, eternas, universales y verdaderas.", "La Idea de Bien es la realidad suprema.", "Conocer es recordar: teoría de la reminiscencia.", "La educación filosófica es un ascenso desde la ignorancia hacia la verdad.", "Texto clave: alegoría de la caverna."] }, { author: "Aristóteles", points: ["Critica a Platón: las Ideas no están separadas de las cosas.", "La realidad está formada por sustancias concretas.", "Toda sustancia se compone de materia y forma.", "El cambio se explica mediante potencia y acto.", "Todo ser tiende a un fin: teleologismo.", "La felicidad es el fin último del ser humano.", "La virtud es el término medio entre extremos."] }] },
  { id: "medieval", title: "Filosofía medieval", authors: "San Agustín y Tomás de Aquino", xp: 120, color: "from-emerald-200 to-lime-100", goal: "Comprender la relación entre razón, fe, alma y Dios.", authorSections: [{ author: "San Agustín", points: ["Integra cristianismo y platonismo.", "La verdad se busca en el interior del alma.", "Dios ilumina la mente humana para conocer la verdad.", "El ser humano es alma espiritual orientada hacia Dios.", "El mal no es una sustancia, sino ausencia de bien."] }, { author: "Tomás de Aquino", points: ["Integra cristianismo y aristotelismo.", "Razón y fe son compatibles porque ambas proceden de Dios.", "La razón puede demostrar ciertas verdades naturales.", "La fe revela verdades que superan la razón.", "Formula las cinco vías para demostrar la existencia de Dios."] }] },
  { id: "moderna", title: "Filosofía moderna", authors: "Descartes, Hume, Rousseau y Kant", xp: 180, color: "from-blue-200 to-indigo-100", goal: "Dominar racionalismo, empirismo, contractualismo y criticismo.", authorSections: [{ author: "Descartes", points: ["Racionalismo: la razón es la fuente principal del conocimiento.", "Busca una verdad absolutamente segura.", "Usa la duda metódica como método.", "Descubre el cogito: pienso, luego existo."] }, { author: "Hume", points: ["Empirismo: todo conocimiento procede de la experiencia.", "Distingue impresiones e ideas.", "Critica la causalidad como conexión necesaria.", "La causalidad es hábito o costumbre mental."] }, { author: "Rousseau", points: ["Critica la desigualdad social.", "El contrato social funda una comunidad legítima.", "La voluntad general expresa el bien común.", "La libertad política consiste en obedecer leyes propias."] }, { author: "Kant", points: ["Crítica de la razón pura: conocimiento, fenómeno, noúmeno, a priori.", "Crítica de la razón práctica: moral, deber, autonomía, imperativo categórico.", "Crítica de la facultad de juzgar: belleza, gusto, finalidad sin fin, sensus communis.", "Kant intenta unir naturaleza y libertad mediante el juicio."] }] },
  { id: "contemporanea", title: "Filosofía contemporánea", authors: "Marx, Nietzsche, Ortega y Arendt", xp: 180, color: "from-rose-200 to-violet-100", goal: "Comprender crítica social, crisis de valores y política contemporánea.", authorSections: [{ author: "Marx", points: ["Materialismo histórico: la base económica condiciona la sociedad.", "La historia avanza mediante lucha de clases.", "El capitalismo enfrenta burguesía y proletariado.", "La alienación separa al trabajador de su producto y de sí mismo."] }, { author: "Nietzsche", points: ["Critica la moral occidental y cristiana.", "La muerte de Dios significa la caída de los valores absolutos.", "El nihilismo aparece cuando ya no hay fundamento moral tradicional.", "El superhombre crea nuevos valores."] }, { author: "Ortega y Gasset", points: ["La vida es la realidad radical.", "Yo soy yo y mi circunstancia.", "La razón debe ser razón vital.", "Cada perspectiva aporta una parte de la verdad."] }, { author: "Hannah Arendt", points: ["La política auténtica se basa en acción y palabra.", "La pluralidad es condición de la vida política.", "La banalidad del mal surge de la incapacidad de pensar.", "Obedecer sin juzgar puede conducir al mal."] }] },
];

export const theoryByAuthor = {
  "Platón": { title: "Teoría completa de Platón", visual: "platon", blocks: [{ heading: "1. Realidad", points: ["Platón defiende un dualismo ontológico: mundo sensible y mundo inteligible.", "El mundo sensible es material, cambiante e imperfecto.", "El mundo inteligible contiene las Ideas, que son eternas y verdaderas.", "Las cosas sensibles son copias imperfectas de las Ideas."] }, { heading: "2. Conocimiento", points: ["El conocimiento verdadero se alcanza con la razón.", "Los sentidos ofrecen opinión, no ciencia.", "Educar es orientar el alma hacia las Ideas."] }, { heading: "3. Idea de Bien", points: ["La Idea de Bien es la Idea suprema.", "Hace posible la verdad y el conocimiento.", "En la caverna se simboliza mediante el sol."] }] },
  "Aristóteles": { title: "Teoría completa de Aristóteles", visual: "aristoteles", blocks: [{ heading: "1. Crítica a Platón", points: ["Aristóteles rechaza que las Ideas estén separadas de las cosas.", "La realidad está en las sustancias concretas.", "La esencia está en las cosas mismas."] }, { heading: "2. Acto y potencia", points: ["La potencia es posibilidad.", "El acto es realización.", "El cambio se explica como paso de potencia a acto."] }, { heading: "3. Ética", points: ["Toda acción busca un fin.", "El fin último es la felicidad.", "La felicidad se logra mediante la virtud.", "La virtud es término medio."] }] },
  "San Agustín": { title: "Teoría completa de San Agustín", visual: "agustin", blocks: [{ heading: "1. Interioridad", points: ["La verdad no se busca fuera, sino dentro del alma.", "El alma humana es superior al mundo sensible.", "La interioridad permite encontrar a Dios."] }, { heading: "2. Iluminación", points: ["Dios ilumina la mente humana.", "Gracias a esa iluminación podemos conocer verdades eternas.", "La verdad depende de Dios como fundamento."] }, { heading: "3. Historia y mal", points: ["El mal no es una sustancia, sino ausencia de bien.", "La historia se entiende como tensión entre Ciudad de Dios y ciudad terrenal."] }] },
  "Tomás de Aquino": { title: "Teoría completa de Tomás de Aquino", visual: "tomas", blocks: [{ heading: "1. Razón y fe", points: ["Razón y fe son compatibles porque ambas proceden de Dios.", "La razón alcanza verdades naturales.", "La fe revela verdades sobrenaturales."] }, { heading: "2. Cinco vías", points: ["Tomás demuestra la existencia de Dios a partir del mundo.", "Parte del movimiento, causalidad, contingencia, grados de perfección y finalidad.", "Concluye que debe existir un primer fundamento."] }, { heading: "3. Ley natural", points: ["La ley natural expresa la participación humana en la ley eterna.", "La moral se basa en la naturaleza racional del ser humano."] }] },
  "René Descartes": { title: "Teoría completa de Descartes", visual: "descartes", blocks: [{ heading: "1. Racionalismo", points: ["La razón es la fuente principal del conocimiento.", "Descartes busca una certeza absoluta.", "Quiere construir el saber sobre fundamentos seguros."] }, { heading: "2. Duda metódica", points: ["Duda de los sentidos.", "Duda del mundo exterior.", "Duda de las matemáticas mediante el genio maligno.", "La duda es método, no escepticismo definitivo."] }, { heading: "3. Cogito", points: ["Aunque dude, no puede dudar de que piensa.", "El cogito es la primera certeza.", "El sujeto pensante fundamenta el conocimiento."] }] },
  "David Hume": { title: "Teoría completa de Hume", visual: "hume", blocks: [{ heading: "1. Empirismo", points: ["Todo conocimiento procede de la experiencia.", "No existen ideas innatas.", "La mente trabaja con percepciones."] }, { heading: "2. Impresiones e ideas", points: ["Las impresiones son percepciones vivas.", "Las ideas son copias debilitadas de impresiones.", "Toda idea válida debe remitirse a una impresión."] }, { heading: "3. Causalidad", points: ["No percibimos conexión necesaria entre causa y efecto.", "Solo observamos sucesiones constantes.", "La causalidad es hábito o costumbre."] }] },
  "Rousseau": { title: "Teoría completa de Rousseau", visual: "rousseau", blocks: [{ heading: "1. Naturaleza y desigualdad", points: ["El ser humano natural es libre e igual.", "La sociedad histórica genera desigualdad.", "La propiedad privada marca el origen de la desigualdad social."] }, { heading: "2. Contrato social", points: ["La comunidad política legítima nace de un pacto.", "La soberanía pertenece al pueblo.", "El contrato busca recuperar la libertad en sociedad."] }, { heading: "3. Voluntad general", points: ["La voluntad general expresa el bien común.", "No equivale a la suma de intereses particulares.", "Obedecer la voluntad general es obedecer una ley propia como ciudadano."] }] },
  "Immanuel Kant": { title: "Kant: las tres críticas", visual: "kant", blocks: [{ heading: "1. Crítica de la razón pura: conocimiento", points: ["Pregunta principal: ¿qué puedo conocer?", "Kant intenta superar racionalismo y empirismo.", "Todo conocimiento comienza con la experiencia, pero no todo procede de ella.", "El sujeto organiza la experiencia mediante formas a priori y categorías.", "Solo conocemos fenómenos, no el noúmeno o cosa en sí.", "Conceptos clave: fenómeno, noúmeno, a priori, sensibilidad, entendimiento, categorías."] }, { heading: "2. Crítica de la razón práctica: moral", points: ["Pregunta principal: ¿qué debo hacer?", "La moral se basa en la razón y en el deber.", "Una acción moral vale por la intención racional, no por sus consecuencias.", "El imperativo categórico exige actuar según máximas universalizables.", "La autonomía consiste en darse a uno mismo la ley moral racional.", "Conceptos clave: deber, autonomía, ley moral, imperativo categórico, universalidad."] }, { heading: "3. Crítica de la facultad de juzgar: estética y finalidad", points: ["Pregunta central: ¿cómo juzgamos lo bello y la finalidad en la naturaleza?", "El juicio de gusto no es conocimiento, sino juicio estético.", "Lo bello produce un placer desinteresado.", "El juicio de gusto es subjetivo, pero pretende universalidad.", "Lo bello muestra finalidad sin fin: parece ordenado, aunque no tenga utilidad concreta.", "Conceptos clave: juicio de gusto, belleza, placer desinteresado, sensus communis, finalidad sin fin."] }, { heading: "4. Relación entre las tres críticas", points: ["La primera crítica estudia la naturaleza conocida por el sujeto.", "La segunda crítica estudia la libertad moral.", "La tercera crítica media entre naturaleza y libertad mediante el juicio.", "En PAU conviene situar siempre el texto en una de las tres críticas."] }] },
  "Karl Marx": { title: "Teoría completa de Marx", visual: "marx", blocks: [{ heading: "1. Materialismo histórico", points: ["La vida material condiciona la conciencia.", "La economía es la base de la sociedad.", "Las ideas dominantes suelen ser las ideas de la clase dominante."] }, { heading: "2. Lucha de clases", points: ["La historia avanza mediante conflictos entre clases.", "En el capitalismo se enfrentan burguesía y proletariado.", "La burguesía posee los medios de producción."] }, { heading: "3. Alienación", points: ["El trabajador queda separado del producto de su trabajo.", "El trabajo deja de ser realización humana.", "El capitalismo convierte el trabajo en explotación."] }] },
  "Nietzsche": { title: "Teoría completa de Nietzsche", visual: "nietzsche", blocks: [{ heading: "1. Crítica de la moral", points: ["Nietzsche critica la moral occidental y cristiana.", "Considera que ha negado la vida, el cuerpo y los instintos.", "Distingue entre moral de señores y moral de esclavos."] }, { heading: "2. Muerte de Dios", points: ["No es una muerte literal.", "Significa la pérdida de autoridad de los valores absolutos.", "Abre el problema del nihilismo."] }, { heading: "3. Superhombre", points: ["El superhombre crea nuevos valores.", "Afirma la vida sin depender de normas heredadas.", "La voluntad de poder expresa fuerza creadora."] }] },
  "Ortega y Gasset": { title: "Teoría completa de Ortega y Gasset", visual: "ortega", blocks: [{ heading: "1. Vida como realidad radical", points: ["La vida es la realidad radical.", "El ser humano no tiene esencia fija.", "La vida es proyecto, decisión y circunstancia."] }, { heading: "2. Yo y circunstancia", points: ["El yo no existe aislado.", "Toda vida humana está situada.", "Salvar la circunstancia es salvarse a uno mismo."] }, { heading: "3. Perspectivismo", points: ["Toda verdad se conoce desde una perspectiva.", "No es relativismo absoluto.", "Cada perspectiva aporta una parte de la verdad."] }] },
  "Hannah Arendt": { title: "Teoría completa de Hannah Arendt", visual: "arendt", blocks: [{ heading: "1. Política y acción", points: ["La política auténtica es acción y palabra.", "La pluralidad es condición de la vida política.", "El espacio público permite aparecer ante otros."] }, { heading: "2. Totalitarismo", points: ["El totalitarismo destruye libertad y pluralidad.", "Convierte a los individuos en piezas obedientes.", "Aísla a las personas y elimina el juicio crítico."] }, { heading: "3. Banalidad del mal", points: ["El mal puede surgir sin odio extremo.", "Puede aparecer cuando alguien obedece sin pensar.", "La incapacidad de juzgar permite participar en atrocidades."] }] },
};

export function readStoredJson(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function nextActivityStreak(previousStreak) {
  const today = localDateKey();
  const lastActivity = localStorage.getItem("lastActivityDate");
  if (lastActivity === today) return previousStreak;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const next = lastActivity === localDateKey(yesterday) ? Math.max(previousStreak, 1) + 1 : 1;
  localStorage.setItem("lastActivityDate", today);
  return next;
}
