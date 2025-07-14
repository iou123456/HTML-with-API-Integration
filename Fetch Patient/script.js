const API_URL = 'https://fedskillstest.coalitiontechnologies.workers.dev';
const AUTH_HEADER = 'Basic ' + btoa('coalition:skills-test');

// Fetch all patient data
async function fetchPatientsData() {
  try {
    console.log("Fetching all patients data...");
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': AUTH_HEADER
      }
    });

    if (!response.ok) throw new Error('Failed to fetch data');
    
    const data = await response.json();
    console.log("Data fetched successfully:", data);
    populatePatientList(data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Populate patient list in the sidebar
function populatePatientList(patients) {
  const patientListContainer = document.getElementById('patient-list');
  patientListContainer.innerHTML = ''; // Clear previous content

  patients.forEach(patient => {
    const patientItem = document.createElement('li');
    patientItem.classList.add('patient-item');
    patientItem.innerHTML = `
      <img src="${patient.profile_picture}" alt="${patient.name}" class="patient-img" />
      <div class="patient-details">
        <span class="patient-name">${patient.name}</span>
        <span class="patient-age-gender">${patient.age} years, ${patient.gender}</span>
      </div>
    `;
    patientItem.addEventListener('click', () => fetchAndDisplayPatientData(patient));
    patientListContainer.appendChild(patientItem);
  });
}

// Fetch and display selected patient's data
async function fetchAndDisplayPatientData(patient) {
  try {
    console.log("Fetching data for patient:", patient.name);
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': AUTH_HEADER
      }
    });

    if (!response.ok) throw new Error('Failed to fetch patient data');
    
    const data = await response.json();
    const selectedPatient = data.find(p => p.name === patient.name);
    if (!selectedPatient) throw new Error('Patient not found');

    renderPatientData(selectedPatient);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Render the selected patient's data
// Render the selected patient's data
function renderPatientData(patientData) {
  const mainContent = document.getElementById('patients-main-content');
  mainContent.innerHTML = '';  // Clear previous content

  // Create profile section first
  mainContent.appendChild(createProfileCard(patientData));

  // Create the diagnosis history and vital signs sections
  const diagnosisHistorySection = document.createElement('div');
  diagnosisHistorySection.className = 'diagnosis-history-container';

  // Add the blood pressure chart section
  diagnosisHistorySection.appendChild(createBloodPressureChart(patientData));

  // Add the vital signs section
  diagnosisHistorySection.appendChild(createVitalSignsSection(patientData));

  // Add the diagnosis history section to the main content
  mainContent.appendChild(diagnosisHistorySection);

  // Create results container for lab results and diagnosis list
  const resultsContainer = document.createElement('div');
  resultsContainer.className = 'results-container';

  // Add lab results and diagnosis list
  resultsContainer.appendChild(createLabResultsSection(patientData));
  resultsContainer.appendChild(createDiagnosisSection(patientData));

  mainContent.appendChild(resultsContainer);
}


// Create patient profile card
function createProfileCard(patientData) {
  const profileCard = document.createElement('div');
  profileCard.className = 'profile-card';
  profileCard.innerHTML = `
    <img src="${patientData.profile_picture}" alt="${patientData.name}" />
    <h2>${patientData.name}</h2>
    <div class="profile-info">
      <p><strong>Date of Birth:</strong> ${patientData.date_of_birth}</p>
      <p><strong>Gender:</strong> ${patientData.gender}</p>
      <p><strong>Contact:</strong> ${patientData.phone_number}</p>
      <p><strong>Emergency:</strong> ${patientData.emergency_contact}</p>
      <p><strong>Insurance:</strong> ${patientData.insurance_type}</p>
    </div>
    <button class="show-info-btn">Show All Information</button>
  `;
  return profileCard;
}

