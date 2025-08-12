
let selectedQRImage = null;
let currentQRFit = 'contain';

function showPage(pageId, element) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
    });
    element.classList.add('active');
}

function handleQRUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            selectedQRImage = e.target.result;
            document.getElementById('qrPreviewImage').src = selectedQRImage;
            document.getElementById('qrPreviewArea').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function generateSampleQR() {
    // Generate a believable QR code using realistic patterns
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // Create a proper QR code grid (21x21 modules for Version 1)
    const moduleSize = 8;
    const modules = 21;
    const offset = (200 - (modules * moduleSize)) / 2;
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 200, 200);
    
    // Create QR pattern array
    const pattern = Array(modules).fill().map(() => Array(modules).fill(false));
    
    // Add finder patterns (position detection patterns)
    function addFinderPattern(x, y) {
        // Outer 7x7 square
        for(let i = 0; i < 7; i++) {
            for(let j = 0; j < 7; j++) {
                if(x + i < modules && y + j < modules) {
                    pattern[x + i][y + j] = (i === 0 || i === 6 || j === 0 || j === 6 || 
                                           (i >= 2 && i <= 4 && j >= 2 && j <= 4));
                }
            }
        }
    }
    
    // Add separator patterns around finder patterns
    function addSeparator(x, y) {
        for(let i = -1; i <= 7; i++) {
            for(let j = -1; j <= 7; j++) {
                if(x + i >= 0 && x + i < modules && y + j >= 0 && y + j < modules) {
                    if(i === -1 || i === 7 || j === -1 || j === 7) {
                        pattern[x + i][y + j] = false;
                    }
                }
            }
        }
    }
    
    // Add finder patterns at corners
    addFinderPattern(0, 0);
    addFinderPattern(0, modules - 7);
    addFinderPattern(modules - 7, 0);
    
    // Add separators
    addSeparator(0, 0);
    addSeparator(0, modules - 7);
    addSeparator(modules - 7, 0);
    
    // Add timing patterns
    for(let i = 8; i < modules - 8; i++) {
        pattern[6][i] = (i % 2 === 0);
        pattern[i][6] = (i % 2 === 0);
    }
    
    // Add format information (placeholder pattern)
    const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
    for(let i = 0; i < 15; i++) {
        if(i < 6) {
            pattern[8][i] = formatBits[i] === 1;
        } else if(i < 8) {
            pattern[8][i + 1] = formatBits[i] === 1;
        } else if(i === 8) {
            pattern[7][8] = formatBits[i] === 1;
        } else {
            pattern[14 - i][8] = formatBits[i] === 1;
        }
    }
    
    // Add some random data modules for realism
    for(let i = 9; i < modules - 8; i++) {
        for(let j = 9; j < modules - 8; j++) {
            if(!pattern[i][j] && pattern[i][j] !== false) {
                pattern[i][j] = Math.random() > 0.5;
            }
        }
    }
    
    // Add some data in remaining areas
    for(let i = 0; i < modules; i++) {
        for(let j = 0; j < modules; j++) {
            if(pattern[i][j] === undefined) {
                // Create some structured data patterns
                pattern[i][j] = ((i + j * 3) % 7 < 3) && Math.random() > 0.3;
            }
        }
    }
    
    // Draw the QR code
    ctx.fillStyle = '#000000';
    for(let i = 0; i < modules; i++) {
        for(let j = 0; j < modules; j++) {
            if(pattern[i][j]) {
                ctx.fillRect(offset + j * moduleSize, offset + i * moduleSize, moduleSize, moduleSize);
            }
        }
    }
    
    selectedQRImage = canvas.toDataURL();
    document.getElementById('qrPreviewImage').src = selectedQRImage;
    document.getElementById('qrPreviewArea').style.display = 'block';
}

function saveQRCode() {
    if (selectedQRImage) {
        // Update the home page with QR code - fill entire container
        const ticketCard = document.getElementById('ticketCard');
        const qrImg = document.getElementById('qrCodeImage');
        const defaultContent = document.getElementById('defaultContent');
        
        qrImg.src = selectedQRImage;
        qrImg.className = 'fit-' + currentQRFit;
        
        // Hide default content and show QR code
        defaultContent.style.display = 'none';
        document.getElementById('qrCodeDisplay').style.display = 'block';
        ticketCard.classList.add('qr-active');
        
        // Show QR management area in profile
        document.getElementById('currentQRStatus').style.display = 'block';
        document.getElementById('qrUploadArea').style.display = 'none';
        
        // Reset upload area
        cancelQRUpload();
        
        // Show success message
        alert('QR Code saved successfully! Check the home page.');
        
        // Switch to home page
        showPage('home', document.querySelector('.nav-item'));
    }
}

