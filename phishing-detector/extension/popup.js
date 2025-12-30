const API_URL = "http://127.0.0.1:8001";

const PHISHING_KEYWORDS = [
  'verify', 'account', 'suspend', 'confirm', 'urgent', 'immediate',
  'click', 'update', 'secure', 'banking', 'password', 'login',
  'paypal', 'ebay', 'amazon', 'apple', 'microsoft', 'security',
  'alert', 'warning', 'expire', 'limited', 'act now', 'congratulations',
  'winner', 'claim', 'prize', 'free', 'bonus', 'offer'
];

const URGENCY_PHRASES = [
  'act now', 'urgent', 'immediate action', 'within 24 hours',
  'expire', 'suspended', 'locked', 'unusual activity',
  'verify immediately', 'confirm now', 'click here now',
  'limited time', 'last chance', 'don\'t miss'
];

const SUSPICIOUS_DOMAINS = [
  'tk', 'ml', 'ga', 'cf', 'gq', 'bit.ly', 'tinyurl',
  'xyz', 'top', 'click', 'loan', 'download'
];

class PhishingDetector {
  analyzeURL(url) {
    let score = 0;
    const reasons = [];

    try {
      const urlObj = new URL(url);
      
      if (!urlObj.protocol.includes('https')) {
        score += 20;
        reasons.push('Non-HTTPS connection (insecure)');
      }

      if (urlObj.hostname.length > 40) {
        score += 15;
        reasons.push('Unusually long domain name');
      }

      const specialCharCount = (urlObj.href.match(/[@\-_]/g) || []).length;
      if (specialCharCount > 3) {
        score += 15;
        reasons.push(`High special character count (${specialCharCount})`);
      }

      const dotCount = (urlObj.hostname.match(/\./g) || []).length;
      if (dotCount > 3) {
        score += 15;
        reasons.push(`Multiple subdomains detected (${dotCount} dots)`);
      }

      if (urlObj.href.includes('@')) {
        score += 25;
        reasons.push('Contains @ symbol (URL obfuscation)');
      }

      const digitCount = (urlObj.hostname.match(/\d/g) || []).length;
      if (digitCount > 3) {
        score += 10;
        reasons.push(`Many digits in domain (${digitCount})`);
      }

      const lowerURL = urlObj.href.toLowerCase();
      const foundKeywords = PHISHING_KEYWORDS.filter(kw => lowerURL.includes(kw));
      if (foundKeywords.length > 0) {
        score += foundKeywords.length * 10;
        reasons.push(`Suspicious keywords: ${foundKeywords.slice(0, 3).join(', ')}`);
      }

      const foundSuspiciousTLD = SUSPICIOUS_DOMAINS.find(tld => 
        urlObj.hostname.endsWith(`.${tld}`) || urlObj.hostname.includes(tld)
      );
      if (foundSuspiciousTLD) {
        score += 20;
        reasons.push(`Suspicious TLD or domain: .${foundSuspiciousTLD}`);
      }

      if (urlObj.href.length > 100) {
        score += 10;
        reasons.push('Extremely long URL');
      }

      const isPhishing = score >= 40;
      
      return {
        isPhishing,
        score,
        confidence: Math.min(95, 50 + score),
        reasons: reasons.length > 0 ? reasons : ['URL structure appears normal'],
        algorithm: 'Random Forest (Simulated)'
      };
    } catch (e) {
      return {
        isPhishing: true,
        score: 100,
        confidence: 90,
        reasons: ['Invalid or malformed URL'],
        algorithm: 'Random Forest (Simulated)'
      };
    }
  }

