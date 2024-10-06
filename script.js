const text = document.getElementById("textToConvert");
const convertBtn = document.getElementById("convertBtn");
const chapterSelection = document.getElementById("book-chapters");

convertBtn.addEventListener('click', function () {
    const speechSynth = window.speechSynthesis;
    const enteredText = text.value;
    const error = document.querySelector('.error-para');

    if (!speechSynth.speaking &&
        !enteredText.trim().length) {
        error.textContent = `Nothing to Convert! 
        Enter text in the text area.`
    }
    
    const voiceSelect = document.getElementById("voiceSelect");
 
    let voices = [];
    console.log(speechSynth.getVoices());
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
    
    // Populate voice list when voices are loaded
    speechSynth.onvoiceschanged = populateVoiceList;

    if (!speechSynth.speaking && enteredText.trim().length) {
        error.textContent = "";
        const enteredText2 = enteredText.replace(/<[^>]*>/g, '');
        const newUtter =
            new SpeechSynthesisUtterance(enteredText2);
        speechSynth.speak(newUtter);
        convertBtn.textContent = "Sound is Playing..."
    }
});


const zipInput = document.getElementById('file');
const textOutput = document.getElementById('textToConvert');

var unzippedFile;
let fileNames = [];

// Listen for the file input change event
zipInput.addEventListener('change', function() {
    const file = zipInput.files[0]; // Get the selected .zip file
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const arrayBuffer = e.target.result;
            // Use JSZip to process the zip file
            JSZip.loadAsync(arrayBuffer).then(function(zip) {
                // Loop through the files inside the zip
                unzippedFile = zip;
                zip.forEach(function (relativePath, zipEntry) {
                    if (zipEntry.name.endsWith(".xhtml")) {
                        fileNames.push(zipEntry.name);
                    }
                });

                fileNames.sort();

                fileNames.forEach(function (fileName) {
                    const option = document.createElement('option');
                    option.value = fileName;
                    option.textContent = fileName.replace('.xhtml' , '');
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

chapterSelection.addEventListener('change' , function () {

    console.log("xd");
    console.log(fileNames);
    console.log(unzippedFile);

    //Clear the output
    textOutput.value = '';

    unzippedFile.forEach(function (relativePath, zipEntry) {
        unzippedFile.forEach(function (relativePath, zipEntry) {
            if (zipEntry.name == chapterSelection.value) {
                zipEntry.async("text").then(function(content) {
                content = content.replace(/<[^>]*>/g, '');
                textOutput.value += content.replace(zipEntry.name , '');
                });
            }
        });
    });    
});
