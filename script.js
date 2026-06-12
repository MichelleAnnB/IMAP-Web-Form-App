/**
 * PCSO Medical Assistance Portal - Frontend Script
 */

let applicationDatabase = [];
let relativeCount = 0;

// Switches between the landing page, the form, and the success page
function switchView(viewId) {
  document.querySelectorAll('.view-container').forEach(view => {
    view.classList.remove('active');
  });

  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.classList.add('active');
  }

  // Changes the background color depending on the active page
  if (viewId === 'view-landing') {
    document.body.className = 'landing-bg';
  } else if (viewId === 'view-submitted') {
    document.body.className = 'success-bg';
  } else {
    document.body.className = 'form-bg'; 
  }
  
  window.scrollTo(0, 0);
}

// Generates and adds a new relative form block into the page
function addNewRelativeEntry() {
  relativeCount++;
  const container = document.getElementById('relatives-dynamic-container');
  
  const entryHtml = `
    <div class="relative-entry-card" id="relative-entry-${relativeCount}">
      <div class="entry-card-header">
        <h4>Relative Entry #${relativeCount}</h4>
        <button type="button" class="btn-remove-entry" onclick="removeRelativeEntry(${relativeCount})">✕ Remove</button>
      </div>
      
      <div class="form-group">
        <label>Full Name of Relative</label>
        <input type="text" class="form-control r-name" placeholder="e.g. Juan E. Dela Cruz" required>
      </div>

      <div class="form-group">
        <label>Age</label>
        <input type="number" class="form-control r-age" min="18" placeholder="e.g. 35" required>
      </div>

      <div class="form-group">
        <label>Civil Status</label>
        <select class="form-control r-status" required>
          <option value="" disabled selected>Select Civil Status</option>
          <option value="Single">Single</option>
          <option value="Widow">Widow</option>
          <option value="Married">Married</option>
          <option value="Separated">Separated</option>
          <option value="With Common Law Partner">With Common Law Partner</option>
        </select>
      </div>

      <div class="form-group">
        <label>Relation To Patient</label>
        <input type="text" class="form-control r-relation" placeholder="e.g. Mother" required>
      </div>

      <div class="form-group">
        <label>Job</label>
        <input type="text" class="form-control r-job" placeholder="e.g. Call Center Agent" required>
      </div>

      <div class="form-group">
        <label>Monthly Income</label>
        <input type="number" class="form-control r-income" min="0" placeholder="e.g. 25000" required>
      </div>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', entryHtml);
}

// Removes a specific relative block from the page
function removeRelativeEntry(id) {
  const target = document.getElementById(`relative-entry-${id}`);
  if (target) {
    target.remove();
  }
}

// Generates a random 7-digit ID for relational primary/foreign keys
function generate7DigitId() {
  return Math.floor(1000000 + Math.random() * 9000000);
}

// Ensures CSV cells handle special characters like commas and quotes correctly
function escapeCsvCell(value) {
  if (value === null || value === undefined) return '';
  let str = value.toString().replace(/"/g, '""');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = `"${str}"`;
  }
  return str;
}

// Collects form data, creates the relational records, and saves them
function handleMasterSubmit(event) {
  event.preventDefault();

  // Create IDs and timestamp
  const generatedRefNo = generate7DigitId();
  const generatedPatientId = generate7DigitId();
  const currentStampDate = new Date().toISOString().split('T')[0];

  // Structure data into separate relational object sections
  const applicationEntryBundle = {
    application_information: {
      Ref_No: generatedRefNo,
      Application_Date: currentStampDate,
      Patient_ID: generatedPatientId,
      Patient_Diagnosis: document.getElementById('p-diagnosis').value,
      Patient_NatureOfRequest: document.getElementById('p-assistance').value
    },
    patient_information: {
      Patient_ID: generatedPatientId,
      Patient_Name: document.getElementById('p-name').value,
      Patient_Address: document.getElementById('p-address').value,
      Patient_CivilStatus: document.getElementById('p-status').value,
      Patient_BirthDate: document.getElementById('p-dob').value,
      Patient_Sex: document.getElementById('p-sex').value,
      Patient_Religion: document.getElementById('p-religion').value || '',
      Patient_EducationalAttainment: document.getElementById('p-education').value,
      Patient_Job: document.getElementById('p-job').value,
      Patient_MonthlyIncome: document.getElementById('p-income').value,
      PhilHealth_MembershipStatus: document.getElementById('p-philhealth').value
    },
    relative_list: []
  };

  // Loop through and collect data from all added relative forms
  const cards = document.querySelectorAll('.relative-entry-card');
  cards.forEach((card) => {
    applicationEntryBundle.relative_list.push({
      Patient_ID: generatedPatientId,
      Relative_ID: generate7DigitId(),
      Relative_Name: card.querySelector('.r-name').value,
      Relative_Age: card.querySelector('.r-age').value,
      Relative_CivilStatus: card.querySelector('.r-status').value,
      Relative_Job: card.querySelector('.r-job').value,
      Relative_MonthlyIncome: card.querySelector('.r-income').value,
      Relative_RelationToPatient: card.querySelector('.r-relation').value
    });
  });

  // Save the complete entry package into our global array database
  applicationDatabase.push(applicationEntryBundle);

  // Refresh the CSV display boxes in the developer console
  generateSessionDatabaseCsvs();

  // Move to the submission success screen
  switchView('view-submitted');
}

// Transforms stored data arrays into 3 separate structured CSV database tables
function generateSessionDatabaseCsvs() {
  // Table 1 Columns
  const appHeaders = ["Ref_No", "Application_Date", "Patient_ID", "Patient_Diagnosis", "Patient_NatureOfRequest"];
  let appCsvRows = [appHeaders.join(",")];

  // Table 2 Columns
  const patientHeaders = ["Patient_ID", "Patient_Name", "Patient_Address", "Patient_CivilStatus", "Patient_BirthDate", "Patient_Sex", "Patient_Religion", "Patient_EducationalAttainment", "Patient_Job", "Patient_MonthlyIncome", "PhilHealth_MembershipStatus"];
  let patientCsvRows = [patientHeaders.join(",")];

  // Table 3 Columns
  const relativeHeaders = ["Patient_ID", "Relative_ID", "Relative_Name", "Relative_Age", "Relative_CivilStatus", "Relative_Job", "Relative_MonthlyIncome", "Relative_RelationToPatient"];
  let relativeCsvRows = [relativeHeaders.join(",")];

  // Process data from memory database into safe CSV strings
  applicationDatabase.forEach(bundle => {
    const appData = [bundle.application_information.Ref_No, bundle.application_information.Application_Date, bundle.application_information.Patient_ID, bundle.application_information.Patient_Diagnosis, bundle.application_information.Patient_NatureOfRequest].map(escapeCsvCell);
    appCsvRows.push(appData.join(","));

    const p = bundle.patient_information;
    const patientData = [p.Patient_ID, p.Patient_Name, p.Patient_Address, p.Patient_CivilStatus, p.Patient_BirthDate, p.Patient_Sex, p.Patient_Religion, p.Patient_EducationalAttainment, p.Patient_Job, p.Patient_MonthlyIncome, p.PhilHealth_MembershipStatus].map(escapeCsvCell);
    patientCsvRows.push(patientData.join(","));

    bundle.relative_list.forEach(rel => {
      const relativeData = [rel.Patient_ID, rel.Relative_ID, rel.Relative_Name, rel.Relative_Age, rel.Relative_CivilStatus, rel.Relative_Job, rel.Relative_MonthlyIncome, rel.Relative_RelationToPatient].map(escapeCsvCell);
      relativeCsvRows.push(relativeData.join(","));
    });
  });

  // Write the completed CSV strings directly into the console textboxes
  document.getElementById('appCsvBox').value = appCsvRows.join("\n");
  document.getElementById('patientCsvBox').value = patientCsvRows.join("\n");
  document.getElementById('relativeCsvBox').value = relativeCsvRows.length > 1 ? relativeCsvRows.join("\n") : "-- No Relatives Logged Across Total Session --";
}

// Generates a downloadable CSV file straight out of the text boxes
function downloadSessionCsv(tableName) {
  let textboxId = '';
  if (tableName === 'application_information') textboxId = 'appCsvBox';
  else if (tableName === 'patient_information') textboxId = 'patientCsvBox';
  else textboxId = 'relativeCsvBox';

  const csvContent = document.getElementById(textboxId).value;
  if (!csvContent || csvContent.startsWith("--")) return;
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const downloadAnchor = document.createElement('a');
  downloadAnchor.href = URL.createObjectURL(blob);
  downloadAnchor.setAttribute("download", `${tableName}_${Date.now()}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
}

// Wipes the form inputs and dynamic relative blocks to start a new entry
function resetPortal() {
  document.getElementById('masterApplicationForm').reset();
  document.getElementById('relatives-dynamic-container').innerHTML = '';
  relativeCount = 0;
  switchView('view-landing');
}

// Listens for the admin shortcut key combination: Ctrl + Shift + D
window.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'd') {
    event.preventDefault();
    const devPanel = document.getElementById('devDashboard');
    if (devPanel) {
      devPanel.classList.toggle('visible');
    }
  }
});

// Sets the application layout state to landing view when the web browser opens
window.addEventListener('DOMContentLoaded', () => {
  switchView('view-landing');
});
