(function() {
  'use strict';

  console.log('🚀 Plagiarism Checker Starting...');

  // DOM Elements
  const elements = {
    text1: document.getElementById('originalText'),
    text2: document.getElementById('checkText'),
    count1: document.getElementById('originalCount'),
    count2: document.getElementById('checkCount'),
    swapBtn: document.getElementById('swapBtn'),
    clearBtn: document.getElementById('clearBtn'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    webCheck: document.getElementById('webCheckToggle'),
    loading: document.getElementById('loadingOverlay')
  };

  // ========== CHARACTER COUNTING ==========
  function updateCharCount(textarea, counter) {
    if (textarea && counter) {
      textarea.addEventListener('input', () => {
        counter.textContent = `${textarea.value.length} chars`;
      });
    }
  }

  updateCharCount(elements.text1, elements.count1);
  updateCharCount(elements.text2, elements.count2);

  console.log('✅ Character counting enabled!');

  // ========== SWAP TEXTS ==========
  if (elements.swapBtn) {
    elements.swapBtn.addEventListener('click', () => {
      const temp = elements.text1.value;
      elements.text1.value = elements.text2.value;
      elements.text2.value = temp;

      elements.count1.textContent = `${elements.text1.value.length} chars`;
      elements.count2.textContent = `${elements.text2.value.length} chars`;
    });
  }

  // ========== CLEAR ALL ==========
  if (elements.clearBtn) {
    elements.clearBtn.addEventListener('click', () => {
      if (confirm('Clear all text and results?')) {
        elements.text1.value = '';
        elements.text2.value = '';
        elements.count1.textContent = '0 chars';
        elements.count2.textContent = '0 chars';
        resetResults();
      }
    });
  }

  // ========== ANALYZE ==========
  if (elements.analyzeBtn) {
    elements.analyzeBtn.addEventListener('click', () => {
      const text1 = elements.text1.value.trim();
      const text2 = elements.text2.value.trim();

      if (!text1 || !text2) {
        alert('Please enter both texts!');
        return;
      }

      console.log('🔍 Analyzing...');
      elements.loading.classList.add('active');
      resetResults();

      setTimeout(() => {
        PlagiarismAnalyser.analyze(text1, text2, elements.webCheck.checked)
          .then(results => {
            console.log('✅ Results:', results);
            displayResults(results);
            elements.loading.classList.remove('active');
          })
          .catch(err => {
            alert('Error: ' + err.message);
            elements.loading.classList.remove('active');
          });
      }, 100);
    });
  }

  // ========== KEYBOARD SHORTCUT ==========
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (elements.analyzeBtn) elements.analyzeBtn.click();
    }
  });

  // ========== DISPLAY RESULTS ==========
  function displayResults(results) {
    const { overallScore, algorithms } = results;

    // Update main score circle
    updateMainScore(overallScore);

    // Update individual algorithm scores
    updateAlgorithmScores(algorithms, results);
  }

  function updateMainScore(score) {
    const progress = document.getElementById('circleProgress');
    const mainScore = document.getElementById('mainScore');
    const label = document.getElementById('scoreLabel');

    if (!progress || !mainScore || !label) return;

    // Update circle progress
    const offset = 339.292 - (score / 100) * 339.292;
    progress.style.strokeDashoffset = offset;

    // Color based on score
    if (score >= 70) {
      progress.style.stroke = '#ef4444';
      label.textContent = '⚠️ High Risk';
      label.style.color = '#ef4444';
    } else if (score >= 40) {
      progress.style.stroke = '#f59e0b';
      label.textContent = '⚡ Medium Risk';
      label.style.color = '#f59e0b';
    } else {
      progress.style.stroke = '#10b981';
      label.textContent = '✅ Low Risk';
      label.style.color = '#10b981';
    }

    // Animate score number
    animateScore(mainScore, score);
  }

  function animateScore(element, target) {
    let current = 0;
    const increment = Math.ceil(target / 50);
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.round(current);
    }, 20);
  }

  function updateAlgorithmScores(algorithms, results) {
    const keys = ['cosine', 'jaccard', 'levenshtein', 'dice', 'overlap'];
    let count = 0;

    function updateNext(index) {
      if (index >= keys.length) {
        // All algorithms updated, show details
        showBreakdown(algorithms);
        showHighlights(results.matchingWords);
        showWebSources(results.webSources);
        return;
      }

      setTimeout(() => {
        const key = keys[index];
        const algo = algorithms[key];
        const elem = document.getElementById(`score-${key}`);
        
        if (elem) elem.textContent = `${algo.score}%`;

        count++;
        const counter = document.getElementById('algorithmCount');
        if (counter) counter.textContent = `${count}/5 completed`;

        updateNext(index + 1);
      }, 100);
    }

    updateNext(0);
  }

  // ========== SHOW BREAKDOWN ==========
  function showBreakdown(algorithms) {
    const breakdown = PlagiarismAnalyser.generateBreakdown(algorithms);
    const container = document.getElementById('breakdownContent');
    if (!container) return;

    container.innerHTML = '';
    
    breakdown.forEach(item => {
      const div = document.createElement('div');
      div.className = 'breakdown-item';

      const nameSpan = document.createElement('span');
      nameSpan.textContent = `${item.name} (${item.weight}% weight)`;

      const valueSpan = document.createElement('span');
      valueSpan.className = 'breakdown-value';
      valueSpan.textContent = `${item.score}%`;

      div.appendChild(nameSpan);
      div.appendChild(valueSpan);
      container.appendChild(div);
    });
  }

  // ========== SHOW HIGHLIGHTS ==========
  function showHighlights(words) {
    const container = document.getElementById('highlights');
    if (!container) return;

    if (!words || words.length === 0) {
      container.innerHTML = '<p class="placeholder">No matches found</p>';
      return;
    }

    let text = elements.text2.value;
    
    // Sort by length (longest first to avoid partial matches)
    words.sort((a, b) => b.length - a.length);

    // Highlight each word
    words.forEach(word => {
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
      text = text.replace(regex, match => `<span class="highlight-match">${match}</span>`);
    });

    container.innerHTML = text;
  }

  // ========== SHOW WEB SOURCES ==========
  function showWebSources(sources) {
    const card = document.getElementById('webResultsCard');
    const container = document.getElementById('webResults');
    
    if (!card || !container) return;

    if (!sources || sources.length === 0) {
      card.style.display = 'none';
      return;
    }

    card.style.display = 'block';
    container.innerHTML = '';

    sources.forEach(source => {
      const div = document.createElement('div');
      div.className = 'web-source';

      const link = document.createElement('a');
      link.href = `https://${source.url}`;
      link.target = '_blank';
      link.className = 'web-source-url';
      link.textContent = `🔗 ${source.url}`;

      const title = document.createElement('div');
      title.className = 'web-source-title';
      title.textContent = source.title;

      const percent = document.createElement('div');
      percent.className = 'web-source-percent';
      percent.textContent = `${source.matchPercent}% match`;

      div.appendChild(link);
      div.appendChild(title);
      div.appendChild(percent);
      container.appendChild(div);
    });
  }

  // ========== RESET RESULTS ==========
  function resetResults() {
    // Reset main score
    const mainScore = document.getElementById('mainScore');
    const scoreLabel = document.getElementById('scoreLabel');
    const progress = document.getElementById('circleProgress');
    const algoCount = document.getElementById('algorithmCount');

    if (mainScore) mainScore.textContent = '0';
    if (scoreLabel) {
      scoreLabel.textContent = 'Awaiting Analysis';
      scoreLabel.style.color = '#64748b';
    }
    if (progress) progress.style.strokeDashoffset = '339.292';
    if (algoCount) algoCount.textContent = '0/5 completed';

    // Reset algorithm scores
    const keys = ['cosine', 'jaccard', 'levenshtein', 'dice', 'overlap'];
    keys.forEach(key => {
      const elem = document.getElementById(`score-${key}`);
      if (elem) elem.textContent = '--';
    });

    // Reset details
    const breakdown = document.getElementById('breakdownContent');
    if (breakdown) {
      breakdown.innerHTML = '<p class="placeholder">Run analysis to see breakdown</p>';
    }

    const highlights = document.getElementById('highlights');
    if (highlights) {
      highlights.innerHTML = '<p class="placeholder">Matching words will appear here</p>';
    }

    const webCard = document.getElementById('webResultsCard');
    if (webCard) webCard.style.display = 'none';
  }

  console.log('✅ ALL READY! Type in textareas to test!');
})();
