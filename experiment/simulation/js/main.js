var index;

function getSelectedValue() {
  getdata(document.getElementById("userWord").value);
  return false;
}

function getdata(ind) {
  if (ind == "null") {
    alert("Select word");
    document.getElementById("fldiv").innerHTML = "";
    return;
  }
  $("#fldiv").load(
    "exp1.php?index=" +
      ind +
      "&root=%&category=%&gender=%&form=%&person=%&tense=%&reference=%&turn=%",
  );
}

var lang;
var src;

function getOption(temp) {
  temp1 = temp.split("_");
  lang = temp1[0];
  scr = temp1[1];
  document.getElementById("option").innerHTML = "";
  document.getElementById("fldiv").innerHTML = "";

  if (lang == "null") {
    alert("Select language");
    return;
  }
  $("#option").load("exp1_opt.php?lang=" + lang + "&script=" + scr);
}

(function (i, s, o, g, r, a, m) {
  i["GoogleAnalyticsObject"] = r;
  ((i[r] =
    i[r] ||
    function () {
      (i[r].q = i[r].q || []).push(arguments);
    }),
    (i[r].l = 1 * new Date()));
  ((a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]));
  a.async = 1;
  a.src = g;
  m.parentNode.insertBefore(a, m);
})(window, document, "script", "//www.google-analytics.com/analytics.js", "ga");
ga("create", "UA-67558473-1", "auto");
ga("send", "pageview");

function normalizeFeatureValue(val) {
  if (val === null || val === undefined || val === "") return "N/A";

  const strVal = String(val).trim();
  if (!strVal) return "N/A";

  const lowered = strVal.toLowerCase();
  if (lowered === "na" || lowered === "n/a") return "N/A";
  if (lowered === "roman") return "Roman";
  if (lowered === "devanagari") return "Devanagari";
  if (lowered === "direct") return "Direct";
  if (lowered === "oblique") return "Oblique";

  return lowered;
}

function parseFeatureLine(line) {
  const parts = line.split("\t").map((part) => part.trim());

  while (parts.length > 0 && parts[parts.length - 1] === "") {
    parts.pop();
  }

  if (parts.length < 9) return null;

  const isScriptToken = (token) => {
    const t = String(token || "").toLowerCase();
    return t === "roman" || t === "devanagari";
  };

  let scriptIndex = -1;
  for (let i = parts.length - 1; i >= 0; i--) {
    if (isScriptToken(parts[i])) {
      scriptIndex = i;
      break;
    }
  }

  if (scriptIndex <= 0) return null;

  const word = parts[0];
  const root = parts[1];
  const category = parts[2];
  const gender = parts[3];
  const number = parts[4];
  const case_ = parts[5];
  const person = parts[6] || "N/A";
  const lang = (parts[scriptIndex - 1] || "").toLowerCase();
  const script = parts[scriptIndex] || "";
  const tense = parts[scriptIndex + 1] || "N/A";

  return {
    word,
    root,
    category,
    gender,
    number,
    case_,
    person,
    lang,
    script,
    tense,
  };
}

// Data Management Class
class FeaturesManager {
  constructor() {
    this.wordData = new Map();
    this.allTenses = new Set();
    this.allCategories = new Set();
    this.allGendersByLang = {};
    this.allPersonsByLang = {};
    this.allNumbersByLang = {};
    this.allScriptsByLang = {};
    this.allCasesByLang = {};
    this.currentWord = null;
    this.isLoaded = false;
  }

  async loadFeatures() {
    try {
      const response = await fetch("features.txt");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const text = await response.text();
      if (!text || text.trim().length === 0)
        throw new Error("Loaded file is empty");

      const lines = text.split("\n").filter((line) => line.trim());
      this.processFeatures(lines);

      this.isLoaded = true;
      console.log("Features loaded from: features.txt");
      //console.log('✅ Features loaded successfully');
      //this.logLoadedOptions();
    } catch (error) {
      console.error("❌ Failed to load features:", error);
      this.isLoaded = false;
    }
  }

