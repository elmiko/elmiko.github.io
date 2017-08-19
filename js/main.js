function imgclicker(image) {
  var imgstate = image;
  return function(event) {
    event.preventDefault();
    if (event.target.src == image) {
      event.target.src = imgstate;
      imgstate = image;
    } else {
      imgstate = event.target.src;
      event.target.src = image;
    }
  };
}
