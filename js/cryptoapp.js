const cardInfoUrl = "https://api.coingecko.com/api/v3/coins/";
const priceInfoUrl = "https://www.cryptocompare.com/api/#-api-data-price-";
const cryptoCurrencyUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=USD";
const cryptoCurrencyLiveDataUrl = "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=%s&tsyms=%a"

let cryptoCard = [];
const uncheckCandidates = [];
let compareList = [];
let cards = [];
const perPage = 20;
let currentPage = 0;
const cache = new Map();

$(async () =>{
  try{
    // loading on
    cryptoCard = await $.get(cryptoCurrencyUrl);
    // loading off
    createPaging();
    paging(0);
    $("#searchInput").on("input", searchInCryptoCards);
  }
  catch(e){
    console.error("Error loading");
  }
});


const getMoreCurrencyInfo = async (id, collapseCardId) => {
  try {
    if (cache.has(id)) {
      const cachedData = JSON.parse(cache.get(id));
      updateCollapseCard(collapseCardId, cachedData);
      return;
    }
    const spinner = $('#' + collapseCardId).find('.spinner-border');
    const cryptoMoreInfo = $('#' + collapseCardId).find('.cryptoMoreInfo');
    cryptoMoreInfo.hide();
    spinner.show(); // show spinner
    const coinInfo = await $.get(cardInfoUrl + id);
    spinner.hide(); // hide spinner
    cryptoMoreInfo.show();
    updateCollapseCard(collapseCardId, coinInfo);
    cache.set(id, JSON.stringify(coinInfo));
    setTimeout(() => {
      cache.delete(id);
    }, 2 * 60 * 1000);

  } catch (error) {
    console.error(error);
  }
};

const updateCollapseCard = (collapseCardId, coinInfo) => {
  const collapseCard = $("#" + collapseCardId);
  collapseCard.find("img").attr("src", coinInfo.image.small);
  collapseCard.find(".usdValue").html(coinInfo.market_data.current_price.usd);
  collapseCard.find(".eurValue").html(coinInfo.market_data.current_price.eur);
  collapseCard.find(".ilsValue").html(coinInfo.market_data.current_price.ils);
};



const addToCompareList = (coinSymbol, coinId, checkBox) => {
  if(!checkBox.checked){
    compareList = compareList.filter((coin) => coin.coinId !== coinId);
    return;
  }
  compareList.push({ coinId: coinId, coinSymbol: coinSymbol });

  if(compareList.length === 6) {
    createModalHtml();
  }
};


const cancelReplacing = () =>{
  uncheckCandidates.splice(0, uncheckCandidates.length);
  const lastElement = compareList.pop();
  console.log(compareList);
  $("#toggle" + lastElement.coinId).prop("checked", false);
}


const replaceCoin = () =>{
  if(uncheckCandidates.length === 0){
    const lastElement = compareList.pop();
    $("#toggle" + lastElement.coinId).prop("checked", false);
    return
  }
  uncheckCandidates.map((coinId) =>{
    compareList = compareList.filter((element) => element.coinId !== coinId);
    $("#toggle" + coinId).prop("checked", false)
    console.log(compareList)
  });
  uncheckCandidates.splice(0, uncheckCandidates.length);
}


const uncheckCoin = (target) =>{
  if(!target.checked){
    uncheckCandidates.push(target.id);
    console.log(uncheckCandidates);
    return;
  } 
  uncheckCandidates.splice(uncheckCandidates.indexOf(target.id), 1)
  console.log(uncheckCandidates);
}


const searchInCryptoCards = () => {
  const searchTerm = $('#searchInput').val().toLowerCase();
  if (searchTerm === '') {
    paging(currentPage);
    return;
  }
  const searchResult = cryptoCard.filter(
    item =>
      item.id.toLowerCase().includes(searchTerm) ||
      item.symbol.toLowerCase().includes(searchTerm)
  );
  createCardData(searchResult);
};