  processFeatures(lines) {
    lines.forEach((line) => {
      if (!line.trim()) return;

      const parsed = parseFeatureLine(line);
      if (!parsed) return;

      const {
        word,
        root,
        category,
        gender,
        number,
        case_,
        person,
        lang,
        script,
        tense,
      } = parsed;

      if (!word || !lang || lang === "N/A") return;

      if (!this.wordData.has(word)) {
        this.wordData.set(word, {
          root: new Set(),
          category: new Set(),
          gender: new Set(),
          number: new Set(),
          person: new Set(),
          script: new Set(),
          case: new Set(),
          tense: new Set(),
          language: lang,
          features: [],
        });
      }

      const wordInfo = this.wordData.get(word);

      if (!this.allGendersByLang[lang]) this.allGendersByLang[lang] = new Set();
      if (!this.allPersonsByLang[lang]) this.allPersonsByLang[lang] = new Set();
      if (!this.allNumbersByLang[lang]) this.allNumbersByLang[lang] = new Set();
      if (!this.allScriptsByLang[lang]) this.allScriptsByLang[lang] = new Set();
      if (!this.allCasesByLang[lang]) this.allCasesByLang[lang] = new Set();

      const normalizeValue = (val) => normalizeFeatureValue(val);

      if (root && root !== "N/A") wordInfo.root.add(root);
      if (category && category !== "N/A" && category !== "na") {
        const normalizedCategory = normalizeValue(category);
        wordInfo.category.add(normalizedCategory);
        this.allCategories.add(normalizedCategory);
      }

      const normalizedGender = normalizeValue(gender);
      const normalizedNumber = normalizeValue(number);
      const normalizedPerson = normalizeValue(person);
      const normalizedScript = normalizeValue(script);
      const normalizedCase = normalizeValue(case_);
      const normalizedTense = normalizeValue(tense);

      const effectiveGender = lang === "en" ? "N/A" : normalizedGender;

      if (effectiveGender !== "N/A") {
        wordInfo.gender.add(effectiveGender);
        this.allGendersByLang[lang].add(effectiveGender);
      }
      if (normalizedNumber !== "N/A") {
        wordInfo.number.add(normalizedNumber);
        this.allNumbersByLang[lang].add(normalizedNumber);
      }
      if (normalizedPerson !== "N/A") {
        wordInfo.person.add(normalizedPerson);
        this.allPersonsByLang[lang].add(normalizedPerson);
      }
      if (normalizedScript !== "N/A") {
        wordInfo.script.add(normalizedScript);
        this.allScriptsByLang[lang].add(normalizedScript);
      }
      if (normalizedCase !== "N/A") {
        wordInfo.case.add(normalizedCase);
        this.allCasesByLang[lang].add(normalizedCase);
      }
      if (normalizedTense !== "N/A") {
        wordInfo.tense.add(normalizedTense);
        this.allTenses.add(normalizedTense);
      }

      wordInfo.features.push({
        root: normalizeValue(root),
        category: normalizeValue(category),
        gender: effectiveGender,
        number: normalizeValue(number),
        person: normalizeValue(person),
        script: normalizeValue(script),
        case: normalizeValue(case_),
        tense: normalizeValue(tense),
      });
    });

    for (const lang in this.allScriptsByLang) {
      if (lang === "hi") {
        this.allScriptsByLang[lang].add("Devanagari");
        this.allScriptsByLang[lang].add("Roman");
        this.allCasesByLang[lang].add("Direct");
        this.allCasesByLang[lang].add("Oblique");
      } else if (lang === "en") {
        this.allScriptsByLang[lang].add("Roman");
        this.allScriptsByLang[lang].add("Devanagari");
        this.allCasesByLang[lang].add("Direct");
        this.allCasesByLang[lang].add("Oblique");
      }
    }

    for (const lang in this.allGendersByLang) {
      this.allGendersByLang[lang].add("N/A");
      this.allPersonsByLang[lang].add("N/A");
      this.allNumbersByLang[lang].add("N/A");
      this.allCasesByLang[lang].add("N/A");
      this.allScriptsByLang[lang].add("N/A");
    }

    this.allTenses.add("N/A");
    this.allTenses.delete("roman");
    this.allTenses.delete("Roman");
  }

  logLoadedOptions() {
    console.log("Loaded options for English:");
    console.log(
      "Script:",
      Array.from(this.allScriptsByLang["en"] || []).sort(),
    );
    console.log("Case:", Array.from(this.allCasesByLang["en"] || []).sort());
    console.log(
      "Gender:",
      Array.from(this.allGendersByLang["en"] || []).sort(),
    );
    console.log(
      "Number:",
      Array.from(this.allNumbersByLang["en"] || []).sort(),
    );
    console.log(
      "Person:",
      Array.from(this.allPersonsByLang["en"] || []).sort(),
    );
    console.log("Loaded options for Hindi:");
    console.log(
      "Script:",
      Array.from(this.allScriptsByLang["hi"] || []).sort(),
    );
    console.log("Case:", Array.from(this.allCasesByLang["hi"] || []).sort());
    console.log(
      "Gender:",
      Array.from(this.allGendersByLang["hi"] || []).sort(),
    );
    console.log(
      "Number:",
      Array.from(this.allNumbersByLang["hi"] || []).sort(),
    );
    console.log(
      "Person:",
      Array.from(this.allPersonsByLang["hi"] || []).sort(),
    );
    console.log("All Tenses:", Array.from(this.allTenses).sort());
  }

  getWordsForLanguage(lang) {
    const words = [];
    this.wordData.forEach((info, word) => {
      if (info.language === lang) {
        words.push(word);
      }
    });

    return words.sort();
  }

  getRootOptions(word, selectedCategory = "") {
    if (!this.wordData.has(word)) return new Set();
    const wordInfo = this.wordData.get(word);
    const roots = new Set();

    const normalizedCategory = normalizeFeatureValue(selectedCategory);
    const hasCategoryFilter =
      selectedCategory && normalizedCategory && normalizedCategory !== "N/A";

    if (hasCategoryFilter) {
      wordInfo.features.forEach((feature) => {
        if (
          normalizeFeatureValue(feature.category) === normalizedCategory &&
          feature.root &&
          normalizeFeatureValue(feature.root) !== "N/A"
        ) {
          roots.add(feature.root);
        }
      });
    }

    if (roots.size > 0) {
      return roots;
    }

    if (wordInfo.root.size > 0) {
      return new Set(wordInfo.root);
    }

    const fallbackRoot = normalizeFeatureValue(word);
    return new Set([fallbackRoot]);
  }

