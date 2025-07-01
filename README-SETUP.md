# Virtual Labs Word Analysis Experiment - Setup Guide

This is a Virtual Labs experiment for morphological analysis of words in Natural Language Processing.

## Prerequisites

Before running this application, make sure you have the following installed:

1. **PHP** (version 7.4 or higher)
   - Download from: https://www.php.org/downloads.php
   - Or install via package manager:
     - Windows: Use XAMPP or WAMP
     - macOS: `brew install php`
     - Linux: `sudo apt install php` or `sudo yum install php`

2. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/

## Setup Instructions

### Method 1: Using PHP Built-in Server (Recommended)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the PHP server:**
   ```bash
   npm run serve-php
   ```
   This will start a PHP server at `http://localhost:8080`

3. **In a new terminal, start the development server:**
   ```bash
   npm run dev
   ```
   This will start the Vite dev server at `http://localhost:3000`

4. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

### Method 2: Using XAMPP/WAMP (Alternative)

1. **Install XAMPP or WAMP:**
   - XAMPP: https://www.apachefriends.org/
   - WAMP: https://www.wampserver.com/

2. **Copy the project to the web server directory:**
   - XAMPP: Copy to `C:\xampp\htdocs\word-analysis\`
   - WAMP: Copy to `C:\wamp64\www\word-analysis\`

3. **Start Apache and PHP services in XAMPP/WAMP**

4. **Open your browser and navigate to:**
   ```
   http://localhost/word-analysis/experiment/simulation/
   ```

## Project Structure

```
├── experiment/
│   ├── simulation/           # Main simulation files
│   │   ├── index.html       # Main entry point
│   │   ├── exp1.php         # Core morphological analysis logic
│   │   ├── exp1_opt.php     # Word selection options
│   │   ├── exp1_answer.php  # Answer checking
│   │   ├── features.txt     # Word features database
│   │   ├── css/            # Stylesheets
│   │   ├── js/             # JavaScript files
│   │   └── images/         # Image assets
│   ├── theory.md           # Experiment theory
│   ├── objective.md        # Learning objectives
│   ├── procedure.md        # Step-by-step procedure
│   └── assignment.md       # Practice assignments
├── pedagogy/               # Educational documentation
└── storyboard/            # Experiment storyboard
```

## How to Use the Application

1. **Select Language:** Choose between English and Hindi
2. **Select Word:** Pick a word from the dropdown menu
3. **Analyze Features:** Select morphological features (root, category, gender, number, person, case, tense)
4. **Check Answer:** Click the "Check" button to verify your analysis
5. **Get Feedback:** View correct/incorrect indicators and get the right answers if needed

## Features

- **Interactive Word Analysis:** Analyze morphological features of words
- **Multi-language Support:** English and Hindi word analysis
- **Real-time Feedback:** Immediate validation of answers
- **Educational Content:** Theory, objectives, and assignments included
- **Responsive Design:** Works on desktop and mobile devices

## Troubleshooting

### Common Issues:

1. **PHP files not loading:**
   - Ensure PHP is installed and running
   - Check that the PHP server is started on port 8080
   - Verify file permissions

2. **Database/Features not loading:**
   - Check that `features.txt` exists in the simulation directory
   - Ensure proper file encoding (UTF-8)

3. **Styling issues:**
   - Clear browser cache
   - Check that CSS files are loading properly

4. **JavaScript errors:**
   - Open browser developer tools (F12) to check for errors
   - Ensure jQuery is loaded properly

### Development Mode:

For development, you can also run the application directly by opening:
```
experiment/simulation/index.html
```
in your browser, but PHP functionality will require a server.

## Contributing

This is a Virtual Labs educational experiment. For contributions or issues, please follow the Virtual Labs development guidelines.

## License

This project is licensed under the GNU Affero General Public License v3.0 - see the LICENSE file for details.