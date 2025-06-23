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
const caseSelect = document.getElementById('case');
const tenseSelect = document.getElementById('tense');
const checkButton = document.getElementById('checkButton');
const showAnswerButton = document.getElementById('showAnswerButton');
const feedbackContainer = document.getElementById('feedback');
const answerContainer = document.getElementById('answer');

// Common feature values for distractors
const commonFeatures = {
    gender: ['male', 'female'],
    number: ['singular', 'plural'],
    person: ['first', 'second', 'third'],
    category: ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction']
};

// Store all unique tenses from features.txt
let allTenses = new Set();

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
                case: new Set(),
                tense: new Set(),
                language: lang,
                script: script,
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
        if (script && script !== 'na') wordInfo.case.add(script);
        if (tense && tense !== 'na') {
            wordInfo.tense.add(tense);
            allTenses.add(tense);
        }
        
        wordInfo.features.push({
            root: root !== 'na' ? root : '',
            category: category !== 'na' ? category : '',
            gender: gender !== 'na' ? gender : '',
            number: number !== 'na' ? number : '',
            person: person !== 'na' ? person : '',
            case: script !== 'na' ? script : '',
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
    caseSelect.addEventListener('change', handleFeatureChange);
    tenseSelect.addEventListener('change', handleFeatureChange);
    checkButton.addEventListener('click', checkAnswer);
    showAnswerButton.addEventListener('click', showAnswer);
}

// Clear all feature selects
function clearAllFeatures() {
    [rootSelect, categorySelect, genderSelect, numberSelect, personSelect, caseSelect, tenseSelect].forEach(select => {
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
    const valueArr = Array.from(values);
    // If 'na' is present, add 'NA' as an option
    if (valueArr.includes('na')) {
        const naOption = document.createElement('option');
        naOption.value = 'NA';
        naOption.textContent = 'NA';
        select.appendChild(naOption);
    }
    // Special handling for script/case dropdown
    if (featureType === 'case') {
        // Always show Devanagari and Roman
        ['Devanagari', 'Roman'].forEach(val => {
            const option = document.createElement('option');
            option.value = val;
            option.textContent = capitalizeFirst(val);
            select.appendChild(option);
        });
        return;
    }
    // Special handling for tense dropdown
    if (featureType === 'tense') {
        // Use all unique tenses from features.txt
        Array.from(allTenses).sort().forEach(val => {
            if (val && val !== 'na') {
                const option = document.createElement('option');
                option.value = val;
                option.textContent = capitalizeFirst(val);
                select.appendChild(option);
            }
        });
        return;
    }
    // Get the first valid value as the correct answer
    const correctValue = valueArr.find(v => v && v !== 'na');
    if (!correctValue && !valueArr.includes('na')) return;
    // Add the correct value (if not NA)
    if (correctValue) {
        const correctOption = document.createElement('option');
        correctOption.value = correctValue;
        correctOption.textContent = capitalizeFirst(correctValue);
        select.appendChild(correctOption);
    }
    // Add distractors/options
    if (featureType === 'root') {
        const similarWords = getRootDistractors(currentWord);
        similarWords.forEach(word => {
            if (word !== correctValue && word !== 'na') {
                const option = document.createElement('option');
                option.value = word;
                option.textContent = capitalizeFirst(word);
                select.appendChild(option);
            }
        });
    } else {
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
    populateFeatureSelect(rootSelect, wordInfo.root, 'root');
    populateFeatureSelect(categorySelect, wordInfo.category, 'category');
    populateFeatureSelect(genderSelect, wordInfo.gender, 'gender');
    populateFeatureSelect(numberSelect, wordInfo.number, 'number');
    populateFeatureSelect(personSelect, wordInfo.person, 'person');
    populateFeatureSelect(caseSelect, wordInfo.case, 'case');
    populateFeatureSelect(tenseSelect, wordInfo.tense, 'tense');
    [rootSelect, categorySelect, genderSelect, numberSelect, personSelect, caseSelect, tenseSelect].forEach(select => {
        select.disabled = false;
    });
    checkButton.style.display = '';
    checkButton.disabled = false;
    showAnswerButton.disabled = false;
    clearFeedback();
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
        feature.case === userAnswer.case &&
        feature.tense === userAnswer.tense
    );
    
    if (correctFeatures) {
        showFeedback('Correct! All features match.', 'success');
    } else {
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
        if (userAnswer.case && !wordInfo.case.has(userAnswer.case)) {
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
    const wordInfo = wordData.get(currentWord);
    const firstFeature = wordInfo.features[0];
    // Set dropdowns to the correct answer
    rootSelect.value = firstFeature.root || '';
    categorySelect.value = firstFeature.category || '';
    genderSelect.value = firstFeature.gender || '';
    numberSelect.value = firstFeature.number || '';
    personSelect.value = firstFeature.person || '';
    caseSelect.value = firstFeature.case || '';
    tenseSelect.value = firstFeature.tense || '';
    // Hide/disable check answer button
    checkButton.style.display = 'none';
    // Show the answer as before
    const answerHTML = `
        <h3>Correct Features for "${currentWord}":</h3>
        <ul>
            <li><strong>Root:</strong> ${firstFeature.root || 'N/A'}</li>
            <li><strong>Category:</strong> ${firstFeature.category || 'N/A'}</li>
            <li><strong>Gender:</strong> ${firstFeature.gender || 'N/A'}</li>
            <li><strong>Number:</strong> ${firstFeature.number || 'N/A'}</li>
            <li><strong>Person:</strong> ${firstFeature.person || 'N/A'}</li>
            <li><strong>Case:</strong> ${firstFeature.case || 'N/A'}</li>
            <li><strong>Tense:</strong> ${firstFeature.tense || 'N/A'}</li>
        </ul>
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

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