  validateFeatures(word, selectedFeatures) {
    if (!this.wordData.has(word)) return false;
    const wordInfo = this.wordData.get(word);

    for (const feature of wordInfo.features) {
      let allMatch = true;
      for (const [key, value] of Object.entries(selectedFeatures)) {
        const featureValue = feature[key];
        if (featureValue !== value) {
          allMatch = false;
          break;
        }
      }
      if (allMatch) return true;
    }
    return false;
  }

  getFeatureOptions(word) {
    if (!this.wordData.has(word)) return null;
    const wordInfo = this.wordData.get(word);
    const lang = wordInfo.language;

    const collectValues = (key) => {
      const values = new Set();
      wordInfo.features.forEach((feature) => {
        values.add(normalizeFeatureValue(feature[key]));
      });
      return values;
    };

    return {
      root: this.getRootOptions(word),
      category: collectValues("category"),
      gender: this.allGendersByLang[lang] || new Set(["N/A"]),
      number: this.allNumbersByLang[lang] || new Set(["N/A"]),
      person: this.allPersonsByLang[lang] || new Set(["N/A"]),
      script: this.allScriptsByLang[lang] || new Set(["N/A"]),
      case: this.allCasesByLang[lang] || new Set(["N/A"]),
      tense: this.allTenses,
    };
  }
}

// Global instance
const featuresManager = new FeaturesManager();

// DOM Elements
const languageSelect = document.getElementById("language");
const wordSelect = document.getElementById("word");
const rootSelect = document.getElementById("root");
const categorySelect = document.getElementById("category");
const genderSelect = document.getElementById("gender");
const numberSelect = document.getElementById("number");
const personSelect = document.getElementById("person");
const scriptSelect = document.getElementById("script");
const caseSelect = document.getElementById("case");
const tenseSelect = document.getElementById("tense");
const checkButton = document.getElementById("checkButton");
const showAnswerButton = document.getElementById("showAnswerButton");
const feedbackContainer = document.getElementById("feedback");
const answerContainer = document.getElementById("answer");

// Track if user previously submitted an incorrect answer
let previouslyIncorrect = false;

// Function to get distractors for a feature
function getDistractors(featureType, correctValue, count = 3) {
  const allValues = commonFeatures[featureType] || [];
  const distractors = allValues.filter(
    (value) => value !== correctValue && value !== "N/A",
  );
  return distractors.sort(() => Math.random() - 0.5).slice(0, count);
}

// Function to generate root distractors (now: all word forms sharing the same root and language)
function getRootDistractors(selectedWord) {
  // Get the word info for the selected word
  const wordInfo = featuresManager.wordData.get(selectedWord);
  if (!wordInfo) return [];
  const root = Array.from(wordInfo.root)[0];
  const lang = wordInfo.language;
  if (!root || !lang) return [];
  // Find all words in wordData that share this root and language
  const similarWords = Array.from(featuresManager.wordData.entries())
    .filter(([word, info]) => info.language === lang && info.root.has(root))
    .map(([word, _]) => word)
    .filter((word) => word && word !== "N/A");
  // Remove duplicates and sort
  return Array.from(new Set(similarWords)).sort();
}

// Initialize the application
async function init() {
  try {
    await featuresManager.loadFeatures();
    setupEventListeners();
    setupInstructionsPanel();
    setupInfoIcons();
  } catch (error) {
    console.error("Error loading features data:", error);
    showFeedback("Error loading features data. Please try again.", "error");
  }
}

