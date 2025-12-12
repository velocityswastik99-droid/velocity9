// Form Validation and Submission for SheetDB
const formInputs = {
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    mobile: document.getElementById('mobile'),
    terms: document.getElementById('terms')
};

const errorMessages = {
    name: document.getElementById('name-error'),
    email: document.getElementById('email-error'),
    mobile: document.getElementById('mobile-error'),
    terms: document.getElementById('terms-error')
};

// Real-time validation
function validateField(field) {
    const input = formInputs[field];
    const error = errorMessages[field];
    let isValid = true;
    
    switch(field) {
        case 'name':
            isValid = input.value.trim().length >= 2;
            error.textContent = isValid ? '' : 'Please enter a valid name (at least 2 characters)';
            break;
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = emailRegex.test(input.value.trim());
            error.textContent = isValid ? '' : 'Please enter a valid email address';
            break;
        case 'mobile':
            const mobileRegex = /^[0-9]{10}$/;
            isValid = mobileRegex.test(input.value.trim());
            error.textContent = isValid ? '' : 'Please enter a valid 10-digit mobile number';
            break;
        case 'terms':
            isValid = input.checked;
            error.textContent = isValid ? '' : 'Please accept the terms to continue';
            break;
    }
    
    if (isValid) {
        input.classList.remove('error');
        input.classList.add('success');
        error.classList.remove('show');
    } else {
        input.classList.add('error');
        input.classList.remove('success');
        error.classList.add('show');
    }
    
    return isValid;
}

// Auto-format mobile number (adds +91 prefix)
formInputs.mobile.addEventListener('input', function(e) {
    // Remove non-numeric characters
    let value = e.target.value.replace(/\D/g, '');
    
    // Limit to 10 digits
    if (value.length > 10) {
        value = value.substring(0, 10);
    }
    
    e.target.value = value;
    
    // Auto-validate as user types
    if (value.length === 10) {
        validateField('mobile');
    }
});

// Add validation to all fields
Object.keys(formInputs).forEach(key => {
    const input = formInputs[key];
    
    input.addEventListener('input', () => {
        validateField(key);
    });
    
    input.addEventListener('blur', () => {
        validateField(key);
    });
});

// Form submission to SheetDB
document.getElementById('syllabus-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validate all fields
    let isValid = true;
    Object.keys(formInputs).forEach(key => {
        if (!validateField(key)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        return;
    }
    
    // Show loading state
    document.getElementById('syllabus-form').classList.add('hidden');
    document.getElementById('loading-state').classList.remove('hidden');
    
    try {
        // Prepare data for SheetDB
        const formData = {
            data: [{
                "Name": formInputs.name.value.trim(),
                "Email": formInputs.email.value.trim().toLowerCase(),
                "Mobile": `+91${formInputs.mobile.value.trim()}`,
                "Date": new Date().toLocaleString('en-IN', { 
                    timeZone: 'Asia/Kolkata',
                    dateStyle: 'medium',
                    timeStyle: 'short'
                }),
                "Source": "Website Form",
                "Status": "Syllabus Download"
            }]
        };
        
        console.log('Submitting to SheetDB:', formData);
        
        // Send to SheetDB
        const response = await fetch('https://sheetdb.io/api/v1/ux76uiylu05e1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to save data');
        }
        
        console.log('SheetDB Response:', result);
        
        // Hide loading state
        document.getElementById('loading-state').classList.add('hidden');
        
        // Show success state
        document.getElementById('success-state').classList.remove('hidden');
        
        // Send analytics
        if (window.dataLayer) {
            window.dataLayer.push({
                'event': 'syllabus_download',
                'name': formData.data[0].Name,
                'email': formData.data[0].Email,
                'mobile': formData.data[0].Mobile
            });
        }
        
        // Auto-download syllabus after 1 second
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = 'DevOps_Guide_2025.pdf';
            link.download = 'Velocity9_DevOps_Syllabus.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Close modal after download
            setTimeout(() => {
                closeSyllabusModal();
                
                // Show thank you notification
                showNotification('✅ Syllabus downloaded successfully! Check your downloads folder.', 'success');
            }, 1000);
            
        }, 1000);
        
    } catch (error) {
        console.error('SheetDB Error:', error);
        
        // Hide loading state
        document.getElementById('loading-state').classList.add('hidden');
        
        // Show error state
        document.getElementById('error-state').classList.remove('hidden');
        document.getElementById('error-message').textContent = error.message || 'Failed to submit. Please try again.';
        
        // Retry button functionality
        document.getElementById('retry-btn').addEventListener('click', function() {
            document.getElementById('error-state').classList.add('hidden');
            document.getElementById('syllabus-form').classList.remove('hidden');
        });
    }
});

// Notification function
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existingNotification = document.querySelector('.custom-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `custom-notification fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-[70] animate-slide-up ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Modal open/close functions (keep your existing ones)
function openSyllabusModal() {
    document.getElementById('syllabus-modal-overlay').classList.add('open');
    document.getElementById('syllabus-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeSyllabusModal() {
    document.getElementById('syllabus-modal-overlay').classList.remove('open');
    document.getElementById('syllabus-modal').classList.remove('open');
    document.body.style.overflow = '';
    
    // Reset form
    document.getElementById('syllabus-form').reset();
    document.getElementById('syllabus-form').classList.remove('hidden');
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('success-state').classList.add('hidden');
    document.getElementById('error-state').classList.add('hidden');
    
    // Reset validation styles
    Object.keys(formInputs).forEach(key => {
        formInputs[key].classList.remove('error', 'success');
        errorMessages[key].classList.remove('show');
    });
}

// Update your existing download button to use this modal
document.getElementById('download-syllabus-btn').addEventListener('click', function(e) {
    e.preventDefault();
    openSyllabusModal();
});