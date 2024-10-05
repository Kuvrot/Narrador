const text = document.getElementById("textToConvert");
const convertBtn = document.getElementById("convertBtn");

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