// Process the features.txt data
function processFeaturesData(text) {
  const lines = text.split("\n");
  lines.forEach((line) => {
    if (!line.trim()) return;

    const [
      word,
      root,
      category,
      gender,
      number,
      case_,
      person,
      lang,
      script,
      tense,
    ] = line.split("\t");

    // Skip empty or invalid entries
    if (!word || !lang || lang === "N/A") return;

    if (!wordData.has(word)) {
      wordData.set(word, {
        root: new Set(),
        category: new Set(),
        gender: new Set(),
        number: new Set(),
        person: new Set(),
        script: new Set(),
        case: new Set(),
        tense: new Set(),
        language: lang,
        features: [],
      });
    }

    const wordInfo = wordData.get(word);

    // Initialize language-specific sets if they don't exist
    if (!allGendersByLang[lang]) allGendersByLang[lang] = new Set();
    if (!allPersonsByLang[lang]) allPersonsByLang[lang] = new Set();
    if (!allNumbersByLang[lang]) allNumbersByLang[lang] = new Set();
    if (!allScriptsByLang[lang]) allScriptsByLang[lang] = new Set();
    if (!allCasesByLang[lang]) allCasesByLang[lang] = new Set();

    // Normalize values to handle inconsistencies
    const normalizeValue = (val) => {
      if (!val || val.toLowerCase() === "na" || val.toLowerCase() === "n/a")
        return "N/A";
      if (val.toLowerCase() === "roman") return "Roman";
      if (val.toLowerCase() === "devanagari") return "Devanagari";
      if (val.toLowerCase() === "direct") return "Direct";
      if (val.toLowerCase() === "oblique") return "Oblique";
      return val.toLowerCase();
    };

    // Only add non-N/A values
    if (root && root !== "N/A") wordInfo.root.add(root);
    if (category && category !== "N/A" && category !== "na")
      allCategories.add(category.toLowerCase());
    if (gender) {
      const normalizedGender = normalizeValue(gender);
      if (normalizedGender !== "N/A") {
        wordInfo.gender.add(normalizedGender);
        allGendersByLang[lang].add(normalizedGender);
      }
    }
    if (number) {
      const normalizedNumber = normalizeValue(number);
      if (normalizedNumber !== "N/A") {
        wordInfo.number.add(normalizedNumber);
        allNumbersByLang[lang].add(normalizedNumber);
      }
    }
    if (person) {
      const normalizedPerson = normalizeValue(person);
      if (normalizedPerson !== "N/A") {
        wordInfo.person.add(normalizedPerson);
        allPersonsByLang[lang].add(normalizedPerson);
      }
    }
    if (script) {
      const normalizedScript = normalizeValue(script);
      if (normalizedScript !== "N/A") {
        wordInfo.script.add(normalizedScript);
        allScriptsByLang[lang].add(normalizedScript);
      }
    }
    if (case_) {
      const normalizedCase = normalizeValue(case_);
      if (normalizedCase !== "N/A") {
        wordInfo.case.add(normalizedCase);
        allCasesByLang[lang].add(normalizedCase);
      }
    }
    if (tense) {
      const normalizedTense = normalizeValue(tense);
      if (normalizedTense !== "N/A") {
        wordInfo.tense.add(normalizedTense);
        allTenses.add(normalizedTense);
      }
    }

    // Store normalized values in features
    wordInfo.features.push({
      root: normalizeValue(root),
      category: normalizeValue(category),
      gender: normalizeValue(gender),
      number: normalizeValue(number),
      person: normalizeValue(person),
      script: normalizeValue(script),
      case: normalizeValue(case_),
      tense: normalizeValue(tense),
    });
  });

  // Set language-specific required options based on what's actually in the data
  // but ensure users can try different options for learning purposes
  for (const lang in allScriptsByLang) {
    if (lang === "hi") {
      // Hindi can have both scripts for learning purposes
      allScriptsByLang[lang].add("Devanagari");
      allScriptsByLang[lang].add("Roman");
      // Hindi can have both cases
      allCasesByLang[lang].add("Direct");
      allCasesByLang[lang].add("Oblique");
    } else if (lang === "en") {
      // English primarily uses Roman script, but allow Devanagari for learning
      allScriptsByLang[lang].add("Roman");
      allScriptsByLang[lang].add("Devanagari"); // Allow for educational purposes
      // English can have Direct case, and allow Oblique for learning
      allCasesByLang[lang].add("Direct");
      allCasesByLang[lang].add("Oblique"); // Allow for educational purposes
    }
  }

  // Add N/A options where appropriate
  for (const lang in allGendersByLang) {
    // Gender N/A for both languages
    allGendersByLang[lang].add("N/A");

    // Person N/A for both languages
    allPersonsByLang[lang].add("N/A");

    // Number N/A for both languages
    allNumbersByLang[lang].add("N/A");

    // Case N/A for both languages
    allCasesByLang[lang].add("N/A");

    // Script N/A for both languages
    allScriptsByLang[lang].add("N/A");
  }

  // Add N/A to tenses and remove any erroneous values
  allTenses.add("N/A");
  // Remove 'roman' if it accidentally got added to tenses
  allTenses.delete("roman");
  allTenses.delete("Roman");

  // Log the loaded options for verification
  /* console.log('Loaded options for English:');
    console.log('Script:', Array.from(allScriptsByLang['en'] || []).sort());
    console.log('Case:', Array.from(allCasesByLang['en'] || []).sort());
    console.log('Gender:', Array.from(allGendersByLang['en'] || []).sort());
    console.log('Number:', Array.from(allNumbersByLang['en'] || []).sort());
    console.log('Person:', Array.from(allPersonsByLang['en'] || []).sort());
    console.log('Loaded options for Hindi:');
    console.log('Script:', Array.from(allScriptsByLang['hi'] || []).sort());
    console.log('Case:', Array.from(allCasesByLang['hi'] || []).sort());
    console.log('Gender:', Array.from(allGendersByLang['hi'] || []).sort());
    console.log('Number:', Array.from(allNumbersByLang['hi'] || []).sort());
    console.log('Person:', Array.from(allPersonsByLang['hi'] || []).sort());
    console.log('All Tenses:', Array.from(allTenses).sort()); */

  populateLanguageSelect();
  populateWordSelect();
}

// Populate the language select dropdown
function populateLanguageSelect() {
  const languages = new Set();
  featuresManager.wordData.forEach((info, word) => {
    if (info.language && info.language !== "N/A" && info.language !== "na") {
      languages.add(info.language);
    }
  });

  languageSelect.innerHTML = '<option value="">Select language...</option>';
  Array.from(languages)
    .sort()
    .forEach((lang) => {
      const option = document.createElement("option");
      option.value = lang;
      option.textContent =
        lang === "en" ? "English" : lang === "hi" ? "Hindi" : lang;
      languageSelect.appendChild(option);
    });
}

