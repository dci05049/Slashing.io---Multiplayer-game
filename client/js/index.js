// My Crappy JS Skills :/

$(".sign-up").on('click', function() {
  $(".button").addClass("expanded");
  $(".sign-up").addClass("hidden");
  $(".content").addClass("background");
  $("button").removeClass("hidden");
  $("form").toggleClass("hidden");
})
