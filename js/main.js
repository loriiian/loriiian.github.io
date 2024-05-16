      let roda = document.querySelector('.roda');
      let botao = document.querySelector('.botao');
      let valor = Math.ceil(Math.random() * 3600);

      botao.onclick = function(){
      roda.style.transform = "rotate(" + valor + "deg)";
      valor += Math.ceil(Math.random() * 3600);
      }

const uploadButton = document.getElementById('botaoimagem');
        const fileInput = document.getElementById('fileInput');

        uploadButton.addEventListener('click', function() {
            fileInput.click();
        });

        fileInput.addEventListener('change', function() {
            handleUpload();
        });

        function handleUpload() {
            const file = fileInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imageContainer = document.getElementById('imageContainer');
                    imageContainer.innerHTML = `<img src="${e.target.result}" alt="Imagem de Perfil" width="100" height="100">`;
                }
                reader.readAsDataURL(file);
            } else {
                alert('Selecione uma imagem primeiro.');
            }
        }

        const textInputButton = document.getElementById('botaotexto');
        const textInputOverlay = document.getElementById('janelinha');
        const textInput = document.getElementById('inputtxt');
        const confirmButton = document.getElementById('depositar');
        const outputContainer = document.getElementById('valor');

        textInputButton.addEventListener('click', function() {
            textInputOverlay.style.display = 'flex';
            textInput.focus();
        });

        confirmButton.addEventListener('click', function() {
            const text = textInput.value;
            outputContainer.textContent = text;
            outputContainer.style.display = 'block';
            textInputOverlay.style.display = 'none';
            textInput.value = '';
        });