// Populate the word select dropdown
function populateWordSelect() {
  const selectedLang = languageSelect.value;
  if (!selectedLang) {
    wordSelect.innerHTML = '<option value="">Select a word...</option>';
    wordSelect.disabled = true;
    return;
  }

  const words = featuresManager.getWordsForLanguage(selectedLang);

  wordSelect.innerHTML = '<option value="">Select a word...</option>';
  words.forEach((word) => {
    const option = document.createElement("option");
    option.value = word;
    option.textContent = word;
    wordSelect.appendChild(option);
  });
  wordSelect.disabled = false;
}

// Setup event listeners
function setupEventListeners() {
  languageSelect.addEventListener("change", () => {
    populateWordSelect();
    clearAllFeatures();
    // Reset feedback and answer containers
    feedbackContainer.textContent = "";
    feedbackContainer.className = "feedback-container";
    answerContainer.innerHTML = "";
    answerContainer.className = "answer-container";
  });
  wordSelect.addEventListener("change", handleWordChange);
  rootSelect.addEventListener("change", handleFeatureChange);
  categorySelect.addEventListener("change", () => {
    updateRootOptionsForSelectedCategory();
    handleFeatureChange();
  });
  genderSelect.addEventListener("change", handleFeatureChange);
  numberSelect.addEventListener("change", handleFeatureChange);
  personSelect.addEventListener("change", handleFeatureChange);
  scriptSelect.addEventListener("change", handleFeatureChange);
  caseSelect.addEventListener("change", handleFeatureChange);
  tenseSelect.addEventListener("change", handleFeatureChange);
  checkButton.addEventListener("click", checkAnswer);
  showAnswerButton.addEventListener("click", showAnswer);
}

// Clear all feature selects
function clearAllFeatures() {
  [
    rootSelect,
    categorySelect,
    genderSelect,
    numberSelect,
    personSelect,
    scriptSelect,
    caseSelect,
    tenseSelect,
  ].forEach((select) => {
    select.innerHTML = '<option value="">Select...</option>';
    select.disabled = true;
  });
  checkButton.disabled = true;
  showAnswerButton.disabled = true;
  clearFeedback();
}

// Populate a feature select dropdown with distractors
function capitalizeFirst(str) {
  if (!str) return str;
  if (str === "N/A") return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function populateFeatureSelect(select, values, featureType) {
  select.innerHTML = '<option value="">Select...</option>';
  let valueArr = Array.from(values).filter(
    (v) => v && v.toLowerCase() !== "na",
  );

  // Sort values in a consistent order
  valueArr.sort((a, b) => {
    // Put N/A at the end
    if (a === "N/A") return 1;
    if (b === "N/A") return -1;
    return a.localeCompare(b);
  });

  // Handle special cases
  if (featureType === "root") {
    valueArr.forEach((val) => {
      if (val && val !== "N/A") {
        const option = document.createElement("option");
        option.value = val;
        option.textContent = capitalizeFirst(val);
        select.appendChild(option);
      }
    });
    return;
  }

  // Add options for all features
  valueArr.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = capitalizeFirst(value);
    select.appendChild(option);
  });

  // Always set default to empty (Select...)
  select.value = "";
}

// Handle word selection change
function handleWordChange() {
  const selectedWord = wordSelect.value;
  if (!selectedWord) {
    clearAllFeatures();
    return;
  }
  featuresManager.currentWord = selectedWord;
  const options = featuresManager.getFeatureOptions(selectedWord);
  if (!options) {
    clearAllFeatures();
    return;
  }

  populateFeatureSelect(rootSelect, options.root, "root");
  populateFeatureSelect(categorySelect, options.category, "category");
  populateFeatureSelect(genderSelect, options.gender, "gender");
  populateFeatureSelect(numberSelect, options.number, "number");
  populateFeatureSelect(personSelect, options.person, "person");
  populateFeatureSelect(scriptSelect, options.script, "script");
  populateFeatureSelect(caseSelect, options.case, "case");
  populateFeatureSelect(tenseSelect, options.tense, "tense");

  // Enable all dropdowns
  [
    rootSelect,
    categorySelect,
    genderSelect,
    numberSelect,
    personSelect,
    scriptSelect,
    caseSelect,
    tenseSelect,
  ].forEach((select) => {
    select.disabled = false;
  });

  checkButton.style.display = "";
  checkButton.disabled = false;
  showAnswerButton.disabled = false;

  updateRootOptionsForSelectedCategory();
}

function updateRootOptionsForSelectedCategory() {
  if (!featuresManager.currentWord) return;

  const selectedCategory = categorySelect.value;
  const rootOptions = featuresManager.getRootOptions(
    featuresManager.currentWord,
    selectedCategory,
  );
  const previousRoot = rootSelect.value;

  populateFeatureSelect(rootSelect, rootOptions, "root");

  if (
    previousRoot &&
    Array.from(rootOptions).some(
      (root) =>
        normalizeFeatureValue(root) === normalizeFeatureValue(previousRoot),
    )
  ) {
    rootSelect.value = previousRoot;
  }
}

