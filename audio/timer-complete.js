/**
 * Timer completion sound
 * Base64 encoded MP3 beep sound
 */
const TimerSound = (() => {
    // Base64 encoded MP3 beep sound for timer completion
    // This is a short, simple sound that works well for timer notifications
    const timerSoundBase64 = 'SUQzAwAAAAAAJlRQRTEAAAAcAAAAU291bmRKYXkuY29tIFNvdW5kIEVmZmVjdHMAVElUMgAAABgAAABUaW1lciBDb21wbGV0aW9uIFNvdW5kAFREUkMAAAAPAAAAU291bmRKYXkuY29tIABUWUVSAAAABQAAAAIwMjMAVENPTgAAAAgAAABBbGFybSAAVENPTQAAABEAAABTb3VuZEpheS5jb20gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7kGRQAPwLAEiNAAAIbEJIaAAgAWomyU0wAAAhgxslpgCCDQQCAAAAAAAALkQhkIgrCgZ79nOfQxNr2vb1nXTtGjR/aNGj/B//ggIOBD4IODggIPqxcWvFi4thAc9X+r/wQfLa3iCDi4IOBAQdhTD//iwsLYWFjDg+X+CCAgLHix79X1f+3///1//65AAAAAB4DBnNH8W0mYbSgiEZMuC0IUQAQAdPpEd9TxDAICaQ65DSlZ073pRJvpyE+dkkUZRkzEiRJ9OSeSE8dTroPJFGTk+0IQnUerp5P/u3/QD0VV7PZvaqQQJFFAQYAYCFQGCpDhMRF5GRQlJRFKTLF7IyUkKOh2I6i5GUUUiKwWU///OqVqjqmjUfTExlGwzDLR1Z/+ikOgDIX1D///6QsLHnCgACgaDIaFAwWDDNM//+qzqqqmZZZMpb//+mZaZZqiNXIyYkRTMtKZ//+Znf/+v//Vd///6pmZn//nUzMzJpTREyZS5eo////rVdVVf/+mZlMzM6N///MzMpkYIQxSM//+rl//ZmZn1RX///9VVVVVVVVX/q//6qqqqo///9VVVVVXUhESRlIhPb/9VVVVVVXUUlGC/MxKRkZKTKJRTMx//2ZVKZmZn/k//9cP/9VX//9X//VVZmZv/S//+jL/+qr//+ixZ3///Vf/QFEwEHAkHicXjGBTCxg0kP/r0qs6gFCcXmUAAz//TUhKxLHhPtKpL//RoI1G0xQX//5WdSEgYXvpaIlIjQbFKRSA1t8rNv/1yVSqFNK3/8rKaQI0H8jRYOw5CVkXMzKI1GQlKVt/9crOj4jT//lJV1/R/9kqnSq6pQKZmZE9t///5Wc7/0ZWdJCjMzMjFGkmKBQLA4hGRkK0ZWdJz8z//5SadGf/+iUYoG6kxBTUUzLjk4LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7kmRAj/ByJsgtMAAABAYNlpaAAAQCAmyWnmmAADgJJOkYAgAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUAAAiQBMAAYVCEAsIgXzIAVZQTAI0BXzaZmg58XQJgkQYkGwqDIEUB4TJIkQClJEaCKiiJTChRGQ1MsN6SCwoImEgLggaNDMWDmZpKkOCgUBJklWZYJ0HKxwuDgkGBcZEkiRIFAoKAuUCQKA+LC4FBIsKhcoJCgoKQkKBQLFYrFAsFCwUCwU';
    
    // Create audio element
    let audioElement = null;
    
    // Initialize the audio element
    const initialize = () => {
        // Create audio element if it doesn't exist yet
        if (!audioElement) {
            try {
                audioElement = new Audio();
                // Try multiple possible paths for the audio file
                audioElement.src = '/assets/illustrations/timer-complete.mp3';
                // If that fails, try a different path
                audioElement.onerror = function() {
                    audioElement.src = 'assets/illustrations/timer-complete.mp3';
                    // If that also fails, fall back to the base64 data
                    audioElement.onerror = function() {
                        audioElement.src = 'data:audio/mp3;base64,' + timerSoundBase64;
                    };
                };
                audioElement.load();
                console.log('Timer sound initialized');
            } catch (e) {
                console.error('Error initializing timer sound:', e);
            }
        }
    };
    
    // Play the timer completion sound
    const play = () => {
        if (!audioElement) {
            initialize();
        }
        
        try {
            // Some browsers restrict autoplay, so we use both approaches
            const playPromise = audioElement.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('Timer sound played successfully');
                }).catch(error => {
                    console.error('Error playing timer sound:', error);
                    // Try to play again with user interaction
                    document.addEventListener('click', function playOnClick() {
                        audioElement.play();
                        document.removeEventListener('click', playOnClick);
                    }, { once: true });
                });
            }
        } catch (e) {
            console.error('Error playing timer sound:', e);
        }
    };
    
    // Public API
    return {
        initialize,
        play
    };
})();

// Initialize the timer sound when this script loads
TimerSound.initialize();