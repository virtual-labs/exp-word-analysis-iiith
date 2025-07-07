var index;

        function getSelectedValue() {
            getdata(document.getElementById('userWord').value);
            return false;
        }

        function getdata(ind) {
            if (ind == 'null') {
                alert("Select word");
                document.getElementById("fldiv").innerHTML = "";
                return;
            }
            $('#fldiv').load('exp1.php?index=' + ind + '&root=%&category=%&gender=%&form=%&person=%&tense=%&reference=%&turn=%');
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
            $('#option').load('exp1_opt.php?lang=' + lang + '&script=' + scr);
        }
    
        (function(i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r;
            i[r] = i[r] || function() {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * new Date();
            a = s.createElement(o), m = s.getElementsByTagName(o)[0];
            a.async = 1;
            a.src = g;
            m.parentNode.insertBefore(a, m)
        })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
        ga('create', 'UA-67558473-1', 'auto');
        ga('send', 'pageview');

// Data structure to store word features
let wordData = new Map();
let currentWord = null;

// DOM Elements
const languageSelect = document.getElementById('language');
const wordSelect = document.getElementById('word');
const rootSelect = document.getElementById('root');
const categorySelect = document.getElementById('category');
const genderSelect = document.getElementById('gender');
const numberSelect = document.getElementById('number');
const personSelect = document.getElementById('person');
const scriptSelect = document.getElementById('script');
const caseSelect = document.getElementById('case');
const tenseSelect = document.getElementById('tense');
const checkButton = document.getElementById('checkButton');
const showAnswerButton = document.getElementById('showAnswerButton');
const feedbackContainer = document.getElementById('feedback');
const answerContainer = document.getElementById('answer');

// Common feature values for distractors
const commonFeatures = {
    gender: ['male', 'female', 'N/A'],
    number: ['singular', 'plural'],
    person: ['first', 'second', 'third', 'N/A'],
    category: ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction'],
    case: ['Direct', 'Oblique', 'N/A'],
    script: ['devanagari', 'Roman']
};

// Store all unique tenses from features.txt
let allTenses = new Set();

// Store all unique categories from features.txt
let allCategories = new Set();

// Track if user previously submitted an incorrect answer
let previouslyIncorrect = false;

// Function to get distractors for a feature
function getDistractors(featureType, correctValue, count = 3) {
    const allValues = commonFeatures[featureType] || [];
    const distractors = allValues.filter(value => value !== correctValue && value !== 'N/A');
    return distractors.sort(() => Math.random() - 0.5).slice(0, count);
}

// Function to generate root distractors (now: all word forms sharing the same root and language)
function getRootDistractors(selectedWord) {
    // Get the word info for the selected word
    const wordInfo = wordData.get(selectedWord);
    if (!wordInfo) return [];
    const root = Array.from(wordInfo.root)[0];
    const lang = wordInfo.language;
    if (!root || !lang) return [];
    // Find all words in wordData that share this root and language
    const similarWords = Array.from(wordData.entries())
        .filter(([word, info]) => info.language === lang && info.root.has(root))
        .map(([word, _]) => word)
        .filter(word => word && word !== 'N/A');
    // Remove duplicates and sort
    return Array.from(new Set(similarWords)).sort();
}

// Initialize the application
async function init() {
    try {
        const response = await fetch('features.txt');
        const text = await response.text();
        processFeaturesData(text);
        setupEventListeners();
        setupInstructionsPanel();
    } catch (error) {
        console.error('Error loading features data:', error);
        showFeedback('Error loading features data. Please try again.', 'error');
    }
}

// Process the features.txt data
function processFeaturesData(text) {
    const lines = text.split('\n');
    lines.forEach(line => {
        if (!line.trim()) return;
        
        const [word, root, category, gender, number, case_, person, lang, script, tense] = line.split('\t');
        
        // Skip empty or invalid entries
        if (!word || !lang || lang === 'N/A') return;
        
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
                features: []
            });
        }
        
        const wordInfo = wordData.get(word);
        
        // Only add non-N/A values
        if (root && root !== 'N/A') wordInfo.root.add(root);
        if (category && category !== 'N/A' && category !== 'na') allCategories.add(category);
        if (gender && gender !== 'N/A') wordInfo.gender.add(gender);
        if (number && number !== 'N/A') wordInfo.number.add(number);
        if (person && person !== 'N/A') wordInfo.person.add(person);
        if (script && script !== 'N/A') wordInfo.script.add(script);
        if (tense && tense !== 'N/A') {
            wordInfo.tense.add(tense);
            allTenses.add(tense);
        }
        // No case info in data, so just add N/A by default
        wordInfo.case.add('N/A');
        
        wordInfo.features.push({
            root: root !== 'N/A' ? root : '',
            category: category !== 'N/A' ? category : '',
            gender: gender !== 'N/A' ? gender : '',
            number: number !== 'N/A' ? number : '',
            person: person !== 'N/A' ? person : '',
            script: script !== 'N/A' ? script : '',
            case: 'N/A',
            tense: tense !== 'N/A' ? tense : ''
        });
    });
    
    populateLanguageSelect();
    populateWordSelect();
}

