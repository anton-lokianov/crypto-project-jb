$(".liveReports").hide();
$(".about").hide();

$("#homePage").on("click", () =>{
    $(".coinsPage").show();
    $(".liveReports").hide();
    $(".about").hide();
    $("#searchInput").show();
    clearInterval(liveReportsInterval);
    window.location.hash = "/Home";
});

$("#liveReportsPage").on("click", () =>{
    $(".liveReports").css({display:"flex"});
    $(".coinsPage").hide();
    $(".about").hide();
    $("#searchInput").hide();
    window.location.hash = "/LiveReport";
});

$("#aboutPage").on("click", () =>{
    $(".about").css({display:"flex"});
    $(".coinsPage").hide();
    $(".liveReports").hide();
    $("#searchInput").hide();
    clearInterval(liveReportsInterval);
    window.location.hash = "/About";
});


$('.webTitle').css('background-position', 'center ' + $(this).scrollTop()/2 + 'px');
$(window).scroll(() => {
    let scrollTop = $(this).scrollTop();
    $('.webTitle').css('background-position', 'center ' + scrollTop / 2 + 'px');
  });
  