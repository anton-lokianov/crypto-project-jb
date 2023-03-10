let chartsData = [];
let liveReportsInterval;
let chart;

const cryptoLinkHashCode = (s) =>{
  return s.split("").reduce(function(a, b) {
    a = a+b.charCodeAt(0);
    return a & a;
  }, 0);
}

const saveCryptoLinkHashCode = (cryptoLink) => {
  sessionStorage.setItem("cryptoLinkHashCode",cryptoLinkHashCode(cryptoLink))
}

const compareCryptoLinksHashCodes = (cryptoLink) => {
  const newCryptoLinkHashCode = cryptoLinkHashCode(cryptoLink);
  return sessionStorage.getItem("cryptoLinkHashCode") 
  && newCryptoLinkHashCode === parseInt(sessionStorage.getItem("cryptoLinkHashCode"));
}

const displayLiveChart = async () => {

  if (!compareList || compareList.length === 0) {
    chart? chart.destroy():()=>{};
    chart = null;
    return;
  }
  // TODO:start progress bar
  const uriParameters = compareList.map((item) => item.coinSymbol).join(",");
  const cryptoLink = cryptoCurrencyLiveDataUrl.replace("%s", uriParameters).replace("%a", "USD,EUR");
  const compareResult = compareCryptoLinksHashCodes(cryptoLink);
  const liveReport = await $.get(cryptoLink);
  // TODO: end progress bar
  const coinsRawData = liveReport.RAW;
  const date = new Date();
  if (compareResult && chartsData.length > 0) {
    chartsData.forEach((item) => {
      const coinData = coinsRawData[item.name];
      item.dataPoints.push({
        x: date,
        y: coinData.USD.PRICE,
      });
    });
  } else {
    chartsData = [];
    for (let key in coinsRawData) {
      const coinData = coinsRawData[key];
      chartsData.push({
        type: "spline",
        name: key,
        showInLegend: true,
        dataPoints: [
          {
            x: date,
            y: coinData.USD.PRICE,
          },
        ],
      });
    }
  }
  if (!chart) {
    const options = {
      exportEnabled: true,
      animationEnabled: true,
      title: {
        text: "Comparing Coins",
      },
      axisX: {
        title: "Time",
      },
      axisY: {
        title: "Coin Value",
        titleFontColor: "#4F81BC",
        lineColor: "#4F81BC",
        labelFontColor: "#4F81BC",
        tickColor: "#4F81BC",
      },
      toolTip: {
        shared: true,
      },
      data: chartsData,
    };
    chart = new CanvasJS.Chart("coinsChart", options);
    chart.render();
  } else {
    chart.options.data = chartsData;
    chart.render();
  }
  if (liveReportsInterval) {
    clearInterval(liveReportsInterval);
  }
  saveCryptoLinkHashCode(cryptoLink);
  liveReportsInterval = setInterval(displayLiveChart, 5000);
};
function locationHashChanged() {
  console.log(location.hash)
}

window.addEventListener('hashchange', () => {
  console.log('The hash has changed!')
}, false);

