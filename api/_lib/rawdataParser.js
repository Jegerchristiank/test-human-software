const fs = require("fs");
const path = require("path");

function normalizeNewlines(text) {
  return String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function stripBom(text) {
  if (!text) return "";
  return String(text).replace(/^\uFEFF/, "");
}

function normalizeSession(label) {
  const cleaned = String(label || "").trim().toLowerCase();
  if (!cleaned) return null;
  if (cleaned.includes("syge")) return "sygeeksamen";
  if (cleaned.includes("ordin")) return "ordinær";
  return cleaned;
}

function normalizeSpaces(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

const HUMAN_CATEGORY_LABELS = [
  "Cellebiologi",
  "Metabolisme (energiomsætning og temperaturregulering)",
  "Nervesystemet og sanserne",
  "Endokrinologi",
  "Bevægeapparatet",
  "Blodet og immunsystemet",
  "Lunger",
  "Mave-tarm og lever-galde",
  "Reproduktion",
  "Hjerte-kredsløb",
  "Nyrer",
];

const HUMAN_CATEGORY_CANONICAL = new Map(
  HUMAN_CATEGORY_LABELS.map((label) => [label.toLowerCase(), label])
);

const HUMAN_CATEGORY_ALIASES = {
  Anatomi: "Bevægeapparatet",
  "Bevægeapparatet": "Bevægeapparatet",
  Skelettet: "Bevægeapparatet",
  Skeletmuskulatur: "Bevægeapparatet",
  "Mekaniske egenskaber af tværstribet muskulatur (skeletmuskulatur)":
    "Bevægeapparatet",

  Cellebiologi: "Cellebiologi",
  "Cellens byggesten": "Cellebiologi",
  "Cellulære transportmekanismer": "Cellebiologi",
  Histologi: "Cellebiologi",
  "Histologi / anatomi": "Cellebiologi",

  Metabolisme: "Metabolisme (energiomsætning og temperaturregulering)",
  "Den kemiske basis for liv": "Metabolisme (energiomsætning og temperaturregulering)",
  Mitokondriet: "Metabolisme (energiomsætning og temperaturregulering)",
  "Cellebiologi – mitochondriet": "Metabolisme (energiomsætning og temperaturregulering)",
  "Nedbrydning af glukose": "Metabolisme (energiomsætning og temperaturregulering)",
  "Grundlæggende kemi og fysik – proteiner":
    "Metabolisme (energiomsætning og temperaturregulering)",
  Termoregulering: "Metabolisme (energiomsætning og temperaturregulering)",
  Temperaturregulering: "Metabolisme (energiomsætning og temperaturregulering)",
  "Kroppens temperaturregulering":
    "Metabolisme (energiomsætning og temperaturregulering)",
  "Negativ feedback og temperaturregulering":
    "Metabolisme (energiomsætning og temperaturregulering)",

  Nervesystemet: "Nervesystemet og sanserne",
  Sanserne: "Nervesystemet og sanserne",
  Lugtesansen: "Nervesystemet og sanserne",
  Smerte: "Nervesystemet og sanserne",

  Endokrinologi: "Endokrinologi",
  Hormoner: "Endokrinologi",
  "Hormoner – hypofysen": "Endokrinologi",
  Binyren: "Endokrinologi",

  Blodet: "Blodet og immunsystemet",
  "Blod og immunsystem": "Blodet og immunsystemet",
  "Blod og immunsystemet": "Blodet og immunsystemet",
  "Blodet og immunsystemet": "Blodet og immunsystemet",
  Immunsystemet: "Blodet og immunsystemet",
  Lymfesystemet: "Blodet og immunsystemet",

  Respiration: "Lunger",
  Lunger: "Lunger",
  Lungefysiologi: "Lunger",
  Respirationsfysiologi: "Lunger",
  Respirationssystemet: "Lunger",
  "Det respiratoriske system": "Lunger",
  Åndedrættet: "Lunger",
  Ventilation: "Lunger",
  Respirationsorganerne: "Lunger",
  "Respirationsorganerne – lungevolumen": "Lunger",
  "Lungefysiologi – alveolen og den respiratoriske membran": "Lunger",

  Fordøjelse: "Mave-tarm og lever-galde",
  Fordøjelseskanalen: "Mave-tarm og lever-galde",
  Fordøjelsessystemet: "Mave-tarm og lever-galde",
  "Fordøjelsessystemet – leveren": "Mave-tarm og lever-galde",
  "Mave-tarmkanalen": "Mave-tarm og lever-galde",
  "Mave-tarmkanalen – tyndtarmen": "Mave-tarm og lever-galde",
  Tyndtarmen: "Mave-tarm og lever-galde",
  "Leverens portåresystem": "Mave-tarm og lever-galde",
  "Lever og kredsløb": "Mave-tarm og lever-galde",

  Reproduktion: "Reproduktion",
  "Reproduktion (forplantning)": "Reproduktion",
  "Positiv feedback og generering af veer": "Reproduktion",
  Mælkeproduktion: "Reproduktion",

  Kredsløb: "Hjerte-kredsløb",
  Kredsløbet: "Hjerte-kredsløb",
  "Kredsløb/respiration": "Hjerte-kredsløb",
  Hjertekredsløb: "Hjerte-kredsløb",
  "Hjerte og kredsløb": "Hjerte-kredsløb",
  Hjertet: "Hjerte-kredsløb",
  "Hjertet og lungerne": "Hjerte-kredsløb",
  Blodkar: "Hjerte-kredsløb",
  Blodtryksregulering: "Hjerte-kredsløb",

  Nyrer: "Nyrer",
  Nyren: "Nyrer",
  "Nyrer og urinveje": "Nyrer",
  "Syre-base": "Nyrer",
  "Syre-base-regulering": "Nyrer",
};

const HUMAN_CATEGORY_LOOKUP = new Map();
Object.entries(HUMAN_CATEGORY_ALIASES).forEach(([key, value]) => {
  HUMAN_CATEGORY_LOOKUP.set(key, value);
  HUMAN_CATEGORY_LOOKUP.set(key.toLowerCase(), value);
});

function normalizeHumanCategory(value) {
  const cleaned = cleanText(value);
  if (!cleaned) return null;
  const alias =
    HUMAN_CATEGORY_LOOKUP.get(cleaned) ||
    HUMAN_CATEGORY_LOOKUP.get(cleaned.toLowerCase());
  if (alias) return alias;
  return HUMAN_CATEGORY_CANONICAL.get(cleaned.toLowerCase()) || null;
}

function invalidHumanCategory(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function parseMcqRawData(rawText) {
  const lines = normalizeNewlines(stripBom(rawText))
    .split("\n")
    .map((line) => line.replace(/\r$/, ""));
  const questions = [];
  let currentYear = null;
  let currentSession = null;
  let i = 0;

  const questionHeaderRe = /^Spørgsmål\s+(\d+)\s+[-–]\s+(.*)$/i;
  const yearHeaderRe = /^(\d{4})(?:\s*[-–]\s*(.*))?$/i;
  const correctRe = /\(korrekt\)/i;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i += 1;
      continue;
    }

    const yearMatch = line.match(yearHeaderRe);
    if (yearMatch) {
      currentYear = Number.parseInt(yearMatch[1], 10);
      currentSession = normalizeSession(yearMatch[2] || "");
      i += 1;
      continue;
    }

    const headerMatch = line.match(questionHeaderRe);
    if (headerMatch) {
      if (!currentYear) {
        throw new Error("Encountered a question header before a year header");
      }
      const number = Number.parseInt(headerMatch[1], 10);
      const rawCategory = String(headerMatch[2] || "").trim();
      const category = normalizeHumanCategory(rawCategory);
      if (!category) {
        throw invalidHumanCategory(
          `Unknown MCQ category '${rawCategory}' for question ${number}`
        );
      }
      i += 1;

      const questionLines = [];
      while (i < lines.length) {
        const possibleOption = lines[i];
        if (/^\s*[A-D]\./.test(possibleOption)) {
          break;
        }
        if (possibleOption.trim()) {
          questionLines.push(possibleOption.trim());
        }
        i += 1;
      }

      if (!questionLines.length) {
        throw new Error(`Missing question text for question ${number} (${category})`);
      }

      const options = [];
      let correctFound = false;
      for (const expectedLabel of ["A", "B", "C", "D"]) {
        if (i >= lines.length) {
          throw new Error(`Missing option ${expectedLabel} for question ${number} (${category})`);
        }
        const optionLine = lines[i].trim();
        const optionMatch = optionLine.match(new RegExp(`^${expectedLabel}\\.\\s*(.*)$`));
        if (!optionMatch) {
          throw new Error(`Unexpected option format near question ${number}: '${optionLine}'`);
        }
        let optionText = String(optionMatch[1] || "").trim();
        const isCorrect = correctRe.test(optionText);
        optionText = optionText.replace(correctRe, "").trim();
        options.push({ label: expectedLabel, text: optionText, isCorrect });
        correctFound = correctFound || isCorrect;
        i += 1;
      }

      if (!correctFound) {
        throw new Error(`No correct option flagged for question ${number} (${category})`);
      }

      const correctOption = options.find((option) => option.isCorrect);
      questions.push({
        year: currentYear,
        number,
        session: currentSession,
        category,
        text: questionLines.join(" "),
        options,
        correctLabel: correctOption ? correctOption.label : null,
      });
      continue;
    }

    i += 1;
  }

  return { items: questions };
}

const KORTSVAR_PATTERNS = {
  year: /^(\d{4})(?:\s*[-–]\s*(.*))?$/i,
  opgave: /^Opgave\s+(\d+)\.?(?:\s*(.*))?$/i,
  hovedemne: /^Hovedemne\s+(\d+)\s*[:–-]\s*(.*)$/i,
  subq: /^(?<label>[A-Za-z])\)\s*(.*)$/,
  undersp: /^Underspørgsmål\s+(\d+)\s*[-–]\s*(?:(?<label>[A-Za-z])\)\s*)?(.*)$/i,
};

