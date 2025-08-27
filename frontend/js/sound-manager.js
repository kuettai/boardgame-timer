class SoundManager {
    constructor() {
        this.sounds = {};
        this.isEnabled = true;
        this.volume = 0.7;
        this.init();
    }

    init() {
        // Load sound preferences
        const savedEnabled = localStorage.getItem('boardgame-timer-sounds');
        const savedVolume = localStorage.getItem('boardgame-timer-volume');
        
        this.isEnabled = savedEnabled !== null ? savedEnabled === 'true' : true;
        this.volume = savedVolume ? parseFloat(savedVolume) : 0.7;
        
        // Create audio context for better mobile support
        this.audioContext = null;
        this.initAudioContext();
        
        // Generate sounds programmatically (no external files needed)
        this.createSounds();
    }

    initAudioContext() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    createSounds() {
        // Create sounds using Web Audio API (no external files needed)
        this.sounds = {
            turnChange: () => this.playTone(800, 0.1, 'sine'),
            gameStart: () => this.playChord([523, 659, 784], 0.3),
            gameEnd: () => this.playChord([392, 523, 659], 0.5),
            pause: () => this.playTone(400, 0.2, 'square'),
            resume: () => this.playTone(600, 0.2, 'sine'),
            overtime: () => this.playTone(300, 0.1, 'sawtooth'),
            button: () => this.playTone(1000, 0.05, 'sine')
        };
        
        // Fallback: Create simple HTML5 audio beep
        this.createFallbackAudio();
    }
    
    createFallbackAudio() {
        // Create multiple audio instances for different sounds
        this.audioElements = {
            beep1: this.createBeepAudio(800, 0.1),
            beep2: this.createBeepAudio(600, 0.15),
            beep3: this.createBeepAudio(400, 0.2)
        };
    }
    
    createBeepAudio(frequency, duration) {
        // Create a simple sine wave beep
        const sampleRate = 44100;
        const samples = Math.floor(sampleRate * duration);
        const buffer = new ArrayBuffer(44 + samples * 2);
        const view = new DataView(buffer);
        
        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + samples * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, samples * 2, true);
        
        // Generate sine wave
        for (let i = 0; i < samples; i++) {
            const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
            view.setInt16(44 + i * 2, sample * 32767, true);
        }
        
        const blob = new Blob([buffer], { type: 'audio/wav' });
        const audio = new Audio(URL.createObjectURL(blob));
        audio.volume = this.volume;
        return audio;
    }

    playTone(frequency, duration, waveType = 'sine') {
        if (!this.isEnabled) {
            console.log('Sounds disabled');
            return;
        }
        
        if (!this.audioContext) {
            console.log('No audio context');
            return;
        }
        
        if (this.audioContext.state === 'suspended') {
            console.log('Audio context suspended, trying to resume...');
            this.audioContext.resume().then(() => {
                this.playTone(frequency, duration, waveType);
            });
            return;
        }

        try {
            console.log(`Playing tone: ${frequency}Hz for ${duration}s`);
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = waveType;
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
            
            console.log('Sound played successfully');
        } catch (e) {
            console.log('Sound playback failed:', e);
        }
    }

    playChord(frequencies, duration) {
        if (!this.isEnabled || !this.audioContext) return;

        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(freq, duration * 0.8, 'sine');
            }, index * 50);
        });
    }

    // Public methods for different game events
    playTurnChange() {
        console.log('Playing turn change sound');
        this.playFallbackSound('beep1');
    }

    playGameStart() {
        console.log('Playing game start sound');
        this.playFallbackSound('beep2');
    }

    playGameEnd() {
        console.log('Playing game end sound');
        if (this.audioContext && this.audioContext.state === 'running') {
            // Play celebratory ascending chord
            const notes = [523, 659, 784, 1047]; // C, E, G, C (major chord)
            notes.forEach((freq, index) => {
                setTimeout(() => {
                    this.playTone(freq, 0.4, 'sine');
                }, index * 100);
            });
        } else {
            this.playFallbackSound('beep2');
        }
    }

    playPause() {
        console.log('Playing pause sound');
        this.playFallbackSound('beep3');
    }

    playResume() {
        console.log('Playing resume sound');
        this.playFallbackSound('beep2');
    }

    playOvertime() {
        console.log('Playing overtime sound');
        if (this.audioContext && this.audioContext.state === 'running') {
            // Play urgent triple beep for overtime
            this.playTone(300, 0.15, 'sawtooth');
            setTimeout(() => this.playTone(300, 0.15, 'sawtooth'), 200);
            setTimeout(() => this.playTone(300, 0.15, 'sawtooth'), 400);
        } else {
            this.playFallbackSound('beep3');
        }
    }

    playButton() {
        console.log('Playing button sound...');
        this.playFallbackSound('beep1');
    }
    
    playTurnAlert() {
        console.log('Playing turn alert sound');
        if (this.audioContext && this.audioContext.state === 'running') {
            this.playTone(1200, 0.15, 'sine');
        } else {
            this.playFallbackSound('beep2');
        }
    }
    
    playFallbackSound(type = 'beep1') {
        if (!this.isEnabled) return;
        
        try {
            const audio = this.audioElements[type];
            if (audio) {
                audio.currentTime = 0;
                audio.volume = this.volume;
                audio.play().catch(e => {
                    console.log(`Fallback audio ${type} failed:`, e);
                });
            }
        } catch (e) {
            console.log('Fallback sound error:', e);
        }
    }

    // Settings management
    toggleSounds() {
        this.isEnabled = !this.isEnabled;
        this.saveSettings();
        
        // Play test sound if enabled
        if (this.isEnabled) {
            this.playButton();
        }
        
        return this.isEnabled;
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
        
        // Play test sound
        this.playButton();
    }

    saveSettings() {
        localStorage.setItem('boardgame-timer-sounds', this.isEnabled.toString());
        localStorage.setItem('boardgame-timer-volume', this.volume.toString());
    }

    // Enable audio context on user interaction (required for mobile)
    enableAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    getSettings() {
        return {
            enabled: this.isEnabled,
            volume: this.volume
        };
    }
}

// Make SoundManager globally available
window.SoundManager = new SoundManager();