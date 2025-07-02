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
    gender: ['male', 'female', 'NA'],
    number: ['singular', 'plural'],
    person: ['first', 'second', 'third', 'NA'],
    category: ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction'],
    case: ['Direct', 'Oblique', 'NA'],
    script: ['Devanagari', 'Roman']
};

// Store all unique tenses from features.txt
let allTenses = new Set();

// Track if user previously submitted an incorrect answer
let previouslyIncorrect = false;

// Function to get distractors for a feature
function getDistractors(featureType, correctValue, count = 3) {
    const allValues = commonFeatures[featureType] || [];
    const distractors = allValues.filter(value => value !== correctValue && value !== 'na');
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
        .filter(word => word && word !== 'na');
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
        if (!word || !lang || lang === 'na') return;
        
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
        
        // Only add non-NA values
        if (root && root !== 'na') wordInfo.root.add(root);
        if (category && category !== 'na') wordInfo.category.add(category);
        if (gender && gender !== 'na') wordInfo.gender.add(gender);
        if (number && number !== 'na') wordInfo.number.add(number);
        if (person && person !== 'na') wordInfo.person.add(person);
        if (script && script !== 'na') wordInfo.script.add(script);
        if (tense && tense !== 'na') {
            wordInfo.tense.add(tense);
            allTenses.add(tense);
        }
        // No case info in data, so just add NA by default
        wordInfo.case.add('NA');
        
        wordInfo.features.push({
            root: root !== 'na' ? root : '',
            category: category !== 'na' ? category : '',
            gender: gender !== 'na' ? gender : '',
            number: number !== 'na' ? number : '',
            person: person !== 'na' ? person : '',
            script: script !== 'na' ? script : '',
            case: 'NA',
            tense: tense !== 'na' ? tense : ''
        });
    });
    
    populateLanguageSelect();
    populateWordSelect();
}