const FIGURE_CUE_RE = /\b(figur|figurer|skitse|tegning|diagram|illustration)\b/i;
const REFERENCE_RE = /^(Pensum:|\(?P\.|\(?Fig\.|Fig\.|Figurer|Figur|p\.|P\.)/i;
const IMAGE_NAME_RE = /^(\d{4})(syg)?-(\d{2})-([a-zA-Z])(\d+)?$/i;
const HOVEDEMN_TITLE_RE = /^Hovedemne\s+\d+\s*[:–-]\s*/i;

function parseImageFilename(filePath) {
  const match = path.basename(filePath, path.extname(filePath)).match(IMAGE_NAME_RE);
  if (!match) return null;
  const year = Number.parseInt(match[1], 10);
  const session = match[2] ? "sygeeksamen" : null;
  const opgave = Number.parseInt(match[3], 10);
  const label = String(match[4] || "").toLowerCase();
  return { year, session, opgave, label };
}

function extractReference(line) {
  if (!line) return null;
  const stripped = line.trim();
  const lowered = stripped.toLowerCase();
  if (lowered.startsWith("kilde:")) {
    return stripped.split(":", 2)[1]?.trim() || "";
  }
  if (lowered.startsWith("pensum:")) {
    return stripped;
  }
  if (REFERENCE_RE.test(stripped)) {
    return stripped;
  }
  if (stripped.startsWith("(") && stripped.endsWith(")")) {
    if (lowered.includes("p.") || lowered.includes("side") || lowered.includes("fig")) {
      return stripped;
    }
  }
  return null;
}

function isHeadingLine(line) {
  if (!line) return false;
  const lowered = line.toLowerCase();
  if (lowered.startsWith("opgave") || lowered.startsWith("svar") || lowered.startsWith("pensum") || lowered.startsWith("underspørgsmål") || lowered.startsWith("hovedemne")) {
    return false;
  }
  if (extractReference(line)) return false;
  if (line.startsWith("(") && line.endsWith(")")) return false;
  if (KORTSVAR_PATTERNS.subq.test(line)) return false;
  if (line.endsWith(":") || line.endsWith(".") || line.endsWith("?")) return false;
  return true;
}

function isAnswerLine(rawLine, strippedLine) {
  if (rawLine.startsWith(" ") || rawLine.startsWith("\t")) return true;
  return strippedLine.toLowerCase().startsWith("svar:");
}

function parseKortsvarRawData(rawText, options = {}) {
  const lines = normalizeNewlines(stripBom(rawText)).split("\n");
  const questions = [];
  let currentYear = null;
  let currentSession = null;
  let opgaveNumber = null;
  let opgaveTitle = null;
  let opgaveIntroLines = [];
  let autoOpgaveNumber = 0;

  let currentLabel = null;
  let promptLines = [];
  let answerLines = [];
  let sources = [];
  let answerStarted = false;

  function finalizeQuestion() {
    if (!promptLines.length && !answerLines.length) {
      currentLabel = null;
      answerStarted = false;
      sources = [];
      return;
    }
    if (!currentYear) {
      throw new Error("Encountered a question before a year header");
    }
    if (opgaveNumber === null || opgaveTitle === null) {
      throw new Error(`Question missing opgave header near year ${currentYear}.`);
    }

    const prompt = normalizeSpaces(promptLines.join(" "));
    const answer = answerLines.map((line) => line.replace(/\s+$/g, "")).join("\n").trim();
    const intro = opgaveIntroLines.length ? normalizeSpaces(opgaveIntroLines.join(" ")) : null;

    if (!prompt) {
      currentLabel = null;
      answerStarted = false;
      sources = [];
      promptLines = [];
      answerLines = [];
      return;
    }

    questions.push({
      year: currentYear,
      session: currentSession,
      opgave: opgaveNumber,
      opgave_title: opgaveTitle,
      opgave_intro: intro,
      label: currentLabel ? String(currentLabel).toLowerCase() : null,
      prompt,
      answer,
      sources: sources.slice(),
      images: [],
    });

    currentLabel = null;
    promptLines = [];
    answerLines = [];
    sources = [];
    answerStarted = false;
  }

  let i = 0;
  let previousBlank = false;
  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      if (answerStarted && answerLines.length) {
        answerLines.push("");
      }
      previousBlank = true;
      i += 1;
      continue;
    }

    const yearMatch = line.match(KORTSVAR_PATTERNS.year);
    if (yearMatch) {
      finalizeQuestion();
      currentYear = Number.parseInt(yearMatch[1], 10);
      currentSession = normalizeSession(yearMatch[2] || "");
      opgaveNumber = null;
      opgaveTitle = null;
      opgaveIntroLines = [];
      autoOpgaveNumber = 0;
      i += 1;
      continue;
    }

    const opgaveMatch = line.match(KORTSVAR_PATTERNS.opgave);
    if (opgaveMatch) {
      finalizeQuestion();
      opgaveNumber = Number.parseInt(opgaveMatch[1], 10);
      autoOpgaveNumber = Math.max(autoOpgaveNumber, opgaveNumber);
      opgaveTitle = (opgaveMatch[2] || "").trim() || `Opgave ${opgaveNumber}`;
      opgaveIntroLines = [];
      i += 1;
      continue;
    }

    const hovedemneMatch = line.match(KORTSVAR_PATTERNS.hovedemne);
    if (hovedemneMatch) {
      finalizeQuestion();
      opgaveNumber = Number.parseInt(hovedemneMatch[1], 10);
      autoOpgaveNumber = Math.max(autoOpgaveNumber, opgaveNumber);
      opgaveTitle = (hovedemneMatch[2] || "").trim() || `Hovedemne ${opgaveNumber}`;
      opgaveIntroLines = [];
      i += 1;
      continue;
    }

    if (isHeadingLine(line)) {
      finalizeQuestion();
      autoOpgaveNumber += 1;
      opgaveNumber = autoOpgaveNumber;
      opgaveTitle = line;
      opgaveIntroLines = [];
      i += 1;
      continue;
    }

    const underspMatch = line.match(KORTSVAR_PATTERNS.undersp);
    if (underspMatch) {
      const label = underspMatch[2];
      const text = String(underspMatch[3] || "").trim();

      if (label) {
        finalizeQuestion();
        if (opgaveNumber === null) {
          opgaveNumber = Number.parseInt(underspMatch[1], 10);
          autoOpgaveNumber = Math.max(autoOpgaveNumber, opgaveNumber);
          if (opgaveTitle === null) {
            opgaveTitle = `Opgave ${opgaveNumber}`;
          }
        }
        currentLabel = label;
        promptLines = text ? [text] : [""];
        answerLines = [];
        sources = [];
        answerStarted = false;
        i += 1;
        continue;
      }

      let nextNonempty = null;
      for (let j = i + 1; j < lines.length; j += 1) {
        if (lines[j].trim()) {
          nextNonempty = lines[j].trim();
          break;
        }
      }
      if (nextNonempty && KORTSVAR_PATTERNS.subq.test(nextNonempty)) {
        opgaveIntroLines.push(line.replace(/:$/, ""));
        i += 1;
        continue;
      }

      finalizeQuestion();
      if (opgaveNumber === null) {
        opgaveNumber = Number.parseInt(underspMatch[1], 10);
        autoOpgaveNumber = Math.max(autoOpgaveNumber, opgaveNumber);
        if (opgaveTitle === null) {
          opgaveTitle = `Opgave ${opgaveNumber}`;
        }
      }
      currentLabel = null;
      promptLines = text ? [text] : [""];
      answerLines = [];
      sources = [];
      answerStarted = false;
      i += 1;
      continue;
    }

    const subqMatch = line.match(KORTSVAR_PATTERNS.subq);
    if (subqMatch) {
      finalizeQuestion();
      currentLabel = subqMatch[1];
      promptLines = [String(subqMatch[2] || "").trim()];
      answerLines = [];
      sources = [];
      answerStarted = false;
      i += 1;
      continue;
    }

    const reference = extractReference(line);
    if (reference !== null && (promptLines.length || answerStarted)) {
      if (reference) {
        sources.push(reference);
      }
      i += 1;
      continue;
    }

    if (!promptLines.length && !answerStarted) {
      let nextNonempty = null;
      for (let j = i + 1; j < lines.length; j += 1) {
        if (lines[j].trim()) {
          nextNonempty = lines[j].trim();
          break;
        }
      }
      if (nextNonempty && KORTSVAR_PATTERNS.subq.test(nextNonempty)) {
        opgaveIntroLines.push(line.replace(/:$/, ""));
        i += 1;
        continue;
      }

      currentLabel = null;
      promptLines = [line];
      answerLines = [];
      sources = [];
      answerStarted = false;
      i += 1;
      continue;
    }

    if (isAnswerLine(rawLine, line) || answerStarted || (previousBlank && promptLines.length)) {
      answerStarted = true;
      let content = line;
      if (content.toLowerCase().startsWith("svar:")) {
        content = content.split(":", 2)[1]?.trim() || "";
      }
      if (content) {
        answerLines.push(content);
      }
      i += 1;
      previousBlank = false;
      continue;
    }

    promptLines.push(line);
    i += 1;
    previousBlank = false;
  }

  finalizeQuestion();

  const grouped = new Map();
  questions.forEach((question) => {
    const key = [question.year, question.session || "", question.opgave, question.opgave_title].join("|");
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key).push(question);
  });

  grouped.forEach((group) => {
    const nonEmpty = group.filter((question) => String(question.answer || "").trim());
    if (nonEmpty.length !== 1) return;
    const fallback = nonEmpty[0];
    group.forEach((question) => {
      if (!String(question.answer || "").trim()) {
        question.answer = fallback.answer;
        if (!question.sources?.length && fallback.sources?.length) {
          question.sources = fallback.sources.slice();
        }
      }
    });
  });

  const imagesPath = options.imagesPath || path.resolve(__dirname, "..", "..", "billeder", "opgaver");
  if (!fs.existsSync(imagesPath)) {
    throw new Error(`Images folder not found: ${imagesPath}`);
  }

  const byKey = new Map();
  const byGroup = new Map();
  questions.forEach((question) => {
    const groupKey = [question.year, question.session || "", question.opgave].join("|");
    if (!byGroup.has(groupKey)) {
      byGroup.set(groupKey, []);
    }
    byGroup.get(groupKey).push(question);
    if (question.label) {
      byKey.set(
        [question.year, question.session || "", question.opgave, question.label.toLowerCase()].join("|"),
        question
      );
    }
  });

  const imagesByKey = new Map();
  const imagesByGroup = new Map();
  const imageFiles = fs
    .readdirSync(imagesPath)
    .filter((entry) => entry && entry !== ".DS_Store")
    .map((entry) => path.join(imagesPath, entry))
    .filter((entry) => fs.statSync(entry).isFile());

  imageFiles.forEach((image) => {
    const parsed = parseImageFilename(image);
    if (!parsed) return;
    const key = [parsed.year, parsed.session || "", parsed.opgave, parsed.label].join("|");
    const groupKey = [parsed.year, parsed.session || "", parsed.opgave].join("|");
    if (!imagesByKey.has(key)) {
      imagesByKey.set(key, []);
    }
    imagesByKey.get(key).push(image);
    if (!imagesByGroup.has(groupKey)) {
      imagesByGroup.set(groupKey, []);
    }
    imagesByGroup.get(groupKey).push(image);
  });

  const usedImages = new Set();

  function lookupImages(year, session, opgave, label) {
    const groupKey = [year, session || "", opgave].join("|");
    if (label) {
      const key = [year, session || "", opgave, label].join("|");
      let candidates = imagesByKey.get(key) || [];
      if (!candidates.length && session === "ordinær") {
        const fallbackKey = [year, "", opgave, label].join("|");
        candidates = imagesByKey.get(fallbackKey) || [];
      }
      if (!candidates.length && !session) {
        const fallbackKey = [year, "ordinær", opgave, label].join("|");
        candidates = imagesByKey.get(fallbackKey) || [];
      }
      return candidates;
    }
    let candidates = imagesByGroup.get(groupKey) || [];
    if (!candidates.length && session === "ordinær") {
      const fallbackKey = [year, "", opgave].join("|");
      candidates = imagesByGroup.get(fallbackKey) || [];
    }
    if (!candidates.length && !session) {
      const fallbackKey = [year, "ordinær", opgave].join("|");
      candidates = imagesByGroup.get(fallbackKey) || [];
    }
    return candidates;
  }

  questions.forEach((question) => {
    let images = [];
    if (question.label) {
      images = lookupImages(question.year, question.session, question.opgave, question.label.toLowerCase());
      if (!images.length && question.label.toLowerCase() === "a") {
        const groupKey = [question.year, question.session || "", question.opgave].join("|");
        const group = byGroup.get(groupKey) || [];
        const unlabeled = group.filter((item) => !item.label);
        if (unlabeled.length === 1) {
          images = lookupImages(question.year, question.session, question.opgave, null);
        }
      }
    } else {
      images = lookupImages(question.year, question.session, question.opgave, null);
    }

    if (!images.length && (FIGURE_CUE_RE.test(question.prompt) || FIGURE_CUE_RE.test(question.answer))) {
      images = lookupImages(question.year, question.session, question.opgave, null);
    }

    if (images.length) {
      images.forEach((image) => {
        usedImages.add(path.basename(image));
        const relPath = path.relative(path.resolve(__dirname, "..", ".."), image);
        if (!question.images.includes(relPath)) {
          question.images.push(relPath);
        }
      });
    }
  });

  const missingImages = [];
  questions.forEach((question) => {
    if (question.images.length) return;
    if (FIGURE_CUE_RE.test(question.prompt) || FIGURE_CUE_RE.test(question.answer)) {
      missingImages.push(`${question.year} ${question.opgave}${question.label || ""}: ${question.prompt}`);
    }
  });

  const unmatchedImages = imageFiles
    .map((filePath) => path.basename(filePath))
    .filter((name) => !usedImages.has(name));

  const payload = questions.map((question) => {
    const rawCategory =
      normalizeSpaces(String(question.opgave_title || "").replace(HOVEDEMN_TITLE_RE, "")) ||
      question.opgave_title ||
      "";
    const category = normalizeHumanCategory(rawCategory);
    if (!category) {
      throw invalidHumanCategory(
        `Unknown kortsvar category '${rawCategory}' for ${question.year} opgave ${question.opgave}`
      );
    }
    return {
      type: "short",
      year: question.year,
      session: question.session,
      category,
      opgave: question.opgave,
      opgaveTitle: question.opgave_title,
      opgaveIntro: question.opgave_intro,
      label: question.label,
      prompt: question.prompt,
      answer: question.answer,
      sources: Array.isArray(question.sources) ? question.sources : [],
      images: Array.isArray(question.images) ? question.images : [],
    };
  });

  return {
    items: payload,
    warnings: {
      missingImages,
      unmatchedImages,
    },
  };
}

