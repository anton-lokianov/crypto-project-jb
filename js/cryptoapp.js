const cardInfoUrl = "https://api.coingecko.com/api/v3/coins/";
const priceInfoUrl = "https://www.cryptocompare.com/api/#-api-data-price-";
const cryptoCurrencyUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=USD";

let cryptoCard = [];
let reports = [];
let counter = 0;
const compareList = [];
const totalCards = 100;

$(async () =>{
  try{
    loadOn();
    cryptoCard = await $.get(cryptoCurrencyUrl);
    getCardData();
    loadOff();
  }
  catch(e){
    console.error("Error loading");
  }
});

const getMoreCurrencyInfo = async (id, collapseCardId) =>{
 const coinInfo = await $.get(cardInfoUrl + id);
 const collapseCard = $("#" + collapseCardId);
 collapseCard.find("img").attr("src", coinInfo.image.small);
 collapseCard.find(".usdValue").html(coinInfo.market_data.current_price.usd);
 collapseCard.find(".eurValue").html(coinInfo.market_data.current_price.eur);
 collapseCard.find(".ilsValue").html(coinInfo.market_data.current_price.ils);
}

const addToCompareList = (coinId) =>{
  if(compareList.length < 5){
    compareList.push(coinId);
    return
  }
};


const getCardData = () => {
    for(let i = 0; i < totalCards; i++) {
      const id = "cardExtendedInfo" + i;
        $("#cryptoCards").append(`
        <div class="card" style="width: 300px">
          <div class="card-body">
          <label class="switch">
            <input type="checkbox" class="toggle" id="toggle${cryptoCard[i].id}" onclick="addToCompareList('${cryptoCard[i].id}')" data-card-inp=${cryptoCard[i].id}>
            <span class="slider round"></span>
          </label>
            <h4 class="card-title">${cryptoCard[i].symbol}</h4>
            <p class="card-text">${cryptoCard[i].id}</p>
            <button class="btn btn-primary moreInfo" 
            onclick="getMoreCurrencyInfo('${cryptoCard[i].id}', '${id}')" data-bs-toggle="collapse"
            data-bs-target="#${id}" aria-expanded="false" >More Info</button>
          </div>
          <div class="collapse" id="${id}">
            <img src="" class="coinImg">
            <div class="cryptoMoreInfo">
              USD $ : <span class="usdValue"></span>
            </div>
            <div class="cryptoMoreInfo">
              EUR € : <span class="eurValue"></span>
            </div>
            <div class="cryptoMoreInfo">
              ILS ₪ : <span class="ilsValue"></span>
            </div>
          </div>
        </div>
        `);
    }
};

// $("#pages").html(`Coins: ${counter} to - ${counter + 25}`)
// $("#next").on("click", () => {
//   counter += 25
//   let current = cryptoCard.slice(counter, counter + 25);
//   $("#cryptoCards").empty();
//   getCardData(current);
//   $("#pages").html(`Coins: ${counter} to - ${counter + 25}`);
// })
// $("#prev").on("click", () => {
//   counter -= 25
//   let current = cryptoCard.slice(counter, counter + 25);
//   $("#cryptoCards").empty();
//   getCardData(current)
//   $("pages").html(`Coins: ${counter} to - ${counter + 25}`);
// });



