let subjectsData = {};
let linksData = {};
let dataLoaded = false;
let textbooksData = {};

// Load Subjects
fetch("data/subjects.json")
  .then(res => res.json())
  .then(data => {
    subjectsData = data;
    console.log("Subjects loaded ✅");
    checkDataLoaded();
  })
  .catch(err => console.error("Subjects load error ❌", err));

// Load Links
fetch("data/links.json")
  .then(res => res.json())
  .then(data => {
    linksData = data;
    console.log("Links loaded ✅");
    checkDataLoaded();
  })
  .catch(err => console.error("Links load error ❌", err));
//load Textbooks
  let linkData = {};

fetch("data/links.json")
.then(res => res.json())
.then(data => {

    linkData = data;

    console.log("Links Loaded");

    loadTextbooks();   // Load first page only once
});

function checkDataLoaded() {
  if (subjectsData && Object.keys(subjectsData).length > 0 && 
      linksData && Object.keys(linksData).length > 0) {
    dataLoaded = true;
    console.log("All data loaded ✅");
  }
}

// ================= CHECK PDF EXISTS =================

async function checkPDF(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

// ================= LOADER CONTROL =================

function showLoader() {
  document.getElementById("loader").classList.remove("hidden");
}

function hideLoader() {
  document.getElementById("loader").classList.add("hidden");
}

// ================= AUTO SCROLL =================

function scrollToElement(id) {
  const el = document.getElementById(id);

  if (el) {
    el.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

// ================= SHOW SECTIONS =================

function showSection(id) {

  // Hide all sections
  document.querySelectorAll(".section").forEach(sec => {
    sec.classList.add("hidden");
  });

  document.getElementById("textbooksSection")?.classList.add("hidden");

  // Show selected section
  const section = document.getElementById(id);

  section.classList.remove("hidden");

  setTimeout(() => {
    section.classList.add("show");
  }, 50);


  // Reset MID
  if (id !== "mid") {
    document.getElementById("subjectBox")?.classList.add("hidden");
    document.getElementById("paperBox")?.classList.add("hidden");
  }

  // Reset SEM
  if (id !== "sem") {
    document.getElementById("semSubjectBox")?.classList.add("hidden");
    document.getElementById("semPaperBox")?.classList.add("hidden");
  }
}

function activateNav(btn) {

  document.querySelectorAll(".nav-btn").forEach(b => {
    b.classList.remove("active");
  });

  btn.classList.add("active");
}


// ================= LOAD MID SUBJECTS =================

function loadMidSubjects() {
  showLoader();
  

  const regulation = document.getElementById("regulation").value;
  const branch = document.getElementById("branch").value;
  const year = document.getElementById("year").value;
  const sem = document.getElementById("semester").value;

  if (!regulation) {
    alert("Please select regulation first");
    hideLoader();
    return;
  }

  if (!branch) {
    alert("Please select branch first");
    hideLoader();
    return;
  }

  if (!year) {
    alert("Please select year first");
    hideLoader();
    return;
  }

  if (!sem) {
    alert("Please select semester first");
    hideLoader();
    return;
  }

  const key = `${year}-${sem}`;

  const subjects =
    subjectsData?.[regulation]?.[branch]?.["MID"]?.[key];

  if (!subjects || subjects.length === 0) {
    alert("No subjects found for the selected options");
    hideLoader();
    return;
  }

  // Render subjects to the table
  const subjectList = document.getElementById("subjectList");
  const subjectBox = document.getElementById("subjectBox");
  
  subjectList.innerHTML = "";
  
  subjects.forEach(sub => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="border p-2">${sub}</td>
      <td class="border p-2 text-center">
        <button onclick="showPapers('${sub}')" class="text-blue-600 underline">
          View Papers
        </button>
      </td>
    `;
    subjectList.appendChild(row);
  });

  // Show the subject box
  subjectBox.classList.remove("hidden");

  // Hide paper box when new subjects are loaded
  document.getElementById("paperBox").classList.add("hidden");

  hideLoader();
}


// ================= SHOW MID PAPERS =================

// Helper function to find subject key using case-insensitive partial match
function findSubjectKey(subjectData, targetSubject) {

  const targetLower = targetSubject.toLowerCase().trim();

  for (const key of Object.keys(subjectData || {})) {

    const keyLower = key.toLowerCase().trim();

    if (keyLower === targetLower) {
      return key;
    }
  }

  return null;
}

async function showPapers(subject) {

  const paperBox = document.getElementById("paperBox");
  let subjectHeading = document.getElementById("paperSubjectHeading");
  if (!subjectHeading) {
    subjectHeading = document.createElement("h3");
    subjectHeading.id = "paperSubjectHeading";
    subjectHeading.className = "text-lg font-semibold mb-3 text-red-700";
    paperBox.insertBefore(subjectHeading, paperBox.querySelector("table"));
  }
  subjectHeading.textContent = subject;

  if (!linksData.MID) {
    alert("Data still loading. Please wait...");
    hideLoader();
    return;
  }

  showLoader();

  const paperList = document.getElementById("paperList");
  paperList.innerHTML = "";

  const branch = document.getElementById("branch").value;
  const year = document.getElementById("year").value;
  const sem = document.getElementById("semester").value;
  const regulation = document.getElementById("regulation").value;

  const key = year + "-" + sem;

  // Debug: Show what's being searched
  console.log("=== DEBUG ===");
  console.log("Regulation:", regulation);
  console.log("Branch:", branch);
  console.log("Year:", year);
  console.log("Sem:", sem);
  console.log("Key:", key);
  console.log("Subject:", subject);
  console.log("linksData.MID:", linksData.MID);
  console.log("linksData.MID[regulation]:", linksData.MID?.[regulation]);
  console.log("linksData.MID[regulation][branch]:", linksData.MID?.[regulation]?.[branch]);
  
  // Find the subject key in linksData using fuzzy matching
  const subjectDataRaw = linksData?.MID?.[regulation]?.[branch]?.[key];
  console.log("subjectDataRaw:", subjectDataRaw);
  console.log("Available subjects in links.json for this semester:", subjectDataRaw ? Object.keys(subjectDataRaw) : "undefined");
  
  const matchedSubjectKey = findSubjectKey(subjectDataRaw, subject);
  console.log("matchedSubjectKey:", matchedSubjectKey);
  
  const subjectData = matchedSubjectKey 
  ? subjectDataRaw[matchedSubjectKey.trim()] 
  : null;
  
  // Show alert with debug info
  if (!subjectData) {
    alert("No papers found for this subject.\n\nSubject: " + subject + "\nAvailable: " + (subjectDataRaw ? Object.keys(subjectDataRaw).join(", ") : "none"));
  }

  const years = ["2023", "2024", "2025"];

  for (let y of years) {

    const yearData = subjectData?.[y];

    const m1s1 = yearData?.mid1?.set1;
    const m1s2 = yearData?.mid1?.set2;

    const m2s1 = yearData?.mid2?.set1;
    const m2s2 = yearData?.mid2?.set2;

    const row = document.createElement("tr");

    row.innerHTML = `
      <td class="border p-2 text-center">${y}</td>

      <td class="border p-2 text-center">
        ${ m1s1 && m1s1.trim() !== "" 
        ? `<a href="${m1s1}" target="_blank" class="text-blue-600 underline">View</a>` 
        : "NA" }
      </td>

      <td class="border p-2 text-center">
        ${ m1s2 && m1s2.trim() !== "" 
        ? `<a href="${m1s2}" target="_blank" class="text-blue-600 underline">View</a>` 
        : "NA" }
      </td>

      <td class="border p-2 text-center">
        ${ m2s1 && m2s1.trim() !== "" 
        ? `<a href="${m2s1}" target="_blank" class="text-blue-600 underline">View</a>` 
        : "NA" }
      </td>

      <td class="border p-2 text-center">
        ${ m2s2 && m2s2.trim() !== "" 
        ? `<a href="${m2s2}" target="_blank" class="text-blue-600 underline">View</a>` 
        : "NA" }
      </td>

    `;

    paperList.appendChild(row);
  }

  document.getElementById("paperBox")
    .classList.remove("hidden");

  document
    .getElementById("paperBox")
    .scrollIntoView({ behavior: "smooth" });


  hideLoader();
}

// ================= LOAD SEM SUBJECTS =================

function loadSemSubjects() {
  showLoader();
  

  const regulation = document.getElementById("semregulation").value;
  const branch = document.getElementById("semBranch").value;
  const year = document.getElementById("semYear").value;
  const sem = document.getElementById("semSemester").value;

  // Validation
  if (!regulation) {
    alert("Please select Regulation first");
    hideLoader();
    return;
  }

  if (!branch) {
    alert("Please select Branch first");
    hideLoader();
    return;
  }

  if (!year) {
    alert("Please select Year first");
    hideLoader();
    return;
  }

  if (!sem) {
    alert("Please select Semester first");
    hideLoader();
    return;
  }

  const key = year + "-" + sem;

  const subjectList = document.getElementById("semSubjectList");
  const subjectBox = document.getElementById("semSubjectBox");
  const paperBox = document.getElementById("semPaperBox");

  // Reset old data
  subjectList.innerHTML = "";
  paperBox.classList.add("hidden");

  // Check data - use subjectsData (same as MID)
  const subjects = subjectsData?.[regulation]?.[branch]?.["SEM"]?.[key];

  if (!subjects || subjects.length === 0) {
    subjectList.innerHTML = `
      <tr>
        <td colspan="2" class="text-center text-red-500 p-4">
          No subjects available for this semester
        </td>
      </tr>
    `;
    subjectBox.classList.remove("hidden");
    hideLoader();
    return;
  }

  // Load subjects
  subjects.forEach(sub => {

    const row = document.createElement("tr");

    row.innerHTML = `
      <td class="border p-2">${sub}</td>

      <td class="border p-2 text-center">
        <button 
          onclick="showSemPapers('${sub}')"
          class="text-blue-600 underline">
          View Papers
        </button>
      </td>
    `;

    subjectList.appendChild(row);
  });


  // Show subject box
  subjectBox.classList.remove("hidden");

  scrollToElement("semSubjectBox");
  hideLoader();
}

// ================= SHOW SEM PAPERS =================

async function showSemPapers(subject) {

  // Add subject heading
  const semPaperBox = document.getElementById("semPaperBox");
  let semSubjectHeading = document.getElementById("semPaperSubjectHeading");
  if (!semSubjectHeading) {
    semSubjectHeading = document.createElement("h3");
    semSubjectHeading.id = "semPaperSubjectHeading";
    semSubjectHeading.className = "text-lg font-semibold mb-3 text-red-700";
    semPaperBox.insertBefore(semSubjectHeading, semPaperBox.querySelector("table"));
  }
  semSubjectHeading.textContent = subject;

  if (!linksData.SEM) {
    alert("Data still loading. Please wait...");
    hideLoader();
    return;
  }
  
  showLoader();

  const paperList = document.getElementById("semPaperList");

  paperList.innerHTML = "";

  const regulation = document.getElementById("semregulation").value;
  const branch = document.getElementById("semBranch").value;
  const year = document.getElementById("semYear").value;
  const sem = document.getElementById("semSemester").value;

  const key = year + "-" + sem;

  // Get data from linksData JSON
  const subjectData = linksData?.SEM?.[regulation]?.[branch]?.[key]?.[subject];

  const years = ["2023", "2024", "2025"];

  for (let y of years) {

    const yearData = subjectData?.[y];
    
    const regularLink = yearData?.regular;
    const supplyLink = yearData?.supply;

    const row = document.createElement("tr");

    row.innerHTML = `
      <td class="border p-2">${y}</td>

      <!-- Regular -->
      <td class="border p-2 text-center">
        ${
          regularLink && regularLink.trim() !== ""
            ? `<a href="${regularLink}" target="_blank" class="text-blue-600 underline">View</a>`
            : `<span class="text-red-500 font-semibold">Not Available</span>`
        }
      </td>

      <!-- Advanced Supply -->
      <td class="border p-2 text-center">
        ${
          supplyLink && supplyLink.trim() !== ""
            ? `<a href="${supplyLink}" target="_blank" class="text-blue-600 underline">View</a>`
            : `<span class="text-red-500 font-semibold">Not Available</span>`
        }
      </td>
    `;

    paperList.appendChild(row);
  }

  const box = document.getElementById("semPaperBox");
  box.classList.remove("hidden");

  scrollToElement("semPaperBox");

  hideLoader();
}


// ================= LOAD LAB SUBJECTS =================

function loadLabSubjects() {
  showLoader();
  

  const regulation = document.getElementById("labRegulation").value;
  const branch = document.getElementById("labBranch").value;
  const year = document.getElementById("labYear").value;
  const sem = document.getElementById("labSemester").value;

  // Validation
  if (!regulation) {
    alert("Please select Regulation first");
    hideLoader();
    return;
  }

  if (!branch) {
    alert("Please select Branch first");
    hideLoader();
    return;
  }

  if (!year) {
    alert("Please select Year first");
    hideLoader();
    return;
  }

  if (!sem) {
    alert("Please select Semester first");
    hideLoader();
    return;
  }

  const key = year + "-" + sem;

  const list = document.getElementById("labSubjectList");
  const box = document.getElementById("labSubjectBox");

  list.innerHTML = "";

  // Check data from subjectsData (same structure as MID/SEM)
  const subjects = subjectsData?.[regulation]?.[branch]?.["LAB"]?.[key];

  if (!subjects || subjects.length === 0) {
    list.innerHTML = `
      <tr>
        <td colspan="2" class="text-center text-red-500 p-4">
          No lab data available
        </td>
      </tr>
    `;

    box.classList.remove("hidden");
    hideLoader();
    return;
  }

  // Get lab links from linksData
  const labLinks = linksData?.LAB?.[regulation]?.[branch]?.[key];

  // Load subjects
  subjects.forEach(sub => {
    const manualLink = labLinks?.[sub]?.manual;

    const row = document.createElement("tr");

    row.innerHTML = `
      <td class="border p-2">${sub}</td>

      <td class="border p-2 text-center">
        ${
          manualLink && manualLink.trim() !== ""
            ? `<a href="${manualLink}" target="_blank" class="text-blue-600 underline">View</a>`
            : `<span class="text-red-500 font-semibold">Not Available</span>`
        }
      </td>
    `;

    list.appendChild(row);
  });

  box.classList.remove("hidden");

  scrollToElement("labSubjectBox");
  hideLoader();
}


// ================= LOAD MATERIALS SUBJECTS =================

function loadMaterialsSubjects() {
  showLoader();
  

  const reg = document.getElementById("matReg");
  const branch = document.getElementById("matBranch");
  const year = document.getElementById("matYear");
  const sem = document.getElementById("matSem");

  // Validation
  if (!reg) {
    alert("Please select Regulation first");
    hideLoader();
    return;
  }

  if (!branch) {
    alert("Please select Branch first");
    hideLoader();
    return;
  }

  if (!year) {
    alert("Please select Year first");
    hideLoader();
    return;
  }

  if (!sem) {
    alert("Please select Semester first");
    hideLoader();
    return;
  }

  const regVal = reg.value;
  const branchVal = branch.value;
  const yearVal = year.value;
  const semVal = sem.value;

  const key = yearVal + "-" + semVal;

  const subjectBox = document.getElementById("materialsSubjects");
  const unitBox = document.getElementById("materialsUnits");

  subjectBox.innerHTML = "";
  unitBox.innerHTML = "";
  unitBox.classList.add("hidden");

  // Check Data from subjectsData
  const subjects = subjectsData?.[regVal]?.[branchVal]?.["NOTES"]?.[key];

  if (!subjects || subjects.length === 0) {
    subjectBox.innerHTML = `
      <p class="text-red-600 font-semibold text-center">
        No materials available
      </p>
    `;
    subjectBox.classList.remove("hidden");
    hideLoader();
    return;
  }

  // Get notes links from linksData
  const notesLinks = linksData?.NOTES?.[regVal]?.[branchVal]?.[key];

  let html = `
    <h3 class="font-bold mb-3">Subjects</h3>

    <table class="w-full border">
      <tr class="bg-gray-100">
        <th class="border p-2">Subject</th>
        <th class="border p-2">Action</th>
      </tr>
  `;

  subjects.forEach(sub => {

    html += `
      <tr>
        <td class="border p-2">${sub}</td>

        <td class="border p-2 text-center">
          <button
            onclick="showMaterialUnits('${sub}')"
            class="bg-blue-500 text-white px-3 py-1 rounded">
            Click to View
          </button>
        </td>
      </tr>
    `;
  });

  html += `</table>`;

  subjectBox.innerHTML = html;
  subjectBox.classList.remove("hidden");

  scrollToElement("materialsSubjects");
  hideLoader();
}

// ================= SHOW MATERIAL UNITS =================

function showMaterialUnits(subject) {
  showLoader();
  
  const unitBox = document.getElementById("materialsUnits");
  const reg = document.getElementById("matReg").value;
  const branch = document.getElementById("matBranch").value;
  const year = document.getElementById("matYear").value;
  const sem = document.getElementById("matSem").value;
  
  const key = year + "-" + sem;
  
  // Get notes links from linksData
  const subjectNotes = linksData?.NOTES?.[reg]?.[branch]?.[key]?.[subject];

  // Units Table
  let html = `
    <div class="bg-white p-5 rounded shadow">

      <h3 class="text-lg font-bold mb-4 text-red-600">
        ${subject} - Materials
      </h3>

      <table class="w-full border">

        <tr class="bg-gray-100">
          <th class="border p-2">Unit</th>
          <th class="border p-2">View</th>
        </tr>
  `;

  // 5 Units
  for (let i = 1; i <= 5; i++) {
    const unitLink = subjectNotes?.[`unit${i}`];

    html += `
      <tr>
        <td class="border p-2">Unit - ${i}</td>

        <td class="border p-2 text-center">
          ${
            unitLink && unitLink.trim() !== ""
              ? `<a href="${unitLink}" target="_blank" class="bg-blue-500 text-white px-3 py-1 rounded">View</a>`
              : `<span class="text-red-500">Not Available</span>`
          }
        </td>
      </tr>
    `;
  }

  html += `
      </table>

    </div>
  `;

  unitBox.innerHTML = html;
  unitBox.classList.remove("hidden");

  scrollToElement("materialsUnits");
  hideLoader();
}

window.onload = function () {

  const homeBtn = document.querySelector(".nav-btn");

  showSection("home", homeBtn);
};
// ================= show TEXTBOOKS =================


const booksPerPage = 5;
let currentBookPage = 1;

function loadTextbooks(page = 1) {

    currentBookPage = page;

    const table = document.getElementById("textbookTable");
    const pagination = document.getElementById("textbookPagination");

    table.innerHTML = "";
    pagination.innerHTML = "";

    const books = linkData.TEXTBOOKS;

    if (!books) return;

    const start = (page - 1) * booksPerPage;
    const end = start + booksPerPage;

    const currentBooks = books.slice(start, end);

    currentBooks.forEach(book => {

        table.innerHTML += `
            <tr>
                <td class="border p-3">
                    ${book.name}
                </td>

                <td class="border p-3 text-center">
                    <a href="${book.link}"
                       target="_blank"
                       class="text-blue-600 underline">
                       View
                    </a>
                </td>
            </tr>
        `;

    });

    const totalPages = Math.ceil(books.length / booksPerPage);

    // Page buttons
    for(let i=1;i<=totalPages;i++){

        pagination.innerHTML += `
        <button
            onclick="loadTextbooks(${i})"
            class="mx-1 px-3 py-2 rounded ${
                page===i
                ? 'bg-red-600 text-white'
                : 'bg-gray-200'
            }">

            ${i}

        </button>`;
    }

    // Next button
    if(page<totalPages){

        pagination.innerHTML += `
        <button
            onclick="loadTextbooks(${page+1})"
            class="mx-1 px-3 py-2 bg-blue-500 text-white rounded">

            Next

        </button>`;
    }

}
// ====================== INITIAL TEXTBOOKS LOAD =================
loadTextbooks();

// ================= RESET WHEN FILTERS CHANGE =================

document.getElementById("year").addEventListener("change", resetMidData);
document.getElementById("semester").addEventListener("change", resetMidData);
document.getElementById("branch").addEventListener("change", resetMidData);
document.getElementById("regulation").addEventListener("change", resetMidData);

function resetMidData() {

  document.getElementById("subjectList").innerHTML = "";
  document.getElementById("paperList").innerHTML = "";

  document.getElementById("subjectBox").classList.add("hidden");
  document.getElementById("paperBox").classList.add("hidden");
}     

// Auto reset when dropdown changes

document.getElementById("semBranch").addEventListener("change", resetSemData);
document.getElementById("semYear").addEventListener("change", resetSemData);
document.getElementById("semSemester").addEventListener("change", resetSemData);
document.getElementById("semregulation").addEventListener("change", resetSemData);

function resetSemData() {
  document.getElementById("semSubjectBox").classList.add("hidden");
  document.getElementById("semPaperBox").classList.add("hidden");
}

// ================= RESET LAB =================

["labBranch","labYear","labSemester", "labRegulation"].forEach(id => {

  document.getElementById(id).addEventListener("change", () => {

    document.getElementById("labSubjectBox")
      .classList.add("hidden");
  });

});

// ================= RESET NOTES =================

["matBranch","matYear","matSemester", "matReg"].forEach(id => {

  const element = document.getElementById(id);
  if (element) {
    element.addEventListener("change", () => {

      document.getElementById("materialsSubjects")
        .classList.add("hidden");
        
      document.getElementById("materialsUnits")
        .classList.add("hidden");
    });
  }

});

// ================= SCROLL TO TOP =================

const scrollBtn = document.getElementById("scrollTopBtn");

window.addEventListener("scroll", () => {

  if (window.scrollY > 300) {
    scrollBtn.classList.remove("hidden");
  } else {
    scrollBtn.classList.add("hidden");
  }

});

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// ================= MOBILE MENU =================

const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

menuBtn.addEventListener("click", () => {
  menu.classList.toggle("hidden");
});

// ================= SCROLL SPY =================

const sections = document.querySelectorAll(".section");
const navLinks = document.querySelectorAll(".nav-btn");

// Track the last manually clicked nav to prevent scroll spy from overriding it
let lastClickedNav = null;

window.addEventListener("scroll", () => {

  let current = "";

  sections.forEach(section => {

    const sectionTop = section.offsetTop - 120;
    const sectionHeight = section.offsetHeight;

    if (
      pageYOffset >= sectionTop &&
      pageYOffset < sectionTop + sectionHeight
    ) {
      current = section.getAttribute("id");
    }

  });

  // Only update active state from scroll if no nav was recently clicked
  if (!lastClickedNav) {
    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("onclick")?.includes(current)) {
        link.classList.add("active");
      }
    });
  }

});

// Auto close mobile menu on click
document.querySelectorAll(".nav-btn").forEach(link => {

  link.addEventListener("click", (e) => {
    // Set the last clicked nav
    lastClickedNav = link;
    
    // Remove active from all
    navLinks.forEach(l => l.classList.remove("active"));
    // Add active to clicked
    link.classList.add("active");
    
    // Clear after a short delay to let scroll spy take over
    setTimeout(() => {
      lastClickedNav = null;
    }, 500);

    if (window.innerWidth < 768) {
      menu.classList.add("hidden");
    }

  });

});

function searchNavbar(){

const input =
document.getElementById("navSearch").value.toLowerCase();

const results =
document.getElementById("searchResults");

results.innerHTML = "";

if(input === ""){
results.classList.add("hidden");
return;
}

const navItems = [
{ name:"Home", section:"home"},
{ name:"About Us", section:"about"},
{ name:"MID QP", section:"mid"},
{ name:"SEM QP", section:"sem"},
{ name:"Lab Manuals", section:"lab"},
{ name:"Materials", section:"materials"},
{ name:"Textbooks", section:"textbooksSection"},
{ name:"Contact", section:"contact"}
];

navItems.forEach(item => {

if(item.name.toLowerCase().includes(input)){

const li = document.createElement("li");

li.innerHTML =
`<a href="#" class="block px-3 py-2 hover:bg-gray-200"
onclick="showSection('${item.section}')">
${item.name}
</a>`;

results.appendChild(li);

}

});

results.classList.remove("hidden");

}

document.addEventListener("click", function(e){

if(!document.getElementById("navSearch").contains(e.target)){
document.getElementById("searchResults").classList.add("hidden");
}

});

let count = localStorage.getItem("visits");

if (!count) {
  count = 1;
} else {
  count = parseInt(count) + 1;
}

localStorage.setItem("visits", count);

document.getElementById("visitorCount").innerText = count;

// ================= GALLERY SLIDER =================
const carousel = document.getElementById("carousel");
const cards = document.querySelectorAll(".card");
const dotsContainer = document.getElementById("dots");

let index = 1; // start center
let total = cards.length;

/* Create dots */
cards.forEach((_, i) => {
  const dot = document.createElement("div");
  dot.addEventListener("click", () => goToSlide(i));
  dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll("#dots div");

/* Update UI */
function updateCarousel() {
  carousel.style.transform = `translateX(-${index * (100 / 3)}%)`;

  cards.forEach(c => c.classList.remove("active"));
  dots.forEach(d => d.classList.remove("active-dot"));

  if (cards[index]) cards[index].classList.add("active");
  if (dots[index]) dots[index].classList.add("active-dot");
}

/* Next */
function nextSlide() {
  index++;
  if (index >= total) index = 0;
  updateCarousel();
}

/* Prev */
function prevSlide() {
  index--;
  if (index < 0) index = total - 1;
  updateCarousel();
}

/* Go to specific */
function goToSlide(i) {
  index = i;
  updateCarousel();
}

/* Auto Slide */
setInterval(nextSlide, 3000);

/* Swipe Support (Mobile) */
let startX = 0;

carousel.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

carousel.addEventListener("touchend", e => {
  let endX = e.changedTouches[0].clientX;

  if (startX - endX > 50) nextSlide();
  if (endX - startX > 50) prevSlide();
});

/* Init */
updateCarousel();

function toggleSyllabus() {

    const box = document.getElementById("syllabusDepartments");

    box.classList.toggle("hidden");

    if (!box.classList.contains("hidden")) {

        box.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}

function loadHomeVideos(){

fetch("data/links.json")

.then(res=>res.json())

.then(data=>{

const container=document.getElementById("homeVideos");

container.innerHTML="";

data.VIDEOS.slice(0,3).forEach(video=>{

container.innerHTML+=`

<div
onclick="window.open('${video.url}','_blank')"
class="bg-white rounded-2xl shadow-lg hover:-translate-y-3 hover:shadow-2xl duration-300 cursor-pointer overflow-hidden">

<img
src="${video.thumbnail}"
class="w-full h-56 object-cover">

<div class="p-5">

<h3 class="text-2xl font-bold">

${video.title}

</h3>

<p class="text-gray-600 mt-2">

${video.description}

</p>

<button
class="mt-5 bg-red-600 text-white px-5 py-2 rounded-full">

${video.platform === "instagram" ? "📷 View Reel" : "▶ Watch Video"}

</button>

</div>

</div>

`;

});

});

}
if (document.getElementById("homeVideos")) {
    loadHomeVideos();
}


function loadAllVideos(){

fetch("data/links.json")
.then(res=>res.json())
.then(data=>{

    console.log("JSON Loaded");
    console.log(data);

    const container=document.getElementById("allVideos");

    console.log(container);

    container.innerHTML="";

    console.log(data.VIDEOS.length);



data.VIDEOS.forEach(video=>{

container.innerHTML+=`

<div
class="bg-white rounded-3xl shadow-lg overflow-hidden hover:-translate-y-2 hover:shadow-2xl duration-300">

<img
src="${video.thumbnail}"
class="w-full h-56 object-cover">

<div class="p-5">

<h2 class="text-2xl font-bold">
${video.title}
</h2>

<p class="text-gray-600 mt-3">
${video.description}
</p>

<a
href="${video.url}"
target="_blank"
class="mt-5 inline-block bg-red-600 text-white px-5 py-3 rounded-xl">

${video.platform === "instagram"
? "📷 View Reel"
: "▶ Watch on YouTube"}

</a>

</div>

</div>

`;

});

});

}
if (document.getElementById("allVideos")) {
    loadAllVideos();
}