// Handle feature selection change
function handleFeatureChange() {
  clearFeedback();
}

// Check the user's answer
function checkAnswer() {
  if (!featuresManager.currentWord) {
    showFeedback(
      "Please select a language and a word before checking the answer.",
      "error",
    );
    answerContainer.innerHTML = "";
    answerContainer.classList.remove("show");
    return;
  }

  const userAnswer = {
    root: normalizeFeatureValue(rootSelect.value),
    category: normalizeFeatureValue(categorySelect.value),
    gender: normalizeFeatureValue(genderSelect.value),
    number: normalizeFeatureValue(numberSelect.value),
    person: normalizeFeatureValue(personSelect.value),
    script: normalizeFeatureValue(scriptSelect.value),
    case: normalizeFeatureValue(caseSelect.value),
    tense: normalizeFeatureValue(tenseSelect.value),
  };

  if (Object.values(userAnswer).some((value) => value === "N/A")) {
    const unselectedLabels = [];
    if (!rootSelect.value) unselectedLabels.push("Root");
    if (!categorySelect.value) unselectedLabels.push("Category");
    if (!genderSelect.value) unselectedLabels.push("Gender");
    if (!numberSelect.value) unselectedLabels.push("Number");
    if (!personSelect.value) unselectedLabels.push("Person");
    if (!scriptSelect.value) unselectedLabels.push("Script");
    if (!caseSelect.value) unselectedLabels.push("Case");
    if (!tenseSelect.value) unselectedLabels.push("Tense");

    if (unselectedLabels.length > 0) {
      showFeedback(
        `Please select values for: ${unselectedLabels.join(", ")}.`,
        "error",
      );
      answerContainer.innerHTML = "";
      answerContainer.classList.remove("show");
      return;
    }
  }

  const wordInfo = featuresManager.wordData.get(featuresManager.currentWord);

  const normalizeFeatureObject = (feature) => ({
    root: normalizeFeatureValue(feature.root),
    category: normalizeFeatureValue(feature.category),
    gender: normalizeFeatureValue(feature.gender),
    number: normalizeFeatureValue(feature.number),
    person: normalizeFeatureValue(feature.person),
    script: normalizeFeatureValue(feature.script),
    case: normalizeFeatureValue(feature.case),
    tense: normalizeFeatureValue(feature.tense),
  });

  const normalizedFeatures = wordInfo.features.map(normalizeFeatureObject);
  const keys = [
    "root",
    "category",
    "gender",
    "number",
    "person",
    "script",
    "case",
    "tense",
  ];

  const exactMatch = normalizedFeatures.find((feature) =>
    keys.every((key) => feature[key] === userAnswer[key]),
  );

  let bestMatch = normalizedFeatures[0];
  let bestScore = -1;
  normalizedFeatures.forEach((feature) => {
    let score = 0;
    keys.forEach((key) => {
      if (feature[key] === userAnswer[key]) score += 1;
    });
    if (score > bestScore) {
      bestScore = score;
      bestMatch = feature;
    }
  });

  const labelByKey = {
    root: "Root",
    category: "Category",
    gender: "Gender",
    number: "Number",
    person: "Person",
    script: "Script",
    case: "Case",
    tense: "Tense",
  };

  const incorrectFeatures = keys
    .filter((key) => userAnswer[key] !== bestMatch[key])
    .map((key) => labelByKey[key]);

  [
    { el: rootSelect, key: "Root" },
    { el: categorySelect, key: "Category" },
    { el: genderSelect, key: "Gender" },
    { el: numberSelect, key: "Number" },
    { el: personSelect, key: "Person" },
    { el: scriptSelect, key: "Script" },
    { el: caseSelect, key: "Case" },
    { el: tenseSelect, key: "Tense" },
  ].forEach(({ el, key }) => {
    if (incorrectFeatures.includes(key)) {
      el.classList.add("highlight-incorrect");
    } else {
      el.classList.remove("highlight-incorrect");
    }
  });
  if (exactMatch && incorrectFeatures.length === 0) {
    showFeedback("Correct! All features match.", "success");
    const matchedFeature = exactMatch;
    const answerHTML = `
            <h3>Correct Features for "${featuresManager.currentWord}":</h3>
            <div><strong>Root:</strong> ${
              capitalizeCamelCase(matchedFeature.root) || "N/A"
            }</div>
            <div><strong>Category:</strong> ${
              capitalizeCamelCase(matchedFeature.category) || "N/A"
            }</div>
            <div><strong>Gender:</strong> ${
              capitalizeCamelCase(matchedFeature.gender) || "N/A"
            }</div>
            <div><strong>Number:</strong> ${
              capitalizeCamelCase(matchedFeature.number) || "N/A"
            }</div>
            <div><strong>Person:</strong> ${
              capitalizeCamelCase(matchedFeature.person) || "N/A"
            }</div>
            <div><strong>Script:</strong> ${
              capitalizeCamelCase(matchedFeature.script) || "N/A"
            }</div>
            <div><strong>Case:</strong> ${
              capitalizeCamelCase(matchedFeature.case) || "N/A"
            }</div>
            <div><strong>Tense:</strong> ${
              capitalizeCamelCase(matchedFeature.tense) || "N/A"
            }</div>
        `;
    answerContainer.innerHTML = answerHTML;
    answerContainer.classList.add("show");
  } else {
    const feedback =
      incorrectFeatures.length > 0
        ? `Incorrect. Please check: ${incorrectFeatures.join(", ")}`
        : "Incorrect. Please try again or show the answer.";
    showFeedback(feedback, "error");
    // Do not show the correct features block if incorrect
    answerContainer.innerHTML = "";
    answerContainer.classList.remove("show");
  }
}

