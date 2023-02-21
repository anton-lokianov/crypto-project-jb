const loadOn = () => {
    $("").show();
};

const loadOff = () => {
    $("").hide();
};

$(".liveReports").hide();
$(".about").hide();

$("#homePage").on("click", () =>{
    $(".coinsPage").slideDown();
    $(".liveReports").hide();
    $(".about").hide();
    $("").hide();
    clearInterval();
})

$("#liveReportsPage").on("click", () =>{
    $(".liveReports").slideDown();
    $(".coinsPage").hide();
    $(".about").hide();
    $("").hide();
    createChart();
})

$("#aboutPage").on("click", () =>{
    $(".about").slideDown();
    $(".coinsPage").hide();
    $(".liveReports").hide();
    $("").hide();
    clearInterval();
})

$("#searchInput").on("input", (e) =>{
    const value = e.target.value;
    cryptoCard.forEach(item =>{
        const isVisible = item.id.includes(value) || item.symbol.includes(value)
        item.element.classList.toggle("hide", !isVisible)
    })
});