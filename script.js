const text = document.getElementById("textToConvert");
const convertBtn = document.getElementById("convertBtn");
const chapterSelection = document.getElementById("book-chapters");
const speechSynth = window.speechSynthesis;
const voiceSelect = document.getElementById("voiceSelect");

let playing = false;

let voices = [];
window.addEventListener("load", (event) => {
    populateVoiceList();
});

// Populate voice list when voices are loaded
voiceSelect.addEventListener("change" , function () {
    speechSynth.voice = voices[voiceSelect.value];
    console.log('cambio');
});

function populateVoiceList() {
    voices = speechSynth.getVoices();
    voiceSelect.innerHTML = ""; // Clear existing options
    
    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        option.value = index;
        voiceSelect.appendChild(option);
    });
} 

convertBtn.addEventListener('click', function () {
    const enteredText = text.value;

    if (!speechSynth.speaking && !enteredText.trim().length) {
        error.textContent = `Nothing to Convert! 
        Enter text in the text area.`
    }

    if (playing){
        stop();
    }

    if (!speechSynth.speaking && enteredText.trim().length) {
        const enteredText2 = enteredText.replace(/<[^>]*>/g, '');
        const newUtter =
            new SpeechSynthesisUtterance(enteredText2);
        
        newUtter.voice = voices[voiceSelect.value];
        speechSynth.speak(newUtter);
        playing = true;
        convertBtn.innerHTML= '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-stop" viewBox="0 0 16 16"><path d="M3.5 5A1.5 1.5 0 0 1 5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11zM5 4.5a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5V5a.5.5 0 0 0-.5-.5z"/></svg>'
    }
});

function stop () {
    speechSynth.cancel();
    convertBtn.innerHTML= '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-play" viewBox="0 0 16 16"><path d="M10.804 8 5 4.633v6.734zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696z"/></svg>'
    playing = false;
}

const zipInput = document.getElementById('file');
const textOutput = document.getElementById('textToConvert');

var unzippedFile;
let fileNames = [];

function isNumber (n) {
    return Number(n)=== n;
}

// unzipping the epub book
zipInput.addEventListener('change', function() {
    const file = zipInput.files[0]; // Get the selected .zip file
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const arrayBuffer = e.target.result;
            // Use JSZip to process the zip file
            JSZip.loadAsync(arrayBuffer).then(function(zip) {
                // Loop through the files inside the zip and add the names into a list to sort it later
                unzippedFile = zip;
                zip.forEach(function (relativePath, zipEntry) {
                    if (zipEntry.name.endsWith(".xhtml") && zipEntry.name.match(/\d+/) !== null) {
                        fileNames.push(zipEntry.name.replace('.xhtml' , ''));
                    }
                });

                fileNames.forEach(function (fileName) {
                    const option = document.createElement('option');
                    option.value = fileName + '.xhtml';
                    option.textContent = fileName;
                    option.textContent = option.textContent.split('/').pop();
                    chapterSelection.appendChild(option);
                });
                
            });
        };

        // Read the zip file as an ArrayBuffer
        reader.readAsArrayBuffer(file);
    } else {
        textOutput.value = ''; // Clear the textarea if no file is selected
    }
});

// When a new chapter is selected
chapterSelection.addEventListener('change' , function () {

    //Clear the output
    textOutput.value = '';
    stop();

    unzippedFile.forEach(function (relativePath, zipEntry) {
        unzippedFile.forEach(function (relativePath, zipEntry) {

            // if the iterated name is equal to the selected one, then this is the chapter that will be narrated
            if (zipEntry.name == chapterSelection.value) {
                zipEntry.async("text").then(function(content) {
                content = content.replace(/<[^>]*>/g, ''); // This removes all the html tags found
                textOutput.value = content.replace(zipEntry.name.split('/').pop() , ''); //this removes the file name from the narration
                });
            }
        });
    });    
});
