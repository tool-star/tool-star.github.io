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

    // Form validation
    function validateForm(weight, activity, intensity, duration) {
        const errors = {};
        
        // Weight validation
        if (!weight || weight < 20 || weight > 300) {
            errors.weight = 'Please enter a valid weight between 20 and 300 kg';
        }

        // Activity validation
        if (!activity) {
            errors.activity = 'Please select an activity';
        }

        // Intensity validation
        if (!intensity) {
            errors.intensity = 'Please select an intensity level';
        }

        // Duration validation
        if (!duration || duration < 1 || duration > 1440) {
            errors.duration = 'Please enter a valid duration between 1 and 1440 minutes';
        }

        return errors;
    }

    // Display error messages
    function displayErrors(errors) {
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        
        // Display new errors
        Object.keys(errors).forEach(field => {
            const errorElement = document.getElementById(`${field}-error`);
            if (errorElement) {
                errorElement.textContent = errors[field];
            }
        });
    }

    // Clear error messages
    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    }

    // Update form submission
    calorieForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Clear previous errors
        clearErrors();
        
        const weight = parseFloat(document.getElementById('weight').value);
        const activity = document.getElementById('activity').value;
        const intensity = document.getElementById('intensity').value;
        const duration = parseFloat(document.getElementById('duration').value);

        // Validate form
        const errors = validateForm(weight, activity, intensity, duration);
        
        if (Object.keys(errors).length > 0) {
            displayErrors(errors);
            return;
        }

        try {
            const calories = calculateCalories(weight, activity, intensity, duration);
            displayResults(calories);
            saveActivity(activity, intensity, duration, calories);
            updateActivityChart();
        } catch (error) {
            console.error('Calculation error:', error);
            alert('An error occurred while calculating calories. Please try again.');
        }
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
    try {
        if (!MET_VALUES[activity] || !MET_VALUES[activity][intensity]) {
            throw new Error('Invalid activity or intensity level');
        }
        
        const met = MET_VALUES[activity][intensity];
        const hours = duration / 60;
        const calories = Math.round(met * weight * hours);
        
        if (isNaN(calories) || calories <= 0) {
            throw new Error('Invalid calculation result');
        }
        
        return calories;
    } catch (error) {
        console.error('Calculation error:', error);
        throw new Error('Failed to calculate calories');
    }
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
    try {
        const activityData = {
            date: new Date().toISOString(),
            activity,
            intensity,
            duration,
            calories
        };

        activityHistory.push(activityData);
        
        if (activityHistory.length > 7) {
            activityHistory = activityHistory.slice(-7);
        }
        
        localStorage.setItem('activityHistory', JSON.stringify(activityHistory));
    } catch (error) {
        console.error('Storage error:', error);
        // Continue without saving to storage
    }
}

// Update activity history chart
function updateActivityChart() {
    const ctx = document.getElementById('activity-chart');
    if (!ctx) return;

    try {
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
    } catch (error) {
        console.error('Chart error:', error);
        // Continue without updating chart
    }
}

const scrollToTopBtn = document.getElementById("scrollToTop");

window.addEventListener("scroll", () => {
    if (window.scrollY > 200) {
        scrollToTopBtn.style.display = "block";
    } else {
        scrollToTopBtn.style.display = "none";
    }
});

scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});