// Populate the language select dropdown
function populateLanguageSelect() {
    const languages = new Set();
    wordData.forEach((info, word) => {
        if (info.language && info.language !== 'N/A' && info.language !== 'na') {
            languages.add(info.language);
        }
    });
    
    languageSelect.innerHTML = '<option value="">Select language...</option>';
    Array.from(languages).sort().forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = lang === 'en' ? 'English' : lang === 'hi' ? 'Hindi' : lang;
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
    
    const words = Array.from(wordData.entries())
        .filter(([_, info]) => info.language === selectedLang)
        .map(([word, _]) => word)
        .sort();
    
    wordSelect.innerHTML = '<option value="">Select a word...</option>';
    words.forEach(word => {
        const option = document.createElement('option');
        option.value = word;
        option.textContent = word;
        wordSelect.appendChild(option);
    });
    wordSelect.disabled = false;
}

// Setup event listeners
function setupEventListeners() {
    languageSelect.addEventListener('change', () => {
        populateWordSelect();
        clearAllFeatures();
        // Reset feedback and answer containers
        feedbackContainer.textContent = '';
        feedbackContainer.className = 'feedback-container';
        answerContainer.innerHTML = '';
        answerContainer.className = 'answer-container';
    });
    wordSelect.addEventListener('change', handleWordChange);
    rootSelect.addEventListener('change', handleFeatureChange);
    categorySelect.addEventListener('change', handleFeatureChange);
    genderSelect.addEventListener('change', handleFeatureChange);
    numberSelect.addEventListener('change', handleFeatureChange);
    personSelect.addEventListener('change', handleFeatureChange);
    scriptSelect.addEventListener('change', handleFeatureChange);
    caseSelect.addEventListener('change', handleFeatureChange);
    tenseSelect.addEventListener('change', handleFeatureChange);
    checkButton.addEventListener('click', checkAnswer);
    showAnswerButton.addEventListener('click', showAnswer);
}

