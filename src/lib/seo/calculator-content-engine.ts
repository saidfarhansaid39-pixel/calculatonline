import type { CalculatorEntry, CategoryHub } from '@calcuniverse/calculator-registry'

interface UseCase {
  title: string
  description: string
}

interface Mistake {
  mistake: string
  solution: string
}

interface GlossaryTerm {
  term: string
  definition: string
}

interface Comparison {
  title: string
  items: { label: string; manual: string; calculator: string }[]
  summary: string
}

interface ProsCons {
  pros: string[]
  cons: string[]
}

interface Alternative {
  name: string
  description: string
}

export interface LongFormSection {
  title: string
  content: string
  subsections?: { heading: string; text: string }[]
}

export interface CalculatorContent {
  whatIs: string
  useCases: UseCase[]
  commonMistakes: Mistake[]
  glossary: GlossaryTerm[]
  relatedConcepts: string[]
  comparisons: Comparison[]
  prosCons: ProsCons
  alternatives: Alternative[]
  expertRecommendations: string[]
  relevantAudience: string[]
  longFormArticle?: LongFormSection[]
}

/* ────────── Locale dictionary (partial overrides; missing tables fall back to EN) ────────── */

export interface ContentEngineDict {
  whatIs?: string
  audience?: Record<string, { persona: string; activity: string; goal: string }>
  useCases?: Record<string, { title: string; description: string }[]>
  mistakes?: Record<string, { mistake: string; solution: string }[]>
  glossary?: Record<string, { term: string; definition: string }[]>
  concepts?: Record<string, string[]>
  comparisons?: Record<string, { title: string; items: { label: string; manual: string; calculator: string }[]; summary: string }[]>
  pros?: string[]
  cons?: string[]
  alternatives?: { name: string; description: string }[]
  recommendations?: string[]
  audiences?: Record<string, string[]>
  adjectives?: Record<string, string>
  domainCtx?: Record<string, DomainCtx>
  longFormFixed?: {
    guideTitle: string; guideContent: string
    howCalcTitle: string; howCalcContent: string
    coreFormula: string; coreLogic: string; coreFormulaText: string; coreLogicText: string
    inputReq: string; inputReqText: string
    processing: string; processingText: string
    tipsTitle: string; tipsContent: string
    doubleCheck: string; doubleCheckText: string
    whatIf: string; whatIfText: string
    benchmarks: string; benchmarksText: string
    walkTitle: string; walkContent: string
    walkSetup: string; walkSetupText: string
    walkAdjust: string; walkAdjustText: string
    walkInterpret: string; walkInterpretText: string
    faqTitle: string; faqContent: string
    defaultDeepTitle: string; defaultDeepContent: string
  }
  deep?: Record<string, { title: string; content: string; subs: { heading: string; text: string }[] }[]>
  faqPools?: Record<string, { q: string; a: string }[]>
  defaultFaqs?: { q: string; a: string }[]
}

/** Keys read from the `contentEngine` translation namespace (partial locale overrides). */
export const CONTENT_DICT_KEYS = [
  'whatIs', 'audience', 'useCases', 'mistakes', 'glossary', 'concepts', 'comparisons',
  'pros', 'cons', 'alternatives', 'recommendations', 'audiences', 'adjectives',
  'domainCtx', 'longFormFixed', 'deep', 'faqPools', 'defaultFaqs',
] as const

/**
 * Build the locale dict from a next-intl translator, keeping ONLY keys that exist.
 *
 * `t.raw()` never returns `undefined` for a missing key — next-intl falls back to the
 * key-path string (e.g. `contentEngine.pros`). The English namespace is intentionally
 * empty (this engine generates English content natively), so without the `t.has()`
 * guard every EN calculator page would receive 18 junk strings and crash on
 * `(dict?.pros?.length ? dict.pros : []).map(...)` during hydration.
 */
export function buildContentEngineDict(lookup: { has(key: string): boolean; raw(key: string): unknown }): ContentEngineDict {
  const dict: ContentEngineDict = {}
  for (const key of CONTENT_DICT_KEYS) {
    try {
      if (!lookup.has(key)) continue
      const value = lookup.raw(key)
      if (value !== undefined) (dict as Record<string, unknown>)[key] = value
    } catch {
      // A key that exists but cannot be resolved is treated as absent → built-in EN fallback.
    }
  }
  return dict
}

/** Fill {placeholders} in a translated template string. Unknown keys are left intact. */
export function fillTemplate(s: string, params: Record<string, string>): string {
  let out = s
  for (const [k, v] of Object.entries(params)) out = out.split(`{${k}}`).join(v)
  return out
}

export interface DomainCtx {
  whatLabel: string
  whyImportant: string
  formulaLead: string
  appFocus: string
  methodLabel: string
  precisionContext: string
  tipArea: string
  riskLabel: string
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function extractTopic(title: string): string {
  return title.replace(/ calculator$/i, '').trim()
}

/** Deterministic pseudo-random based on slug for content variation */
function pickBySlug<T>(items: T[], slug: string): T {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash) + slug.charCodeAt(i)
    hash |= 0
  }
  return items[Math.abs(hash) % items.length]
}

function pickNBySlug<T>(items: T[], slug: string, n: number): T[] {
  const result: T[] = []
  const pool = [...items]
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash) + slug.charCodeAt(i)
    hash |= 0
  }
  let seed = Math.abs(hash)
  for (let i = 0; i < n && pool.length > 0; i++) {
    const idx = seed % pool.length
    result.push(pool[idx])
    pool.splice(idx, 1)
    seed = (seed * 31 + 17) % pool.length
  }
  return result
}

/* ──────────────────────── Category Audiences ──────────────────────── */

const categoryAudience: Record<CategoryHub, { persona: string; activity: string; goal: string }> = {
  financial: { persona: 'a homebuyer, investor, or financial planner', activity: 'managing your personal finances', goal: 'making informed financial decisions and building long-term wealth' },
  health: { persona: 'someone focused on their health and wellness', activity: 'tracking your health metrics', goal: 'understanding your body and improving your well-being' },
  math: { persona: 'a student, teacher, or professional', activity: 'solving mathematical problems', goal: 'getting accurate calculations and understanding mathematical concepts' },
  conversion: { persona: 'a traveler, cook, engineer, or student', activity: 'converting between different units', goal: 'getting precise, accurate unit conversions instantly' },
  'date-time': { persona: 'a project manager, event planner, or curious mind', activity: 'calculating dates and time spans', goal: 'managing your time and schedule effectively' },
  construction: { persona: 'a contractor, architect, or DIY enthusiast', activity: 'planning construction projects', goal: 'estimating materials and costs accurately' },
  statistics: { persona: 'a researcher, analyst, or data scientist', activity: 'analyzing data sets', goal: 'understanding data patterns and drawing meaningful insights' },
  education: { persona: 'a student, teacher, or academic advisor', activity: 'tracking academic performance', goal: 'improving grades and planning educational goals' },
  physics: { persona: 'a student, engineer, or science enthusiast', activity: 'solving physics problems', goal: 'understanding physical laws and their practical applications' },
  chemistry: { persona: 'a chemist, student, or lab technician', activity: 'performing chemical calculations', goal: 'getting accurate results for experiments and analysis' },
  engineering: { persona: 'an engineer, designer, or technical professional', activity: 'solving engineering problems', goal: 'designing safe, efficient systems and structures' },
  everyday: { persona: 'anyone managing daily tasks and decisions', activity: 'handling everyday calculations', goal: 'saving time and making better daily decisions' },
  food: { persona: 'a home cook, chef, or nutrition enthusiast', activity: 'preparing and planning meals', goal: 'creating delicious, nutritious food with confidence' },
  biology: { persona: 'a biologist, student, or science enthusiast', activity: 'studying living organisms', goal: 'understanding biological processes and relationships' },
  ecology: { persona: 'an environmental scientist, student, or conservationist', activity: 'studying ecosystems and environmental impact', goal: 'understanding and protecting our natural environment' },
  sports: { persona: 'an athlete, coach, or fitness enthusiast', activity: 'optimizing athletic performance', goal: 'improving fitness, tracking progress, and preventing injuries' },
}

/* ──────────────────────── What Is Generation ──────────────────────── */

function buildWhatIs(calc: CalculatorEntry): string {
  const topic = extractTopic(calc.title)
  const aud = categoryAudience[calc.category]
  const keyPhrase = calc.description.length > 20
    ? calc.description.charAt(0).toLowerCase() + calc.description.slice(1)
    : `calculate and analyze ${topic}`
  return `The ${calc.title} is a free online tool that helps you ${keyPhrase}. Designed for ${aud.persona}, it provides accurate results instantly. Whether you're ${aud.activity}, this calculator simplifies complex computations so you can focus on ${aud.goal}.`
}

/* ──────────────────────── Use Cases ──────────────────────── */