// Create blood pressure chart dynamically
function createBloodPressureChart(patientData) {
  const chartContainer = document.createElement('div');
  chartContainer.className = 'chart-section';

  const canvas = document.createElement('canvas');
  chartContainer.appendChild(canvas);

  const labels = patientData.diagnosis_history.map(item => item.year);
  const systolicData = patientData.diagnosis_history.map(item => item.blood_pressure.systolic.value);
  const diastolicData = patientData.diagnosis_history.map(item => item.blood_pressure.diastolic.value);

  new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Systolic',
          data: systolicData,
          borderColor: 'red',
          fill: false,
          tension: 0.4
        },
        {
          label: 'Diastolic',
          data: diastolicData,
          borderColor: 'blue',
          fill: false,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `Blood Pressure Over the Years for ${patientData.name}`
        }
      },
      scales: {
        x: { title: { display: true, text: 'Year' } },
        y: {
          title: { display: true, text: 'Pressure Value' },
          suggestedMin: 0,
          suggestedMax: 200
        }
      }
    }
  });

  return chartContainer;
}

// Create vital signs section dynamically
function createVitalSignsSection(patientData) {
  const vitalSignsContainer = document.createElement('div');
  vitalSignsContainer.className = 'vitals'; // Ensure the container uses the correct class

  const vitalSigns = [
    { 
      label: 'Respiratory Rate', 
      value: patientData.respiratory_rate,  // Dynamically fetch the value from API
      unit: 'bpm', 
      image: 'imagesandicons/respiratory rate.svg'  // Replace with actual image path
    },
    { 
      label: 'Temperature', 
      value: patientData.temperature,  // Dynamically fetch the value from API
      unit: '°F', 
      image: 'imagesandicons/temperature.svg'  // Replace with actual image path
    },
    { 
      label: 'Heart Rate', 
      value: patientData.heart_rate,  // Dynamically fetch the value from API
      unit: 'bpm', 
      image: 'imagesandicons/HeartBPM.svg'  // Replace with actual image path
    },
  ];

  vitalSigns.forEach(vital => {
    const card = document.createElement('div');
    card.className = 'vital-box';  // Ensure that the class name matches the CSS selector

    card.innerHTML = `
      <div class="vital-sign-info">
        <img src="${vital.image}" alt="${vital.label}" class="vital-sign-img" />
        <div class="vital-sign-text">
          <p>${vital.label}</p>
          <span>${vital.value !== undefined ? vital.value : 'N/A'} ${vital.unit}</span>
        </div>
      </div>
    `;

    vitalSignsContainer.appendChild(card);
  });

  return vitalSignsContainer;
}

// Create lab results section dynamically
function createLabResultsSection(patientData) {
  const labResultsContainer = document.createElement('div');
  labResultsContainer.className = 'lab-results';

  const labResultsList = document.createElement('ul');
  patientData.lab_results.forEach(result => {
    const li = document.createElement('li');
    li.innerHTML = `${result} <button class="download-btn" title="Download"><img src="imagesandicons/downloadbtn.png" alt="Download" /></button>`;
    labResultsList.appendChild(li);
  });

  labResultsContainer.innerHTML = `<h3>Lab Results</h3>`;
  labResultsContainer.appendChild(labResultsList);

  return labResultsContainer;
}


// Create diagnosis history section dynamically
function createDiagnosisSection(patientData) {
  const diagnosisContainer = document.createElement('div');
  diagnosisContainer.className = 'diagnosis-list';

  const table = document.createElement('table');
  const tbody = document.createElement('tbody');

  // Check if the diagnostic_list is available
  if (patientData.diagnostic_list && Array.isArray(patientData.diagnostic_list)) {
    patientData.diagnostic_list.forEach(diagnosis => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${diagnosis.name}</td>
        <td>${diagnosis.description}</td>
        <td>${diagnosis.status}</td> <!-- Directly show the status -->
      `;
      tbody.appendChild(tr);
    });
  }

  table.innerHTML = `
    <thead>
      <tr>
        <th>Problem/Diagnosis</th>
        <th>Description</th>
        <th>Status</th>
      </tr>
    </thead>
  `;
  table.appendChild(tbody);

  diagnosisContainer.innerHTML = `<h2>Diagnosis List</h2>`;
  diagnosisContainer.appendChild(table);

  return diagnosisContainer;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', fetchPatientsData);