// Show the correct answer
function showAnswer() {
  if (!featuresManager.currentWord) {
    showFeedback(
      "Please select a language and a word before showing the answer.",
      "error",
    );
    return;
  }
  clearFeedback();
  feedbackContainer.textContent = "";
  feedbackContainer.className = "feedback-container";
  const wordInfo = featuresManager.wordData.get(featuresManager.currentWord);
  const keys = [
    "root",
    "category",
    "gender",
    "number",
    "person",
    "script",
    "case",
    "tense",
  ];

  const userAnswer = {
    root: normalizeFeatureValue(rootSelect.value),
    category: normalizeFeatureValue(categorySelect.value),
    gender: normalizeFeatureValue(genderSelect.value),
    number: normalizeFeatureValue(numberSelect.value),
    person: normalizeFeatureValue(personSelect.value),
    script: normalizeFeatureValue(scriptSelect.value),
    case: normalizeFeatureValue(caseSelect.value),
    tense: normalizeFeatureValue(tenseSelect.value),
  };

  const normalizedFeatures = wordInfo.features.map((feature) => ({
    root: normalizeFeatureValue(feature.root),
    category: normalizeFeatureValue(feature.category),
    gender: normalizeFeatureValue(feature.gender),
    number: normalizeFeatureValue(feature.number),
    person: normalizeFeatureValue(feature.person),
    script: normalizeFeatureValue(feature.script),
    case: normalizeFeatureValue(feature.case),
    tense: normalizeFeatureValue(feature.tense),
  }));

  let bestMatch = normalizedFeatures[0];
  let bestScore = -1;
  normalizedFeatures.forEach((feature) => {
    let score = 0;
    keys.forEach((key) => {
      if (feature[key] === userAnswer[key]) score += 1;
    });
    if (score > bestScore) {
      bestScore = score;
      bestMatch = feature;
    }
  });

  // Normalize display values
  const normalizeDisplayValue = (val) => {
    if (!val || val === "") return "N/A";
    if (val.toLowerCase() === "na" || val.toLowerCase() === "n/a") return "N/A";
    if (val === "devanagari") return "Devanagari";
    if (val === "roman") return "Roman";
    if (val === "direct") return "Direct";
    if (val === "oblique") return "Oblique";
    return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
  };

  const answerHTML = `
        <h3>Correct Features for "${featuresManager.currentWord}":</h3>
        <div><strong>Root:</strong> ${normalizeDisplayValue(
          bestMatch.root,
        )}</div>
        <div><strong>Category:</strong> ${normalizeDisplayValue(
          bestMatch.category,
        )}</div>
        <div><strong>Gender:</strong> ${normalizeDisplayValue(
          bestMatch.gender,
        )}</div>
        <div><strong>Number:</strong> ${normalizeDisplayValue(
          bestMatch.number,
        )}</div>
        <div><strong>Person:</strong> ${normalizeDisplayValue(
          bestMatch.person,
        )}</div>
        <div><strong>Script:</strong> ${normalizeDisplayValue(
          bestMatch.script,
        )}</div>
        <div><strong>Case:</strong> ${normalizeDisplayValue(
          bestMatch.case,
        )}</div>
        <div><strong>Tense:</strong> ${normalizeDisplayValue(
          bestMatch.tense,
        )}</div>
    `;
  answerContainer.innerHTML = answerHTML;
  answerContainer.classList.add("show");

  const possibleCategories = Array.from(
    new Set(
      normalizedFeatures.map((feature) =>
        normalizeDisplayValue(feature.category),
      ),
    ),
  ).sort();
  if (possibleCategories.length > 1) {
    answerContainer.innerHTML += `<div><strong>Valid categories for this word:</strong> ${possibleCategories.join(
      ", ",
    )}</div>`;
  }

  // Highlight incorrect dropdowns
  [
    { el: rootSelect, key: "root" },
    { el: categorySelect, key: "category" },
    { el: genderSelect, key: "gender" },
    { el: numberSelect, key: "number" },
    { el: personSelect, key: "person" },
    { el: scriptSelect, key: "script" },
    { el: caseSelect, key: "case" },
    { el: tenseSelect, key: "tense" },
  ].forEach(({ el, key }) => {
    const correctVal = normalizeDisplayValue(bestMatch[key]);
    const userVal = normalizeDisplayValue(userAnswer[key]);
    if (correctVal !== userVal) {
      el.classList.add("highlight-incorrect");
    } else {
      el.classList.remove("highlight-incorrect");
    }
  });
}