const useCaseTemplates: Record<CategoryHub, (topic: string, calc: CalculatorEntry) => UseCase[]> = {
  financial: (topic) => [
    { title: `Planning a ${topic} strategy`, description: `Use the ${topic} calculator to model different financial scenarios and find the optimal approach for your unique situation.` },
    { title: `Comparing ${topic} options`, description: `Input different variables side by side to compare outcomes and choose the most favorable option.` },
    { title: `Budgeting for ${topic}`, description: `Incorporate ${topic} calculations into your overall financial plan to ensure accuracy and completeness.` },
    { title: `Educational purposes`, description: `Learn how ${topic} works by experimenting with different inputs and observing how they affect results.` },
  ],
  health: (topic) => [
    { title: `Tracking your ${topic}`, description: `Monitor your ${topic} over time to identify trends and make informed decisions about your health.` },
    { title: `Setting ${topic} goals`, description: `Use the calculator to establish realistic health targets based on your current metrics and desired outcomes.` },
    { title: `Consulting with professionals`, description: `Share your ${topic} results with healthcare providers for more informed medical consultations.` },
    { title: `Health education`, description: `Understand what ${topic} means and how it relates to overall wellness and disease prevention.` },
  ],
  math: (topic) => [
    { title: `Solving ${topic} problems`, description: `Quickly compute ${topic} values for homework, work projects, or personal calculations.` },
    { title: `Checking your work`, description: `Verify manual calculations to ensure accuracy before submitting assignments or making decisions.` },
    { title: `Teaching ${topic}`, description: `Use the calculator as a teaching aid to demonstrate mathematical concepts and their real-world applications.` },
    { title: `Applied mathematics`, description: `Apply ${topic} to practical situations like budgeting, construction, or data analysis.` },
  ],
  conversion: (topic) => [
    { title: `International travel`, description: `Convert currencies, temperatures, and measurements when traveling abroad.` },
    { title: `Cooking and baking`, description: `Convert between metric and imperial units for recipes from around the world.` },
    { title: `Academic and professional work`, description: `Ensure accurate unit conversions in scientific research, engineering projects, and academic assignments.` },
    { title: `Online shopping`, description: `Compare product specifications across different unit systems when shopping internationally.` },
  ],
  'date-time': (topic) => [
    { title: `Project planning`, description: `Calculate project durations, deadlines, and milestone dates with precision.` },
    { title: `Event coordination`, description: `Determine the exact time between dates for event planning and scheduling.` },
    { title: `Age and anniversary calculations`, description: `Calculate exact ages, anniversaries, and time since important life events.` },
    { title: `Business deadline management`, description: `Track contract dates, payment schedules, and delivery timelines accurately.` },
  ],
  construction: (topic) => [
    { title: `Project estimation`, description: `Calculate ${topic} requirements before purchasing materials to avoid waste and shortages.` },
    { title: `Cost planning`, description: `Budget your construction project accurately by calculating material quantities and costs.` },
    { title: `Contractor communication`, description: `Provide precise specifications to contractors and verify their estimates.` },
    { title: `DIY home improvement`, description: `Plan home renovation projects with confidence using accurate measurements and material estimates.` },
  ],
  statistics: (topic) => [
    { title: `Data analysis`, description: `Apply ${topic} calculations to analyze survey results, experimental data, or business metrics.` },
    { title: `Research projects`, description: `Use the calculator for academic research requiring statistical analysis and hypothesis testing.` },
    { title: `Quality control`, description: `Monitor production quality through statistical process control and variation analysis.` },
    { title: `Decision making`, description: `Use statistical insights to make data-driven business and personal decisions.` },
  ],
  education: (topic) => [
    { title: `Academic planning`, description: `Calculate ${topic} to plan your academic trajectory and set realistic grade goals.` },
    { title: `College applications`, description: `Determine your GPA and academic standing for college and scholarship applications.` },
    { title: `Progress tracking`, description: `Monitor your academic performance throughout the semester and adjust study strategies accordingly.` },
    { title: `Parent-teacher communication`, description: `Share calculated academic metrics with parents or advisors for collaborative educational planning.` },
  ],
  physics: (topic) => [
    { title: `Homework and exams`, description: `Solve ${topic} problems quickly and verify your work during study sessions and tests.` },
    { title: `Lab experiments`, description: `Calculate theoretical values and compare them with experimental results.` },
    { title: `Engineering applications`, description: `Apply ${topic} principles to real-world engineering design and analysis.` },
    { title: `Understanding natural phenomena`, description: `Explore how ${topic} governs everything from planetary motion to subatomic particles.` },
  ],
  chemistry: (topic) => [
    { title: `Lab work`, description: `Perform ${topic} calculations accurately for experiments and chemical analysis.` },
    { title: `Homework and studying`, description: `Check your chemistry homework and understand the relationships between chemical quantities.` },
    { title: `Industrial processes`, description: `Calculate ${topic} for manufacturing, quality control, and process optimization.` },
    { title: `Safety planning`, description: `Determine safe chemical concentrations and reaction parameters before conducting experiments.` },
  ],
  engineering: (topic) => [
    { title: `Design and analysis`, description: `Calculate ${topic} for engineering design projects, ensuring safety and efficiency.` },
    { title: `Prototyping`, description: `Verify ${topic} parameters before building prototypes to reduce development costs.` },
    { title: `Compliance checking`, description: `Ensure ${topic} calculations meet industry standards and regulatory requirements.` },
    { title: `Troubleshooting`, description: `Diagnose ${topic}-related issues in existing systems and determine corrective actions.` },
  ],
  everyday: (topic) => [
    { title: `Daily decision making`, description: `Use ${topic} calculations to make smarter choices in your everyday life.` },
    { title: `Shopping and budgeting`, description: `Calculate ${topic} for better financial decisions while shopping or managing household expenses.` },
    { title: `Time management`, description: `Apply ${topic} to plan your schedule more effectively and reduce stress.` },
    { title: `Learning and curiosity`, description: `Satisfy your curiosity about ${topic} and how it applies to your daily life.` },
  ],
  food: (topic) => [
    { title: `Recipe scaling`, description: `Scale ${topic} measurements up or down depending on the number of servings needed.` },
    { title: `Nutritional planning`, description: `Track ${topic} to meet dietary goals and nutritional requirements.` },
    { title: `Meal prep`, description: `Calculate ${topic} for efficient meal preparation and ingredient purchasing.` },
    { title: `Dietary restrictions`, description: `Adjust ${topic} for special dietary needs like low-sodium, low-sugar, or gluten-free diets.` },
  ],
  biology: (topic) => [
    { title: `Research and analysis`, description: `Calculate ${topic} for biological research, field studies, and laboratory experiments.` },
    { title: `Academic study`, description: `Understand ${topic} concepts through practical calculation and visualization.` },
    { title: `Healthcare applications`, description: `Apply ${topic} calculations in clinical settings for diagnosis and treatment planning.` },
    { title: `Environmental monitoring`, description: `Use ${topic} to track biological indicators of ecosystem health.` },
  ],
  ecology: (topic) => [
    { title: `Environmental assessment`, description: `Calculate ${topic} to evaluate environmental impact and ecosystem health.` },
    { title: `Conservation planning`, description: `Use ${topic} data to inform conservation strategies and resource management decisions.` },
    { title: `Academic research`, description: `Apply ${topic} calculations in ecological research and field studies.` },
    { title: `Sustainability reporting`, description: `Generate ${topic} metrics for sustainability assessments and environmental compliance.` },
  ],
  sports: (topic) => [
    { title: `Training optimization`, description: `Calculate ${topic} to optimize your training regimen and achieve better results.` },
    { title: `Performance tracking`, description: `Monitor ${topic} changes over time to measure progress and adjust goals.` },
    { title: `Competition preparation`, description: `Use ${topic} data to prepare for competitions and develop race or game strategies.` },
    { title: `Injury prevention`, description: `Track ${topic} metrics to identify potential injury risks and modify training accordingly.` },
  ],
}

/* ──────────────────────── Common Mistakes ──────────────────────── */

const commonMistakes: Record<CategoryHub, { mistake: string; solution: string }[]> = {
  financial: [
    { mistake: 'Ignoring fees and transaction costs', solution: 'Always include all applicable fees, commissions, and taxes in your calculations for realistic results.' },
    { mistake: 'Using nominal instead of effective rates', solution: 'Use effective annual rates that account for compounding frequency rather than nominal rates.' },
    { mistake: 'Not adjusting for inflation', solution: 'Use real (inflation-adjusted) returns for long-term projections to maintain purchasing power.' },
    { mistake: 'Overlooking compounding frequency', solution: 'Verify whether interest compounds annually, monthly, or daily and use the correct frequency.' },
  ],
  health: [
    { mistake: 'Using inaccurate measurements', solution: 'Measure height, weight, and other metrics at the same time of day using calibrated equipment.' },
    { mistake: 'Ignoring individual variability', solution: 'Use population averages as guidelines only. Individual results vary based on genetics, lifestyle, and medical conditions.' },
    { mistake: 'Misinterpreting results as diagnostic', solution: 'Health calculators provide estimates, not medical diagnoses. Always consult a healthcare professional.' },
    { mistake: 'Not accounting for activity level', solution: 'Include accurate activity level data for calorie and fitness calculations to avoid over or underestimation.' },
  ],
  math: [
    { mistake: 'Wrong order of operations', solution: 'Follow PEMDAS (Parentheses, Exponents, Multiplication/Division, Addition/Subtraction) consistently.' },
    { mistake: 'Rounding prematurely', solution: 'Keep full precision throughout multi-step calculations and round only the final answer.' },
    { mistake: 'Unit mismatch', solution: 'Convert all values to the same unit system before performing calculations.' },
    { mistake: 'Sign errors', solution: 'Double-check positive and negative signs, especially in subtraction and equation solving.' },
  ],
  conversion: [
    { mistake: 'Using wrong conversion factor', solution: 'Verify conversion factors from authoritative sources. Many units have multiple definitions.' },
    { mistake: 'Confusing metric and imperial prefixes', solution: 'Learn common prefixes: milli-, centi-, kilo- for metric; inch, foot, yard, mile for imperial.' },
    { mistake: 'Rounding too early', solution: 'Carry full precision through calculations and round only at the final converted value.' },
    { mistake: 'Forgetting significant figures', solution: 'Match the precision of your input. A 3-digit input should yield a 3-digit output.' },
  ],
  'date-time': [
    { mistake: 'Not accounting for leap years', solution: 'Use a calculator that automatically handles leap years rather than assuming 365 days per year.' },
    { mistake: 'Time zone confusion', solution: 'Convert all times to a common time zone (preferably UTC) before performing date arithmetic.' },
    { mistake: 'Off-by-one errors in date ranges', solution: 'Decide whether your date range is inclusive or exclusive of the start and end dates.' },
    { mistake: 'Daylight saving transitions', solution: 'Be aware that days with DST transitions have 23 or 25 hours, affecting precise time calculations.' },
  ],
  construction: [
    { mistake: 'Not accounting for waste', solution: 'Add 10-15% waste factor to material estimates for cuts, breakage, and mistakes.' },
    { mistake: 'Forgetting depth and thickness', solution: 'Always verify whether you need linear, square, or cubic measurements for your project.' },
    { mistake: 'Using nominal vs actual dimensions', solution: 'Lumber and many materials have nominal sizes that differ from actual. Always use actual dimensions for calculations.' },
    { mistake: 'Ignoring local building codes', solution: 'Check local codes for minimum requirements that may supersede standard calculations.' },
  ],
  statistics: [
    { mistake: 'Confusing correlation with causation', solution: 'Statistical correlation does not prove causation. Consider confounding variables and controlled experiments.' },
    { mistake: 'Using mean with skewed data', solution: 'For skewed distributions, consider median instead of mean as the central tendency measure.' },
    { mistake: 'Small sample sizes', solution: 'Ensure your sample size is large enough for statistical significance. Use power analysis to determine minimum size.' },
    { mistake: 'P-hacking and data dredging', solution: 'Define your hypothesis and analysis plan before collecting data. Avoid testing multiple hypotheses without correction.' },
  ],
  education: [
    { mistake: 'Forgetting to weight courses by credits', solution: 'Multiply each grade by its credit hours before averaging. A 4-credit course counts more than a 1-credit course.' },
    { mistake: 'Using wrong grade scale', solution: 'Verify whether your school uses weighted or unweighted GPA, and whether plus/minus modifiers are included.' },
    { mistake: 'Not accounting for pass/fail courses', solution: 'Exclude pass/fail courses from GPA calculations unless your school specifies otherwise.' },
    { mistake: 'Ignoring academic policies', solution: 'Check your institution\'s specific policies on grade forgiveness, retakes, and honors weighting.' },
  ],
  physics: [
    { mistake: 'Unit inconsistency', solution: 'Convert all values to SI units (meters, kilograms, seconds) before applying physics formulas.' },
    { mistake: 'Forgetting vector direction', solution: 'Force, velocity, and acceleration are vectors. Include direction in calculations, not just magnitude.' },
    { mistake: 'Confusing mass and weight', solution: 'Mass is constant. Weight = mass × gravity and varies by location. Use kg for mass, N for weight.' },
    { mistake: 'Significant figures in scientific notation', solution: 'Report results with the appropriate number of significant figures based on your input precision.' },
  ],
  chemistry: [
    { mistake: 'Incorrect molar mass', solution: 'Use atomic masses from the periodic table with at least 4 significant figures for accuracy.' },
    { mistake: 'Forgetting to balance equations', solution: 'Always balance chemical equations before performing stoichiometric calculations.' },
    { mistake: 'Temperature not in Kelvin', solution: 'Convert Celsius to Kelvin (K = °C + 273.15) for gas law calculations. Never use Celsius in gas equations.' },
    { mistake: 'Concentration unit confusion', solution: 'Distinguish between molarity (mol/L), molality (mol/kg), percent composition, and ppm carefully.' },
  ],
  engineering: [
    { mistake: 'Ignoring safety factors', solution: 'Always apply appropriate safety factors to your calculations based on industry standards and risk assessment.' },
    { mistake: 'Wrong material properties', solution: 'Verify material specifications from manufacturer data sheets rather than using generic values.' },
    { mistake: 'Unit errors in mixed systems', solution: 'Convert all values to a single consistent unit system. Mixing metric and imperial causes costly errors.' },
    { mistake: 'Overlooking environmental factors', solution: 'Consider temperature, humidity, corrosion, and fatigue in your engineering calculations.' },
  ],
  everyday: [
    { mistake: 'Mental math errors', solution: 'Use a calculator for important financial decisions rather than relying on mental approximations.' },
    { mistake: 'Forgetting sales tax', solution: 'Always add applicable sales tax to purchase calculations. Rates vary by location and product type.' },
    { mistake: 'Tip calculation confusion', solution: 'Calculate tip on the pre-tax amount unless otherwise specified. Standard tips range from 15-20%.' },
    { mistake: 'Budget underestimation', solution: 'Include irregular expenses (annual subscriptions, maintenance, emergencies) in monthly budgets.' },
  ],
  food: [
    { mistake: 'Volume vs weight confusion', solution: 'Use weight (grams/ounces) for dry ingredients and volume (cups/ml) for liquids for best accuracy.' },
    { mistake: 'Not accounting for ingredient density', solution: 'A cup of flour weighs differently than a cup of sugar. Use ingredient-specific weight conversions.' },
    { mistake: 'Scaling errors in baking', solution: 'Baking requires precise ratios. Scale ingredients proportionally rather than rounding measurements.' },
    { mistake: 'Ignoring altitude adjustments', solution: 'At high altitudes, adjust flour, sugar, liquid, and baking time for successful results.' },
  ],
  biology: [
    { mistake: 'Sample contamination', solution: 'Use sterile techniques and proper controls to prevent contamination in biological calculations and experiments.' },
    { mistake: 'Wrong units in concentration', solution: 'Biological concentrations use molarity, mg/mL, or % solutions. Verify the correct unit for your application.' },
    { mistake: 'Not accounting for growth phase', solution: 'Microbial and cell growth calculations should account for lag, log, stationary, and death phases.' },
    { mistake: 'Genetic assumption errors', solution: 'Punnett square and inheritance calculations are probabilistic. Actual ratios vary with sample size.' },
  ],
  ecology: [
    { mistake: 'Underestimating biodiversity needs', solution: 'Species richness alone is insufficient. Include evenness, abundance, and functional diversity metrics.' },
    { mistake: 'Ignoring spatial scale', solution: 'Ecological patterns change with scale. Specify the geographic area and resolution of your analysis.' },
    { mistake: 'Carbon calculation omissions', solution: 'Include all relevant carbon pools: biomass, soil organic carbon, dead wood, litter, and harvested products.' },
    { mistake: 'Assuming linear relationships', solution: 'Ecological systems are often non-linear. Use appropriate models rather than simple linear extrapolations.' },
  ],
  sports: [
    { mistake: 'Overtraining without recovery', solution: 'Balance training load with adequate recovery. Use heart rate and perceived exertion to monitor intensity.' },
    { mistake: 'Ignoring body composition changes', solution: 'Weight alone doesn\'t tell the full story. Track body fat percentage and muscle mass for accurate progress.' },
    { mistake: 'Generic workout plans', solution: 'Use personalized calculations based on your metrics rather than following generic plans from the internet.' },
    { mistake: 'Neglecting nutrition and sleep', solution: 'Performance calculations should account for recovery factors. Nutrition and sleep quality significantly affect results.' },
  ],
}

