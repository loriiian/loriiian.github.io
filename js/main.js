      let roda = document.querySelector('.roda');
      let botao = document.querySelector('.botao');
      let valor = Math.ceil(Math.random() * 3600);

      botao.onclick = function(){
      roda.style.transform = "rotate(" + valor + "deg)";
      valor += Math.ceil(Math.random() * 3600);
      }