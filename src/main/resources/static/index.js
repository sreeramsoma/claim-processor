document.addEventListener('DOMContentLoaded', function () {
    const backendUrl = `${window.location.origin}`; // Define the backend URL here

    // Update the form action attribute with the backend URL
    const form = document.getElementById('uploadForm');
    form.action = `${backendUrl}/upload`;
});