const DISEASE_RESERVED_COLUMNS = new Set(["sygdom", "tyngde", "emne", "prioritet"]);
const DISEASE_SECTION_ORDER = [
  "Definition",
  "Forekomst",
  "Patogenese",
  "Ætiologi",
  "Symptomer og fund",
  "Diagnostik",
  "Følgetilstande",
  "Behandling",
  "Forebyggelse",
  "Prognose",
];
const PRIORITY_ALIASES = {
  "høj": "high",
  "hoej": "high",
  high: "high",
  mellem: "medium",
  middel: "medium",
  medium: "medium",
  lav: "low",
  low: "low",
  "ikke pensum": "excluded",
  "ikke-pensum": "excluded",
  "udgået": "excluded",
};
const PRIORITY_LABELS = {
  high: "Høj",
  medium: "Mellem",
  low: "Lav",
  excluded: "Ikke pensum",
};
const CATEGORY_ALIASES = {
  "bevæge": "Bevægelsesapparatet sygdomme",
  "bevægeapparatets sygdomme": "Bevægelsesapparatet sygdomme",
  "bevægelsesapparatet sygdomme": "Bevægelsesapparatet sygdomme",
  "gynækologi og obstetrik": "Gynækologiske sygdomme og obstetrik",
  "nyre- og urinsvejssygdomme": "Nyre og urinvejssygdomme",
};