/* ──────────────────────── Glossary ──────────────────────── */

const glossaryTerms: Record<CategoryHub, GlossaryTerm[]> = {
  financial: [
    { term: 'Principal', definition: 'The original amount of money borrowed or invested, excluding interest.' },
    { term: 'Compound Interest', definition: 'Interest calculated on both the initial principal and accumulated interest from previous periods.' },
    { term: 'APR (Annual Percentage Rate)', definition: 'The yearly cost of borrowing including interest and fees, expressed as a percentage.' },
    { term: 'Amortization', definition: 'The process of spreading a loan into a series of fixed payments over time.' },
    { term: 'Inflation', definition: 'The rate at which the general level of prices rises, reducing purchasing power over time.' },
    { term: 'Liquidity', definition: 'How quickly an asset can be converted to cash without significant loss of value.' },
    { term: 'Diversification', definition: 'Spreading investments across different assets to reduce overall portfolio risk.' },
    { term: 'Net Worth', definition: 'Total assets minus total liabilities, representing overall financial health.' },
  ],
  health: [
    { term: 'BMI (Body Mass Index)', definition: 'A measure of body fat based on height and weight, used as a screening tool for weight categories.' },
    { term: 'BMR (Basal Metabolic Rate)', definition: 'The number of calories your body burns at rest to maintain basic life functions.' },
    { term: 'TDEE (Total Daily Energy Expenditure)', definition: 'Total calories burned per day including BMR, exercise, and daily activities.' },
    { term: 'Macronutrients', definition: 'Nutrients required in large amounts: carbohydrates, proteins, and fats that provide energy and building blocks.' },
    { term: 'Body Fat Percentage', definition: 'The proportion of fat mass to total body mass, a key indicator of fitness and health.' },
    { term: 'Heart Rate Zone', definition: 'A percentage range of maximum heart rate used to target specific exercise intensity levels.' },
  ],
  math: [
    { term: 'Percentage', definition: 'A fraction or ratio expressed as a part of 100, denoted by the % symbol.' },
    { term: 'Ratio', definition: 'A comparison of two quantities showing the relative size of one to the other.' },
    { term: 'Mean', definition: 'The arithmetic average of a set of numbers, calculated by dividing the sum by the count.' },
    { term: 'Median', definition: 'The middle value in a sorted dataset, dividing it into two equal halves.' },
    { term: 'Standard Deviation', definition: 'A measure of the dispersion of values from the mean in a dataset.' },
    { term: 'Exponent', definition: 'A number indicating how many times a base is multiplied by itself.' },
  ],
  conversion: [
    { term: 'Conversion Factor', definition: 'A multiplier used to convert a quantity from one unit to another.' },
    { term: 'SI Units', definition: 'The International System of Units, the modern metric system used globally in science and trade.' },
    { term: 'Imperial System', definition: 'The system of units traditionally used in the US and UK, including inches, feet, pounds, and gallons.' },
    { term: 'Significant Figures', definition: 'The digits in a number that carry meaningful information about its precision.' },
    { term: 'Base Unit', definition: 'A fundamental unit defined by a standard, from which other units are derived.' },
  ],
  'date-time': [
    { term: 'UTC (Coordinated Universal Time)', definition: 'The primary time standard by which the world regulates clocks and time.' },
    { term: 'Leap Year', definition: 'A year with 366 days, occurring every 4 years to synchronize the calendar with the solar year.' },
    { term: 'Daylight Saving Time', definition: 'The practice of advancing clocks during warmer months to extend evening daylight.' },
    { term: 'Unix Timestamp', definition: 'The number of seconds elapsed since January 1, 1970, 00:00:00 UTC.' },
    { term: 'ISO 8601', definition: 'The international standard for date and time representation: YYYY-MM-DDTHH:mm:ssZ.' },
  ],
  construction: [
    { term: 'Square Footage', definition: 'The area of a space measured in square feet, calculated by multiplying length by width.' },
    { term: 'Load-Bearing Wall', definition: 'A wall that supports the weight of the structure above it, including roof and upper floors.' },
    { term: 'PSI (Pounds per Square Inch)', definition: 'A unit of pressure used to measure concrete strength and material stress tolerance.' },
    { term: 'R-Value', definition: 'A measure of thermal resistance used in insulation to indicate heat flow resistance.' },
    { term: 'Span', definition: 'The distance between structural supports such as beams, joists, or trusses.' },
  ],
  statistics: [
    { term: 'Population', definition: 'The entire group of individuals or items that a statistical study aims to analyze.' },
    { term: 'Sample', definition: 'A subset of the population selected to represent the whole in statistical analysis.' },
    { term: 'Correlation', definition: 'A statistical measure describing the extent of relationship between two variables.' },
    { term: 'P-Value', definition: 'The probability of obtaining results at least as extreme as observed, assuming the null hypothesis is true.' },
    { term: 'Normal Distribution', definition: 'A symmetric, bell-shaped probability distribution where most values cluster around the mean.' },
    { term: 'Variance', definition: 'The average of squared differences from the mean, measuring data spread.' },
  ],
  education: [
    { term: 'GPA (Grade Point Average)', definition: 'A numerical representation of academic performance calculated from grades and credit hours.' },
    { term: 'Credit Hour', definition: 'A unit measuring academic workload, typically representing one hour of class time per week per semester.' },
    { term: 'Weighted GPA', definition: 'A GPA calculation that gives additional points for honors, AP, or IB courses.' },
    { term: 'Percentile', definition: 'A score below which a given percentage of test-takers fall.' },
    { term: 'Standardized Test', definition: 'A uniform test administered and scored consistently to allow comparison across test-takers.' },
  ],
  physics: [
    { term: 'Newton\'s Laws', definition: 'Three fundamental laws describing the relationship between motion and forces.' },
    { term: 'Kinetic Energy', definition: 'The energy an object possesses due to its motion, calculated as ½mv².' },
    { term: 'Potential Energy', definition: 'Stored energy based on an object\'s position or configuration.' },
    { term: 'Acceleration', definition: 'The rate of change of velocity over time, measured in m/s².' },
    { term: 'Momentum', definition: 'The product of mass and velocity, a conserved quantity in closed systems.' },
    { term: 'Wavelength', definition: 'The distance between successive peaks of a wave, inversely related to frequency.' },
  ],
  chemistry: [
    { term: 'Mole', definition: 'A unit representing 6.022 × 10²³ particles (Avogadro\'s number), used to quantify chemical substances.' },
    { term: 'Molarity', definition: 'Concentration expressed as moles of solute per liter of solution (mol/L).' },
    { term: 'Stoichiometry', definition: 'The calculation of reactants and products in chemical reactions using balanced equations.' },
    { term: 'pH', definition: 'A measure of hydrogen ion concentration, indicating acidity (pH < 7) or alkalinity (pH > 7).' },
    { term: 'Avogadro\'s Number', definition: '6.022 × 10²³, the number of particles in one mole of a substance.' },
  ],
  engineering: [
    { term: 'Torque', definition: 'A twisting force that causes rotation, calculated as force × distance from pivot point.' },
    { term: 'Stress', definition: 'Force per unit area within a material, measured in pascals (Pa) or psi.' },
    { term: 'Strain', definition: 'The deformation of a material relative to its original length under applied stress.' },
    { term: 'Factor of Safety', definition: 'The ratio of a material\'s ultimate strength to the allowable working stress.' },
    { term: 'Modulus of Elasticity', definition: 'A measure of a material\'s stiffness, describing its resistance to elastic deformation.' },
  ],
  everyday: [
    { term: 'Sale Price', definition: 'The reduced price of an item after applying a discount to the original price.' },
    { term: 'Sales Tax', definition: 'A consumption tax imposed by governments on the sale of goods and services.' },
    { term: 'Compound Annual Growth Rate', definition: 'The mean annual growth rate of an investment over a specified period longer than one year.' },
    { term: 'Return on Investment', definition: 'The ratio of net profit to the cost of an investment, expressed as a percentage.' },
  ],
  food: [
    { term: 'Tare Weight', definition: 'The weight of an empty container subtracted from the gross weight to determine net ingredient weight.' },
    { term: 'Yield Percentage', definition: 'The edible portion of a food item after trimming, cooking, or processing.' },
    { term: 'Baker\'s Percentage', definition: 'A method of expressing ingredient ratios relative to flour weight in baking recipes.' },
    { term: 'Caloric Density', definition: 'The number of calories per gram of food, used for dietary planning and weight management.' },
  ],
  biology: [
    { term: 'Genotype', definition: 'The genetic constitution of an organism, representing the alleles inherited from both parents.' },
    { term: 'Phenotype', definition: 'The observable physical characteristics of an organism resulting from genotype and environmental interaction.' },
    { term: 'Allele Frequency', definition: 'The relative frequency of a gene variant in a population\'s gene pool.' },
    { term: 'Carrying Capacity', definition: 'The maximum population size an environment can sustain indefinitely.' },
    { term: 'Biodiversity Index', definition: 'A quantitative measure of species diversity in a community, combining richness and evenness.' },
  ],
  ecology: [
    { term: 'Carbon Footprint', definition: 'Total greenhouse gas emissions caused by an individual, organization, or product, measured in CO₂ equivalents.' },
    { term: 'Ecological Niche', definition: 'The role and position of a species within its environment, including resource use and interactions.' },
    { term: 'Trophic Level', definition: 'The position an organism occupies in a food chain, from producers to apex predators.' },
    { term: 'Biomass', definition: 'The total mass of living organisms in a given area or volume at a given time.' },
    { term: 'Ecosystem Services', definition: 'Benefits humans receive from ecosystems, including provisioning, regulating, supporting, and cultural services.' },
  ],
  sports: [
    { term: 'VO₂ Max', definition: 'The maximum rate of oxygen consumption during intense exercise, measuring aerobic endurance.' },
    { term: 'Heart Rate Reserve', definition: 'The difference between maximum heart rate and resting heart rate, used for training zone calculation.' },
    { term: 'One Rep Max (1RM)', definition: 'The maximum weight a person can lift for one complete repetition of an exercise.' },
    { term: 'Anaerobic Threshold', definition: 'The exercise intensity at which lactic acid builds up faster than it can be removed.' },
    { term: 'Caloric Deficit', definition: 'The state of consuming fewer calories than expended, leading to weight loss.' },
  ],
}

