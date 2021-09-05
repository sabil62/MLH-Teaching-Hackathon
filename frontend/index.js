var wrapper = $("#button-wrapper");

$(".submit").click(function () {
  alert("one");
  if (wrapper.not(".checked")) {
    wrapper.addClass("checked");
    setTimeout(function () {
      wrapper.removeClass("checked");
    }, 8000);
  }
});