// Clear all feature selects
function clearAllFeatures() {
    [rootSelect, categorySelect, genderSelect, numberSelect, personSelect, scriptSelect, caseSelect, tenseSelect].forEach(select => {
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
    if (str === 'N/A') return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function populateFeatureSelect(select, values, featureType) {
    select.innerHTML = '<option value="">Select...</option>';
    let valueArr = Array.from(values).filter(v => v && v.toLowerCase() !== 'na');
    // Always add N/A for gender, person, tense, and case
    if (["gender", "person", "tense", "case"].includes(featureType)) {
        if (!valueArr.includes('N/A')) valueArr.push('N/A');
    }
    if (featureType === 'root') {
        valueArr.forEach(val => {
            if (val && val !== 'N/A') {
                const option = document.createElement('option');
                option.value = val;
                option.textContent = capitalizeFirst(val);
                select.appendChild(option);
            }
        });
        return;
    }
    if (featureType === 'case') {
        ['Direct', 'Oblique', 'N/A'].forEach(val => {
            const option = document.createElement('option');
            option.value = val;
            option.textContent = val;
            select.appendChild(option);
        });
        return;
    }
    if (featureType === 'script') {
        ['devanagari', 'Roman'].forEach(val => {
            const option = document.createElement('option');
            option.value = val;
            option.textContent = val.charAt(0).toUpperCase() + val.slice(1);
            select.appendChild(option);
        });
        return;
    }
    if (featureType === 'tense') {
        Array.from(allTenses).sort().forEach(val => {
            if (val && val !== 'N/A' && val.toLowerCase() !== 'na' && val.toLowerCase() !== 'roman') {
                const option = document.createElement('option');
                option.value = val;
                option.textContent = capitalizeFirst(val);
                select.appendChild(option);
            }
        });
        // Add N/A as an option (not default)
        const naOption = document.createElement('option');
        naOption.value = 'N/A';
        naOption.textContent = 'N/A';
        select.appendChild(naOption);
        // Always set default to empty (Select...)
        select.value = '';
        return;
    }
    // Add correct and distractor options for other features
    valueArr.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = capitalizeFirst(value);
        select.appendChild(option);
    });
    // Always set default to empty (Select...) for all feature dropdowns
    select.value = '';
}

// Handle word selection change
function handleWordChange() {
    const selectedWord = wordSelect.value;
    if (!selectedWord) {
        clearAllFeatures();
        return;
    }
    currentWord = selectedWord;
    const wordInfo = wordData.get(selectedWord);
    // --- NEW LOGIC: Find all similar/related word forms for the selected word ---
    let similarForms = new Set();
    if (wordInfo) {
        // Get the language of the selected word
        const lang = wordInfo.language;
        // For Hindi: collect all surface forms (the first column in features.txt) that share the same root as the selected word
        if (lang === 'hi') {
            // Get the root(s) for the selected word
            const selectedRoots = Array.from(wordInfo.root);
            wordData.forEach((info, word) => {
                // If this word shares a root with the selected word, add its surface form
                for (const r of info.root) {
                    if (selectedRoots.includes(r)) {
                        similarForms.add(word);
                    }
                }
            });
        } else if (lang === 'en') {
            // For English: collect all surface forms (the first column) that share the same root as the selected word
            const selectedRoots = Array.from(wordInfo.root);
            wordData.forEach((info, word) => {
                for (const r of info.root) {
                    if (selectedRoots.includes(r)) {
                        similarForms.add(word);
                    }
                }
            });
        } else {
            // Fallback: just use the current word's root(s)
            wordInfo.root.forEach(r => similarForms.add(r));
        }
    }
    // If no similar forms found, fallback to the current word's root(s)
    if (similarForms.size === 0 && wordInfo) {
        wordInfo.root.forEach(r => similarForms.add(r));
    }
    // Always use the correct sets for each feature
    populateFeatureSelect(rootSelect, similarForms, 'root');
    // Use allCategories for the category dropdown
    populateFeatureSelect(categorySelect, allCategories, 'category');
    populateFeatureSelect(genderSelect, wordInfo.gender, 'gender');
    populateFeatureSelect(numberSelect, wordInfo.number, 'number');
    populateFeatureSelect(personSelect, wordInfo.person, 'person');
    populateFeatureSelect(scriptSelect, wordInfo.script, 'script');
    populateFeatureSelect(caseSelect, wordInfo.case, 'case');
    populateFeatureSelect(tenseSelect, wordInfo.tense, 'tense');
    [rootSelect, categorySelect, genderSelect, numberSelect, personSelect, scriptSelect, caseSelect, tenseSelect].forEach(select => {
        select.disabled = false;
    });
    checkButton.style.display = '';
    checkButton.disabled = false;
    showAnswerButton.disabled = false;
    clearFeedback();
    previouslyIncorrect = false;
}

// Handle feature selection change
function handleFeatureChange() {
    clearFeedback();
}

// Check the user's answer
function checkAnswer() {
    if (!currentWord) return;
    const userAnswer = {
        root: rootSelect.value,
        category: categorySelect.value,
        gender: genderSelect.value,
        number: numberSelect.value,
        person: personSelect.value,
        script: scriptSelect.value,
        case: caseSelect.value,
        tense: tenseSelect.value
    };
    const wordInfo = wordData.get(currentWord);
    // Strictly check all features: must match exactly
    let incorrectFeatures = [];
    let foundMatch = false;
    for (const feature of wordInfo.features) {
        let allMatch = true;
        if (feature.root !== userAnswer.root) allMatch = false;
        if (feature.category !== userAnswer.category) allMatch = false;
        if (feature.gender !== userAnswer.gender) allMatch = false;
        if (feature.number !== userAnswer.number) allMatch = false;
        if (feature.person !== userAnswer.person) allMatch = false;
        // Script: case-insensitive, trimmed
        if (!feature.script || !userAnswer.script || feature.script.trim().toLowerCase() !== userAnswer.script.trim().toLowerCase()) allMatch = false;
        if (feature.case !== userAnswer.case) allMatch = false;
        if (feature.tense !== userAnswer.tense) allMatch = false;
        if (allMatch) {
            foundMatch = true;
            break;
        }
    }
    // Identify all incorrect features (always, for feedback)
    const correct = wordInfo.features[0];
    if (userAnswer.root !== correct.root) incorrectFeatures.push('Root');
    if (userAnswer.category !== correct.category) incorrectFeatures.push('Category');
    if (userAnswer.gender !== correct.gender) incorrectFeatures.push('Gender');
    if (userAnswer.number !== correct.number) incorrectFeatures.push('Number');
    if (userAnswer.person !== correct.person) incorrectFeatures.push('Person');
    if (!correct.script || !userAnswer.script || correct.script.trim().toLowerCase() !== userAnswer.script.trim().toLowerCase()) incorrectFeatures.push('Script');
    if (userAnswer.case !== correct.case) incorrectFeatures.push('Case');
    if (userAnswer.tense !== correct.tense) incorrectFeatures.push('Tense');
    // Highlight incorrect dropdowns
    [
        {el: rootSelect, key: 'Root'},
        {el: categorySelect, key: 'Category'},
        {el: genderSelect, key: 'Gender'},
        {el: numberSelect, key: 'Number'},
        {el: personSelect, key: 'Person'},
        {el: scriptSelect, key: 'Script'},
        {el: caseSelect, key: 'Case'},
        {el: tenseSelect, key: 'Tense'}
    ].forEach(({el, key}) => {
        if (incorrectFeatures.includes(key)) {
            el.classList.add('highlight-incorrect');
        } else {
            el.classList.remove('highlight-incorrect');
        }
    });
    if (foundMatch && incorrectFeatures.length === 0) {
        showFeedback('Correct! All features match.', 'success');
    } else {
        const feedback = incorrectFeatures.length > 0
            ? `Incorrect. Please check: ${incorrectFeatures.join(', ')}`
            : 'Incorrect. Please try again or show the answer.';
        showFeedback(feedback, 'error');
    }
    // Do NOT disable dropdowns after checking; user can retry
}

// Show the correct answer
function showAnswer() {
    if (!currentWord) return;
    clearFeedback();
    feedbackContainer.textContent = '';
    feedbackContainer.className = 'feedback-container';
    const wordInfo = wordData.get(currentWord);
    const firstFeature = wordInfo.features[0];
    // Always show the correct features from the data, not from the dropdowns
    function displayCase(val) {
        if (!val || val === 'N/A') return 'N/A';
        if (val.toLowerCase() === 'devanagari') return 'Devanagari';
        if (val.toLowerCase() === 'roman') return 'Roman';
        return capitalizeCamelCase(val);
    }
    const answerHTML = `
        <h3>Correct Features for "${currentWord}":</h3>
        <div><strong>Root:</strong> ${capitalizeCamelCase(firstFeature.root) || 'N/A'}</div>
        <div><strong>Category:</strong> ${capitalizeCamelCase(firstFeature.category) || 'N/A'}</div>
        <div><strong>Gender:</strong> ${capitalizeCamelCase(firstFeature.gender) || 'N/A'}</div>
        <div><strong>Number:</strong> ${capitalizeCamelCase(firstFeature.number) || 'N/A'}</div>
        <div><strong>Person:</strong> ${capitalizeCamelCase(firstFeature.person) || 'N/A'}</div>
        <div><strong>Script:</strong> ${capitalizeCamelCase(firstFeature.script) || 'N/A'}</div>
        <div><strong>Case:</strong> ${displayCase(firstFeature.case)}</div>
        <div><strong>Tense:</strong> ${capitalizeCamelCase(firstFeature.tense) || 'N/A'}</div>
    `;
    answerContainer.innerHTML = answerHTML;
    answerContainer.classList.add('show');
    // Optionally, highlight incorrect dropdowns for user clarity
    const userAnswer = {
        root: rootSelect.value,
        category: categorySelect.value,
        gender: genderSelect.value,
        number: numberSelect.value,
        person: personSelect.value,
        script: scriptSelect.value,
        case: caseSelect.value,
        tense: tenseSelect.value
    };
    [
        {el: rootSelect, key: 'root'},
        {el: categorySelect, key: 'category'},
        {el: genderSelect, key: 'gender'},
        {el: numberSelect, key: 'number'},
        {el: personSelect, key: 'person'},
        {el: scriptSelect, key: 'script'},
        {el: caseSelect, key: 'case'},
        {el: tenseSelect, key: 'tense'}
    ].forEach(({el, key}) => {
        if ((firstFeature[key] || '').toLowerCase() !== (userAnswer[key] || '').toLowerCase()) {
            el.classList.add('highlight-incorrect');
        } else {
            el.classList.remove('highlight-incorrect');
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
    feedbackContainer.className = 'feedback-container';
    answerContainer.className = 'answer-container';
}

// Setup instructions panel functionality
function setupInstructionsPanel() {
    const tab = document.getElementById('instructionsTab');
    const instructionsContent = document.getElementById('instructionsContent');
    if (tab && instructionsContent) {
        // Collapsed by default
        instructionsContent.classList.add('collapsed');
        tab.addEventListener('click', () => {
            const isCollapsed = instructionsContent.classList.contains('collapsed');
            if (isCollapsed) {
                instructionsContent.classList.remove('collapsed');
            } else {
                instructionsContent.classList.add('collapsed');
            }
        });
    }
}

// Add event listener for Reset button
document.addEventListener('DOMContentLoaded', function() {
    const resetButton = document.getElementById('resetButton');
    if (resetButton) {
        resetButton.addEventListener('click', resetSimulation);
    }
});

function resetSimulation() {
    // Reset language and word selects
    languageSelect.selectedIndex = 0;
    wordSelect.innerHTML = '<option value="">Select a word...</option>';
    wordSelect.disabled = true;
    // Reset all feature selects
    [rootSelect, categorySelect, genderSelect, numberSelect, personSelect, scriptSelect, caseSelect, tenseSelect].forEach(select => {
        select.innerHTML = '<option value="">Select...</option>';
        select.disabled = true;
    });
    // Hide feedback and answer
    clearFeedback();
    feedbackContainer.textContent = '';
    feedbackContainer.className = 'feedback-container';
    answerContainer.innerHTML = '';
    answerContainer.classList.remove('show');
    // Reset buttons
    checkButton.disabled = true;
    showAnswerButton.disabled = true;
    checkButton.style.display = '';
    // Reset current word
    currentWord = null;
    // Reset instructions panel to collapsed
    const instructionsContent = document.getElementById('instructionsContent');
    const tab = document.getElementById('instructionsTab');
    if (instructionsContent && tab) {
        instructionsContent.classList.add('collapsed');
    }
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    previouslyIncorrect = false;
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Utility to split camel case and capitalize each word
function capitalizeCamelCase(str) {
    if (!str || str === 'N/A') return str;
    // Split camelCase or PascalCase into words, capitalize each
    return str
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}
