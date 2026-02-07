// Note definitions with colors and emojis
const notes = [
    { name: 'C', frequency: 261.63, color: '#e74c3c', emoji: '🎹' },
    { name: 'C#', frequency: 277.18, color: '#e67e22', emoji: '🌙' },
    { name: 'D', frequency: 293.66, color: '#f39c12', emoji: '🌻' },
    { name: 'D#', frequency: 311.13, color: '#f1c40f', emoji: '⚡' },
    { name: 'E', frequency: 329.63, color: '#2ecc71', emoji: '🦋' },
    { name: 'F', frequency: 349.23, color: '#1abc9c', emoji: '🔥' },
    { name: 'F#', frequency: 369.99, color: '#3498db', emoji: '🌊' },
    { name: 'G', frequency: 392.00, color: '#9b59b6', emoji: '🎸' },
    { name: 'G#', frequency: 415.30, color: '#8e44ad', emoji: '🌟' },
    { name: 'A', frequency: 440.00, color: '#e91e63', emoji: '🍎' },
    { name: 'A#', frequency: 466.16, color: '#db2777', emoji: '🚀' },
    { name: 'B', frequency: 493.88, color: '#c2185b', emoji: '🐝' }
];

// Audio context
let audioContext = null;
let isPlaying = false;
let intervalId = null;
let currentTempo = 1000; // milliseconds
let lastNote = null; // Track the last note to avoid repetition
let availableNotes = [...notes]; // Notes available for selection

// DOM elements
const playButton = document.getElementById('playButton');
const noteNameEl = document.getElementById('noteName');
const noteEmojiEl = document.getElementById('noteEmoji');
const tempoSlider = document.getElementById('tempoSlider');
const tempoValue = document.getElementById('tempoValue');
const noteCountSlider = document.getElementById('noteCountSlider');
const noteCountValue = document.getElementById('noteCountValue');

// Cycle of fifths progression starting from C
// Alternates adding to the right (fifth up) and left (fourth up/fifth down)
const cycleOfFifths = [
    'C',   // 1
    'G',   // 2 - fifth up
    'F',   // 3 - fourth up
    'D',   // 4 - fifth up from G
    'A#',  // 5 - fourth up from F (Bb)
    'A',   // 6 - fifth up from D
    'E',   // 7 - fifth up from A
    'D#',  // 8 - fourth up from Bb (Eb)
    'B',   // 9 - fifth up from E
    'G#',  // 10 - fourth up from Eb (Ab)
    'F#',  // 11 - fifth up from B
    'C#'   // 12 - fourth up from Ab (Db)
];

// Get notes based on count using cycle of fifths
function getAvailableNotes(count) {
    const selectedNames = cycleOfFifths.slice(0, count);
    return notes.filter(note => selectedNames.includes(note.name));
}

// Initialize audio context on first user interaction
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Play a note with realistic acoustic guitar synthesis
function playNote(frequency, duration = 0.5) {
    initAudioContext();

    const now = audioContext.currentTime;

    // Acoustic guitar harmonics (string overtones)
    const harmonics = [
        { ratio: 1, amplitude: 0.4, type: 'triangle' },      // Fundamental
        // { ratio: 2, amplitude: 0.25, type: 'triangle' },     // 1st harmonic
        // { ratio: 3, amplitude: 0.15, type: 'sine' },         // 2nd harmonic
        // { ratio: 4, amplitude: 0.08, type: 'sine' },         // 3rd harmonic
        // { ratio: 5, amplitude: 0.05, type: 'sine' },         // 4th harmonic
        // { ratio: 6, amplitude: 0.03, type: 'sine' }          // 5th harmonic
    ];

    // Create the string harmonics
    harmonics.forEach(({ ratio, amplitude, type }) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency * ratio;
        oscillator.type = type;

        // Guitar-like envelope: sharp attack, exponential decay
        const attackTime = 0.005; // Very fast pluck
        const decayTime = duration * 0.6;

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(amplitude, now + attackTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + attackTime + decayTime);

        oscillator.start(now);
        oscillator.stop(now + duration);
    });

    // Add pluck noise for realism (brief noise burst at the start)
    const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.05, audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const noiseSource = audioContext.createBufferSource();
    const noiseGain = audioContext.createGain();
    const noiseFilter = audioContext.createBiquadFilter();

    noiseSource.buffer = noiseBuffer;
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioContext.destination);

    // Filter the noise to sound like string pluck
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = frequency * 2;
    noiseFilter.Q.value = 5;

    // Quick decay on the pluck noise
    noiseGain.gain.setValueAtTime(0.2, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    noiseSource.start(now);
    noiseSource.stop(now + 0.05);
}

// Get a random note (different from last one)
function getRandomNote() {
    let note;
    do {
        note = availableNotes[Math.floor(Math.random() * availableNotes.length)];
    } while (lastNote && note.name === lastNote.name && availableNotes.length > 1);

    lastNote = note;
    return note;
}

// Apply random octave shift: -1, 0, or +1 octave
function applyOctaveShift(frequency) {
    const shift = Math.floor(Math.random() * 3); // 0, 1, or 2
    return frequency * Math.pow(2, shift);
}

// Update UI with note information
function updateUI(note) {
    noteNameEl.textContent = note.name;
    noteEmojiEl.textContent = note.emoji;
    document.body.style.backgroundColor = note.color;
}

// Play random notes in a loop
function startPlaying() {
    isPlaying = true;
    playButton.textContent = '⏸ Pause';
    playButton.classList.add('playing');

    // Play immediately
    const note = getRandomNote();
    updateUI(note);
    playNote(applyOctaveShift(note.frequency), currentTempo / 1000);

    // Then continue at intervals
    intervalId = setInterval(() => {
        const note = getRandomNote();
        updateUI(note);
        playNote(applyOctaveShift(note.frequency), currentTempo / 1000);
    }, currentTempo);
}

// Stop playing
function stopPlaying() {
    isPlaying = false;
    playButton.textContent = '▶ Play';
    playButton.classList.remove('playing');

    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }

    // Reset UI and last note
    lastNote = null;
    noteNameEl.textContent = 'Click play to start';
    noteEmojiEl.textContent = '🎵';
    document.body.style.backgroundColor = '#2c3e50';
}

// Toggle play/pause
playButton.addEventListener('click', () => {
    if (isPlaying) {
        stopPlaying();
    } else {
        startPlaying();
    }
});

// Update tempo
tempoSlider.addEventListener('input', (e) => {
    currentTempo = parseInt(e.target.value);
    tempoValue.textContent = (currentTempo / 1000).toFixed(1) + 's';

    // If currently playing, restart with new tempo
    if (isPlaying) {
        clearInterval(intervalId);
        intervalId = setInterval(() => {
            const note = getRandomNote();
            updateUI(note);
            playNote(applyOctaveShift(note.frequency), currentTempo / 1000);
        }, currentTempo);
    }
});

// Update note count
noteCountSlider.addEventListener('input', (e) => {
    const count = parseInt(e.target.value);
    noteCountValue.textContent = count;
    availableNotes = getAvailableNotes(count);

    // Reset last note if it's no longer available
    if (lastNote && !availableNotes.find(n => n.name === lastNote.name)) {
        lastNote = null;
    }
});

// Initialize displays
tempoValue.textContent = (currentTempo / 1000).toFixed(1) + 's';
noteCountValue.textContent = '12';
