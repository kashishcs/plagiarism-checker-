const PlagiarismAlgorithms = {
  // Tokenize text into words (removes punctuation, converts to lowercase)
  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  },

  // Get word bigrams (pairs of consecutive words)
  getBigrams(text) {
    const words = this.tokenize(text);
    const bigrams = [];
    for (let i = 0; i < words.length - 1; i++) {
      bigrams.push(words[i] + ' ' + words[i + 1]);
    }
    return bigrams;
  },

  // Algorithm 1: Cosine Similarity (Vector Space Model)
  cosineSimilarity(text1, text2) {
    const words1 = this.tokenize(text1);
    const words2 = this.tokenize(text2);

    // Create vocabulary (all unique words)
    const allWords = {};
    words1.forEach(word => allWords[word] = true);
    words2.forEach(word => allWords[word] = true);
    const vocabulary = Object.keys(allWords);

    // Create frequency vectors
    const vector1 = [];
    const vector2 = [];

    vocabulary.forEach(word => {
      vector1.push(words1.filter(w => w === word).length);
      vector2.push(words2.filter(w => w === word).length);
    });

    // Calculate dot product and magnitudes
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
      magnitude1 += vector1[i] * vector1[i];
      magnitude2 += vector2[i] * vector2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    return Math.round((dotProduct / (magnitude1 * magnitude2)) * 100);
  },

  // Algorithm 2: Jaccard Similarity (Set-based)
  jaccardSimilarity(text1, text2) {
    const words1 = this.tokenize(text1);
    const words2 = this.tokenize(text2);

    const set1 = new Set(words1);
    const set2 = new Set(words2);

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    if (union.size === 0) return 0;

    return Math.round((intersection.size / union.size) * 100);
  },

  // Algorithm 3: Levenshtein Distance (Edit Distance)
  levenshteinSimilarity(text1, text2) {
    const s1 = text1.toLowerCase().trim();
    const s2 = text2.toLowerCase().trim();

    if (s1.length === 0 || s2.length === 0) return 0;

    // Create matrix
    const matrix = [];
    for (let i = 0; i <= s1.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= s2.length; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= s1.length; i++) {
      for (let j = 1; j <= s2.length; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    const distance = matrix[s1.length][s2.length];
    const maxLength = Math.max(s1.length, s2.length);

    return Math.round(((maxLength - distance) / maxLength) * 100);
  },

  // Algorithm 4: Dice Coefficient (Bigram-based)
  diceSimilarity(text1, text2) {
    const bigrams1 = this.getBigrams(text1);
    const bigrams2 = this.getBigrams(text2);

    if (bigrams1.length === 0 || bigrams2.length === 0) return 0;

    const set1 = new Set(bigrams1);
    const set2 = new Set(bigrams2);

    const intersection = new Set([...set1].filter(x => set2.has(x)));

    return Math.round((2 * intersection.size / (bigrams1.length + bigrams2.length)) * 100);
  },

  // Algorithm 5: Word Overlap Coefficient
  wordOverlap(text1, text2) {
    const words1 = this.tokenize(text1);
    const words2 = this.tokenize(text2);

    const set1 = new Set(words1);
    const set2 = new Set(words2);

    const intersection = new Set([...set2].filter(x => set1.has(x)));

    if (set2.size === 0) return 0;

    return Math.round((intersection.size / set2.size) * 100);
  },

  // Get list of matching words between two texts
  getMatchingWords(text1, text2) {
    const words1 = this.tokenize(text1);
    const words2 = this.tokenize(text2);

    const set1 = new Set(words1);
    const matches = [...new Set(words2.filter(word => set1.has(word)))];

    return matches;
  }
};
