const patientData = {
    '001': 98,
    '002': 97,
    '003': 94,
    '004': 94,
    '005': 81,
    '007': 85,
    '008': 75,
    '009': 92,
    '010': 96,
    '011': 103,
    '012': 92,
    '013': 18,
    '014': 99,
    '015': 93,
    '016': 79,
    '017': 96,
    '018': 84,
    '019': 88,
    '020': 91,
    // Add more patients as needed
};

let currentPatient = '';
let currentImageIndex = 0;
let allBaseImageNumbers = [];
let filteredImages = [];

const searchBox = document.getElementById('searchBox');
const patientImage = document.getElementById('patientImage');
const imageNumberInput = document.getElementById('imageNumberInput');
const totalImagesDisplay = document.getElementById('totalImagesDisplay');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const eventCheckbox = document.getElementById('eventCheckbox');
const searchPrompt = document.getElementById('searchPrompt');
const patientNotFoundMsg = document.getElementById('patientNotFoundMsg');

function resetImageDisplay(shouldDisableInput = true) {
    patientImage.style.display = 'none';
    patientImage.src = '';
    imageNumberInput.value = '';
    totalImagesDisplay.textContent = '';
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    if (shouldDisableInput) {
        imageNumberInput.disabled = true;
        eventCheckbox.disabled = true;
    }
}

function populateAllBaseImageNumbers() {
    allBaseImageNumbers = [];
    if (currentPatient) {
        const totalCount = patientData[currentPatient];
        for (let i = 1; i <= totalCount; i++) {
            allBaseImageNumbers.push(i);
        }
    }
}

function isEventImage(patientNum, baseImageNum) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = `images/patient_${patientNum}/${baseImageNum}_event.png`;
    });
}

async function filterImages() {
    if (!currentPatient) {
        filteredImages = [];
        loadImage();
        return;
    }

    let tempFiltered = [];
    const sortedBaseNumbers = [...allBaseImageNumbers].sort((a, b) => a - b);

    if (eventCheckbox.checked) {
        const eventChecks = sortedBaseNumbers.map(num => isEventImage(currentPatient, num));
        const results = await Promise.all(eventChecks);

        results.forEach((isEvent, index) => {
            if (isEvent) {
                tempFiltered.push(sortedBaseNumbers[index]);
            }
        });
    } else {
        tempFiltered = sortedBaseNumbers;
    }

    filteredImages = tempFiltered;

    if (filteredImages.length > 0) {
        const currentImageNumber = (currentImageIndex >= 0 && currentImageIndex < allBaseImageNumbers.length) ? allBaseImageNumbers[currentImageIndex] : -1;
        const newIndex = filteredImages.indexOf(currentImageNumber);

        if (newIndex !== -1) {
            currentImageIndex = newIndex;
        } else {
            currentImageIndex = 0;
        }
    } else {
        currentImageIndex = -1;
    }

    loadImage();
}

function loadImage() {
    if (!currentPatient || filteredImages.length === 0 || currentImageIndex === -1) {
        resetImageDisplay(true);
        return;
    }

    const imageNumberToLoad = filteredImages[currentImageIndex];
    const regularPath = `images/patient_${currentPatient}/${imageNumberToLoad}.png`;
    const eventPath = `images/patient_${currentPatient}/${imageNumberToLoad}_event.png`;

    patientImage.src = '';
    patientImage.style.display = 'none';

    let attemptingEventPath = false;

    patientImage.onload = () => {
        patientImage.style.display = 'block';
        imageNumberInput.value = currentImageIndex + 1;
        totalImagesDisplay.textContent = filteredImages.length;
        prevBtn.disabled = currentImageIndex === 0;
        nextBtn.disabled = currentImageIndex === filteredImages.length - 1;
        imageNumberInput.disabled = false;
        eventCheckbox.disabled = false;
    };

    patientImage.onerror = () => {
        if (!attemptingEventPath && eventCheckbox.checked) {
            console.warn(`Unexpected error: Regular image ${regularPath} failed while event checkbox is checked.`);
            resetImageDisplay(false);
        } else if (!attemptingEventPath && !eventCheckbox.checked) {
            attemptingEventPath = true;
            patientImage.src = eventPath;
        } else if (attemptingEventPath) {
            console.error(`Failed to load either ${regularPath} or ${eventPath}. Image not found.`);
            resetImageDisplay(false);
        }
        imageNumberInput.disabled = false;
    };

    if (eventCheckbox.checked) {
        attemptingEventPath = true;
        patientImage.src = eventPath;
    } else {
        attemptingEventPath = false;
        patientImage.src = regularPath;
    }
}


searchBox.addEventListener('input', function() {
    const patientNumber = searchBox.value.trim();
    const paddedPatientNumber = patientNumber.padStart(3, '0');

    searchPrompt.style.display = 'none';
    patientNotFoundMsg.style.display = 'none';

    if (patientNumber === '') {
        currentPatient = '';
        allBaseImageNumbers = [];
        filteredImages = [];
        resetImageDisplay(true);
        searchPrompt.style.display = 'block';
        return;
    }
    if (patientData[paddedPatientNumber]) {
        currentPatient = paddedPatientNumber;
        populateAllBaseImageNumbers();
        currentImageIndex = 0;
        filterImages();
        imageNumberInput.disabled = false;
        eventCheckbox.disabled = false;
    } else {
        currentPatient = '';
        allBaseImageNumbers = [];
        filteredImages = [];
        resetImageDisplay(true);
        patientNotFoundMsg.textContent = "Patient does not exist. Please enter a valid Patient ID between 1 to 20.";
        patientNotFoundMsg.style.display = 'block';
    }
});

prevBtn.addEventListener('click', function() {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        loadImage();
    }
});

nextBtn.addEventListener('click', function() {
    if (currentImageIndex < filteredImages.length - 1) {
        currentImageIndex++;
        loadImage();
    }
});

imageNumberInput.addEventListener('input', function() {
    const inputVal = this.value.trim();

    if (!currentPatient) {
        resetImageDisplay(true);
        return;
    }

    if (inputVal === '') {
        patientImage.style.display = 'none';
        patientImage.src = '';
        totalImagesDisplay.textContent = filteredImages.length;
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
    }

    const desiredIndex = parseInt(inputVal);

    if (!isNaN(desiredIndex) && desiredIndex >= 1 && desiredIndex <= filteredImages.length) {
        currentImageIndex = desiredIndex - 1;
        loadImage();
    } else {
        patientImage.style.display = 'none';
        patientImage.src = '';
        totalImagesDisplay.textContent = filteredImages.length;
        prevBtn.disabled = true;
        nextBtn.disabled = true;
    }
});

eventCheckbox.addEventListener('change', function() {
    filterImages();
});

resetImageDisplay(true);
searchPrompt.style.display = 'block';
patientNotFoundMsg.style.display = 'none';