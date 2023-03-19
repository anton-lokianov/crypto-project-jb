const cardInfoUrl = "https://api.coingecko.com/api/v3/coins/";
const priceInfoUrl = "https://www.cryptocompare.com/api/#-api-data-price-";
const cryptoCurrencyUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=USD";
const cryptoCurrencyLiveDataUrl = "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=%s&tsyms=%a"
// Initialize variables
let cryptoCard = [];
const uncheckCandidates = [];
let compareList = [];
let cards = [];
const perPage = 20;
let currentPage = 0;
let cacheStorage = null;

// Function to store data in cache
const setCachedData = async (cacheId, coinInfo) =>{
  if(!cacheStorage){
    cacheStorage = await caches.open("cryptoInfo");
  }
  // Add timestamp to the coinInfo object before storing in cache
  coinInfo.timestamp = Date.now();
  await cacheStorage.put(cacheId, new Response(JSON.stringify(coinInfo)));
}

// Function to retrieve data from cache
const getCachedData = async (cacheId) =>{
  if(!cacheStorage){
    cacheStorage = await caches.open("cryptoInfo");
  }

  const coinInfo = await cacheStorage.match(cacheId);
  if(!coinInfo){
    return null;
  }
  
  // Parse the cached data and calculate the time elapsed since it was cached
  const coinInfoJson = await coinInfo.json();
  const timeElapsed = (Date.now() - coinInfoJson.timestamp) / 1000;
  if (timeElapsed > 120){
    // Delete the cached data if it has been more than 120 seconds
    cacheStorage.delete(coinInfoJson);
    coinInfoJson = null;
  }
  return coinInfoJson;
}

$(async () =>{
  try{
    // Show loading spinner while fetching data
    $('.loading-spinner').show();
    cryptoCard = await $.get(cryptoCurrencyUrl);
    // Create pagination for the fetched data
    createPaging();
    // Show the first page
    paging(0);
    $('.loading-spinner').hide();
    // Add event listener to search input
    $("#searchInput").on("input", searchInCryptoCards);
  }
  catch(e){
    console.error(e,"Error loading");
  }
});

// Function to retrieve additional information for a specific cryptocurrency and update its collapse card
const getMoreCurrencyInfo = async (id, collapseCardId) => {
  try {
    const spinner = $('#' + collapseCardId).find('.spinner-border');
    const cryptoMoreInfo = $('#' + collapseCardId).find('.cryptoMoreInfo');
    cryptoMoreInfo.hide();
    spinner.show(); 
    // check if the data is cached
    let coinInfo = await getCachedData(id);
    if (!coinInfo){
      // if not cached, retrieve it from remote server
      coinInfo = await $.get(cardInfoUrl + id);
      // cache the retrieved data
      setCachedData(id, coinInfo);
    }

    spinner.hide();
    cryptoMoreInfo.show();
    // update the collapse card with the retrieved data
    updateCollapseCard(collapseCardId, coinInfo);
  } catch (error) {
    console.error(error);
  }
};

// Function to update the collapse card with the retrieved coin information
const updateCollapseCard = (collapseCardId, coinInfo) => {
  const collapseCard = $("#" + collapseCardId);
  collapseCard.find("img").attr("src", coinInfo.image.small);
  collapseCard.find(".usdValue").html(coinInfo.market_data.current_price.usd);
  collapseCard.find(".eurValue").html(coinInfo.market_data.current_price.eur);
  collapseCard.find(".ilsValue").html(coinInfo.market_data.current_price.ils);
};

/*
This function adds or removes a coin from the compareList based on whether its checkbox is checked or unchecked.
If the checkbox is unchecked, the coin is removed from the compareList.
If the checkbox is checked, the coin is added to the compareList.
If the compareList contains six coins, it calls createModalHtml() to create the comparison modal. 
*/
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

/*
This function cancels the replacing of a coin from the compareList.
It removes all the elements from the uncheckCandidates array,
and removes the last coin that was added to the compareList from both the compareList and the checkbox.
*/
const cancelReplacing = () =>{
  uncheckCandidates.splice(0, uncheckCandidates.length);
  const lastElement = compareList.pop();
  $("#toggle" + lastElement.coinId).prop("checked", false);
}

/*
This function replaces a coin from the compareList with another coin.
If there are no coins in the uncheckCandidates array,
it removes the last coin that was added to the compareList from both the compareList and the checkbox.
If there are coins in the uncheckCandidates array, it removes those coins from the compareList and the checkboxes.
*/
const replaceCoin = () =>{
  if(uncheckCandidates.length === 0){
    const lastElement = compareList.pop();
    $("#toggle" + lastElement.coinId).prop("checked", false);
    return
  }
  uncheckCandidates.map((coinId) =>{
    compareList = compareList.filter((element) => element.coinId !== coinId);
    $("#toggle" + coinId).prop("checked", false)
  });
  uncheckCandidates.splice(0, uncheckCandidates.length);
}

/* 
This function is called when a user unchecks a checkbox in the compare list.
It receives the target checkbox element as a parameter.
If the checkbox is unchecked, add its id to the uncheckCandidates array.
If the checkbox is checked again, remove its id from the uncheckCandidates array.
*/
const uncheckCoin = (target) =>{
  if(!target.checked){
    uncheckCandidates.push(target.id);
    console.log(uncheckCandidates);
    return;
  } 
  uncheckCandidates.splice(uncheckCandidates.indexOf(target.id), 1)
}

/*
 This function searches for a search term entered by the user in the search input field
 that search the cards on the home page
*/
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

/*
This function handles pagination of the crypto cards by taking in the 
current page index and context as parameters
*/
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
  // Creates a new array of the sliced crypto cards based on the start and end index
  const slicedCryptoCards = JSON.parse(JSON.stringify(cryptoCard.slice(startIndex, endIndex)))
  createCardData(slicedCryptoCards);
}

// This function creates paging for cryptoCard data.
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

//this function creates cards element for the crypto data he requested from the api server
const createCardData = (slicedCryptoCards) => {
  $("#cryptoCards").html("");
  const cardData = [];
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

/*
This is a function that returns a string of HTML elements for a collapsible card
 that displays additional information about a cryptocurrency. 
*/
const getMoreCurrencyInfoCollapse = () => {
  return `
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
}

/*
this function call the modal html 
if you have more the five items in the coins list
*/
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