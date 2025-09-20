// Demo page initialization script
// This handles all the interactive demo functionality

function simulateImageCaptioning() {
  const button = event.target;
  const originalText = button.textContent;
  
  button.textContent = 'Generating caption...';
  button.disabled = true;
  
  setTimeout(() => {
    const image = document.getElementById('demo-image');
    image.innerHTML = `
      <div style="text-align: center; color: #2d3748;">
        <div style="font-weight: 600; margin-bottom: 0.5rem;">AI Caption Generated:</div>
        <div>"A beautiful landscape with mountains and a clear blue sky"</div>
        <div style="font-size: 0.9rem; color: #718096; margin-top: 0.5rem;">
          Confidence: 95% | Source: AI Analysis
        </div>
      </div>
    `;
    image.style.background = '#c6f6d5';
    image.style.borderColor = '#48bb78';
    
    button.textContent = 'Caption Generated ✓';
    button.style.background = '#48bb78';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
      button.style.background = '';
      image.innerHTML = '<span>Sample Image - Click "Describe" to see AI captioning</span>';
      image.style.background = '#f7fafc';
      image.style.borderColor = '#cbd5e0';
    }, 3000);
  }, 2000);
}

function simulateTTS() {
  const button = event.target;
  const originalText = button.textContent;
  
  button.textContent = 'Reading...';
  button.disabled = true;
  
  // Simulate TTS with visual feedback
  const textElement = document.getElementById('tts-demo-text');
  textElement.style.background = '#ebf8ff';
  textElement.style.borderLeftColor = '#3182ce';
  
  setTimeout(() => {
    button.textContent = 'Reading Complete ✓';
    button.style.background = '#48bb78';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
      button.style.background = '';
      textElement.style.background = '#f7fafc';
      textElement.style.borderLeftColor = '#3182ce';
    }, 2000);
  }, 3000);
}

function simulateVoiceCommands() {
  const button = event.target;
  const originalText = button.textContent;
  
  button.textContent = 'Listening...';
  button.style.background = '#e53e3e';
  
  // Simulate voice command recognition
  setTimeout(() => {
    button.textContent = 'Command: "Scroll down" ✓';
    button.style.background = '#48bb78';
    
    // Simulate scroll
    window.scrollBy(0, 200);
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '';
    }, 2000);
  }, 1500);
}

function simulateContrastFix() {
  const button = event.target;
  const originalText = button.textContent;
  
  button.textContent = 'Applying fix...';
  button.disabled = true;
  
  const textElement = document.querySelector('.demo-text[style*="background: #f0f0f0"]');
  
  setTimeout(() => {
    textElement.style.background = '#1a202c';
    textElement.style.color = '#ffffff';
    textElement.style.borderLeftColor = '#ffffff';
    
    button.textContent = 'Contrast Fixed ✓';
    button.style.background = '#48bb78';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
      button.style.background = '';
      textElement.style.background = '#f0f0f0';
      textElement.style.color = '#666';
      textElement.style.borderLeftColor = '#666';
    }, 3000);
  }, 1000);
}

function simulateKeyboardNav() {
  const button = event.target;
  const originalText = button.textContent;
  
  button.textContent = 'Testing navigation...';
  button.disabled = true;
  
  // Simulate keyboard navigation
  let currentElement = document.activeElement;
  const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
  
  let index = 0;
  const interval = setInterval(() => {
    if (index < focusableElements.length) {
      focusableElements[index].focus();
      focusableElements[index].style.outline = '3px solid #3182ce';
      
      setTimeout(() => {
        focusableElements[index].style.outline = '';
      }, 500);
      
      index++;
    } else {
      clearInterval(interval);
      button.textContent = 'Navigation Test Complete ✓';
      button.style.background = '#48bb78';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        button.style.background = '';
      }, 2000);
    }
  }, 600);
}

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-navigation');
  }
});

document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-navigation');
});

// Add focus styles for keyboard navigation
const style = document.createElement('style');
style.textContent = `
  .keyboard-navigation *:focus {
    outline: 3px solid #3182ce !important;
    outline-offset: 2px !important;
  }
`;
document.head.appendChild(style);

// Expose functions globally for onclick handlers
window.simulateImageCaptioning = simulateImageCaptioning;
window.simulateTTS = simulateTTS;
window.simulateVoiceCommands = simulateVoiceCommands;
window.simulateContrastFix = simulateContrastFix;
window.simulateKeyboardNav = simulateKeyboardNav;