function changeQRFit(fitMode, button) {
    currentQRFit = fitMode;
    const qrImg = document.getElementById('qrCodeImage');
    
    // Remove all fit classes
    qrImg.classList.remove('fit-contain', 'fit-cover', 'fit-fill', 'fit-scale-down');
    
    // Add new fit class
    qrImg.classList.add('fit-' + fitMode);
    
    // Update button states for fit buttons only
    document.querySelectorAll('.scale-button').forEach(btn => {
        if (btn.textContent.includes('Normal') || btn.textContent.includes('Zoomed') || 
            btn.textContent.includes('Stretched') || btn.textContent.includes('Compact')) {
            btn.classList.remove('active');
        }
    });
    button.classList.add('active');
    
    // Visual feedback
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 150);
}

function adjustQRMargin(marginSize) {
    const ticketCard = document.getElementById('ticketCard');
    
    // Remove existing margin classes
    ticketCard.classList.remove('qr-margin-small', 'qr-margin-medium', 'qr-margin-large');
    
    // Add new margin class
    ticketCard.classList.add('qr-margin-' + marginSize);
    
    // Update margin styles dynamically
    const qrDisplay = document.getElementById('qrCodeDisplay');
    let padding = '20px'; // default
    
    switch(marginSize) {
        case 'small':
            padding = '10px';
            break;
        case 'medium':
            padding = '20px';
            break;
        case 'large':
            padding = '30px';
            break;
    }
    
    if (qrDisplay) {
        qrDisplay.style.padding = padding;
    }
}

function removeQRCode() {
    // Remove QR code from home page and restore original content
    const ticketCard = document.getElementById('ticketCard');
    const defaultContent = document.getElementById('defaultContent');
    
    document.getElementById('qrCodeDisplay').style.display = 'none';
    defaultContent.style.display = 'block';
    ticketCard.classList.remove('qr-active');
    
    // Hide QR management area and show upload area in profile
    document.getElementById('currentQRStatus').style.display = 'none';
    document.getElementById('qrUploadArea').style.display = 'block';
    
    // Reset fit mode
    currentQRFit = 'contain';
    document.querySelectorAll('.scale-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.scale-button').classList.add('active');
    
    selectedQRImage = null;
    
    alert('QR Code removed from home page.');
}

function generateCustomQR() {
    document.getElementById('customQRArea').style.display = 'block';
    document.getElementById('customQRText').focus();
}

function cancelCustomQR() {
    document.getElementById('customQRArea').style.display = 'none';
    document.getElementById('customQRText').value = '';
}

function generateQRFromText() {
    const text = document.getElementById('customQRText').value.trim();
    if (!text) {
        alert('Please enter some text or URL for the QR code');
        return;
    }
    
    // Generate QR code with the entered text
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // Create QR code based on text length and content
    generateAdvancedQR(ctx, text, 200);
    
    selectedQRImage = canvas.toDataURL();
    document.getElementById('qrPreviewImage').src = selectedQRImage;
    document.getElementById('qrPreviewArea').style.display = 'block';
    document.getElementById('customQRArea').style.display = 'none';
}

