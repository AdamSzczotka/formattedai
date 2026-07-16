export const STYLE_PRESETS = {
  casual: {
    aggressiveness: 0.7,
    stripHedgeOpeners: true,
    stripResolutionClosers: true,
    shortParagraphs: true,
    maxParagraphSentences: 4,
    contractionMode: 'shortened',
    targetBurstiness: 0.7,
    cutFiller: false,
    emDashKeepRatio: 0.25,
  },
  academic: {
    aggressiveness: 0.45,
    stripHedgeOpeners: true,
    stripResolutionClosers: false,
    shortParagraphs: false,
    maxParagraphSentences: 8,
    contractionMode: 'expanded',
    targetBurstiness: 0.55,
    cutFiller: false,
    emDashKeepRatio: 0.5,
  },
  direct: {
    aggressiveness: 0.85,
    stripHedgeOpeners: true,
    stripResolutionClosers: true,
    shortParagraphs: true,
    maxParagraphSentences: 2,
    contractionMode: 'shortened',
    targetBurstiness: 0.78,
    cutFiller: true,
    emDashKeepRatio: 0.15,
  },
};

export const PERSONAS = {
  pl: {
    casual: 'Zmęczony pracownik biura piszący na Slacku w piątek o 16. Pisze jasno, krótko, z lekkim rozluźnieniem. Rzadko używa złożonych zdań. Czasem rzuci "no" albo "więc".',
    academic: 'Doktorant piszący rozdział pracy. Staranny ale bez ozdobników. Unika górnolotnych zwrotów i wstępów typu "W dzisiejszym świecie". Pisze konkretnie, bez lania wody.',
    direct: 'Senior inżynier piszący jednoakapitowy email do zajętego CEO. Każde zdanie ma sens. Bez wstępów, bez podsumowań, bez fillerów. Maksymalnie 2 zdania na akapit.',
  },
  en: {
    casual: 'A tired office worker writing on Slack at 4pm Friday. Writes clearly, briefly, slightly informal. Rarely uses complex sentences. Throws in occasional "well" or "so".',
    academic: 'A graduate student writing a thesis section. Careful but not flowery. Avoids grand openers like "In today\'s world". Writes concretely, without filler.',
    direct: 'A senior engineer writing a one-paragraph email to a busy CEO. Every sentence earns its place. No openers, no closers, no fillers. Max 2 sentences per paragraph.',
  },
};

export const REBUILD_RULES = {
  pl: {
    avoidWords: ['zagłębić', 'zagłębiamy', 'krajobraz', 'tkanka', 'kompleksowy', 'rewolucjonizować', 'synergia', 'holistyczny', 'bezprecedensowy', 'transformować', 'kluczowy', 'fundamentalny', 'innowacyjny', 'przełomowy', 'wszechstronny'],
    avoidPhrases: ['warto zauważyć', 'warto podkreślić', 'należy pamiętać', 'nie ulega wątpliwości', 'w dzisiejszym świecie', 'w dobie', 'w erze', 'podsumowując', 'reasumując', 'na zakończenie', 'pamiętajmy że'],
  },
  en: {
    avoidWords: ['delve', 'tapestry', 'navigate', 'leverage', 'robust', 'unprecedented', 'pivotal', 'holistic', 'seamless', 'cutting-edge', 'groundbreaking', 'revolutionary', 'transformative', 'utilize', 'foster', 'harness', 'embark'],
    avoidPhrases: ["it's important to note", 'it is important to note', 'in conclusion', 'in summary', 'to sum up', "in today's world", 'in the era of', 'at the end of the day', 'a testament to', 'in the realm of'],
  },
};

export function getPreset(name) {
  return STYLE_PRESETS[name] || STYLE_PRESETS.casual;
}

export function getPersona(lang, preset) {
  return (PERSONAS[lang] && PERSONAS[lang][preset]) || PERSONAS.en.casual;
}

export function getRebuildRules(lang) {
  return REBUILD_RULES[lang] || REBUILD_RULES.en;
}