const paging = (index, context) => {
  if (context !== undefined) {
    const $currentPage = $(".page-index." + currentPage);
    $currentPage.removeClass("active");
    context.classList.add("active");
  }

  index = parseInt(index);
  currentPage = index;

  const startIndex = index * perPage;
  const endIndex = startIndex + perPage;
  if (startIndex < 0 || endIndex > cryptoCard.length) {
    return;
  }
  const slicedCryptoCards = JSON.parse(JSON.stringify(cryptoCard.slice(index*perPage, index*perPage+perPage)))
  console.log(slicedCryptoCards);
  createCardData(slicedCryptoCards);
}


const createPaging = () =>{
  const pages = Math.ceil(cryptoCard.length/perPage);
  for(let pageIndex = 0; pageIndex < pages; pageIndex++){
    const pageNumber =`
      <div class='page-index ${pageIndex}' onclick="paging('${pageIndex}', this)">
        ${pageIndex+1}
      </div>
      `;
      $("#paging").append(pageNumber);
  }
  paging(0, $(".page-index")[0]);
};


const createCardData = (slicedCryptoCards) => {
  $("#cryptoCards").html("");
  const cardData = [];
  console.log(cryptoCard.slice(0, perPage));
  slicedCryptoCards.map((card, index) => {
    const id = `cardExtendedInfo${index}`;
    const isChecked = compareList.some(coin => coin.coinId === card.id);
    const cardHtml = `
      <div class="cards">
        <div class="card" style="width: 300px">
          <div class="card-body">
            <label class="switch">
              <input type="checkbox" class="toggle" 
                id="toggle${card.id}" 
                onclick="addToCompareList('${card.symbol}', '${card.id}', this)" 
                data-card-inp=${card.id}
                ${isChecked ? 'checked' : ''}>
              <span class="slider round"></span>
            </label>
            <h4 class="card-title">${card.symbol}</h4>
            <p class="card-text">${card.name}</p>
            <button class="btn btn-primary moreInfo" 
              onclick="getMoreCurrencyInfo('${card.id}', '${id}')" 
              data-bs-toggle="collapse"
              data-bs-target="#${id}" 
              aria-expanded="false">More Info
            </button>
          </div>
          <div class="collapse flex-grow-0" id="${id}">
            ${getMoreCurrencyInfoCollapse()}
          </div>
        </div>
      </div>
    `;
    
    $("#cryptoCards").append(cardHtml);
    
    const cardObj = {
      name: card.name,
      symbol: card.symbol,
      element: $(".card")[0] 
    };
    
    cardData.push(cardObj);
  });
  return cardData;
};


const getMoreCurrencyInfoCollapse = () => {
  const cardCollapse = `
    <div class="cardCollapse">
      <div class="cardCollapseWrap">
        <div class="spinner-border text-primary" style="display: block;"></div>
        <div class="cryptoMoreInfo">
          <img src="" class="coinImg">
        </div>
        <div class="cryptoMoreInfo">
          USD $: <span class="usdValue"></span>
        </div>
        <div class="cryptoMoreInfo">
          EUR €: <span class="eurValue"></span>
        </div>
        <div class="cryptoMoreInfo">
          ILS ₪: <span class="ilsValue"></span>
        </div>
      </div>
    </div>
  `;
  $(".collapse").html(cardCollapse);
}


const createModalHtml = () => {
  const compareModal = $("#myModal");
  let modalContent = document.createElement("div");
  modalContent.id = "myModal";
  const tmp = [...compareList];
  console.log(tmp.pop());
  tmp.forEach((item) => {
     modalContent.innerHTML +=`
     <div class="form-check form-switch form-switch-sm">
     <input type="checkbox" class="form-check-input" 
     id="${item.coinId}" 
     checked onclick="uncheckCoin(this)">
      ${item.coinId}:
    </div>`
  });
    compareModal.find(".modal-body").html(modalContent);
    compareModal.modal("show");
}
