const loadCoinsPageOn = () => {};

const loadCoinsPageOff = () => {};

const loadOnMoreInfo = () => {};

const loadOffMoreInfo = () => {};

$(".liveReports").hide();
$(".about").hide();

$("#homePage").on("click", () =>{
    $(".coinsPage").slideDown();
    $(".liveReports").hide();
    $(".about").hide();
    $("#searchInput").show();
    clearInterval(liveReportsInterval)
})

$("#liveReportsPage").on("click", () =>{
    $(".liveReports").slideDown();
    $(".coinsPage").hide();
    $(".about").hide();
    console.log($(".about"));
    $("#searchInput").hide();
})

$("#aboutPage").on("click", () =>{
    $(".about").slideDown();
    $(".coinsPage").hide();
    $(".liveReports").hide();
    $("#searchInput").hide();
    clearInterval(liveReportsInterval)
})