// Populate the language select dropdown
function populateLanguageSelect() {
    const languages = new Set();
    wordData.forEach((info, word) => {
        if (info.language && info.language !== 'na') {
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
    if (str === 'NA') return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function populateFeatureSelect(select, values, featureType) {
    select.innerHTML = '<option value="">Select...</option>';
    let valueArr = Array.from(values);
    // Always add N/A for gender, person, tense, and case
    if (["gender", "person", "tense", "case"].includes(featureType)) {
        if (!valueArr.includes('NA')) valueArr.push('NA');
    }
    if (featureType === 'root') {
        // For root, show all possible roots for the selected word
        valueArr.forEach(val => {
            if (val && val !== 'na') {
                const option = document.createElement('option');
                option.value = val;
                option.textContent = capitalizeFirst(val);
                select.appendChild(option);
            }
        });
        return;
    }
    if (featureType === 'case') {
        ['Direct', 'Oblique', 'NA'].forEach(val => {
            const option = document.createElement('option');
            option.value = val;
            option.textContent = val;
            select.appendChild(option);
        });
        return;
    }
    if (featureType === 'script') {
        ['Devanagari', 'Roman'].forEach(val => {
            const option = document.createElement('option');
            option.value = val;
            option.textContent = val;
            select.appendChild(option);
        });
        return;
    }
    if (featureType === 'tense') {
        Array.from(allTenses).sort().forEach(val => {
            if (val && val !== 'na') {
                const option = document.createElement('option');
                option.value = val;
                option.textContent = capitalizeFirst(val);
                select.appendChild(option);
            }
        });
        // Add N/A
        const naOption = document.createElement('option');
        naOption.value = 'NA';
        naOption.textContent = 'N/A';
        select.appendChild(naOption);
        return;
    }
    // Add correct and distractor options for other features
    const correctValue = valueArr.find(v => v && v !== 'na');
    if (correctValue) {
        const correctOption = document.createElement('option');
        correctOption.value = correctValue;
        correctOption.textContent = capitalizeFirst(correctValue);
        select.appendChild(correctOption);
    }
    const distractors = getDistractors(featureType, correctValue);
    distractors.forEach(value => {
        if (value !== 'na') {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = capitalizeFirst(value);
            select.appendChild(option);
        }
    });
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
    populateFeatureSelect(rootSelect, similarForms, 'root');
    populateFeatureSelect(categorySelect, wordInfo.category, 'category');
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
    const correctFeatures = wordInfo.features.find(feature => 
        feature.root === userAnswer.root &&
        feature.category === userAnswer.category &&
        feature.gender === userAnswer.gender &&
        feature.number === userAnswer.number &&
        feature.person === userAnswer.person &&
        // Fix script comparison: case-insensitive, trimmed
        feature.script && userAnswer.script && feature.script.trim().toLowerCase() === userAnswer.script.trim().toLowerCase() &&
        feature.case === userAnswer.case &&
        feature.tense === userAnswer.tense
    );
    if (correctFeatures) {
        if (previouslyIncorrect) {
            showFeedback('Correct! Well done after correction.', 'success');
        } else {
            showFeedback('Correct! All features match.', 'success');
        }
        previouslyIncorrect = false;
    } else {
        previouslyIncorrect = true;
        // Check which features are incorrect
        const incorrectFeatures = [];
        if (userAnswer.root && !wordInfo.root.has(userAnswer.root)) {
            incorrectFeatures.push('Root');
        }
        if (userAnswer.category && !wordInfo.category.has(userAnswer.category)) {
            incorrectFeatures.push('Category');
        }
        if (userAnswer.gender && !wordInfo.gender.has(userAnswer.gender)) {
            incorrectFeatures.push('Gender');
        }
        if (userAnswer.number && !wordInfo.number.has(userAnswer.number)) {
            incorrectFeatures.push('Number');
        }
        if (userAnswer.person && !wordInfo.person.has(userAnswer.person)) {
            incorrectFeatures.push('Person');
        }
        // Fix script comparison for feedback: case-insensitive, trimmed
        const scriptSet = new Set(Array.from(wordInfo.script).map(s => s.trim().toLowerCase()));
        if (userAnswer.script && !scriptSet.has(userAnswer.script.trim().toLowerCase())) {
            incorrectFeatures.push('Script');
        }
        // Case is always NA in data, so only check if user selected something else
        if (userAnswer.case && userAnswer.case !== 'NA') {
            incorrectFeatures.push('Case');
        }
        if (userAnswer.tense && !wordInfo.tense.has(userAnswer.tense)) {
            incorrectFeatures.push('Tense');
        }
        const feedback = incorrectFeatures.length > 0
            ? `Incorrect. Please check: ${incorrectFeatures.join(', ')}`
            : 'Incorrect. Please try again or show the answer.';
        showFeedback(feedback, 'error');
    }
}

// Show the correct answer
function showAnswer() {
    if (!currentWord) return;
    clearFeedback(); // Remove any feedback
    feedbackContainer.textContent = '';
    feedbackContainer.className = 'feedback-container';
    const wordInfo = wordData.get(currentWord);
    const firstFeature = wordInfo.features[0];
    // Set dropdowns to the correct answer
    rootSelect.value = firstFeature.root || '';
    categorySelect.value = firstFeature.category || '';
    genderSelect.value = firstFeature.gender || '';
    numberSelect.value = firstFeature.number || '';
    personSelect.value = firstFeature.person || '';
    scriptSelect.value = firstFeature.script || '';
    caseSelect.value = firstFeature.case || 'NA';
    tenseSelect.value = firstFeature.tense || '';
    // Hide/disable check answer button
    checkButton.style.display = 'none';
    // Map script/case codes to display names
    function displayCase(val) {
        if (!val || val === 'NA' || val === 'na') return 'N/A';
        if (val.toLowerCase() === 'deva' || val.toLowerCase() === 'devanagari') return 'Devanagari';
        if (val.toLowerCase() === 'roman') return 'Roman';
        return val;
    }
    // Show the answer as a clean block (no bullets)
    const answerHTML = `
        <h3>Correct Features for "${currentWord}":</h3>
        <div><strong>Root:</strong> ${firstFeature.root || 'N/A'}</div>
        <div><strong>Category:</strong> ${firstFeature.category || 'N/A'}</div>
        <div><strong>Gender:</strong> ${firstFeature.gender || 'N/A'}</div>
        <div><strong>Number:</strong> ${firstFeature.number || 'N/A'}</div>
        <div><strong>Person:</strong> ${firstFeature.person || 'N/A'}</div>
        <div><strong>Script:</strong> ${firstFeature.script || 'N/A'}</div>
        <div><strong>Case:</strong> ${displayCase(firstFeature.case)}</div>
        <div><strong>Tense:</strong> ${firstFeature.tense || 'N/A'}</div>
    `;
    answerContainer.innerHTML = answerHTML;
    answerContainer.classList.add('show');
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
    const toggleBtn = document.getElementById('toggleInstructions');
    const instructionsContent = document.getElementById('instructionsContent');
    if (toggleBtn && instructionsContent) {
        // Collapsed by default
        instructionsContent.classList.add('collapsed');
        toggleBtn.textContent = 'Show Instructions';
        toggleBtn.addEventListener('click', () => {
            const isCollapsed = instructionsContent.classList.contains('collapsed');
            if (isCollapsed) {
                instructionsContent.classList.remove('collapsed');
                toggleBtn.textContent = 'Hide Instructions';
            } else {
                instructionsContent.classList.add('collapsed');
                toggleBtn.textContent = 'Show Instructions';
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
    const toggleBtn = document.getElementById('toggleInstructions');
    if (instructionsContent && toggleBtn) {
        instructionsContent.classList.add('collapsed');
        toggleBtn.textContent = 'Show Instructions';
    }
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    previouslyIncorrect = false;
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
