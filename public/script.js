document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const image = document.getElementById('image');
    const cropButton = document.getElementById('cropButton');
    let cropper;

    // Initialize JSONEditor
    const container = document.getElementById("result");
  
    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                image.src = e.target.result;
                image.style.display = 'block';
                if (cropper) {
                    cropper.destroy();
                }
                cropper = new Cropper(image, {
                    viewMode: 1,
                    autoCropArea: 1,
                    movable: true,
                    scalable: true,
                    zoomable: true,
                    rotatable: true,
                    aspectRatio: NaN // Permitir recorte libre
                });
            };
            reader.readAsDataURL(file);
        }
    });

    cropButton.addEventListener('click', () => {
        if (cropper) {
            const canvas = cropper.getCroppedCanvas();
            const croppedImage = canvas.toDataURL('image/png');
            fetch('/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image: croppedImage.split(',')[1] }) // Enviar solo la parte base64
            })
            .then(response => response.json())
            .then(data => {

                console.log('Respuesta de la API:', data);

                let rawJson = data.result.replace('```json\n', '').replace('\n```', '');

                // Convertir a objeto JSON
                try {
                    let jsonObject = JSON.parse(rawJson);
                    console.log(JSON.stringify(jsonObject, null, 2));
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                }


            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    });

  
});
