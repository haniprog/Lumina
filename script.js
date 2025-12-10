const toggleSwitch = document.getElementById('themeToggle');
const body = document.body;


function enableDarkMode() {
    body.classList.remove('light-mode');
    localStorage.setItem('theme', 'dark');
}


function enableLightMode() {
    body.classList.add('light-mode'); 
    localStorage.setItem('theme', 'light');
}


if (localStorage.getItem('theme') === 'dark') {
    toggleSwitch.checked = true;
    enableDarkMode();
} else {
    toggleSwitch.checked = false;
    enableLightMode();
}

// 2. Listen for switch changes
toggleSwitch.addEventListener('change', function() {
    if (this.checked) {
        enableDarkMode();
    } else {
        enableLightMode();
    }
});

function clearAll() {
    document.getElementById('sourceInput').value = '';
    
    const tableBody = document.getElementById('resultBody');
    tableBody.innerHTML = `
        <tr><td>example</td><td>example</td><td>example</td></tr>
        <tr><td>example</td><td>example</td><td>example</td></tr>
        <tr><td>example</td><td>example</td><td>example</td></tr>
        <tr><td>example</td><td>example</td><td>example</td></tr>
        <tr><td>example</td><td>example</td><td>example</td></tr>
        <tr><td>example</td><td>example</td><td>example</td></tr>
        <tr><td>example</td><td>example</td><td>example</td></tr>
        <tr><td>example</td><td>example</td><td>example</td></tr>
    `;
}

function analyzeCode() {
    alert("Lexical analysis logic is currently disabled.");
}

document.getElementById('fileUpload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('sourceInput').value = e.target.result;
        };
        reader.readAsText(file);
    }
});