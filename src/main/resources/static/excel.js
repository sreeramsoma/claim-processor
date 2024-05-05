// script.js
const backendUrl = `${window.location.origin}`;

console.log(backendUrl)
function setData(data) {
    // Access the iframe's content document
    const iframe = document.getElementById('dataFrame');
    // More code here if needed
    const iframeDocument = iframe.contentWindow.document;
    const editForm = iframeDocument.getElementById('editForm');
    editForm.querySelector('#name').value = data.name || '';
    editForm.querySelector('#age').value = data.age || '';
    editForm.querySelector('#salary').value = data.salary || '';


    let elem = document.getElementById('buttonStrip');
    elem.querySelector('#row').textContent = data.row || '';
    elem.querySelector('#numrows').textContent = data.numrows || '';

}

document.addEventListener('DOMContentLoaded', function () {

    /*  const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const jsonStr = urlParams.get('jsonData');
      console.log('JSON data :' + jsonStr);
  
  
      const data = JSON.parse(jsonStr);*/
    // Get the URL parameters
    const iframe = document.getElementById('dataFrame');

    // More code here if needed

    iframe.addEventListener('load', function () {

        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const jsonStr = urlParams.get('jsonData');
        console.log('JSON data :' + jsonStr);


        const data = JSON.parse(jsonStr);
        setData(data);
    });


    const strip = document.getElementById('buttonStrip');
    const nextButton = strip.querySelector('#next');
    nextButton.addEventListener('click', function () {
        // Get the current row and numrows values
        const row = parseInt(document.getElementById('row').textContent);
        const numrows = parseInt(document.getElementById('numrows').textContent);

        if (row == numrows) {
            return;
        }

        // Make a fetch request to get the next record
        const url = `${backendUrl}/getRecord?row=${row + 1}`;
        console.error(url + "ding");
        fetchDataAndUpdate(url);

    });

    const prevButton = strip.querySelector('#prev');
    prevButton.addEventListener('click', function () {
        console.log("called prev");
        const row = parseInt(document.getElementById('row').textContent);
        if (row == 1) {
            return;
        }

        // Make a fetch request to get the previous record
        const url = `${backendUrl}/getRecord?row=${row - 1}`;
        fetchDataAndUpdate(url);
    });

    const downloadButton = strip.querySelector('#download');
    downloadButton.addEventListener('click', function () {
        console.log("called download");
        const url = `${backendUrl}/downloadExcel`;
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

    const updateButton = strip.querySelector('#updateButton');
    updateButton.addEventListener('click', function () {
        // Get the values from the input fields
        const iframe = document.getElementById('dataFrame');
        const iframeDocument = iframe.contentWindow.document;
        const editForm = iframeDocument.getElementById('editForm');

        const name = editForm.querySelector('#name').value;
        const age = parseInt(editForm.querySelector('#age').value);
        const salary = parseFloat(editForm.querySelector('#salary').value);
        let elem = document.getElementById('buttonStrip');
        const row = parseInt(elem.querySelector('#row').textContent);

        // Create an object with the captured data
        const editedData = {
            name: name,
            age: age,
            salary: salary,
            row: row
        };

        // Make an AJAX request to the update route
        fetch(`${backendUrl}/update`, {
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

            setData(data);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            if (errorHandler) {
                errorHandler(error);
            }
        });
}

