// JSON para tratar casos de falha na requisicao AJAX
var XMLfail = {
  "status": "fail"
};
//funcao para simplificar queries no document(HTML)
//Similar ao $ do jQuery
function _q(selector){
    var ans = document.querySelectorAll(selector);
    return ans.length == 1?ans[0]: ans;
}
//Variaveis Globais, myJSON a variavel que ira armazenar o JSON quando
//este chegar via requisicao AJAX, atualPage e o controlador da pagina
//que esta sendo exibida no HTML
var myJSON = XMLfail, atualPage = 1;
//funcao para executar requisicoes AJAX, e passado a url e o JSON que
//vier como resposta e armazenado na variavel myJSON
function MakeRequest(url) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function(){ // o que deve ser executado quando a requisicao chegar
    if(xhr.status >= '200' && xhr.status < '400'){ // verificando se e uma resposta valida
      myJSON = JSON.parse(xhr.responseText); // Atribuido o JSON de resposta a myJSON
    } else {
      myJSON = XMLfail;// Atribuido o JSON de falha a myJSON
    }
    load(); // Chamada de load() para alteral o HTML com os dados que cheagaram
  };
  xhr.open('get', url, true);//Definindo metodo de requisicao
  xhr.send();//Enviando requisicao
}
//funcao para chamar MakeRequest com o padrao da api de filmes da YTS.AG
function make_json(){
    //url para solicitar os dados com variavel limit por padrao sendo 48 ou seja
    //48 filmes por pagina e page recebendo atualPage para alterar a pagina de que
    //sera pego os filmes
    MakeRequest(`https://yts.ag/api/v2/list_movies.json?limit=${48}&page=${atualPage}`);
}
make_json(); // fazendo requisicao para iniciar o servico
//funcao para alterar estado de exibicao quando um filme e clickado
function change(){
  var movies = myJSON.data.movies, myId = this.id; // Carregando todos os filmes da pagina e o id do filme clickado
  // verificar o style caso seja inline-block significa que o filme clickado deve ser
  // focalizado, caso nao quer dizer que se deve voltar para a exibicao da lista de filmes
  if(this.style.display == "inline-block"){
    var myMovie;//Variavel para salvar as informacoes do filme a ser focado quando o encontrar
    movies.forEach(function(movie){
      _q(`#a${movie.id}`).style.display = "none";//alterando o display de todos os filmes para nao serem exibidos
      if(`a${movie.id}` === myId)//verificando se esse filme possui o mesmo id, do que deve ser focalizado
        myMovie = movie;//Salvando informacoes necesarias
    });
    this.innerHTML = "";//Limpando conteudo atual do filme
    this.style.display = "block"; //Alterando estilo
    this.style.width = "100%";
    this.style.height = "100%";
    var sinopse = document.createElement('p');// elemento para armazenar sinopse do filme
    sinopse.innerHTML = 'Sinopse: ' + myMovie.synopsis; // Colocando o conteudo
    sinopse.style = "width: 60%; text-align: justify; display: inline-block; padding: 3%;"; // alterando o estilo
    var img = document.createElement('img'); // elemento para imagem do filme
    img.src = myMovie.large_cover_image;
    img.style = "width: 20em; height: 30em; display:inline-block; padding: 3%;";
    var title = document.createElement('h2'); // elemento para titulo do filme
    title.innerHTML = myMovie.title_long;
    var rating = document.createElement('h3'); // elemento para o rating IMBD
    rating.innerHTML = 'Rating: ' + myMovie.rating;
    var classification = document.createElement('h4'); // elemento para a classificacao idincativa
    classification.innerHTML = 'Classification: ' + myMovie.mpa_rating;
    this.appendChild(img);//Adicionando informacoes do filme a div atual
    this.appendChild(title);
    this.appendChild(rating);
    this.appendChild(classification);
    this.appendChild(sinopse);
  } else { // Voltar exibicao para o modo lista
    this.innerHTML = ""; // Limpar conteudo atual
    var imgP = document.createElement('img'); // elemento para imagem do modo lista
    var titleP = document.createElement('p'); // elemento para titulo do modo lista
    titleP.style = "text-align: center;"; // Atribuido estilo ao elemento
    imgP.style =  "width:90%; height:95%"; // Atribuindo estilo
    movies.forEach(function(movie){
      if(`a${movie.id}` === myId){ // Verificando se e o filme que esta focalizado
          titleP.innerHTML = movie.title; //Adicionando o titulo do filme ao elemento criado
          imgP.src = movie.medium_cover_image; // Linkando capa do filme no elemento da imagem
      } else
        _q(`#a${movie.id}`).style.display = "inline-block";// Reatribuindo visualizacao aos outros itens da lista
    });
    this.appendChild(imgP); // reestabelecendo modo normal para item focalizado
    this.appendChild(titleP);
    this.style = "width:12%; height: 17%; display: inline-block;";
  }
}
function clear_content(){
  var toLoad = _q('#movies'); //Simplificando o acesso a div onde os filmes serao exibidos
  toLoad.innerHTML = ""; //Limpando o conteudo atual
}
function make_me_sad(){// Para tratar erros
  var toLoad = _q('#movies');
  var badINFO = document.createElement('h1');// Criando elementos para informar o erro
  var unhappyIMG = document.createElement('img');
  //Situacao em que se encontra o programador quando o codigo falha
  unhappyIMG.src = "http://ih0.redbubble.net/image.172927789.2754/flat,800x800,075,f.u2.jpg";
  unhappyIMG.style = "display: block; width: 30%; height: 30%; margin: auto;"; //Atribuind estilo
  //Mensagem para o cliente
  badINFO.innerHTML = "Sorry, an internal error ocurred";
  badINFO.style = "text-align: center;";
  toLoad.appendChild(badINFO); // Colocando a Mensagem e a imagem no HTML
  toLoad.appendChild(unhappyIMG);
  _q('#query').style.backgroundColor = "red";//Para o erro ficar mais claro
}
//funcao para carregar os dados do myJSON no HTML
function load(){
  var toLoad = _q('#movies'); //Simplificando o acesso a div onde os filmes serao exibidos
  clear_content();// Limpando conteudo
  if(myJSON.status === "fail"){ // Tratando casos de erro onde a requisicao AJAX falha
    make_me_sad();// Muito triste a situacao
    return; // Terminado execucao da funcao
  }
  _q('#query').style.backgroundColor = "white";//Restabelecendo cor de fundo do input ja que nao houve erro
  var movies = myJSON.data.movies; // Pegando no JSON o Array que contem as informacoes sobre os filmes
  movies.forEach(function(movie){ // Adicionando cada filme ao HTML
    var div = document.createElement('div'); // Criacao de elementos
    var img = document.createElement('img');
    var title = document.createElement('p');
    title.innerHTML = movie.title; //Adicionando o titulo do filme ao elemento criado
    title.style = "text-align: center;"; // Atribuido estilo ao elemento
    img.src = movie.medium_cover_image; // Linkando capa do filme no elemento da imagem
    img.style =  "width:90%; height:95%"; // Atribuindo estilo
    div.appendChild(img); // Adicionando elemento img ao elemento div
    div.appendChild(title);// Adicionando elemento title ao elemento div
    div.style = "width:12%; height: 17%; display: inline-block;"; // Atribuindo estilo ao elemento div
    div.id = "a" + movie.id; // Atribuindo id a elemento div baseado no filme que ele possui
    div.addEventListener('click', change); // Atribuindo funcao para quando ele for clickado
    toLoad.appendChild(div);// Adicionando elemento div ao HTML
  });
}
_q('#previousPage').addEventListener('click',function(){// Tratamento de click no botao de Voltar Pagina
  atualPage--;// Decrementar pagina atual
  this.disabled = (atualPage == 1)?true:false;//Desativando botao atual caso nao seja possivel decrementar a pagina de novo
  _q('#nextPage').disabled = false; // Ativando botao de proxima pagina caso esteja desativado
  make_json(); // Requisitando recarregar pagina
});
_q('#nextPage').addEventListener('click', function(){ // Tratamento de click no botao de Avancar Pagina
  atualPage++;// Incrementar pagina atual
  _q('#previousPage').disabled = false; // Ativando botao de voltar pagina caso esteja desativado
  this.disabled = (atualPage == 20)?true:false;//Desativando botao atual caso nao seja possivel incrementar a pagina de novo
  make_json();// Requisitando recarregar pagina
});
_q('#query').addEventListener('keyup',function(){// Alterando os filmes exibidos conforme alteracoes no input
  if(myJSON.status === "fail"){//Tratando erros
    clear_content(); // Limpando conteudo
    make_me_sad(); // Mandando Mensagem de erro
    return; // Terminando execucao
  }
  _q('#query').style.backgroundColor = "white";//Restabelecendo cor de fundo do input ja que nao houve erro
  var movies = myJSON.data.movies;// Acessando os filmes que sao exibidos
  var pattern = this.value;//Pegando o valor que esta presente na input
  movies.forEach(function(movie){
    var thisMovie = _q(`#a${movie.id}`);
    if(!(new RegExp(pattern)).test(movie.title)){//verificando se o titulo do filme possui como parte dele
      // o que foi digitado pelo usuario
      thisMovie.style.display = "none";//Caso nao tenha deixa de exibir
    } else {
      thisMovie.style.display = "inline-block"; // Caso tenha exibi
    }
  });
});
