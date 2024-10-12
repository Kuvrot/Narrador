const text = document.getElementById("textToConvert");
const convertBtn = document.getElementById("convertBtn");
const chapterSelection = document.getElementById("book-chapters");
const speechSynth = window.speechSynthesis;
const voiceSelect = document.getElementById("voiceSelect");
var input;

let playing = false;
let voices = [];
let currentSegment = 0;
let segments = [];
let utterance;  // Save the utterance globally

window.addEventListener("load", (event) => {
    // This timeout avoids a bug, because sometimes the voices don't load at all.
    setTimeout(() => {
        populateVoiceList();
    }, 2000);
});

// Load voice list
voiceSelect.addEventListener("change", function () {
    speechSynth.voice = voices[voiceSelect.value];
});

function populateVoiceList() {
    voices = speechSynth.getVoices();
    voiceSelect.innerHTML = ""; // Clean the existing options
    
    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        option.value = index;
        voiceSelect.appendChild(option);
    });
}

// Divides the text into an N number of words
function divideTextIntoSegments(text, segmentSize) {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    for (let i = 0; i < words.length; i += segmentSize) {
        segments.push(words.slice(i, i + segmentSize).join(' '));
    }
}

// Plays a segment
function playSegment(segment) {
    if (segment < segments.length && playing) {
        utterance = new SpeechSynthesisUtterance(segments[segment]);
        utterance.voice = voices[voiceSelect.value];
        utterance.rate = 0.75; //Narration speed (goes from 0.0 to 1.0)

        //When the speech ends this is called
        utterance.onend = function () {
            if (playing){ // This second validation seems redundant, but is made in order to avoid removing the previous segment if the speech was stopped manually.
                segments.shift();// This removes the first element
            }
            playSegment(currentSegment);  // Plays the next segment
        };
        speechSynth.speak(utterance);
    }else{
        stop();
    }
}

//This is when the play button is pressed
convertBtn.addEventListener('click', function () {
    const enteredText = text.value.replace(/<[^>]*>/g, '');  // deletes HTML tags

    if (!enteredText.trim().length) {
        //In case there is nothing to convert
        return;
    }

    if (playing) {
        stop();
    } else {
        currentSegment = 0;
        divideTextIntoSegments(enteredText, 100);  // Divide in fragments of N words.
        playing = true;
        playSegment(currentSegment);
        convertBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-stop" viewBox="0 0 16 16"><path d="M3.5 5A1.5 1.5 0 0 1 5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a.5.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11zM5 4.5a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5V5a.5.5 0 0 0-.5-.5z"/></svg>';
    }
});

//Stop the speech
function stop() {
    speechSynth.cancel();
    convertBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-play" viewBox="0 0 16 16"><path d="M10.804 8 5 4.633v6.734zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696z"/></svg>';
    playing = false;
}

// Opening file and unzipping the file
var unzippedFile;
let fileNames = [];
function openFile (){
    zipInput = document.createElement('input');
    zipInput.type = 'file';
    zipInput.accept = '.epub' , '.mobi' , '.zip';
    zipInput.id = 'file';

    //Unzipping
    zipInput.onchange = function() {
        const file = zipInput.files[0]; // Get the selected .zip file
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const arrayBuffer = e.target.result;
                // Use JSZip to process the zip file
                JSZip.loadAsync(arrayBuffer).then(function(zip) {

                    //unzippedFile variable will be used again when playing the TTS audio.
                    unzippedFile = zip;

                    // Loop through the files inside the zip and add the names into a list to sort it later
                    zip.forEach(function (relativePath, zipEntry) {
                        if (zipEntry.name.endsWith(".xhtml") && zipEntry.name.match(/\d+/) !== null) {
                            fileNames.push(zipEntry.name.replace('.xhtml' , ''));
                        }
                    });

                    //sort the names
                    fileNames.sort((a, b) => {
                        // Extract numeric part or return a large number for non-matching cases
                        let numA = parseInt(a.match(/\d+$/)) || 0;
                        let numB = parseInt(b.match(/\d+$/)) || 0;
                    
                        // Sort alphabetically first if no numbers are present
                        if (numA === numB) {
                        return a.localeCompare(b);
                        }
                    
                        // Compare the numeric parts
                        return numA - numB;
                    });
                    
                    //Put the names as options into the select element
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

            chapterSelection.innerHTML="";
        } else {
            text.value = ""; // Clear the textarea if no file is selected
        }
    };
    zipInput.click();
}

// When a new chapter/file is selected
chapterSelection.addEventListener("change" , function () {

    //Clear the output
    text.value = '';
    stop();

    unzippedFile.forEach(function (relativePath, zipEntry) {
       // if the iterated name is equal to the selected one, then this is the chapter that will be narrated
       if (zipEntry.name == chapterSelection.value) {
        zipEntry.async("text").then(function(content) {
            content = content.replace(".</p>", '.');
            content = content.replace("</p>", '.');
            content = content.replace("</h1>", '.');
            content = content.replace(/<[^>]*>/g, ''); // This removes all the html tags found
            content = content.replace(zipEntry.name.split('/').pop() , ""); //this removes the file name from the narration

            segments = []; // restart the segments array
            text.value = content; // the textfield will be equal to the content of the file

            text.value = content.replace(zipEntry.name.replace(".xhtml") , "");
            });
        }
    });    
});
