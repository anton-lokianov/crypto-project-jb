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
    clearInterval(liveReportsInterval);
    window.location.hash = "/Home";
});

$("#liveReportsPage").on("click", () =>{
    $(".liveReports").slideDown();
    $(".coinsPage").hide();
    $(".about").hide();
    $("#searchInput").hide();
    window.location.hash = "/LiveReport";
});

$("#aboutPage").on("click", () =>{
    $(".about").slideDown();
    $(".coinsPage").hide();
    $(".liveReports").hide();
    $("#searchInput").hide();
    clearInterval(liveReportsInterval);
    window.location.hash = "/About";
});