  analyzeText(text) {
    let score = 0;
    const reasons = [];
    const lowerText = text.toLowerCase();

    const foundKeywords = PHISHING_KEYWORDS.filter(kw => lowerText.includes(kw));
    if (foundKeywords.length > 2) {
      score += foundKeywords.length * 8;
      reasons.push(`Phishing keywords detected: ${foundKeywords.slice(0, 4).join(', ')}`);
    }

    const foundUrgency = URGENCY_PHRASES.filter(phrase => lowerText.includes(phrase));
    if (foundUrgency.length > 0) {
      score += foundUrgency.length * 15;
      reasons.push(`Urgency tactics: "${foundUrgency[0]}"`);
    }

    const linkCount = (text.match(/https?:\/\//gi) || []).length;
    if (linkCount > 2) {
      score += 10;
      reasons.push(`Multiple links present (${linkCount})`);
    }

    if (/click here|click now|click below/i.test(text)) {
      score += 15;
      reasons.push('Suspicious call-to-action phrases');
    }

    if (/dear (customer|user|member)/i.test(text)) {
      score += 10;
      reasons.push('Generic greeting (not personalized)');
    }

    if (/\$\d+|prize|reward|won|winner/i.test(text)) {
      score += 12;
      reasons.push('Financial incentive or prize mention');
    }

    const capsPercentage = (text.match(/[A-Z]/g) || []).length / text.length;
    if (capsPercentage > 0.3 && text.length > 20) {
      score += 10;
      reasons.push('Excessive capitalization');
    }

    if (text.length < 30) {
      score += 5;
      reasons.push('Very short message (suspicious)');
    }

    const isPhishing = score >= 35;

    return {
      isPhishing,
      score,
      confidence: Math.min(95, 45 + score),
      reasons: reasons.length > 0 ? reasons : ['Text appears legitimate'],
      algorithm: 'TF-IDF + DistilBERT (Simulated)'
    };
  }
}

const detector = new PhishingDetector();

function displayResult(elementId, result) {
  const resultBox = document.getElementById(elementId);
  const classification = result.isPhishing ? 'PHISHING' : 'LEGITIMATE';
  const icon = result.isPhishing ? '⚠️' : '✅';
  const cssClass = result.isPhishing ? 'phishing' : 'legitimate';

  resultBox.className = `result-box ${cssClass}`;
  resultBox.innerHTML = `
    <div class="result-title">
      <span>${icon}</span>
      <span>${classification}</span>
      <span style="font-size: 12px; font-weight: normal; margin-left: auto;">
        ${result.confidence}% confidence
      </span>
    </div>
    <div class="result-explanation">
      ${result.isPhishing ? 
        'This content shows signs of phishing. Exercise caution.' : 
        'This content appears legitimate based on analysis.'}
    </div>
    <div class="result-details">
      <div class="detail-item"><strong>Algorithm:</strong> ${result.algorithm}</div>
      <div class="detail-item"><strong>Risk Score:</strong> ${result.score}/100</div>
      <div class="detail-item"><strong>Analysis:</strong></div>
      ${result.reasons.map(r => `<div class="detail-item">• ${r}</div>`).join('')}
    </div>
  `;
  resultBox.classList.remove('hidden');
}

function showScanning(elementId, message) {
  const resultBox = document.getElementById(elementId);
  resultBox.className = 'result-box scanning';
  resultBox.innerHTML = `
    <div class="result-title">
      <span class="spinner"></span>
      <span>${message}</span>
    </div>
  `;
  resultBox.classList.remove('hidden');
}

document.getElementById('scanUrlBtn').addEventListener('click', () => {
  const url = document.getElementById('urlInput').value.trim();
  
  if (!url) {
    alert('Please enter a URL to scan');
    return;
  }

  showScanning('urlResult', 'Scanning URL...');
  
  setTimeout(() => {
    const result = detector.analyzeURL(url);
    displayResult('urlResult', result);
  }, 800);
});

document.getElementById('scanCurrentBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      const url = tabs[0].url;
      document.getElementById('urlInput').value = url;
      
      showScanning('urlResult', 'Scanning Current Tab...');
      
      setTimeout(() => {
        const result = detector.analyzeURL(url);
        displayResult('urlResult', result);
      }, 800);
    }
  });
});

document.getElementById('scanTextBtn').addEventListener('click', () => {
  const text = document.getElementById('textInput').value.trim();
  
  if (!text) {
    alert('Please enter text to analyze');
    return;
  }

  showScanning('textResult', 'Analyzing Text...');
  
  setTimeout(() => {
    const result = detector.analyzeText(text);
    displayResult('textResult', result);
  }, 1000);
});

document.getElementById('urlInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('scanUrlBtn').click();
  }
});