/* ──────────────────────── Related Concepts ──────────────────────── */

const relatedConcepts: Record<CategoryHub, string[]> = {
  financial: ['Compound Interest', 'Inflation', 'Risk Management', 'Asset Allocation', 'Tax Planning', 'Retirement Planning', 'Diversification', 'Time Value of Money', 'Amortization'],
  health: ['Body Composition', 'Macronutrients', 'Cardiovascular Health', 'Metabolic Rate', 'Hydration', 'Sleep Quality', 'Stress Management', 'Physical Activity Guidelines'],
  math: ['Algebra', 'Calculus', 'Geometry', 'Trigonometry', 'Statistics', 'Number Theory', 'Discrete Mathematics', 'Linear Algebra'],
  conversion: ['Metric System', 'Imperial System', 'Temperature Scales', 'Currency Exchange', 'Data Storage Units', 'Time Zones', 'Angle Measurements'],
  'date-time': ['Time Zones', 'Calendar Systems', 'Astronomical Time', 'Unix Timestamp', 'ISO 8601', 'DST', 'Leap Seconds'],
  construction: ['Structural Engineering', 'Material Science', 'Building Codes', 'Project Management', 'Surveying', 'HVAC Design', 'Plumbing Systems'],
  statistics: ['Probability Theory', 'Regression Analysis', 'Hypothesis Testing', 'Bayesian Statistics', 'Time Series Analysis', 'Experimental Design'],
  education: ['Learning Theories', 'Curriculum Design', 'Educational Psychology', 'Assessment Methods', 'Study Techniques', 'Career Planning'],
  physics: ['Classical Mechanics', 'Thermodynamics', 'Electromagnetism', 'Quantum Physics', 'Relativity', 'Fluid Dynamics', 'Optics'],
  chemistry: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Analytical Chemistry', 'Biochemistry', 'Thermochemistry'],
  engineering: ['Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Chemical Engineering', 'Software Engineering', 'Systems Design'],
  everyday: ['Personal Finance', 'Home Maintenance', 'Time Management', 'Cooking Skills', 'Shopping Strategies', 'Health & Wellness'],
  food: ['Nutrition Science', 'Culinary Arts', 'Food Chemistry', 'Dietary Guidelines', 'Meal Planning', 'Food Safety'],
  biology: ['Cell Biology', 'Genetics', 'Evolution', 'Ecology', 'Molecular Biology', 'Physiology', 'Microbiology'],
  ecology: ['Environmental Science', 'Conservation Biology', 'Climate Science', 'Sustainable Development', 'Environmental Policy', 'Restoration Ecology'],
  sports: ['Exercise Physiology', 'Sports Nutrition', 'Biomechanics', 'Sports Psychology', 'Training Theory', 'Injury Prevention'],
}

/* ──────────────────────── Commercial Content ──────────────────────── */

const comparisonTemplates: Record<CategoryHub, (topic: string) => Comparison[]> = {
  financial: (topic) => [
    {
      title: `Manual ${topic} Calculation vs Our Calculator`,
      items: [
        { label: 'Speed', manual: 'Minutes to hours per calculation', calculator: 'Instant results in milliseconds' },
        { label: 'Accuracy', manual: 'Prone to arithmetic errors and formula mistakes', calculator: 'Guaranteed precision with validated formulas' },
        { label: 'Complexity', manual: 'Requires understanding of financial formulas and math', calculator: 'No formula knowledge needed' },
        { label: 'Scenario Testing', manual: 'Time-consuming to recalculate each scenario', calculator: 'Adjust inputs instantly and compare scenarios' },
        { label: 'Visualization', manual: 'Requires manual chart creation in spreadsheet', calculator: 'Built-in charts and visual breakdowns' },
      ],
      summary: `Our ${topic} calculator eliminates manual calculation errors and reduces computation time from minutes to seconds, while providing visual insights that manual methods cannot match.`,
    },
    {
      title: `${topic} Calculator vs Spreadsheet`,
      items: [
        { label: 'Setup Time', manual: 'Requires formula setup and verification', calculator: 'Ready to use immediately with pre-built logic' },
        { label: 'Error Checking', manual: 'Spreadsheet errors are common and hard to detect', calculator: 'Input validation prevents common mistakes' },
        { label: 'Portability', manual: 'Tied to desktop software or specific files', calculator: 'Access from any device with internet connection' },
        { label: 'Updates', manual: 'Manual formula updates needed for changes', calculator: 'Always up-to-date with latest calculation methods' },
      ],
      summary: `While spreadsheets offer flexibility, our dedicated ${topic} calculator provides faster setup, fewer errors, and anytime-anywhere access.`,
    },
  ],
  health: (topic) => [
    {
      title: `Manual ${topic} Calculation vs Our Calculator`,
      items: [
        { label: 'Formula Complexity', manual: 'Multiple formulas with different variables', calculator: 'Automated formula selection based on inputs' },
        { label: 'Unit Conversion', manual: 'Manual conversion between metric and imperial', calculator: 'Automatic unit conversion with toggle' },
        { label: 'Result Interpretation', manual: 'Requires external reference for what results mean', calculator: 'Built-in interpretation and context' },
        { label: 'Progress Tracking', manual: 'No built-in way to track changes over time', calculator: 'Save scenarios and compare results' },
      ],
      summary: `Our ${topic} calculator simplifies health assessments by automating complex formulas and providing instant interpretation of your results.`,
    },
  ],
  math: (topic) => [
    {
      title: `Manual ${topic} Calculation vs Our Calculator`,
      items: [
        { label: 'Speed', manual: 'Step-by-step manual computation', calculator: 'Instant results' },
        { label: 'Verification', manual: 'Hard to verify without redoing work', calculator: 'Copy and share results for verification' },
        { label: 'Learning Aid', manual: 'Must know formula upfront', calculator: 'Shows formula and steps for learning' },
      ],
      summary: `Our ${topic} calculator checks your work instantly while helping you understand the underlying mathematical principles.`,
    },
  ],
  conversion: (topic) => [
    {
      title: `Manual ${topic} Conversion vs Our Calculator`,
      items: [
        { label: 'Conversion Factors', manual: 'Must look up and apply correct factors', calculator: 'Built-in authoritative conversion database' },
        { label: 'Precision', manual: 'Rounding errors accumulate', calculator: 'High-precision calculations throughout' },
        { label: 'Bidirectional', manual: 'Must calculate reverse conversion separately', calculator: 'Instant bidirectional conversion' },
      ],
      summary: `Our ${topic} converter eliminates lookup time and calculation errors with instant, high-precision results across all major unit systems.`,
    },
  ],
  'date-time': (topic) => [
    {
      title: `Manual ${topic} Calculation vs Our Calculator`,
      items: [
        { label: 'Leap Year Handling', manual: 'Must track leap years manually', calculator: 'Automatic leap year and calendar logic' },
        { label: 'Time Zone Adjustments', manual: 'Complex manual offsets', calculator: 'Simple time zone selection' },
        { label: 'Accuracy', manual: 'Off-by-one errors are common', calculator: 'Precise date arithmetic' },
      ],
      summary: `Our ${topic} calculator handles all calendar edge cases automatically, eliminating common manual calculation errors.`,
    },
  ],
  construction: (topic) => [
    {
      title: `Manual ${topic} Estimation vs Our Calculator`,
      items: [
        { label: 'Material Waste', manual: 'Easy to forget waste factor', calculator: 'Built-in waste percentage calculation' },
        { label: 'Unit Conversions', manual: 'Must convert between measurement systems', calculator: 'Handles all unit conversions automatically' },
        { label: 'Cost Updates', manual: 'Must manually look up current prices', calculator: 'Update price inputs and recalculate instantly' },
      ],
      summary: `Our ${topic} calculator saves hours of manual estimation time and reduces costly material ordering mistakes.`,
    },
  ],
  statistics: (topic) => [
    {
      title: `Manual ${topic} Analysis vs Our Calculator`,
      items: [
        { label: 'Computation Time', manual: 'Tedious manual calculations', calculator: 'Instant statistical computations' },
        { label: 'Formula Selection', manual: 'Must choose correct statistical test', calculator: 'Guided formula application' },
        { label: 'Visualization', manual: 'Must create charts separately', calculator: 'Built-in data visualization' },
      ],
      summary: `Our ${topic} calculator transforms tedious statistical work into instant, visual insights.`,
    },
  ],
  education: (topic) => [
    {
      title: `Manual ${topic} Calculation vs Our Calculator`,
      items: [
        { label: 'Weighting', manual: 'Complex manual weighted averaging', calculator: 'Automatic credit-weighted calculations' },
        { label: 'Scenario Planning', manual: 'Time-consuming what-if analysis', calculator: 'Instant grade projection with any inputs' },
        { label: 'Scale Conversion', manual: 'Must know different grading scales', calculator: 'Supports multiple grading systems' },
      ],
      summary: `Our ${topic} calculator eliminates grading calculation complexity, letting you focus on academic improvement.`,
    },
  ],
  physics: (topic) => [
    {
      title: `Manual ${topic} Calculation vs Our Calculator`,
      items: [
        { label: 'Formula Application', manual: 'Must recall and apply correct formula', calculator: 'Select concept, enter values, get answer' },
        { label: 'Unit Management', manual: 'Manual SI conversion required', calculator: 'Automatic unit handling' },
        { label: 'Step Verification', manual: 'Hard to identify where errors occur', calculator: 'Step-by-step breakdown shows each stage' },
      ],
      summary: `Our ${topic} calculator helps students and professionals verify their work and understand the problem-solving process.`,
    },
  ],
  chemistry: (topic) => [
    {
      title: `Manual ${topic} Calculation vs Our Calculator`,
      items: [
        { label: 'Atomic Mass Lookup', manual: 'Must look up values from periodic table', calculator: 'Built-in atomic mass database' },
        { label: 'Unit Conversion', manual: 'Manual molarity/molality conversion', calculator: 'Automatic concentration unit handling' },
        { label: 'Error Prone', manual: 'Small mistakes compound in multi-step calculations', calculator: 'Validated at each computation step' },
      ],
      summary: `Our ${topic} calculator reduces lab calculation errors and speeds up experimental preparation significantly.`,
    },
  ],
  engineering: (topic) => [
    {
      title: `Manual ${topic} Calculation vs Our Calculator`,
      items: [
        { label: 'Standards Compliance', manual: 'Must reference standards manually', calculator: 'Built-in industry standards and formulas' },
        { label: 'Iteration Speed', manual: 'Slow design iteration cycle', calculator: 'Instant parameter adjustment' },
        { label: 'Documentation', manual: 'Must document calculations separately', calculator: 'Export and share results easily' },
      ],
      summary: `Our ${topic} calculator accelerates engineering design cycles while maintaining professional accuracy standards.`,
    },
  ],
  everyday: (topic) => [
    {
      title: `Manual ${topic} Calculation vs Our Calculator`,
      items: [
        { label: 'Mental Math', manual: 'Approximations with potential errors', calculator: 'Exact results every time' },
        { label: 'Tax/Budget Updates', manual: 'Must track changing rates manually', calculator: 'Update inputs for current rates' },
        { label: 'Speed', manual: 'Takes time to work through mentally', calculator: 'Instant results' },
      ],
      summary: `Our ${topic} calculator helps you make better everyday decisions with accurate, instant calculations.`,
    },
  ],
  food: (topic) => [
    {
      title: `Manual ${topic} Calculation vs Our Calculator`,
      items: [
        { label: 'Ingredient Ratios', manual: 'Manual proportional scaling', calculator: 'Automatic ingredient scaling with unit conversion' },
        { label: 'Nutrition Math', manual: 'Look up and calculate nutrition per serving', calculator: 'Instant nutritional breakdown' },
        { label: 'Batch Adjustments', manual: 'Time-consuming batch recalculations', calculator: 'Adjust servings and all values update' },
      ],
      summary: `Our ${topic} calculator takes the guesswork out of recipe scaling and nutritional planning.`,
    },
  ],
  biology: (topic) => [
    {
      title: `Manual ${topic} Calculation vs Our Calculator`,
      items: [
        { label: 'Data Processing', manual: 'Manual data entry and calculation', calculator: 'Automated computation and analysis' },
        { label: 'Statistical Analysis', manual: 'Requires separate statistical tools', calculator: 'Built-in biological statistics' },
        { label: 'Repeatability', manual: 'Hard to replicate manual calculations', calculator: 'Consistent results every time' },
      ],
      summary: `Our ${topic} calculator streamlines biological data analysis, reducing calculation time and improving accuracy.`,
    },
  ],
  ecology: (topic) => [
    {
      title: `Manual ${topic} Calculation vs Our Calculator`,
      items: [
        { label: 'Complex Formulas', manual: 'Multiple interconnected formulas', calculator: 'Integrated computation chain' },
        { label: 'Data Management', manual: 'Scattered data across sources', calculator: 'Centralized input and output' },
        { label: 'Scenario Modeling', manual: 'Time-consuming what-if analysis', calculator: 'Quick scenario comparison' },
      ],
      summary: `Our ${topic} calculator makes environmental analysis accessible, accurate, and repeatable.`,
    },
  ],
  sports: (topic) => [
    {
      title: `Manual ${topic} Calculation vs Our Calculator`,
      items: [
        { label: 'Formula Knowledge', manual: 'Must know sports science formulas', calculator: 'Just enter your metrics' },
        { label: 'Progress Tracking', manual: 'Manual logging and calculation', calculator: 'Track and compare performance metrics' },
        { label: 'Accuracy', manual: 'Rounding errors in multi-step calculations', calculator: 'Precise athlete-specific computations' },
      ],
      summary: `Our ${topic} calculator helps athletes and coaches make data-driven training decisions without needing sports science expertise.`,
    },
  ],
}

