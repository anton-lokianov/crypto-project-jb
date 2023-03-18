// Define variables
let chartsData = [];
let liveReportsInterval;
let chart;

// Calculate hash code for a string
const cryptoLinkHashCode = (s) => {
  return s.split("").reduce(function (a, b) {
    a = a + b.charCodeAt(0);
    return a & a;
  }, 0);
}

// Save hash code of a crypto link in session storage
const saveCryptoLinkHashCode = (cryptoLink) => {
  sessionStorage.setItem("cryptoLinkHashCode", cryptoLinkHashCode(cryptoLink));
}

// Compare hash codes of a crypto link with the one stored in session storage
const compareCryptoLinksHashCodes = (cryptoLink) => {
  const newCryptoLinkHashCode = cryptoLinkHashCode(cryptoLink);
  return sessionStorage.getItem("cryptoLinkHashCode") && newCryptoLinkHashCode === parseInt(sessionStorage.getItem("cryptoLinkHashCode"));
}

// Display live chart for selected coins
const displayLiveChart = async () => {
  // Check if there are coins to compare
  if (!compareList || compareList.length === 0) {
    chart ? chart.destroy() : () => {};
    chart = null;
    return;
  }
  
  const uriParameters = compareList.map((item) => item.coinSymbol).join(",");
  const cryptoLink = cryptoCurrencyLiveDataUrl.replace("%s", uriParameters).replace("%a", "USD,EUR");
  const compareResult = compareCryptoLinksHashCodes(cryptoLink);
  $('.loading-spinner').show();
  const liveReport = await $.get(cryptoLink);
  $('.loading-spinner').hide();
 
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
        valueFormatString: "HH:mm:ss",
        labelAngle: -50
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
  liveReportsInterval = setInterval(displayLiveChart, 2000);
};

function locationHashChanged() {
  console.log(location.hash)
}

window.addEventListener('hashchange', () => {
  console.log('The hash has changed!')
}, false);