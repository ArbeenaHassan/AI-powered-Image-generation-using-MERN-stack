document.addEventListener('DOMContentLoaded', () => {
    const storedImageUrl = localStorage.getItem('imageUrl');
    if (storedImageUrl) {
        const imageContainer = document.getElementById('image-container');
        imageContainer.innerHTML = `<img src="${storedImageUrl}" alt="Generated Image" id="generated-image">`;
        document.getElementById('download-btn').style.display = 'block';
    }
});

document.getElementById('generate-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const prompt = document.getElementById('prompt').value;

    try {
        const response = await fetch('http://localhost:5000/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputs: prompt }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate image');
        }

        const result = await response.json();
        const imageUrl = result.imageUrl;

        // Save the image URL in localStorage
        localStorage.setItem('imageUrl', imageUrl);

        // Update the image container
        const imageContainer = document.getElementById('image-container');
        imageContainer.innerHTML = `<img src="${imageUrl}" alt="Generated Image" id="generated-image">`;

        // Show the download button
        const downloadBtn = document.getElementById('download-btn');
        downloadBtn.style.display = 'block';

        // Set up the download button
        downloadBtn.onclick = function() {
            downloadImage(imageUrl, 'generated-image.png');
        };

        console.log('Image generated:', imageUrl);

        // Reload the page after a short delay if needed
        setTimeout(() => {
            window.location.reload();
        }, 3000); // 3 seconds delay before reloading the page

    } catch (error) {
        console.error('Error:', error);
        alert('Error generating image');
    }
});

function downloadImage(imageUrl, fileName) {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