function buildAlternatives(calc: CalculatorEntry): Alternative[] {
  const topic = extractTopic(calc.title)
  return [
    { name: `Manual ${topic} Spreadsheet`, description: `Build your own ${topic} calculator in Excel or Google Sheets. Offers full customization but requires formula knowledge and setup time.` },
    { name: `Competitor ${topic} Tools`, description: `Other free online ${topic} calculators may offer basic functionality. Compare features and accuracy to choose the best tool.` },
    { name: `Professional ${getHubAdjective(calc.category)} Software`, description: `Professional-grade ${calc.category} software with advanced ${topic} features. Best for frequent or complex usage but often requires payment.` },
  ]
}

function buildExpertRecommendations(calc: CalculatorEntry): string[] {
  const topic = extractTopic(calc.title)
  return [
    `For the most accurate ${topic} results, ensure all input values are measured or verified before entering them into the calculator.`,
    `Use the Save Scenario feature to compare multiple ${topic} scenarios side by side and identify the optimal approach.`,
    `Regularly recalculate ${topic} as your circumstances change to ensure your plans remain on track.`,
    `Combine ${topic} insights with other related calculators on our platform for a comprehensive analysis.`,
    `Share your ${topic} results with relevant professionals (financial advisors, doctors, contractors) for personalized guidance.`,
  ]
}

function getHubAdjective(category: CategoryHub): string {
  const adjectives: Record<CategoryHub, string> = {
    financial: 'Financial',
    health: 'Healthcare',
    math: 'Mathematical',
    conversion: 'Conversion',
    'date-time': 'Time Management',
    construction: 'Construction',
    statistics: 'Statistical',
    education: 'Educational',
    physics: 'Physics',
    chemistry: 'Chemistry',
    engineering: 'Engineering',
    everyday: 'Productivity',
    food: 'Culinary',
    biology: 'Biological',
    ecology: 'Environmental',
    sports: 'Fitness',
  }
  return adjectives[category]
}

function buildRelevantAudience(calc: CalculatorEntry): string[] {
  const audiences: Record<CategoryHub, string[]> = {
    financial: ['Homebuyers', 'Investors', 'Financial Planners', 'Students', 'Small Business Owners'],
    health: ['Individuals Tracking Health', 'Fitness Enthusiasts', 'Healthcare Professionals', 'Nutritionists', 'Personal Trainers'],
    math: ['Students', 'Teachers', 'Engineers', 'Scientists', 'Professionals'],
    conversion: ['Travelers', 'Chefs', 'Engineers', 'Students', 'Online Shoppers'],
    'date-time': ['Project Managers', 'Event Planners', 'Developers', 'Researchers', 'HR Professionals'],
    construction: ['Contractors', 'Architects', 'DIY Enthusiasts', 'Homeowners', 'Builders'],
    statistics: ['Researchers', 'Data Analysts', 'Students', 'Business Analysts', 'Quality Control Managers'],
    education: ['Students', 'Teachers', 'Academic Advisors', 'Parents', 'Administrators'],
    physics: ['Students', 'Engineers', 'Physics Teachers', 'Researchers', 'Science Enthusiasts'],
    chemistry: ['Chemists', 'Lab Technicians', 'Students', 'Researchers', 'Industrial Scientists'],
    engineering: ['Engineers', 'Designers', 'Technical Managers', 'Students', 'Quality Assurance'],
    everyday: ['Consumers', 'Shoppers', 'Planners', 'Budgeters', 'Anyone Making Daily Decisions'],
    food: ['Home Cooks', 'Chefs', 'Nutritionists', 'Meal Planners', 'Bakers'],
    biology: ['Biologists', 'Students', 'Researchers', 'Healthcare Workers', 'Environmental Scientists'],
    ecology: ['Environmental Scientists', 'Conservationists', 'Students', 'Policy Makers', 'Researchers'],
    sports: ['Athletes', 'Coaches', 'Personal Trainers', 'Sports Scientists', 'Fitness Enthusiasts'],
  }
  return audiences[calc.category]
}

/* ──────────────────────── Long-Form Educational Articles ──────────────────────── */

let _longFormArticles: Record<string, LongFormSection[]> = {}

export const longFormArticlesReady: Promise<void> = import('./content-articles')
  .then(m => { _longFormArticles = { ...m.default } })
  .catch(() => { _longFormArticles = {} })

