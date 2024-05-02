// script.js

document.addEventListener('DOMContentLoaded', function () {
    // Get the URL parameters
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    // Get the JSON object string from the "data" parameter (assuming "data" is the parameter name)
    const jsonStr = urlParams.get('jsonData');
    console.error('JSON data :' + jsonStr);

    if (jsonStr) {
        // Parse the JSON object string into a JavaScript object
        const data = JSON.parse(jsonStr);

        // Display the values in the input fields
        document.getElementById('name').value = data.name || '';
        document.getElementById('age').value = data.age || '';
        document.getElementById('salary').value = data.salary || '';
        // Calculate bonus (assuming bonus is age * salary * 0.1)
        const bonus = data.age * data.salary * 0.1;
        document.getElementById('bonus').value = bonus || '';
        document.getElementById('row').textContent = data.row || '';
        document.getElementById('numrows').textContent = data.numrows || '';
    } else {
        console.error('JSON data not found in URL parameters.');
    }
});

// Event listener for the Update button
const updateButton = document.getElementById('updateButton');
updateButton.addEventListener('click', function () {
    // Get the values from the input fields
    const name = document.getElementById('name').value;
    const age = parseInt(document.getElementById('age').value);
    const salary = parseFloat(document.getElementById('salary').value);
    const bonus = parseFloat(document.getElementById('bonus').value);
    const row = parseInt(document.getElementById('row').textContent);

    // Create an object with the captured data
    const editedData = {
        name: name,
        age: age,
        salary: salary,
        bonus: bonus,
        row: row
    };

    // Make an AJAX request to the update route
    fetch('/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedData),
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {
            console.log('Data updated successfully:', data);
            // Optionally, display a success message or redirect to another page
        })
        .catch(error => {
            console.error('Error updating data:', error);
            // Handle errors (e.g., display an error message)
        });
});

const nextButton = document.getElementById('next');
nextButton.addEventListener('click', function () {
    // Get the current row and numrows values
    const row = parseInt(document.getElementById('row').textContent);
    const numrows = parseInt(document.getElementById('numrows').textContent);

    if (row == numrows) {
        return;
    }

    // Make a fetch request to get the next record
    const url = '/getRecord?row=' + (row + 1);
    console.error(url + "ding");
    fetchDataAndUpdate(url);

});

const prevButton = document.getElementById('prev');
prevButton.addEventListener('click', function () {
    console.log("called prev");
    const row = parseInt(document.getElementById('row').textContent);
    if (row == 1) {
        return;
    }

    // Make a fetch request to get the previous record
    const url = '/getRecord?row=' + (row - 1);
    fetchDataAndUpdate(url);
});

const downloadButton = document.getElementById('download');
downloadButton.addEventListener('click', function () {
    console.log("called download");
    const url = '/downloadExcel';
    let filename = 'file.xlsx';
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/vnd.ms-excel', // Specify the content type for Excel files
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            const contentDisposition = response.headers.get('Content-Disposition');
            filename = contentDisposition.split(';')[1].split('=')[1].trim();
            console.log('Downloaded file name:', filename);

            // Optionally, handle the downloaded file data

            return response.blob(); // Get the response as a Blob (binary data)
        })
        .then(blobData => {
            // Create a temporary URL for the blob data
            const blobUrl = window.URL.createObjectURL(blobData);

            // Create a temporary link element
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;// Set the download attribute with the desired file name
            document.body.appendChild(link);

            // Programmatically click the link to trigger the download
            link.click();

            // Remove the link element after download
            document.body.removeChild(link);

            // Clean up the temporary URL
            window.URL.revokeObjectURL(blobUrl);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            if (errorHandler) {
                errorHandler(error);
            }
        });
});




function fetchDataAndUpdate(url, errorHandler) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json(); // Parse the JSON response
        })
        .then(data => {
            console.log('Data fetched successfully:', data);
            // Display the fetched data in the input fields
            document.getElementById('name').value = data.name || '';
            document.getElementById('age').value = data.age || '';
            document.getElementById('salary').value = data.salary || '';
            // Calculate bonus (assuming bonus is age * salary * 0.1)
            const bonus = data.age * data.salary * 0.1;
            document.getElementById('bonus').value = bonus || '';
            document.getElementById('row').textContent = data.row || '';
            document.getElementById('numrows').textContent = data.numrows || '';
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            if (errorHandler) {
                errorHandler(error);
            }
        });
}

