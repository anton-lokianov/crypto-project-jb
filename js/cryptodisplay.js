$(".liveReports").hide();
$(".about").hide();

//show the home page and hide all the others pages
$("#homePage").on("click", () =>{
    $(".coinsPage").show();
    $(".liveReports").hide();
    $(".about").hide();
    $("#searchInput").show();
    clearInterval(liveReportsInterval);
    window.location.hash = "/Home";
});

//show the Live report page and hide all the other pages
$("#liveReportsPage").on("click", () =>{
    $(".liveReports").show();
    $(".coinsPage").hide();
    $(".about").hide();
    $("#searchInput").hide();
    window.location.hash = "/LiveReport";
});

//show the about page and hide all the other pages
$("#aboutPage").on("click", () =>{
    $(".about").css({display:"flex"});
    $(".coinsPage").hide();
    $(".liveReports").hide();
    $("#searchInput").hide();
    clearInterval(liveReportsInterval);
    window.location.hash = "/About";
});

//parallax effect for the background image 
$('.webTitle').css('background-position', 'center ' + $(this).scrollTop()/2 + 'px');
$(window).scroll(() => {
    let scrollTop = $(this).scrollTop();
    $('.webTitle').css('background-position', 'center ' + scrollTop / 2 + 'px');
  });
  