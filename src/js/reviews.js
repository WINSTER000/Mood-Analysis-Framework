// MovieSense - Sentiment Analysis App
// Pure JavaScript implementation matching React functionality

class MovieSenseApp {
  constructor() {
    // Sample reviews from constants/sampleReviews.ts
    this.sampleReviews = [
      "This movie was absolutely incredible! The cinematography was breathtaking and the acting was superb. I loved every minute of it.",
      "What a disappointing film. The plot was confusing and the characters were poorly developed. Complete waste of time.",
      "It was an okay movie. Not great, not terrible. Some parts were interesting but overall pretty average."
    ];

    // Sentiment analysis word lists from utils/sentimentAnalysis.ts
    this.positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best', 'brilliant', 'outstanding', 'perfect', 'incredible', 'awesome', 'superb'];
    this.negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'worst', 'boring', 'disappointing', 'stupid', 'pathetic', 'waste', 'poorly', 'failed'];

    // Application state
    this.state = {
      reviewText: '',
      isAnalyzing: false,
      currentResult: null,
      analyzedReviews: [],
      isDarkMode: false
    };

    this.init();
  }

  init() {
    this.setupEventListeners();
    // this.initTheme();
    this.updateAnalyzeButton();
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  setupEventListeners() {
    // Theme toggle
    // document.getElementById('review-theme-toggle').addEventListener('click', () => {
    //   this.toggleTheme();
    // });

    // Review input
    document.getElementById('review-input-text').addEventListener('input', (e) => {
      this.state.reviewText = e.target.value;
      this.updateAnalyzeButton();
    });

    // Analyze button
    document.getElementById('review-analyze-btn').addEventListener('click', () => {
      this.handleAnalyze();
    });

    // Sample buttons
    document.querySelectorAll('.review-sample-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sampleIndex = parseInt(e.target.getAttribute('data-sample'));
        this.loadSampleReview(sampleIndex);
      });
    });
  }

  // initTheme() {
  //   // Check for saved theme preference or default to light mode
  //   const savedTheme = localStorage.getItem('theme');
  //   const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
  //   if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
  //     this.state.isDarkMode = true;
  //     document.documentElement.classList.add('dark');
  //     document.getElementById('review-theme-icon').setAttribute('data-lucide', 'sun');
  //   } else {
  //     this.state.isDarkMode = false;
  //     document.getElementById('review-theme-icon').setAttribute('data-lucide', 'moon');
  //   }

  //   if (typeof lucide !== 'undefined') {
  //     lucide.createIcons();
  //   }
  // }

  // toggleTheme() {
  //   this.state.isDarkMode = !this.state.isDarkMode;
    
  //   if (this.state.isDarkMode) {
  //     document.documentElement.classList.add('dark');
  //     localStorage.setItem('theme', 'dark');
  //     document.getElementById('review-theme-icon').setAttribute('data-lucide', 'sun');
  //   } else {
  //     document.documentElement.classList.remove('dark');
  //     localStorage.setItem('theme', 'light');
  //     document.getElementById('review-theme-icon').setAttribute('data-lucide', 'moon');
  //   }

  //   if (typeof lucide !== 'undefined') {
  //     lucide.createIcons();
  //   }
  // }

  updateAnalyzeButton() {
    const analyzeBtn = document.getElementById('review-analyze-btn');
    const hasText = this.state.reviewText.trim().length > 0;
    
    analyzeBtn.disabled = !hasText || this.state.isAnalyzing;
  }

  loadSampleReview(index) {
    if (index >= 0 && index < this.sampleReviews.length) {
      this.state.reviewText = this.sampleReviews[index];
      document.getElementById('review-input-text').value = this.state.reviewText;
      this.updateAnalyzeButton();
    }
  }

  async handleAnalyze() {
    if (!this.state.reviewText.trim() || this.state.isAnalyzing) return;
    
    this.state.isAnalyzing = true;
    this.updateAnalyzeButton();
    
    // Update button text to show analyzing state
    const analyzeText = document.getElementById('review-analyze-text');
    analyzeText.textContent = 'Analyzing...';
    analyzeText.classList.add('review-animate-pulse');
    
    // Simulate API call delay like in React version
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const result = this.analyzeSentiment(this.state.reviewText);
    this.state.currentResult = result;
    
    // Add to analysis history
    const newAnalyzedReview = {
      id: Date.now().toString(),
      text: this.state.reviewText,
      result: result,
      timestamp: new Date()
    };
    
    this.state.analyzedReviews = [newAnalyzedReview, ...this.state.analyzedReviews.slice(0, 4)]; // Keep last 5
    
    this.state.isAnalyzing = false;
    this.updateAnalyzeButton();
    
    // Reset button text
    analyzeText.textContent = 'Analyze Sentiment';
    analyzeText.classList.remove('review-animate-pulse');
    
    // Render results
    this.renderSentimentResult(result);
    this.renderAnalysisHistory();
  }

  // Sentiment analysis logic from utils/sentimentAnalysis.ts
  analyzeSentiment(text) {
    const words = text.toLowerCase().split(' ');
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    words.forEach(word => {
      if (this.positiveWords.includes(word)) positiveScore += 1;
      if (this.negativeWords.includes(word)) negativeScore += 1;
    });
    
    // Add some randomness for more realistic results
    positiveScore += Math.random() * 2;
    negativeScore += Math.random() * 2;
    
    const total = positiveScore + negativeScore + 1; // +1 for neutral baseline
    const normalizedPositive = positiveScore / total;
    const normalizedNegative = negativeScore / total;
    const normalizedNeutral = 1 / total;
    
    let sentiment;
    let confidence;
    
    if (normalizedPositive > normalizedNegative && normalizedPositive > normalizedNeutral) {
      sentiment = 'positive';
      confidence = normalizedPositive;
    } else if (normalizedNegative > normalizedPositive && normalizedNegative > normalizedNeutral) {
      sentiment = 'negative';
      confidence = normalizedNegative;
    } else {
      sentiment = 'neutral';
      confidence = normalizedNeutral;
    }
    
    return {
      sentiment,
      confidence: Math.min(confidence * 100, 95), // Cap at 95% for realism
      scores: {
        positive: normalizedPositive * 100,
        negative: normalizedNegative * 100,
        neutral: normalizedNeutral * 100
      }
    };
  }

  getSentimentIcon(sentiment) {
    switch (sentiment) {
      case 'positive': 
        return { icon: 'smile', class: 'review-text-green-500' };
      case 'negative': 
        return { icon: 'frown', class: 'review-text-red-500' };
      default: 
        return { icon: 'meh', class: 'review-text-yellow-500' };
    }
  }

  renderSentimentResult(result) {
    const resultCard = document.getElementById('review-result-card');
    const resultIcon = document.getElementById('review-result-icon');
    const sentimentBadge = document.getElementById('review-sentiment-badge');
    const confidenceScore = document.getElementById('review-confidence-score');
    
    // Show the result card
    resultCard.classList.remove('review-hidden');
    
    // Update icon
    const iconInfo = this.getSentimentIcon(result.sentiment);
    resultIcon.setAttribute('data-lucide', iconInfo.icon);
    resultIcon.className = `review-w-5 review-h-5 ${iconInfo.class}`;
    
    // Update badge
    sentimentBadge.textContent = result.sentiment.toUpperCase();
    
    // Update confidence
    confidenceScore.textContent = result.confidence.toFixed(1);
    
    // Update progress bars and scores
    this.updateProgressBar('positive', result.scores.positive);
    this.updateProgressBar('negative', result.scores.negative);
    this.updateProgressBar('neutral', result.scores.neutral);
    
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  updateProgressBar(type, value) {
    const scoreElement = document.getElementById(`review-${type}-score`);
    const progressElement = document.getElementById(`review-${type}-progress`);
    
    scoreElement.textContent = `${value.toFixed(1)}%`;
    progressElement.style.width = `${value}%`;
  }

  renderAnalysisHistory() {
    const historyCard = document.getElementById('review-history-card');
    const historyContent = document.getElementById('review-history-content');
    
    if (this.state.analyzedReviews.length === 0) {
      historyCard.classList.add('review-hidden');
      return;
    }
    
    historyCard.classList.remove('review-hidden');
    
    historyContent.innerHTML = this.state.analyzedReviews.map(review => {
      const iconInfo = this.getSentimentIcon(review.result.sentiment);
      
      return `
        <div class="review-border review-rounded-lg review-p-3 review-space-y-2">
          <div class="review-flex review-items-center review-justify-between">
            <div class="review-flex review-items-center review-gap-2">
              <i data-lucide="${iconInfo.icon}" class="review-w-4 review-h-4 ${iconInfo.class}"></i>
              <span class="review-badge-outline">
                ${review.result.sentiment}
              </span>
              <span class="review-text-sm review-text-muted-foreground">
                ${review.result.confidence.toFixed(1)}% confidence
              </span>
            </div>
            <span class="review-text-xs review-text-muted-foreground">
              ${review.timestamp.toLocaleTimeString()}
            </span>
          </div>
          <p class="review-text-sm review-text-muted-foreground review-line-clamp-2">
            ${review.text}
          </p>
        </div>
      `;
    }).join('');
    
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const app = new MovieSenseApp();
  
  // Make app globally available for debugging
  window.movieSenseApp = app;
  
  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});