function setupInfoIcons() {
  const icons = document.querySelectorAll(".info-icon");
  if (!icons.length) return;

  let tooltip = document.getElementById("infoTooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "infoTooltip";
    tooltip.className = "info-tooltip";
    tooltip.setAttribute("role", "status");
    tooltip.setAttribute("aria-live", "polite");
    document.body.appendChild(tooltip);
  }

  const closeTooltip = () => {
    tooltip.classList.remove("show");
    tooltip.textContent = "";
  };

  const openTooltip = (icon) => {
    const message = icon.getAttribute("title") || icon.dataset.info || "";
    if (!message) return;

    icon.dataset.info = message;
    icon.removeAttribute("title");

    tooltip.textContent = message;
    tooltip.classList.add("show");

    const iconRect = icon.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    let left = iconRect.left + window.scrollX + iconRect.width + 8;
    let top =
      iconRect.top +
      window.scrollY -
      tooltipRect.height / 2 +
      iconRect.height / 2;

    const viewportRight = window.scrollX + window.innerWidth;
    const maxLeft = viewportRight - tooltipRect.width - 12;
    if (left > maxLeft) {
      left = iconRect.left + window.scrollX - tooltipRect.width - 8;
    }

    const minTop = window.scrollY + 8;
    const maxTop = window.scrollY + window.innerHeight - tooltipRect.height - 8;
    top = Math.max(minTop, Math.min(top, maxTop));

    tooltip.style.left = `${Math.max(window.scrollX + 8, left)}px`;
    tooltip.style.top = `${top}px`;
  };

  icons.forEach((icon) => {
    icon.setAttribute("role", "button");
    if (!icon.hasAttribute("tabindex")) {
      icon.setAttribute("tabindex", "0");
    }

    icon.addEventListener("click", (event) => {
      event.stopPropagation();
      const message = icon.dataset.info || icon.getAttribute("title") || "";
      if (
        tooltip.classList.contains("show") &&
        tooltip.textContent === message
      ) {
        closeTooltip();
      } else {
        openTooltip(icon);
      }
    });

    icon.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openTooltip(icon);
      } else if (event.key === "Escape") {
        closeTooltip();
      }
    });

    icon.addEventListener("focus", () => openTooltip(icon));
  });

  document.addEventListener("click", (event) => {
    if (
      !event.target.closest(".info-icon") &&
      !event.target.closest("#infoTooltip")
    ) {
      closeTooltip();
    }
  });

  window.addEventListener("scroll", closeTooltip, { passive: true });
  window.addEventListener("resize", closeTooltip);
}

// Show feedback message
function showFeedback(message, type) {
  feedbackContainer.textContent = message;
  feedbackContainer.className = `feedback-container show ${type}`;
}

// Clear feedback and answer
function clearFeedback() {
  feedbackContainer.className = "feedback-container";
  answerContainer.className = "answer-container";
}

// Setup instructions panel functionality
function setupInstructionsPanel() {
  const tab = document.getElementById("instructionsTab");
  const instructionsContent = document.getElementById("instructionsContent");
  if (tab && instructionsContent) {
    // Collapsed by default
    instructionsContent.classList.add("collapsed");
    tab.classList.add("collapsed");

    tab.addEventListener("click", () => {
      const isCollapsed = instructionsContent.classList.contains("collapsed");
      if (isCollapsed) {
        instructionsContent.classList.remove("collapsed");
        tab.classList.remove("collapsed");
      } else {
        instructionsContent.classList.add("collapsed");
        tab.classList.add("collapsed");
      }
    });
  }
}

// Add event listener for Reset button
document.addEventListener("DOMContentLoaded", function () {
  const resetButton = document.getElementById("resetButton");
  if (resetButton) {
    resetButton.addEventListener("click", resetSimulation);
  }
});

function resetSimulation() {
  // Reset language and word selects
  languageSelect.selectedIndex = 0;
  wordSelect.innerHTML = '<option value="">Select a word...</option>';
  wordSelect.disabled = true;
  // Reset all feature selects
  [
    rootSelect,
    categorySelect,
    genderSelect,
    numberSelect,
    personSelect,
    scriptSelect,
    caseSelect,
    tenseSelect,
  ].forEach((select) => {
    select.innerHTML = '<option value="">Select...</option>';
    select.disabled = true;
  });
  // Hide feedback and answer
  clearFeedback();
  feedbackContainer.textContent = "";
  feedbackContainer.className = "feedback-container";
  answerContainer.innerHTML = "";
  answerContainer.classList.remove("show");
  // Reset buttons
  checkButton.disabled = true;
  showAnswerButton.disabled = true;
  checkButton.style.display = "";
  // Reset current word
  featuresManager.currentWord = null;
  // Reset instructions panel to collapsed
  const instructionsContent = document.getElementById("instructionsContent");
  const tab = document.getElementById("instructionsTab");
  if (instructionsContent && tab) {
    instructionsContent.classList.add("collapsed");
  }
  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
  previouslyIncorrect = false;
}

// Initialize the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", init);

// Utility to split camel case and capitalize each word
function capitalizeCamelCase(str) {
  if (!str || str === "N/A") return str;
  // Split camelCase or PascalCase into words, capitalize each
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