function generateCategoryLongForm(calculator: CalculatorEntry, dict?: ContentEngineDict): LongFormSection[] {
  const topic = extractTopic(calculator.title)
  const { category, description, formulaSource: formula, keywords = [] } = calculator
  const cat = category as string
  const adj = dict?.adjectives?.[cat] ?? getHubAdjective(category)
  const slug = calculator.slug

  // Deterministic seed from slug for content variation
  let seed = 0
  for (let i = 0; i < slug.length; i++) { seed = ((seed << 5) - seed) + slug.charCodeAt(i); seed |= 0 }
  seed = Math.abs(seed)
  const exampleVal1 = (seed % 900 + 100).toString()
  const exampleVal2 = (seed % 9000 + 1000).toString()
  const exampleVal3 = (seed % 12 + 3).toString()

  const domainCtx: Record<string, DomainCtx> = {
    financial: { whatLabel: 'financial metric', whyImportant: 'From mortgage rates to investment returns, getting the numbers right can mean thousands of dollars in savings or earnings.', formulaLead: 'The core financial formula', appFocus: 'portfolio growth, loan amortization, and retirement planning', methodLabel: 'financial formulas', precisionContext: 'penny-accurate', tipArea: 'interest rates and compounding periods', riskLabel: 'financial' },
    health: { whatLabel: 'health metric', whyImportant: 'Your health numbers are vital signs of your overall wellness.', formulaLead: 'The physiological basis', appFocus: 'fitness tracking, medical assessments, and wellness planning', methodLabel: 'physiological formulas', precisionContext: 'clinically meaningful', tipArea: 'measurement conditions and timing', riskLabel: 'health' },
    math: { whatLabel: 'mathematical concept', whyImportant: 'Understanding the underlying formulas unlocks deeper insight into how the world works.', formulaLead: 'The fundamental mathematical expression', appFocus: 'academic problem-solving, engineering design, and scientific research', methodLabel: 'mathematical methods', precisionContext: 'the required decimal precision', tipArea: 'assumptions and edge cases', riskLabel: 'numerical' },
    conversion: { whatLabel: 'unit conversion', whyImportant: 'A wrong conversion can ruin a recipe or compromise a structural design.', formulaLead: 'The conversion relationship', appFocus: 'international travel, recipe scaling, engineering specs, and scientific data', methodLabel: 'conversion factors', precisionContext: 'the appropriate significant figures', tipArea: 'unit consistency and rounding', riskLabel: 'conversion' },
    'date-time': { whatLabel: 'time calculation', whyImportant: 'Calculating durations and deadlines accurately helps you plan effectively.', formulaLead: 'The time arithmetic', appFocus: 'project scheduling, event planning, and deadline management', methodLabel: 'calendar math', precisionContext: 'the day or hour', tipArea: 'time zones and daylight saving', riskLabel: 'scheduling' },
    construction: { whatLabel: 'construction measurement', whyImportant: 'Accurate material estimates and structural calculations prevent costly rework and ensure code compliance.', formulaLead: 'The construction engineering formula', appFocus: 'material estimation, structural design, and building code compliance', methodLabel: 'building standards', precisionContext: 'a fraction of an inch', tipArea: 'material waste factors and local building codes', riskLabel: 'structural' },
    statistics: { whatLabel: 'statistical measure', whyImportant: 'Choosing the right statistical method determines the validity of your conclusions.', formulaLead: 'The statistical formula', appFocus: 'hypothesis testing, data analysis, and research validation', methodLabel: 'statistical methods', precisionContext: 'the confidence interval', tipArea: 'sample size and data distribution', riskLabel: 'statistical' },
    education: { whatLabel: 'educational metric', whyImportant: 'Educational measurements help track progress and identify areas for improvement.', formulaLead: 'The educational assessment formula', appFocus: 'academic grading, learning assessment, and progress tracking', methodLabel: 'educational standards', precisionContext: 'the grading rubric', tipArea: 'grading curves and weighting', riskLabel: 'academic' },
    physics: { whatLabel: 'physical quantity', whyImportant: 'Physics calculations describe the fundamental laws of the universe.', formulaLead: 'The physics equation', appFocus: 'mechanics, electromagnetism, thermodynamics, and quantum physics', methodLabel: 'physical constants', precisionContext: 'the appropriate significant figures', tipArea: 'unit systems (SI vs imperial) and measurement error', riskLabel: 'physical' },
    chemistry: { whatLabel: 'chemical quantity', whyImportant: 'Accurate chemical calculations are critical for lab work, pharmaceuticals, and environmental monitoring.', formulaLead: 'The chemical relationship', appFocus: 'stoichiometry, solution preparation, and reaction yield optimization', methodLabel: 'chemical principles', precisionContext: 'the molar precision', tipArea: 'temperature, pressure, and purity of reagents', riskLabel: 'chemical' },
    engineering: { whatLabel: 'engineering parameter', whyImportant: 'Engineering calculations ensure structures stand, circuits function, and systems operate safely.', formulaLead: 'The engineering design formula', appFocus: 'structural analysis, circuit design, and system optimization', methodLabel: 'engineering standards', precisionContext: 'the design tolerance', tipArea: 'safety factors, material properties, and code requirements', riskLabel: 'engineering' },
    everyday: { whatLabel: 'everyday calculation', whyImportant: 'Getting daily calculations right saves money, time, and frustration.', formulaLead: 'The practical formula', appFocus: 'budgeting, shopping, planning, and household management', methodLabel: 'everyday math', precisionContext: 'a practical margin', tipArea: 'estimating vs precise calculation', riskLabel: 'practical' },
    food: { whatLabel: 'culinary measurement', whyImportant: 'Precise measurements ensure consistent cooking results every time.', formulaLead: 'The culinary ratio', appFocus: 'recipe scaling, nutritional planning, and baking ratios', methodLabel: 'culinary standards', precisionContext: 'a gram or teaspoon', tipArea: 'ingredient density and substitution ratios', riskLabel: 'culinary' },
    biology: { whatLabel: 'biological parameter', whyImportant: 'Biological calculations enable advances in medicine, agriculture, and conservation.', formulaLead: 'The biological relationship', appFocus: 'population studies, dosage calculations, and growth rate analysis', methodLabel: 'biological assays', precisionContext: 'the biological significance threshold', tipArea: 'experimental conditions and control variables', riskLabel: 'biological' },
    ecology: { whatLabel: 'ecological indicator', whyImportant: 'Ecological calculations are essential for informed environmental stewardship.', formulaLead: 'The ecological model', appFocus: 'carbon footprinting, resource management, and conservation planning', methodLabel: 'environmental metrics', precisionContext: 'the ecological significance', tipArea: 'seasonal variation and data collection methods', riskLabel: 'environmental' },
    sports: { whatLabel: 'athletic metric', whyImportant: 'Athletes and coaches rely on performance metrics to train smarter and prevent injuries.', formulaLead: 'The sports science formula', appFocus: 'performance tracking, training load management, and injury prevention', methodLabel: 'sports science standards', precisionContext: 'a meaningful performance increment', tipArea: 'individual variation and recovery periods', riskLabel: 'athletic' },
  }

  const ctx = dict?.domainCtx?.[cat] ?? domainCtx[category]

  // Locale fill params (locale templates use {topic} {topicLower} {adj} {v1} {v2} {v3} {description} {formula} {method})
  const LP = {
    topic, topicLower: topic.toLowerCase(), adj,
    v1: exampleVal1, v2: exampleVal2, v3: exampleVal3,
    description, formula: formula || '', method: ctx.methodLabel,
  }

  // Category-specific deep-dive section with unique angles
  const categorySpecificSection = (): LongFormSection => {
    const choice = seed % 3
    const deepVariants = dict?.deep?.[cat]
    if (deepVariants && deepVariants.length > 0) {
      const dv = deepVariants[choice % deepVariants.length]
      return {
        title: fillTemplate(dv.title, LP),
        content: fillTemplate(dv.content, LP),
        subsections: dv.subs.map(s => ({ heading: fillTemplate(s.heading, LP), text: fillTemplate(s.text, LP) })),
      }
    }
    switch (category) {
      case 'financial': {
        if (choice === 0) return { title: 'How Time and Rates Shape Your Financial Outcome', content: `The ${topic} calculation is sensitive to two critical inputs: the time horizon and the rate of change. Even small adjustments to either parameter produce dramatically different outcomes. For example, a ${exampleVal2} unit difference in the principal or term can change your total cost by hundreds of dollars over the life of the calculation. This is because financial formulas use exponential or multiplicative relationships rather than simple addition. Understanding this sensitivity helps you prioritize which variables to negotiate or optimize. The most successful financial strategies focus on the inputs that have the largest multiplier effect on the final result.`, subsections: [{ heading: 'The Time Value of Money Applied', text: `Time is the most powerful variable in financial calculations. A ${exampleVal3}-year difference in term length can alter your payment by ${(parseInt(exampleVal2)/10).toFixed(0)}% or more. The calculator illustrates exactly how time compounds or discounts your financial outcomes.` }, { heading: 'Rate Sensitivity Analysis', text: `A half-percentage-point change in your interest rate or return rate translates into real money. The calculator lets you toggle rates in ${exampleVal1} basis point increments to see the dollar impact instantly.` }] }
        if (choice === 1) return { title: 'Breaking Down the Components of Your Calculation', content: `Every financial calculation can be decomposed into its core components. The ${topic} consists of principal or base amount, rate of return or cost, time period, and recurring contributions or payments. By isolating each component, you can see which factor drives the result most heavily. This decomposition is particularly valuable when comparing different financial products or strategies. A loan with a slightly higher rate but significantly lower fees may be cheaper overall. An investment with lower volatility but modest returns might outperform a high-risk alternative when adjusted for risk. The calculator provides this component breakdown automatically.`, subsections: [{ heading: 'Principal and Base Amounts', text: `The starting amount is the foundation of your calculation. A change of ${exampleVal1} units in the principal directly scales the final result. The calculator shows how much of the outcome comes from the base amount versus the growth or cost applied to it.` }, { heading: 'Recurring Contributions or Payments', text: `Regular additions or deductions compound alongside the base amount. Adding ${exampleVal2} units per period changes the trajectory significantly over ${exampleVal3} years or more. The calculator separates one-time from recurring effects.` }] }
        return { title: 'Risk, Return, and Realistic Assumptions', content: `Financial calculations require realistic assumptions about rates, returns, and risk. The ${topic} calculator helps you test different scenarios by adjusting these assumptions. A conservative estimate using lower expected returns gives you a safer planning target. An optimistic scenario shows the upside potential. By running both, you can plan for a range of outcomes rather than a single number. This range-based approach is the hallmark of professional financial planning and is built directly into the calculator's comparison features.`, subsections: [{ heading: 'Conservative vs. Optimistic Scenarios', text: `Run the calculation with both conservative (${(parseInt(exampleVal2)*0.7).toFixed(0)} units) and optimistic (${(parseInt(exampleVal2)*1.3).toFixed(0)} units) assumptions to establish a range of possible outcomes. The calculator displays both results side by side.` }, { heading: 'Stress Testing Your Assumptions', text: `What happens if rates change by ${exampleVal1}%? If the timeline extends by ${exampleVal3} periods? Stress testing reveals which scenarios break your plan and where you need contingency strategies.` }] }
      }
      case 'health': {
        if (choice === 0) return { title: 'Understanding Your Numbers in Context', content: `A ${topic} value on its own tells only part of the story. What matters more is how your number compares to established reference ranges and how it changes over time. For example, a reading of ${exampleVal1} units might be perfectly healthy for one demographic while indicating concern for another. The calculator provides context-specific benchmarks based on age, gender, and other relevant factors. Tracking your ${topic.toLowerCase()} over ${exampleVal3} consecutive measurements gives you a trend line that is far more informative than any single data point.`, subsections: [{ heading: 'Reference Ranges and What They Mean', text: `Healthy ranges vary by population. The calculator uses the latest clinical guidelines to classify your result as low, normal, elevated, or high. Each classification comes with guidance on next steps.` }, { heading: 'The Power of Longitudinal Tracking', text: `A single measurement is a snapshot. Recording results over ${exampleVal3} sessions reveals whether your ${topic.toLowerCase()} is stable, improving, or declining. The calculator includes a tracking history feature for this purpose.` }] }
        if (choice === 1) return { title: 'Factors That Influence Your Health Metrics', content: `Your ${topic} result is influenced by a combination of modifiable and non-modifiable factors. Modifiable factors include diet, physical activity, sleep, stress, and medication adherence. Non-modifiable factors include age, genetics, and sex. Understanding which factors you can change and by how much empowers you to take action. For instance, improving your ${topic.toLowerCase()} by ${exampleVal1} units might require a combination of dietary changes and increased physical activity over ${exampleVal3} weeks. The calculator helps you set realistic targets based on scientific evidence.`, subsections: [{ heading: 'Modifiable vs. Non-Modifiable Factors', text: `Focus your energy on factors within your control. The calculator shows which inputs are modifiable and provides evidence-based estimates of the impact each change can have on your ${topic.toLowerCase()}.` }, { heading: 'Setting Realistic Improvement Targets', text: `Aim for a ${exampleVal2} unit improvement over ${exampleVal3} months as a starting target. The calculator tracks progress and adjusts recommendations based on your rate of change.` }] }
        return { title: 'When to Seek Professional Guidance', content: `While online calculators provide valuable insights, they complement rather than replace professional medical advice. The ${topic} calculator includes clear indicators when your result falls outside healthy ranges and suggests when to consult a healthcare provider. For example, if your ${topic.toLowerCase()} reading exceeds ${exampleVal2} units or changes by more than ${exampleVal1} units between measurements, this may warrant professional attention. The calculator also provides educational resources to help you prepare for medical appointments with relevant questions and data.`, subsections: [{ heading: 'Understanding Warning Thresholds', text: `The calculator flags results that exceed clinically validated thresholds. A ${topic.toLowerCase()} of ${exampleVal2} units triggers a caution notice with suggestions for follow-up.` }, { heading: 'Preparing for Your Appointment', text: `Use the calculator's export feature to share your ${exampleVal3}-session trend data with your healthcare provider. This longitudinal data is more useful than isolated readings.` }] }
      }
      case 'math': {
        if (choice === 0) return { title: 'Why This Mathematical Concept Matters', content: `${topic} appears throughout mathematics and its applications. Understanding this concept strengthens your mathematical foundation and prepares you for more advanced topics. The concept relies on ${exampleVal1} core principles that interact in predictable ways. Mastery of ${topic.toLowerCase()} opens doors to related topics in ${adj} analysis and beyond. The calculator not only computes results but also shows the step-by-step derivation, reinforcing the underlying mathematics with each use.`, subsections: [{ heading: 'Prerequisite Knowledge', text: `Before working with ${topic}, you should be comfortable with ${exampleVal2} core mathematical operations. The calculator includes a prerequisite review section that refreshes these foundational skills.` }, { heading: 'Connection to Advanced Topics', text: `${topic} serves as a building block for more advanced mathematical concepts. Understanding it thoroughly makes subsequent learning more efficient and intuitive.` }] }
        if (choice === 1) return { title: 'Common Approaches to Solving', content: `There are ${exampleVal3} primary methods for solving ${topic} problems, each with its own strengths. The calculator implements all ${exampleVal3} approaches and shows the results side by side. This comparison helps you understand which method is most appropriate for different problem types. The direct method works well for standard cases, while the alternative approaches handle special situations like extreme values or constrained inputs. By seeing multiple solution paths, you develop a more flexible understanding of the concept.`, subsections: [{ heading: 'The Direct Approach', text: `The most straightforward method applies the core formula directly. This works for the majority of cases and is the fastest route to an answer. The calculator shows the direct calculation first.` }, { heading: 'Alternative Solution Paths', text: `When inputs are extreme or constraints apply, alternative methods provide more accurate results. The calculator automatically selects the best method based on your inputs.` }] }
        return { title: 'Visualizing the Mathematical Relationship', content: `Mathematics becomes intuitive when you can visualize it. The ${topic} calculator includes interactive graphs that show how changing one variable affects the result. For example, adjusting the input by ${exampleVal1} units shifts the output along a curve that you can see updating in real time. This visual feedback builds intuition faster than working with numbers alone. The graph highlights key points such as intercepts, asymptotes, and maxima that are mathematically significant.`, subsections: [{ heading: 'Interactive Variable Exploration', text: `Drag the input slider from ${exampleVal1} to ${exampleVal2} units and watch the graph update. This real-time feedback makes the mathematical relationship tangible.` }, { heading: 'Key Mathematical Features', text: `The graph automatically labels critical points including the value at ${exampleVal1} input units, the rate of change at that point, and any boundary conditions that apply.` }] }
      }
      case 'conversion': {
        if (choice === 0) return { title: 'Why Precision Matters in Unit Conversion', content: `Unit conversion is deceptively simple. A single misplaced decimal or wrong conversion factor can produce results that are off by orders of magnitude. For example, confusing US gallons (3.785 L) with UK gallons (4.546 L) introduces a ${(16).toFixed(0)}% error. The ${topic} calculator handles these nuances automatically, applying the correct conversion factor based on the units you select. It also respects significant figures, ensuring that your result is only as precise as your least precise input. This attention to detail is critical when conversions affect safety, compliance, or cost.`, subsections: [{ heading: 'Commonly Confused Unit Pairs', text: `US vs UK gallons, short vs long tons, liquid vs dry ounces, and metric vs imperial cups are among the most frequently confused conversions. The calculator clarifies these distinctions.` }, { heading: 'Significant Figures and Rounding', text: `A conversion with ${exampleVal1} significant figures in the input can only produce results with ${exampleVal1} significant figures. The calculator rounds appropriately, preventing false precision.` }] }
        if (choice === 1) return { title: 'Conversion Factors and How They Work', content: `Every unit conversion relies on a conversion factor — a fixed ratio between two units. The ${topic} conversion uses the factor ${exampleVal2} units per base unit, which is derived from international standards. Understanding conversion factors helps you verify results and perform conversions even when a calculator is not available. The relationship is always linear: multiply by the factor to convert from one unit to another. The calculator stores hundreds of conversion factors in its database, each verified against official standards from organizations like NIST and BIPM.`, subsections: [{ heading: 'Where Conversion Factors Come From', text: `Conversion factors are defined by international treaties and standards bodies. The meter, kilogram, second, and other base units are defined by physical constants, and all other units derive from these definitions.` }, { heading: 'Verifying Your Conversion', text: `A quick sanity check: if converting ${exampleVal1} units using the factor ${exampleVal2}, the result should be approximately ${(parseInt(exampleVal1)*parseInt(exampleVal2)/1000).toFixed(1)}. The calculator provides this verification automatically.` }] }
        return { title: 'Real-World Impact of Conversion Errors', content: `Conversion errors have real consequences. In 1999, a $125 million Mars climate orbiter was lost because one engineering team used imperial units while another used metric. In healthcare, medication dosing errors from unit confusion harm patients every year. The ${topic} calculator helps prevent such errors by validating units, showing the conversion path, and flagging unusual results. When you convert ${exampleVal1} units and get a result of ${(parseInt(exampleVal1)*parseInt(exampleVal2)/100).toFixed(0)} target units, the calculator confirms this aligns with expected values.`, subsections: [{ heading: 'High-Stakes Conversion Scenarios', text: `Aviation, medicine, engineering, and international trade are fields where conversion accuracy is non-negotiable. The calculator includes field-specific presets for these professions.` }, { heading: 'Building a Conversion Habit', text: `Always verify your conversion by running it in reverse: convert the result back to the original unit. The calculator includes a reverse-conversion button to make this verification instant.` }] }
      }
      default: return { title: `Inside the ${topic} Calculation`, content: `The ${topic} calculator combines ${exampleVal3} key variables using a formula designed for accuracy and ease of use. Each input has been carefully chosen based on established ${ctx.methodLabel}. The calculation flow proceeds through ${exampleVal3} distinct stages: input collection, validation, computation, and result presentation. At each stage, the calculator provides feedback to help you understand what is happening and why. This transparency builds trust in the results and helps you learn the underlying concepts through hands-on use.`, subsections: [{ heading: 'Input Collection and Validation', text: `The calculator checks that all inputs fall within acceptable ranges. For example, if you enter ${exampleVal2} units where the valid range is 0-${exampleVal1}, it prompts for correction before computing.` }, { heading: 'Result Interpretation', text: `The output is presented with context: whether it falls within expected ranges, how it compares to benchmarks, and what factors most influenced the result.` }] }
    }
  }

  // Build 3 unique FAQ items - use keywords when available, otherwise generate contextual ones
  const faqPools: Record<string, { q: string; a: string }[]> = {
    financial: [
      { q: `What assumptions does the ${topic} calculation make?`, a: `The calculator assumes consistent rates and regular payment timing throughout the term. Real-world rates fluctuate, so consider the result as an estimate under steady conditions.` },
      { q: `How often should I recalculate ${topic}?`, a: `Recalculate whenever your underlying assumptions change — interest rates shift, income changes, or goals evolve. A ${exampleVal3}-month review cycle is a good practice for most scenarios.` },
      { q: `What is the single most impactful variable in ${topic}?`, a: `Time horizon typically has the largest effect. Extending your term by ${exampleVal3} periods often changes the result more than any other single input.` },
      { q: `Can I trust the ${topic} calculator for major financial decisions?`, a: `Yes, the calculator uses validated formulas. For major commitments like mortgages or retirement planning, use it as your primary estimation tool alongside professional advice.` },
    ],
    health: [
      { q: `How accurate is the ${topic} measurement?`, a: `The calculator's accuracy depends on your inputs. Use calibrated equipment and consistent measurement conditions. A variance of ${exampleVal1} units between readings is normal.` },
      { q: `How often should I measure ${topic}?`, a: `For trending purposes, measure at the same time of day under similar conditions. ${exampleVal3} measurements per week is sufficient for most health metrics.` },
      { q: `Does ${topic} vary by age or gender?`, a: `Yes, reference ranges differ by demographic. The calculator adjusts its benchmarks based on the demographic information you provide.` },
      { q: `When should I seek medical attention for abnormal ${topic}?`, a: `If your result exceeds ${exampleVal2} units or changes by more than ${exampleVal1}% between consecutive measurements, consult a healthcare provider.` },
    ],
    math: [
      { q: `What are the prerequisites for understanding ${topic}?`, a: `A solid grasp of basic arithmetic and introductory algebra is recommended. The calculator includes step-by-step explanations to help fill knowledge gaps.` },
      { q: `Where is ${topic} used outside the classroom?`, a: `${topic} appears in engineering, computer science, physics, economics, and data analysis. It is a foundational concept with broad applicability.` },
      { q: `What is the most common mistake when calculating ${topic}?`, a: `Misapplying the formula or using incorrect units are the most frequent errors. The calculator validates inputs to catch these before computing.` },
    ],
  }
  // Array.isArray guards: a malformed dict value (e.g. a next-intl key-path string)
  // must fall back to the built-in English content instead of crashing `.map`/`.split`.
  const dictFaqs = dict && Array.isArray(dict.defaultFaqs) && dict.defaultFaqs.length ? dict.defaultFaqs : undefined
  const defaultFaqs = dictFaqs ?? [
    { q: `What is the most common mistake in ${topic} calculation?`, a: `Using inconsistent units or misreading the formula produces the most errors. The calculator validates inputs automatically to catch these issues.` },
    { q: `How accurate is this ${topic} calculator?`, a: `The calculator uses validated formulas for ${ctx.precisionContext} results. Your result's accuracy depends primarily on the quality of your input data.` },
    { q: `Can I use this calculator for professional work?`, a: `Yes, it employs professional-grade formulas. For regulated industries, verify critical results with certified tools as an additional check.` },
  ]
  const pool = dict?.faqPools?.[cat]?.length ? dict.faqPools[cat] : (faqPools[category] || defaultFaqs)
  const faqItems = []
  for (let i = 0; i < Math.min(3, pool.length); i++) {
    const idx = (seed + i * 17) % pool.length
    faqItems.push({ heading: fillTemplate(pool[idx].q, LP), text: fillTemplate(pool[idx].a, LP) })
  }

  // Build example walkthrough with calculator-specific numbers
  const LF = dict?.longFormFixed
  const exampleSec = {
    title: LF?.walkTitle ? fillTemplate(LF.walkTitle, LP) : `Walkthrough: Calculating ${topic} Step by Step`,
    content: LF?.walkContent ? fillTemplate(LF.walkContent, LP) : `Let us work through a practical example using realistic values. This step-by-step walkthrough shows exactly how the ${topic} calculator processes your inputs to produce the final result. Follow along with your own numbers to see how the calculation applies to your situation.`,
    subsections: [
      { heading: LF?.walkSetup ? fillTemplate(LF.walkSetup, LP) : `Setting Up with Value ${exampleVal1}`, text: LF?.walkSetupText ? fillTemplate(LF.walkSetupText, LP) : `Start by entering ${exampleVal1} as your primary input. Set secondary parameters to their defaults. The calculator validates these inputs and prepares the formula. The intermediate result at this stage is ${(parseInt(exampleVal1)*(seed%20+80)/100).toFixed(1)}.` },
      { heading: LF?.walkAdjust ? fillTemplate(LF.walkAdjust, LP) : `Adjusting to ${exampleVal2}`, text: LF?.walkAdjustText ? fillTemplate(LF.walkAdjustText, LP) : `Change the primary input to ${exampleVal2}. Observe how the output changes in real time. The difference between the two results is ${(parseInt(exampleVal2)-parseInt(exampleVal1))} units, demonstrating the sensitivity of the calculation to this variable.` },
      { heading: LF?.walkInterpret ? fillTemplate(LF.walkInterpret, LP) : 'Interpreting the Final Result', text: LF?.walkInterpretText ? fillTemplate(LF.walkInterpretText, LP) : `The calculated value represents your ${topic.toLowerCase()} under the given assumptions. Compare it to the reference ranges displayed alongside the result. If the value falls within the expected range (typically between ${(parseInt(exampleVal1)*0.8).toFixed(0)} and ${(parseInt(exampleVal2)*1.2).toFixed(0)}), your scenario aligns with normal parameters.` },
    ],
  }

  const sections: LongFormSection[] = [
    {
      title: LF?.guideTitle ? fillTemplate(LF.guideTitle, LP) : `A Complete Guide to ${topic}`,
      content: LF?.guideContent ? fillTemplate(LF.guideContent, LP) : `${description} This guide explains the core concepts, the mathematics behind the calculation, and how to apply the results in real-world situations. Whether you are new to ${topic.toLowerCase()} or looking to deepen your understanding, you will find practical insights and clear explanations throughout.`,
    },
    {
      title: LF?.howCalcTitle ? fillTemplate(LF.howCalcTitle, LP) : `How ${topic} Is Calculated`,
      content: LF?.howCalcContent ? fillTemplate(LF.howCalcContent, LP) : `The ${topic} calculation follows a systematic process designed to produce reliable, repeatable results. Understanding this process helps you use the calculator more effectively and interpret results with confidence.`,
      subsections: [
        { heading: formula ? (LF?.coreFormula ? fillTemplate(LF.coreFormula, LP) : `The Core Formula: ${formula}`) : (LF?.coreLogic ? fillTemplate(LF.coreLogic, LP) : 'The Core Calculation Logic'), text: formula ? (LF?.coreFormulaText ? fillTemplate(LF.coreFormulaText, LP) : `The formula ${formula} is the foundation of this calculator. Each variable represents a specific input that you provide. The relationship between them determines your result.`) : (LF?.coreLogicText ? fillTemplate(LF.coreLogicText, LP) : `The calculator applies established ${ctx.methodLabel} to your inputs. Each step builds on the previous one, with intermediate values displayed for verification.`) },
        { heading: LF?.inputReq ? fillTemplate(LF.inputReq, LP) : 'Input Requirements', text: LF?.inputReqText ? fillTemplate(LF.inputReqText, LP) : `You need ${exampleVal3} key inputs for a complete calculation. Optional parameters allow fine-tuning for specific scenarios. The calculator guides you through each input with clear labels and format hints.` },
        { heading: LF?.processing ? fillTemplate(LF.processing, LP) : 'Processing and Validation', text: LF?.processingText ? fillTemplate(LF.processingText, LP) : `Before computing, the calculator validates that all inputs are within acceptable ranges and that units are consistent. If an input is unusual (e.g., ${exampleVal2} units where ${exampleVal1} is typical), the calculator flags it for review.` },
      ],
    },
    categorySpecificSection(),
    {
      title: LF?.tipsTitle ? fillTemplate(LF.tipsTitle, LP) : 'Expert Tips for Accurate Results',
      content: LF?.tipsContent ? fillTemplate(LF.tipsContent, LP) : `Follow these recommendations to get the most reliable results from the ${topic} calculator and avoid common pitfalls that can skew your calculations.`,
      subsections: [
        { heading: LF?.doubleCheck ? fillTemplate(LF.doubleCheck, LP) : `Double-Check ${ctx.tipArea}`, text: LF?.doubleCheckText ? fillTemplate(LF.doubleCheckText, LP) : `Errors in ${ctx.tipArea.toLowerCase()} are the most common source of inaccuracy. Verify each input against its source document or measurement. A ${exampleVal1}-unit mistake here can change the result by ${(parseInt(exampleVal1)*2).toFixed(0)} units.` },
        { heading: LF?.whatIf ? fillTemplate(LF.whatIf, LP) : 'Run Multiple What-If Scenarios', text: LF?.whatIfText ? fillTemplate(LF.whatIfText, LP) : `Test at least ${exampleVal3} different combinations of inputs to understand how sensitive the result is to each variable. This sensitivity analysis reveals which inputs matter most for your specific case.` },
        { heading: LF?.benchmarks ? fillTemplate(LF.benchmarks, LP) : 'Compare Against Benchmarks', text: LF?.benchmarksText ? fillTemplate(LF.benchmarksText, LP) : `The calculator provides reference ranges based on industry standards. Compare your result against these benchmarks to quickly assess whether it falls within expected parameters.` },
      ],
    },
    exampleSec,
    {
      title: LF?.faqTitle ? fillTemplate(LF.faqTitle, LP) : 'Frequently Asked Questions',
      content: LF?.faqContent ? fillTemplate(LF.faqContent, LP) : `Common questions about ${topic} and how this calculator handles them.`,
      subsections: faqItems,
    },
  ]

  return sections
}

