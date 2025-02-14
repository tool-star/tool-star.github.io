// MET values for different activities and intensities
const MET_VALUES = {
    walking: {
        low: 2.5,
        moderate: 3.5,
        high: 4.5
    },
    running: {
        low: 6.0,
        moderate: 8.0,
        high: 10.0
    },
    cycling: {
        low: 4.0,
        moderate: 6.0,
        high: 8.0
    },
    swimming: {
        low: 5.0,
        moderate: 7.0,
        high: 9.0
    },
    weight_training: {
        low: 3.0,
        moderate: 4.0,
        high: 5.0
    },
    yoga: {
        low: 2.0,
        moderate: 3.0,
        high: 4.0
    },
    dancing: {
        low: 3.0,
        moderate: 4.5,
        high: 6.0
    },
    basketball: {
        low: 4.5,
        moderate: 6.0,
        high: 8.0
    },
    soccer: {
        low: 5.0,
        moderate: 7.0,
        high: 9.0
    }
};

// Activity history storage
let activityHistory = JSON.parse(localStorage.getItem('activityHistory')) || [];

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    const calorieForm = document.getElementById('calorie-form');
    const bmiForm = document.getElementById('bmi-form');
    const mobileMenuButton = document.getElementById('mobile-menu');
    const mainNav = document.getElementById('main-nav');
    const menuOverlay = document.getElementById('menu-overlay');
    const body = document.body;

    // Mobile menu toggle
    if (mobileMenuButton && mainNav && menuOverlay) {
        function toggleMenu() {
            mobileMenuButton.classList.toggle('active');
            mainNav.classList.toggle('active');
            menuOverlay.classList.toggle('active');
            body.classList.toggle('menu-open');
            
            // Update ARIA attributes
            const isExpanded = mobileMenuButton.classList.contains('active');
            mobileMenuButton.setAttribute('aria-expanded', isExpanded);
        }

        // Event listeners
        mobileMenuButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });

        menuOverlay.addEventListener('click', toggleMenu);

        // Close menu when clicking a link
        const menuLinks = mainNav.getElementsByTagName('a');
        Array.from(menuLinks).forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mainNav.classList.contains('active')) {
                toggleMenu();
            }
        });
    }

    // Handle touch events for better mobile experience
    let touchStartX = 0;
    let touchEndX = 0;

    mainNav.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    mainNav.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);

    function handleSwipe() {
        const swipeThreshold = 50;
        const swipeLength = touchEndX - touchStartX;
        
        // If swiped left, close menu
        if (swipeLength < -swipeThreshold && mainNav.classList.contains('active')) {
            toggleMenu();
        }
    }

    // Calorie calculator form submission
    calorieForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const weight = parseFloat(document.getElementById('weight').value);
        const activity = document.getElementById('activity').value;
        const intensity = document.getElementById('intensity').value;
        const duration = parseFloat(document.getElementById('duration').value);

        const calories = calculateCalories(weight, activity, intensity, duration);
        displayResults(calories);
        saveActivity(activity, intensity, duration, calories);
        updateActivityChart();
    });

    // BMI calculator form submission
    bmiForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const weight = parseFloat(document.getElementById('bmi-weight').value);
        const height = parseFloat(document.getElementById('height').value);
        
        const bmi = calculateBMI(weight, height);
        displayBMIResults(bmi);
    });

    // Initialize activity chart
    updateActivityChart();
});

// Calculate calories burned
function calculateCalories(weight, activity, intensity, duration) {
    const met = MET_VALUES[activity][intensity];
    // Calories = MET × weight (kg) × duration (hours)
    const hours = duration / 60; // Convert minutes to hours
    return Math.round(met * weight * hours);
}

// Display calorie calculation results
function displayResults(calories) {
    const results = document.getElementById('results');
    const caloriesValue = document.getElementById('calories-value');
    
    results.classList.remove('hidden');
    caloriesValue.textContent = calories;
}

// Calculate BMI
function calculateBMI(weight, height) {
    // Convert height to meters
    const heightInMeters = height / 100;
    // BMI formula: weight (kg) / (height (m))²
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
}

// Display BMI results
function displayBMIResults(bmi) {
    const bmiResult = document.getElementById('bmi-result');
    let category;

    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal weight';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';

    bmiResult.classList.remove('hidden');
    bmiResult.innerHTML = `
        <div class="result-card">
            <div class="calories-burned">
                <span>${bmi}</span>
                <span class="unit">BMI</span>
            </div>
            <p class="result-description">Your BMI indicates: ${category}</p>
        </div>
    `;
}

// Save activity to history
function saveActivity(activity, intensity, duration, calories) {
    const activityData = {
        date: new Date().toISOString(),
        activity,
        intensity,
        duration,
        calories
    };

    activityHistory.push(activityData);
    // Keep only last 7 days of activities
    if (activityHistory.length > 7) {
        activityHistory = activityHistory.slice(-7);
    }
    
    localStorage.setItem('activityHistory', JSON.stringify(activityHistory));
}

// Update activity history chart
function updateActivityChart() {
    const ctx = document.getElementById('activity-chart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (window.activityChart instanceof Chart) {
        window.activityChart.destroy();
    }

    const labels = activityHistory.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString();
    });

    const data = activityHistory.map(entry => entry.calories);

    window.activityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Calories Burned',
                data: data,
                backgroundColor: '#4CAF50',
                borderColor: '#45a049',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Calories'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
}
