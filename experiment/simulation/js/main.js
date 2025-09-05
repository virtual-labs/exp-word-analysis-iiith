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
      "&root=%&category=%&gender=%&form=%&person=%&tense=%&reference=%&turn=%"
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
  (i[r] =
    i[r] ||
    function () {
      (i[r].q = i[r].q || []).push(arguments);
    }),
    (i[r].l = 1 * new Date());
  (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
  a.async = 1;
  a.src = g;
  m.parentNode.insertBefore(a, m);
})(window, document, "script", "//www.google-analytics.com/analytics.js", "ga");
ga("create", "UA-67558473-1", "auto");
ga("send", "pageview");

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

      const normalizeValue = (val) => {
        if (!val || val.toLowerCase() === "na" || val.toLowerCase() === "n/a")
          return "N/A";
        if (val.toLowerCase() === "roman") return "Roman";
        if (val.toLowerCase() === "devanagari") return "Devanagari";
        if (val.toLowerCase() === "direct") return "Direct";
        if (val.toLowerCase() === "oblique") return "Oblique";
        return val.toLowerCase();
      };

      if (root && root !== "N/A") wordInfo.root.add(root);
      if (category && category !== "N/A" && category !== "na")
        this.allCategories.add(category.toLowerCase());

      const normalizedGender = normalizeValue(gender);
      const normalizedNumber = normalizeValue(number);
      const normalizedPerson = normalizeValue(person);
      const normalizedScript = normalizeValue(script);
      const normalizedCase = normalizeValue(case_);
      const normalizedTense = normalizeValue(tense);

      if (normalizedGender !== "N/A") {
        wordInfo.gender.add(normalizedGender);
        this.allGendersByLang[lang].add(normalizedGender);
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
        gender: normalizeValue(gender),
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
      Array.from(this.allScriptsByLang["en"] || []).sort()
    );
    console.log("Case:", Array.from(this.allCasesByLang["en"] || []).sort());
    console.log(
      "Gender:",
      Array.from(this.allGendersByLang["en"] || []).sort()
    );
    console.log(
      "Number:",
      Array.from(this.allNumbersByLang["en"] || []).sort()
    );
    console.log(
      "Person:",
      Array.from(this.allPersonsByLang["en"] || []).sort()
    );
    console.log("Loaded options for Hindi:");
    console.log(
      "Script:",
      Array.from(this.allScriptsByLang["hi"] || []).sort()
    );
    console.log("Case:", Array.from(this.allCasesByLang["hi"] || []).sort());
    console.log(
      "Gender:",
      Array.from(this.allGendersByLang["hi"] || []).sort()
    );
    console.log(
      "Number:",
      Array.from(this.allNumbersByLang["hi"] || []).sort()
    );
    console.log(
      "Person:",
      Array.from(this.allPersonsByLang["hi"] || []).sort()
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

  getSimilarForms(word) {
    if (!this.wordData.has(word)) return new Set();
    const wordInfo = this.wordData.get(word);
    const lang = wordInfo.language;
    const similarForms = new Set();

    const selectedRoots = Array.from(wordInfo.root);
    this.wordData.forEach((info, w) => {
      if (info.language === lang) {
        for (const r of info.root) {
          if (selectedRoots.includes(r)) {
            similarForms.add(w);
          }
        }
      }
    });

    if (similarForms.size === 0) {
      wordInfo.root.forEach((r) => similarForms.add(r));
    }

    return similarForms;
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

    return {
      root: this.getSimilarForms(word),
      category: this.allCategories,
      gender: this.allGendersByLang[lang] || new Set(),
      number: this.allNumbersByLang[lang] || new Set(),
      person: this.allPersonsByLang[lang] || new Set(),
      script: this.allScriptsByLang[lang] || new Set(),
      case: this.allCasesByLang[lang] || new Set(),
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
    (value) => value !== correctValue && value !== "N/A"
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
  categorySelect.addEventListener("change", handleFeatureChange);
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
    (v) => v && v.toLowerCase() !== "na"
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
  const wordInfo = featuresManager.wordData.get(selectedWord);
  const lang = wordInfo.language;

  // Find all similar/related word forms
  let similarForms = new Set();
  if (wordInfo) {
    const selectedRoots = Array.from(wordInfo.root);
    featuresManager.wordData.forEach((info, word) => {
      if (info.language === lang) {
        for (const r of info.root) {
          if (selectedRoots.includes(r)) {
            similarForms.add(word);
          }
        }
      }
    });
  }

  // If no similar forms found, fallback to the current word's root(s)
  if (similarForms.size === 0 && wordInfo) {
    wordInfo.root.forEach((r) => similarForms.add(r));
  }

  // Populate all feature dropdowns using language-specific sets
  populateFeatureSelect(rootSelect, similarForms, "root");
  populateFeatureSelect(
    categorySelect,
    featuresManager.allCategories,
    "category"
  );
  populateFeatureSelect(
    genderSelect,
    featuresManager.allGendersByLang[lang],
    "gender"
  );
  populateFeatureSelect(
    numberSelect,
    featuresManager.allNumbersByLang[lang],
    "number"
  );
  populateFeatureSelect(
    personSelect,
    featuresManager.allPersonsByLang[lang],
    "person"
  );
  populateFeatureSelect(
    scriptSelect,
    featuresManager.allScriptsByLang[lang],
    "script"
  );
  populateFeatureSelect(
    caseSelect,
    featuresManager.allCasesByLang[lang],
    "case"
  );
  populateFeatureSelect(tenseSelect, featuresManager.allTenses, "tense");

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
}

// Handle feature selection change
function handleFeatureChange() {
  clearFeedback();
}

// Check the user's answer
function checkAnswer() {
  if (!featuresManager.currentWord) return;
  const userAnswer = {
    root: rootSelect.value,
    category: categorySelect.value,
    gender: genderSelect.value,
    number: numberSelect.value,
    person: personSelect.value,
    script: scriptSelect.value,
    case: caseSelect.value,
    tense: tenseSelect.value,
  };
  const wordInfo = featuresManager.wordData.get(featuresManager.currentWord);
  let incorrectFeatures = [];
  let foundMatch = false;
  for (const feature of wordInfo.features) {
    let allMatch = true;
    if (feature.root !== userAnswer.root) allMatch = false;
    if (feature.category !== userAnswer.category) allMatch = false;
    if (feature.gender !== userAnswer.gender) allMatch = false;
    if (feature.number !== userAnswer.number) allMatch = false;
    if (feature.person !== userAnswer.person) allMatch = false;
    if (
      !feature.script ||
      !userAnswer.script ||
      feature.script.trim().toLowerCase() !==
        userAnswer.script.trim().toLowerCase()
    )
      allMatch = false;
    if (feature.case !== userAnswer.case) allMatch = false;
    if (feature.tense !== userAnswer.tense) allMatch = false;
    if (allMatch) {
      foundMatch = true;
      break;
    }
  }
  const correct = wordInfo.features[0];
  if (userAnswer.root !== correct.root) incorrectFeatures.push("Root");
  if (userAnswer.category !== correct.category)
    incorrectFeatures.push("Category");
  if (userAnswer.gender !== correct.gender) incorrectFeatures.push("Gender");
  if (userAnswer.number !== correct.number) incorrectFeatures.push("Number");
  if (userAnswer.person !== correct.person) incorrectFeatures.push("Person");
  if (
    !correct.script ||
    !userAnswer.script ||
    correct.script.trim().toLowerCase() !==
      userAnswer.script.trim().toLowerCase()
  )
    incorrectFeatures.push("Script");
  if (userAnswer.case !== correct.case) incorrectFeatures.push("Case");
  if (userAnswer.tense !== correct.tense) incorrectFeatures.push("Tense");
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
  if (foundMatch && incorrectFeatures.length === 0) {
    showFeedback("Correct! All features match.", "success");
    // Show the correct features block only if correct
    function displayCase(val) {
      if (!val || val === "N/A") return "N/A";
      if (val.toLowerCase() === "devanagari") return "Devanagari";
      if (val.toLowerCase() === "roman") return "Roman";
      return capitalizeCamelCase(val);
    }
    const answerHTML = `
            <h3>Correct Features for "${featuresManager.currentWord}":</h3>
            <div><strong>Root:</strong> ${
              capitalizeCamelCase(correct.root) || "N/A"
            }</div>
            <div><strong>Category:</strong> ${
              capitalizeCamelCase(correct.category) || "N/A"
            }</div>
            <div><strong>Gender:</strong> ${
              capitalizeCamelCase(correct.gender) || "N/A"
            }</div>
            <div><strong>Number:</strong> ${
              capitalizeCamelCase(correct.number) || "N/A"
            }</div>
            <div><strong>Person:</strong> ${
              capitalizeCamelCase(correct.person) || "N/A"
            }</div>
            <div><strong>Script:</strong> ${
              capitalizeCamelCase(correct.script) || "N/A"
            }</div>
            <div><strong>Case:</strong> ${displayCase(correct.case)}</div>
            <div><strong>Tense:</strong> ${
              capitalizeCamelCase(correct.tense) || "N/A"
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
  if (!featuresManager.currentWord) return;
  clearFeedback();
  feedbackContainer.textContent = "";
  feedbackContainer.className = "feedback-container";
  const wordInfo = featuresManager.wordData.get(featuresManager.currentWord);
  const firstFeature = wordInfo.features[0];

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
          firstFeature.root
        )}</div>
        <div><strong>Category:</strong> ${normalizeDisplayValue(
          firstFeature.category
        )}</div>
        <div><strong>Gender:</strong> ${normalizeDisplayValue(
          firstFeature.gender
        )}</div>
        <div><strong>Number:</strong> ${normalizeDisplayValue(
          firstFeature.number
        )}</div>
        <div><strong>Person:</strong> ${normalizeDisplayValue(
          firstFeature.person
        )}</div>
        <div><strong>Script:</strong> ${normalizeDisplayValue(
          firstFeature.script
        )}</div>
        <div><strong>Case:</strong> ${normalizeDisplayValue(
          firstFeature.case
        )}</div>
        <div><strong>Tense:</strong> ${normalizeDisplayValue(
          firstFeature.tense
        )}</div>
    `;
  answerContainer.innerHTML = answerHTML;
  answerContainer.classList.add("show");

  // Highlight incorrect dropdowns
  const userAnswer = {
    root: rootSelect.value,
    category: categorySelect.value,
    gender: genderSelect.value,
    number: numberSelect.value,
    person: personSelect.value,
    script: scriptSelect.value,
    case: caseSelect.value,
    tense: tenseSelect.value,
  };

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
    const correctVal = normalizeDisplayValue(firstFeature[key]);
    const userVal = normalizeDisplayValue(userAnswer[key]);
    if (correctVal !== userVal) {
      el.classList.add("highlight-incorrect");
    } else {
      el.classList.remove("highlight-incorrect");
    }
  });
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
