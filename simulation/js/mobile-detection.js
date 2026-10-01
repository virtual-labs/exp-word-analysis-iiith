// Mobile Detection and Overlay Script
// This script detects mobile devices and shows a desktop optimization warning

class MobileDetection {
  constructor() {
    this.isMobile = this.detectMobile();
    this.overlayShown = false;
    this.init();
  }

  detectMobile() {
    // Check for mobile user agents
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // Mobile device patterns
    const mobilePatterns = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i,
      /Opera Mini/i,
      /IEMobile/i,
      /Mobile/i
    ];

    // Check screen size (additional check for small screens)
    const isSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 600;
    
    // Check touch capability
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Return true if any mobile pattern matches OR if it's a small touch screen
    return mobilePatterns.some(pattern => pattern.test(userAgent)) || 
           (isSmallScreen && isTouchDevice);
  }

  init() {
    if (this.isMobile && !this.overlayShown) {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.showOverlay());
      } else {
        this.showOverlay();
      }
    }
  }

  showOverlay() {
    if (this.overlayShown) return;
    
    this.overlayShown = true;

    // Create overlay HTML
    const overlay = document.createElement('div');
    overlay.id = 'mobile-warning-overlay';
    overlay.innerHTML = `
      <div class="mobile-overlay-backdrop">
        <div class="mobile-overlay-content">
          <div class="mobile-overlay-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z" stroke="#f59e0b" stroke-width="2" fill="#fef3c7"/>
              <path d="M12 8V13M12 16H12.01" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h2 class="mobile-overlay-title">Desktop Experience Recommended</h2>
          <p class="mobile-overlay-description">
            This word analysis experiment is optimized for desktop computers with larger screens and mouse interaction. 
            While you can continue on mobile, you may experience:
          </p>
          <ul class="mobile-overlay-list">
            <li>• Difficulty interacting with complex word forms</li>
            <li>• Limited screen space for morphological analysis</li>
            <li>• Reduced functionality for feature selection</li>
            <li>• Suboptimal user experience</li>
          </ul>
          <div class="mobile-overlay-actions">
            <button class="mobile-overlay-btn mobile-overlay-btn-primary" onclick="mobileDetection.continueAnyway()">
              Continue Anyway
            </button>
            <button class="mobile-overlay-btn mobile-overlay-btn-secondary" onclick="mobileDetection.goBack()">
              Use Desktop Instead
            </button>
          </div>
          <p class="mobile-overlay-footer">
            For the best learning experience, please access this on a desktop or laptop computer.
          </p>
        </div>
      </div>
    `;

    // Add overlay styles
    const styles = `
      <style>
        .mobile-overlay-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(4px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.3s ease-out;
        }

        .mobile-overlay-content {
          background: white;
          border-radius: 16px;
          padding: 24px;
          max-width: 400px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          text-align: center;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: slideUp 0.3s ease-out;
        }

        .mobile-overlay-icon {
          margin: 0 auto 16px;
          width: 48px;
          height: 48px;
        }

        .mobile-overlay-title {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 12px;
          line-height: 1.3;
        }

        .mobile-overlay-description {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 16px;
          line-height: 1.5;
          text-align: left;
        }

        .mobile-overlay-list {
          text-align: left;
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 20px;
          padding-left: 0;
          list-style: none;
        }

        .mobile-overlay-list li {
          margin-bottom: 6px;
          line-height: 1.4;
        }

        .mobile-overlay-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .mobile-overlay-btn {
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }

        .mobile-overlay-btn-primary {
          background: #3b82f6;
          color: white;
        }

        .mobile-overlay-btn-primary:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .mobile-overlay-btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .mobile-overlay-btn-secondary:hover {
          background: #e5e7eb;
          transform: translateY(-1px);
        }

        .mobile-overlay-footer {
          font-size: 12px;
          color: #9ca3af;
          line-height: 1.4;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (min-width: 480px) {
          .mobile-overlay-actions {
            flex-direction: row;
          }
          
          .mobile-overlay-btn {
            width: auto;
            flex: 1;
          }
        }
      </style>
    `;

    // Add styles to head
    document.head.insertAdjacentHTML('beforeend', styles);
    
    // Add overlay to body
    document.body.appendChild(overlay);
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
  }

  continueAnyway() {
    this.hideOverlay();
  }

  goBack() {
    // Try to go back in history, or redirect to a homepage if available
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // You can customize this to redirect to your main page
      alert('Please bookmark this page and open it on a desktop computer for the best experience.');
    }
  }

  hideOverlay() {
    const overlay = document.getElementById('mobile-warning-overlay');
    if (overlay) {
      overlay.style.animation = 'fadeOut 0.3s ease-out forwards';
      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = '';
      }, 300);
    }
  }
}

// Add fadeOut animation
document.head.insertAdjacentHTML('beforeend', `
  <style>
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  </style>
`);

// Initialize mobile detection
const mobileDetection = new MobileDetection();

// Export for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileDetection;
} 