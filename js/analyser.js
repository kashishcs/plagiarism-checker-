const PlagiarismAnalyser = {
  // Main analysis function
  analyze(originalText, checkText, includeWebCheck = false) {
    return new Promise((resolve, reject) => {
      if (!originalText.trim() || !checkText.trim()) {
        reject(new Error('Both texts must contain content'));
        return;
      }

      const results = {
        algorithms: {},
        overallScore: 0,
        webSources: [],
        matchingWords: []
      };

      // Define algorithms with weights
      const algorithms = [
        { name: 'cosine', fn: 'cosineSimilarity', weight: 0.25 },
        { name: 'jaccard', fn: 'jaccardSimilarity', weight: 0.20 },
        { name: 'levenshtein', fn: 'levenshteinSimilarity', weight: 0.15 },
        { name: 'dice', fn: 'diceSimilarity', weight: 0.20 },
        { name: 'overlap', fn: 'wordOverlap', weight: 0.20 }
      ];

      // Process algorithms sequentially with delay for visual effect
      let index = 0;
      const processNext = () => {
        if (index >= algorithms.length) {
          // All algorithms complete
          results.overallScore = this.calculateOverallScore(results.algorithms);
          results.matchingWords = PlagiarismAlgorithms.getMatchingWords(originalText, checkText);

          // Simulate web check if enabled
          if (includeWebCheck) {
            setTimeout(() => {
              results.webSources = this.simulateWebCheck(results.overallScore);
              resolve(results);
            }, 500);
          } else {
            resolve(results);
          }
          return;
        }

        const algo = algorithms[index];
        
        setTimeout(() => {
          const score = PlagiarismAlgorithms[algo.fn](originalText, checkText);
          results.algorithms[algo.name] = {
            score: score,
            weight: algo.weight,
            name: this.getAlgorithmName(algo.name)
          };
          index++;
          processNext();
        }, 300);
      };

      processNext();
    });
  },

  // Calculate weighted overall score
  calculateOverallScore(algorithms) {
    let totalScore = 0;
    let totalWeight = 0;

    for (const algo in algorithms) {
      totalScore += algorithms[algo].score * algorithms[algo].weight;
      totalWeight += algorithms[algo].weight;
    }

    return Math.round(totalScore / totalWeight);
  },

  // Get human-readable algorithm name
  getAlgorithmName(key) {
    const names = {
      cosine: 'Cosine Similarity',
      jaccard: 'Jaccard Index',
      levenshtein: 'Levenshtein Distance',
      dice: 'Dice Coefficient',
      overlap: 'Word Overlap'
    };
    return names[key] || key;
  },

  // Simulate web source checking (demo mode)
  simulateWebCheck(overallScore) {
    const sources = [
      { url: 'wikipedia.org/article', title: 'Wikipedia Article', matchPercent: overallScore + 10 },
      { url: 'medium.com/blog-post', title: 'Medium Blog Post', matchPercent: overallScore + 5 },
      { url: 'researchgate.net/publication', title: 'Research Paper', matchPercent: overallScore },
      { url: 'stackoverflow.com/questions', title: 'Stack Overflow Discussion', matchPercent: overallScore - 5 }
    ];

    // Return sources based on score threshold
    if (overallScore < 30) return [];

    const numSources = Math.min(4, Math.floor(overallScore / 20));
    return sources.slice(0, numSources).map(source => ({
      ...source,
      matchPercent: Math.min(95, Math.round(source.matchPercent))
    }));
  },

  // Generate breakdown for display
  generateBreakdown(algorithms) {
    const breakdown = [];
    
    for (const key in algorithms) {
      const algo = algorithms[key];
      breakdown.push({
        name: algo.name,
        score: algo.score,
        weight: Math.round(algo.weight * 100)
      });
    }

    // Sort by weighted score (highest first)
    breakdown.sort((a, b) => (b.score * b.weight) - (a.score * a.weight));

    return breakdown;
  }
};