function cleanText(value) {
  const text = String(value || "").replace(/\u00a0/g, " ");
  return text.replace(/\s+/g, " ").trim();
}

function slugify(text) {
  const lowered = String(text || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9æøå\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
  return lowered;
}

function normalizePriority(value) {
  const cleaned = cleanText(value).toLowerCase();
  if (!cleaned) return "medium";
  return PRIORITY_ALIASES[cleaned] || "medium";
}

function normalizeCategory(value) {
  const cleaned = cleanText(value);
  if (!cleaned) return "Ukendt";
  const alias = CATEGORY_ALIASES[cleaned.toLowerCase()];
  return alias || cleaned;
}

function normalizeHeader(header) {
  return cleanText(header).toLowerCase();
}

function splitTsvLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && ch === "\t") {
      fields.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  fields.push(current);
  return fields;
}

function readTsv(rawText) {
  const rows = normalizeNewlines(stripBom(rawText))
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line && line.split("\t").some((cell) => cell.trim()))
    .map((line) => splitTsvLine(line));
  return rows;
}

function alignRow(row, headerLen) {
  if (row.length === headerLen) return row;
  if (row.length < headerLen) {
    return row.concat(Array.from({ length: headerLen - row.length }, () => ""));
  }
  return row.slice(0, headerLen - 1).concat([row.slice(headerLen - 1).join(" ")]);
}

