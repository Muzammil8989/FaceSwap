// script.js

document.getElementById('faceswap-form').addEventListener('submit', async function(e) {
    e.preventDefault();
  
    const swapImageInput = document.getElementById('swapImage');
    const targetImageInput = document.getElementById('targetImage');
    const statusDiv = document.getElementById('status');
    const resultDiv = document.getElementById('result');
    const resultImage = document.getElementById('resultImage');
  
    // Clear previous results
    statusDiv.textContent = '';
    resultImage.src = '';
    resultDiv.style.display = 'none';
  
    // Validate that files are selected
    if (swapImageInput.files.length === 0 || targetImageInput.files.length === 0) {
      statusDiv.textContent = 'Please select both images.';
      statusDiv.style.color = 'red';
      return;
    }
  
    const formData = new FormData();
    formData.append('swapImage', swapImageInput.files[0]);
    formData.append('targetImage', targetImageInput.files[0]);
  
    try {
      statusDiv.textContent = 'Uploading images and processing...';
      statusDiv.style.color = 'blue';
  
      const response = await axios.post('http://localhost:3000/faceswap/image/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      statusDiv.textContent = 'FaceSwap completed successfully!';
      statusDiv.style.color = 'green';
  
      // Display the result image
      resultImage.src = response.data.output;
      resultDiv.style.display = 'block';
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data && error.response.data.details) {
        statusDiv.textContent = `Error: ${error.response.data.details}`;
      } else {
        statusDiv.textContent = 'An unexpected error occurred.';
      }
      statusDiv.style.color = 'red';
    }
  });
  