document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const youtubeUrlInput = document.getElementById('youtubeUrl');
    const fetchInfoBtn = document.getElementById('fetchInfoBtn');
    const videoInfoSection = document.getElementById('videoInfo');
    const thumbnail = document.getElementById('thumbnail');
    const videoTitle = document.getElementById('videoTitle');
    const videoAuthor = document.getElementById('videoAuthor');
    const videoDuration = document.getElementById('videoDuration');
    const convertBtn = document.getElementById('convertBtn');
    const loadingSection = document.getElementById('loadingSection');
    const progressBarElement = document.getElementById('progressBar');
    const progressTextElement = document.getElementById('progressText');
    const downloadLinkContainer = document.getElementById('downloadLinkContainer');
    const downloadLink = document.getElementById('downloadLink');
    const errorMessage = document.getElementById('errorMessage');
    const formatRadios = document.getElementsByName('format');
    
    // Current download ID for tracking
    let currentDownloadId = null;
    let progressInterval = null;
    let timeoutCounter = 0;

    // Function to show error message
    const showError = (message) => {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        loadingSection.style.display = 'none';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    };

    // Function to reset progress display
    const resetProgress = () => {
        progressBarElement.style.width = '0%';
        progressTextElement.textContent = '0%';
        loadingSection.style.display = 'none';
        downloadLinkContainer.style.display = 'none';
        clearInterval(progressInterval);
        timeoutCounter = 0;
    };

    // Format duration from seconds to HH:MM:SS
    const formatDuration = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }
    };

    // Validate YouTube URL
    const isValidYouTubeUrl = (url) => {
        const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        return regex.test(url);
    };

    // Fetch video information
    const fetchVideoInfo = async () => {
        const url = youtubeUrlInput.value.trim();
        
        // Reset any previous info
        resetProgress();

        if (!url) {
            showError('Please enter a YouTube URL');
            return;
        }

        if (!isValidYouTubeUrl(url)) {
            showError('Please enter a valid YouTube URL');
            return;
        }

        try {
            // Show loading state
            loadingSection.style.display = 'flex';
            progressTextElement.textContent = 'Fetching video info...';
            
            console.log('Fetching info for URL:', url);
            
            // Fetch video info with a timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
            
            const response = await fetch(`/api/info?url=${encodeURIComponent(url)}`, {
                signal: controller.signal
            }).catch(err => {
                if (err.name === 'AbortError') {
                    throw new Error('Request timed out. Server might be busy or not responding.');
                }
                throw err;
            });
            
            clearTimeout(timeoutId);
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                let errorMessage = 'Failed to fetch video info';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    // If we can't parse the error JSON, use text instead
                    errorMessage = await response.text() || errorMessage;
                }
                throw new Error(errorMessage);
            }
            
            const videoInfo = await response.json();
            console.log('Video info received:', videoInfo);
            
            if (!videoInfo || !videoInfo.title) {
                throw new Error('Invalid video information received from server');
            }
            
            // Update UI with video info
            thumbnail.src = videoInfo.thumbnail || '';
            videoTitle.textContent = videoInfo.title || 'Unknown Title';
            videoAuthor.textContent = videoInfo.author || 'Unknown Author';
            videoDuration.textContent = formatDuration(videoInfo.lengthSeconds || 0);
            
            // Show video info section
            videoInfoSection.style.display = 'block';
            loadingSection.style.display = 'none';
            
        } catch (error) {
            console.error('Error fetching video info:', error);
            showError(error.message || 'Failed to fetch video info. Try a different URL.');
            loadingSection.style.display = 'none';
        }
    };

    // Function to check download progress
    const checkProgress = async (downloadId) => {
        try {
            const response = await fetch(`/api/progress/${downloadId}`);
            if (!response.ok) {
                throw new Error('Failed to get progress');
            }
            
            const progressData = await response.json();
            
            // Reset timeout counter if we're making progress
            if (progressData.progress > 0) {
                timeoutCounter = 0;
            }
            
            // Update progress bar with a smoothing effect
            let displayProgress = progressData.progress;
            if (displayProgress === 0 && timeoutCounter > 2) {
                // If stuck at 0%, show some visual progress to indicate work is happening
                displayProgress = 5 + (timeoutCounter * 2);
                if (displayProgress > 20) displayProgress = 20; // Cap at 20%
            }
            
            progressBarElement.style.width = `${displayProgress}%`;
            
            // More detailed status messages
            let statusText = progressData.status || 'processing';
            if (statusText === 'downloading') {
                statusText = 'downloading audio';
            } else if (statusText === 'processing') {
                statusText = 'processing audio';
            }
            
            progressTextElement.textContent = `${displayProgress}% - ${statusText}`;
            
            // Handle different status types
            switch (progressData.status) {
                case 'completed':
                    clearInterval(progressInterval);
                    progressBarElement.style.width = '100%';
                    progressTextElement.textContent = 'Download completed!';
                    
                    // Show download link
                    downloadLink.href = progressData.downloadUrl;
                    downloadLink.textContent = progressData.fileName;
                    downloadLink.setAttribute('download', progressData.fileName);
                    downloadLinkContainer.style.display = 'block';
                    
                    // Automatically click the download link after 1 second
                    setTimeout(() => {
                        downloadLink.click();
                    }, 1000);
                    break;
                    
                case 'error':
                    clearInterval(progressInterval);
                    showError(progressData.error || 'Error during download');
                    break;
            }
            
        } catch (error) {
            console.error('Error checking progress:', error);
            timeoutCounter++;
            
            // If stuck, show increasing progress to indicate work is happening
            if (timeoutCounter > 3) {
                let fakeProgress = 10 + (timeoutCounter * 5);
                if (fakeProgress > 95) fakeProgress = 95; // Never reach 100%
                
                progressBarElement.style.width = `${fakeProgress}%`;
                progressTextElement.textContent = `${fakeProgress}% - still working...`;
            }
            
            // If we've had 20 failed checks in a row (much more patient), show a timeout error
            if (timeoutCounter > 20) {
                clearInterval(progressInterval);
                showError('Download timed out. Please try again.');
            }
        }
    };

    // Handle the download process
    const handleDownload = async () => {
        const url = youtubeUrlInput.value.trim();
        // Get selected format
        let format = 'mp3'; // Default to MP3
        for (const radio of formatRadios) {
            if (radio.checked) {
                format = radio.value;
                break;
            }
        }
        
        // Reset any previous download
        resetProgress();
        
        if (!url) {
            showError('Please enter a YouTube URL');
            return;
        }
        
        if (!isValidYouTubeUrl(url)) {
            showError('Please enter a valid YouTube URL');
            return;
        }
        
        try {
            // Show loading state
            loadingSection.style.display = 'flex';
            progressTextElement.textContent = 'Starting download...';
            
            // Start download
            const response = await fetch(`/api/download?url=${encodeURIComponent(url)}&format=${format}`);
            if (!response.ok) {
                throw new Error('Failed to start download');
            }
            
            const data = await response.json();
            if (!data || !data.downloadId) {
                throw new Error('Invalid response from server');
            }
            
            // Store the download ID
            currentDownloadId = data.downloadId;
            
            // Show initial progress before first check
            progressBarElement.style.width = '5%';
            progressTextElement.textContent = '5% - preparing download';
            
            // Check progress every 1 second, not 2 seconds (faster updates)
            progressInterval = setInterval(() => {
                checkProgress(currentDownloadId);
            }, 1000);
            
        } catch (error) {
            console.error('Error starting download:', error);
            showError(error.message || 'Failed to start download');
            loadingSection.style.display = 'none';
        }
    };

    // Event Listeners
    fetchInfoBtn.addEventListener('click', fetchVideoInfo);
    
    youtubeUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            fetchVideoInfo();
        }
    });
    
    convertBtn.addEventListener('click', handleDownload);
    
    // Auto-fetch info when a URL is pasted
    youtubeUrlInput.addEventListener('paste', () => {
        setTimeout(fetchVideoInfo, 100);
    });
});