function parseRows(rows) {
  if (!rows.length) return { header: [], entries: [] };
  const header = rows[0].map((cell) => normalizeHeader(cell));
  const entries = rows.slice(1).map((row) => {
    const aligned = alignRow(row, header.length);
    const entry = {};
    header.forEach((key, idx) => {
      entry[key] = cleanText(aligned[idx]);
    });
    return entry;
  });
  return { header, entries };
}

function extractSections(entry, header) {
  const sections = [];
  header.forEach((column) => {
    if (!column || DISEASE_RESERVED_COLUMNS.has(column)) return;
    let title = column.charAt(0).toUpperCase() + column.slice(1);
    if (column === "symptomer og fund") {
      title = "Symptomer og fund";
    } else if (column === "følgetilstande") {
      title = "Følgetilstande";
    } else if (column === "ætiologi") {
      title = "Ætiologi";
    }
    const content = entry[column] || "";
    if (content) {
      sections.push({ title, content });
    }
  });
  return sections;
}

function sortSections(sections) {
  const order = new Map(DISEASE_SECTION_ORDER.map((label, index) => [label, index]));
  return sections.sort((a, b) => {
    const aIndex = order.has(a.title) ? order.get(a.title) : 999;
    const bIndex = order.has(b.title) ? order.get(b.title) : 999;
    if (aIndex !== bIndex) return aIndex - bIndex;
    return a.title.toLowerCase().localeCompare(b.title.toLowerCase(), "da");
  });
}