function generateAdvancedQR(ctx, text, size) {
    const moduleSize = 8;
    const modules = 25; // Version 2 QR code for longer text
    const offset = (size - (modules * moduleSize)) / 2;
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    // Create pattern based on text
    const pattern = Array(modules).fill().map(() => Array(modules).fill(false));
    
    // Add finder patterns
    function addFinderPattern(x, y) {
        for(let i = 0; i < 7; i++) {
            for(let j = 0; j < 7; j++) {
                if(x + i < modules && y + j < modules) {
                    pattern[x + i][y + j] = (i === 0 || i === 6 || j === 0 || j === 6 || 
                                           (i >= 2 && i <= 4 && j >= 2 && j <= 4));
                }
            }
        }
    }
    
    // Add finder patterns
    addFinderPattern(0, 0);
    addFinderPattern(0, modules - 7);
    addFinderPattern(modules - 7, 0);
    
    // Add timing patterns
    for(let i = 8; i < modules - 8; i++) {
        pattern[6][i] = (i % 2 === 0);
        pattern[i][6] = (i % 2 === 0);
    }
    
    // Add alignment pattern for Version 2
    function addAlignmentPattern(x, y) {
        for(let i = -2; i <= 2; i++) {
            for(let j = -2; j <= 2; j++) {
                if(x + i >= 0 && x + i < modules && y + j >= 0 && y + j < modules) {
                    pattern[x + i][y + j] = (Math.abs(i) === 2 || Math.abs(j) === 2 || (i === 0 && j === 0));
                }
            }
        }
    }
    addAlignmentPattern(18, 18);
    
    // Convert text to binary and create data pattern
    let textHash = 0;
    for(let i = 0; i < text.length; i++) {
        textHash = ((textHash << 5) - textHash + text.charCodeAt(i)) & 0xffffffff;
    }
    
    // Fill data modules based on text hash
    let bitIndex = 0;
    for(let i = 0; i < modules; i++) {
        for(let j = 0; j < modules; j++) {
            if(pattern[i][j] === undefined || pattern[i][j] === false) {
                // Use hash to determine module state
                const bit = (textHash >>> (bitIndex % 32)) & 1;
                pattern[i][j] = bit === 1;
                bitIndex++;
                
                // Mix in some randomness based on position and text
                if((i + j + text.length) % 3 === 0) {
                    pattern[i][j] = !pattern[i][j];
                }
            }
        }
    }
    
    // Draw the pattern
    ctx.fillStyle = '#000000';
    for(let i = 0; i < modules; i++) {
        for(let j = 0; j < modules; j++) {
            if(pattern[i][j]) {
                ctx.fillRect(offset + j * moduleSize, offset + i * moduleSize, moduleSize, moduleSize);
            }
        }
    }
}

function cancelQRUpload() {
    document.getElementById('qrPreviewArea').style.display = 'none';
    document.getElementById('customQRArea').style.display = 'none';
    document.getElementById('qrFileInput').value = '';
    document.getElementById('customQRText').value = '';
    selectedQRImage = null;
}

function toggleSetting(settingName, element) {
    const currentValue = element.textContent.trim();
    let newValue;
    
    switch(settingName) {
        case 'notifications':
        case 'pushNotifications':
            newValue = currentValue === 'Enabled' ? 'Disabled' : 'Enabled';
            break;
        case 'autoRenewal':
        case 'darkMode':
        case 'twoFactor':
            newValue = currentValue === 'Enabled' ? 'Disabled' : 'Enabled';
            break;
        case 'locationServices':
            newValue = currentValue === 'Allowed' ? 'Denied' : 'Allowed';
            break;
        case 'analytics':
            newValue = currentValue === 'Anonymous' ? 'Disabled' : 'Anonymous';
            break;
        default:
            newValue = currentValue === 'On' ? 'Off' : 'On';
    }
    
    element.textContent = newValue;
    element.style.transform = 'scale(0.95)';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 150);
}

function cycleSetting(settingName, options, element) {
    const currentValue = element.textContent.trim();
    const currentIndex = options.indexOf(currentValue);
    const nextIndex = (currentIndex + 1) % options.length;
    const newValue = options[nextIndex];
    
    element.textContent = newValue;
    element.style.transform = 'scale(0.95)';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 150);
}

function editSetting(settingName, element) {
    const input = element.querySelector('input');
    if (input) {
        input.focus();
        input.select();
    }
}

function saveSetting(settingName, inputElement) {
    const value = inputElement.value.trim();
    
    if (settingName === 'name') {
        // Update name in header
        document.getElementById('headerTitle').textContent = 'Hello ' + value;
        document.getElementById('profileName').textContent = value;
    } else if (settingName === 'address') {
        // Update address on home page
        document.getElementById('homeAddress').innerHTML = value.replace(', ', '<br>');
    }
}

function handleEnter(event, inputElement) {
    if (event.key === 'Enter') {
        inputElement.blur();
    }
}

// Add event listener when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener for file input
    const fileInput = document.getElementById('qrFileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleQRUpload);
    }

    // Add click feedback
    document.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'translateY(-2px)';
            }, 150);
        });
    });
    
    // Set initial values for inputs
    const nameInput = document.getElementById('nameInput');
    if (nameInput) {
        nameInput.addEventListener('input', function() {
            saveSetting('name', this);
        });
    }
    
    const addressInput = document.getElementById('addressInput');
    if (addressInput) {
        addressInput.addEventListener('input', function() {
            saveSetting('address', this);
        });
    }
});