/* ──────────────────────── Main Generator ──────────────────────── */

export function generateCalculatorContent(calc: CalculatorEntry, dict?: ContentEngineDict): CalculatorContent {
  const topic = extractTopic(calc.title)
  const P = { topic, topicLower: topic.toLowerCase() }
  const cat = calc.category as string
  const adj = dict?.adjectives?.[cat] ?? getHubAdjective(calc.category)

  const categoryUseCases = useCaseTemplates[calc.category]
  const categoryMistakes = commonMistakes[calc.category]
  const categoryGlossary = glossaryTerms[calc.category]
  const categoryConcepts = relatedConcepts[calc.category]
  const categoryComparisons = comparisonTemplates[calc.category]

  const whatIs = dict?.whatIs
    ? fillTemplate(dict.whatIs, {
        title: calc.title,
        topic,
        keyPhrase: calc.description.length > 20
          ? calc.description.charAt(0).toLowerCase() + calc.description.slice(1)
          : `calculate and analyze ${topic}`,
        persona: dict.audience?.[cat]?.persona ?? categoryAudience[calc.category].persona,
        activity: dict.audience?.[cat]?.activity ?? categoryAudience[calc.category].activity,
        goal: dict.audience?.[cat]?.goal ?? categoryAudience[calc.category].goal,
      })
    : buildWhatIs(calc)
  const useCases = dict?.useCases?.[cat]?.length
    ? dict.useCases[cat].map(u => ({ title: fillTemplate(u.title, P), description: fillTemplate(u.description, P) }))
    : categoryUseCases ? categoryUseCases(topic, calc) : []
  const commonMistakesList = dict?.mistakes?.[cat]?.length
    ? pickNBySlug(dict.mistakes[cat].map(m => ({ mistake: fillTemplate(m.mistake, P), solution: fillTemplate(m.solution, P) })), calc.slug, 4)
    : pickNBySlug(categoryMistakes, calc.slug, 4)
  const glossary = dict?.glossary?.[cat]?.length
    ? pickNBySlug(dict.glossary[cat], calc.slug, 6)
    : pickNBySlug(categoryGlossary, calc.slug, 6)
  const relatedConceptsList = dict?.concepts?.[cat]?.length
    ? pickNBySlug(dict.concepts[cat], calc.slug, 6)
    : pickNBySlug(categoryConcepts, calc.slug, 6)
  const comparisons = dict?.comparisons?.[cat]?.length
    ? dict.comparisons[cat].map(c => ({
        title: fillTemplate(c.title, P),
        items: c.items.map(i => ({ label: i.label, manual: fillTemplate(i.manual, P), calculator: fillTemplate(i.calculator, P) })),
        summary: fillTemplate(c.summary, P),
      }))
    : categoryComparisons ? categoryComparisons(topic) : []
  const dictPros = dict && Array.isArray(dict.pros) && dict.pros.length ? dict.pros : undefined
  const dictCons = dict && Array.isArray(dict.cons) && dict.cons.length ? dict.cons : undefined
  const prosCons: ProsCons = {
    pros: (dictPros ?? [
      `Instant ${topic} results with no manual calculation required`,
      `Built-in ${getHubAdjective(calc.category).toLowerCase()} formulas validated by professionals`,
      `Interactive charts and visual breakdowns for better understanding`,
      `Free to use with no registration or download needed`,
      `Works on any device with internet access`,
    ]).map(s => fillTemplate(s, { ...P, adj: adj.toLowerCase() })),
    cons: (dictCons ?? [
      `Requires internet connection for access`,
      `Results are estimates based on provided inputs and assumptions`,
      `Limited to predefined calculation types and parameters`,
      `Should not replace professional advice for critical decisions`,
    ]).map(s => fillTemplate(s, P)),
  }
  const dictAlternatives = dict && Array.isArray(dict.alternatives) && dict.alternatives.length ? dict.alternatives : undefined
  const alternatives = dictAlternatives
    ? dictAlternatives.map(a => ({ name: fillTemplate(a.name, { ...P, category: cat, adj }), description: fillTemplate(a.description, { ...P, category: cat, adj }) }))
    : buildAlternatives(calc)
  const dictRecommendations = dict && Array.isArray(dict.recommendations) && dict.recommendations.length ? dict.recommendations : undefined
  const expertRecommendations = dictRecommendations
    ? dictRecommendations.map(r => fillTemplate(r, P))
    : buildExpertRecommendations(calc)
  const relevantAudience = dict?.audiences?.[cat]?.length
    ? dict.audiences[cat]
    : buildRelevantAudience(calc)

  const slugKey = calc.slug.replace(/-calculator$/, '')
  const longForm = _longFormArticles[calc.slug] || _longFormArticles[slugKey]
    || generateCategoryLongForm(calc, dict)

  return {
    whatIs,
    useCases,
    commonMistakes: commonMistakesList,
    glossary,
    relatedConcepts: relatedConceptsList,
    comparisons,
    prosCons,
    alternatives,
    expertRecommendations,
    relevantAudience,
    longFormArticle: longForm,
  }
}