function parseSygdomslaereRawData(rawText) {
  const rows = readTsv(rawText);
  const { header, entries } = parseRows(rows);
  const diseases = [];
  const weights = new Map();
  const categories = new Map();

  entries.forEach((entry) => {
    const name = entry.sygdom || "";
    if (!name) return;
    const category = normalizeCategory(entry.emne || "");
    const weight = entry.tyngde || "";
    const priority = normalizePriority(entry.prioritet || "");
    let sections = extractSections(entry, header);
    sections = sortSections(sections);

    if (category) {
      categories.set(category, (categories.get(category) || 0) + 1);
    }
    if (weight) {
      weights.set(weight, (weights.get(weight) || 0) + 1);
    }

    diseases.push({
      id: slugify(name),
      name,
      category,
      weight,
      priority,
      priorityLabel: PRIORITY_LABELS[priority] || "Mellem",
      sections: sections.map((section) => ({ title: section.title, content: section.content })),
    });
  });

  const payload = {
    meta: {
      source: "rawdata-sygdomslaere.txt",
      generatedAt: new Date().toISOString(),
      sectionOrder: DISEASE_SECTION_ORDER,
      priorities: Object.keys(PRIORITY_LABELS),
      weights: Array.from(weights.keys()).sort((a, b) => a.localeCompare(b, "da")),
      categories: Array.from(categories.keys()).sort((a, b) => a.localeCompare(b, "da")),
    },
    diseases,
  };

  return { payload };
}

module.exports = {
  normalizeNewlines,
  stripBom,
  normalizeHumanCategory,
  HUMAN_CATEGORY_LABELS,
  parseMcqRawData,
  parseKortsvarRawData,
  parseSygdomslaereRawData,
};
