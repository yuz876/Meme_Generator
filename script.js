// script.js


//form
const form = document.getElementById('generate-meme');
//form: submit
form.addEventListener('submit', func_generate);
function func_generate(event) {
  // toggle relevant buttons
  document.querySelector("[type='submit']").disabled = true;
  document.querySelector("[type='reset']").disabled = false;
  document.querySelector("[type='button']").disabled = false;
  document.getElementById("voice-selection").disabled = false;

  //grabbing the text in the two inputs with ids text-top and text-bottom
  var text_top_value = document.getElementById("text-top").value;
  console.log("text_top_value: ", text_top_value);
  var text_bottom_value = document.getElementById("text-bottom").value;
  console.log("text_bottom_value: ", text_bottom_value);

  var canvas = document.getElementById('user-image');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');    
    ////adding the relevant text to the canvas
    ctx.font = "40px Arial";
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
    let textWidth = ctx.measureText(text_top_value).width;
    ctx.strokeText(text_top_value, (canvas.width/2) - (textWidth / 2), 35);
    
    textWidth = ctx.measureText(text_bottom_value).width;
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
    ctx.strokeText(text_bottom_value, (canvas.width/2) - (textWidth / 2), canvas.height-20);
  }
  event.preventDefault();
}

form.addEventListener('reset', func_reset);
function func_reset(event) {
  // clear the image and/or text present
  var canvas = document.getElementById('user-image');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');   
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
  }
  // toggle relevant buttons
  document.querySelector("[type='submit']").disabled = false;
  document.querySelector("[type='reset']").disabled = true;
  document.querySelector("[type='button']").disabled = true;

  event.preventDefault();
}


//voice
var synth = window.speechSynthesis;
var read = document.querySelector("[type='button']");
var voiceSelect = document.getElementById("voice-selection");
var voices = [];
var inputTxt = "";
function populateVoiceList() {
  console.log(synth.getVoices().name);
  voices = synth.getVoices().sort(function (a, b) {
      const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
      if ( aname < bname ) return -1;
      else if ( aname == bname ) return 0;
      else return +1;
  });
  var selectedIndex = voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
  voiceSelect.innerHTML = '';
  for(let i = 0; i < voices.length ; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';
    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }
    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }
  voiceSelect.selectedIndex = selectedIndex;
}
populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}
function speak(){
  if (synth.speaking) {
      console.error('speechSynthesis.speaking');
      return;
  }
  var text_top_value = document.getElementById("text-top").value;
  var text_bottom_value = document.getElementById("text-bottom").value;
  inputTxt = text_top_value + text_bottom_value;
  console.log("inputTxt: ", inputTxt);
  if (inputTxt !== '') {
    var utterThis = new SpeechSynthesisUtterance(inputTxt);
    utterThis.onend = function (event) {
        console.log('SpeechSynthesisUtterance.onend');
    }
    utterThis.onerror = function (event) {
        console.error('SpeechSynthesisUtterance.onerror');
    }
    var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
    for(let i = 0; i < voices.length ; i++) {
      if(voices[i].name === selectedOption) {
        utterThis.voice = voices[i];
        break;
      }
    }
    utterThis.volume = document.querySelector("[type='range']").value /  100;
    console.log("utterThis.volume: ", utterThis.volume);
    synth.speak(utterThis);
  }
}
// voiceSelect.onchange = function(event) {
//   speak();
// }
read.onclick = function(event) {
  event.preventDefault();
  speak();
  // $('inputTxt').blur();
}


//volume
var volume_range = document.querySelector("[type='range']");
volume_range.addEventListener('input', func_volume);
function  func_volume() {
  //get the selected image  info
  var volume = document.querySelector("[type='range']").value;
  var volume_img = document.getElementById("volume-group").getElementsByTagName("img").item(0);
  console.log("volume_img: ", volume_img);
  console.log("volume_img.src: ", volume_img.src);
  console.log("volume: ", volume);
  var volume_level = 3;
  if (volume > 66 ){
    volume_level = 3;
    volume_img.src = "icons/volume-level-3.svg";
  }else if (volume > 33){
    volume_level = 2;
    volume_img.src = "icons/volume-level-2.svg";
  }else if (volume > 0){
    volume_level = 1;
    volume_img.src = "icons/volume-level-1.svg";
  }else{
    volume_level = 0;
    volume_img.src = "icons/volume-level-0.svg";
  }
  console.log("volume_level: ", volume_level);
};


// deal with image section
const img = new Image(); // used to load image from <input> and draw to canvas

document.getElementById("image-input").onchange = function() {
  //get the selected image  info
  var image_input_value = document.getElementById("image-input").files.item(0).name;
  //load in the selected image into the Image object (img) src attribute
  img.src = "images/"+image_input_value;
  //set the image alt attribute by extracting the image file name from the file path
  img.alt = image_input_value;
};



// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // TODO
  console.log('img has fully loaded');

  var canvas = document.getElementById('user-image');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    //clear the canvas context
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //toggle the relevant buttons
    document.getElementById("voice-selection").disabled = false;
    document.querySelector("[type='submit']").disabled = false;
    //Fill the whole Canvas with black
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //add the selected image
    let dimm = getDimmensions(canvas.width, canvas.height, img.naturalWidth, img.naturalHeight);
    console.log("loc: ", dimm['startX'], dimm['startY'], dimm['width'], dimm['height']);
    ctx.drawImage(img, dimm['startX'], dimm['startY'], dimm['width'], dimm['height']);
  }
  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});


/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
