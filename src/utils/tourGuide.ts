import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
// Import our custom styles (these will override the default styles)
import '../styles/driver-custom.css';

// Define tour steps for the dashboard
const dashboardTourSteps = [
  {
    element: '#dashboard-welcome',
    popover: {
      title: 'Welcome to SkillSync!',
      description: 'This is your dashboard where you can analyze and improve your resume.',
      position: 'bottom'
    }
  },
  {
    element: '#upload-area',
    popover: {
      title: 'Upload Your Resume',
      description: 'Drag and drop your resume file here or click to browse files.',
      position: 'top'
    }
  },
  {
    element: '#analyze-button',
    popover: {
      title: 'Analyze Your Resume',
      description: 'Click this button to analyze your resume and get feedback.',
      position: 'bottom'
    }
  },
  {
    element: '#edit-button',
    popover: {
      title: 'Edit Your Resume',
      description: 'After analysis, you can edit your resume to improve it.',
      position: 'left'
    }
  },
  {
    element: '.navbar-logo',
    popover: {
      title: 'Navigation',
      description: 'Click here to go back to the home page anytime.',
      position: 'bottom'
    }
  }
];

// Create a tour guide instance
export const createDashboardTour = () => {
  // Get the current theme from body class
  const isDarkMode = document.body.classList.contains('dark');

  const driverObj = driver({
    showProgress: true,
    steps: dashboardTourSteps,
    nextBtnText: 'Next',
    prevBtnText: 'Previous',
    doneBtnText: 'Done',
    animate: true,
    overlayColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)',
    stagePadding: 12,
    onHighlightStarted: (element) => {
      // Scroll to element if needed
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    onDeselected: (element) => {
      console.log('Element deselected', element);
    },
    onDestroyed: () => {
      // Save that the tour has been completed
      localStorage.setItem('dashboard_tour_completed', 'true');
    }
  });

  return driverObj;
};

// Check if the user has already seen the tour
export const shouldShowTour = () => {
  return localStorage.getItem('dashboard_tour_completed') !== 'true';
};

// Start the dashboard tour
export const startDashboardTour = () => {
  const tourGuide = createDashboardTour();
  tourGuide.drive();
};
