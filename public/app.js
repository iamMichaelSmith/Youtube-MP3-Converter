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
            
            // Update progress bar
            if (progressData.progress) {
                progressBarElement.style.width = `${progressData.progress}%`;
                progressTextElement.textContent = `${progressData.progress}% - ${progressData.status}`;
            }
            
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
            
            // If we've had 10 failed checks in a row, show a timeout error
            if (timeoutCounter > 10) {
                clearInterval(progressInterval);
                showError('Download timed out. Please try again.');
            }
        }
    };

    // Handle the download process
    const handleDownload = async () => {
        const url = youtubeUrlInput.value.trim();
        
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

        // Always use MP3 format
        const format = 'mp3';

        try {
            // Show loading state
            loadingSection.style.display = 'flex';
            progressTextElement.textContent = 'Starting download...';
            
            // Start the download process
            const response = await fetch(`/api/download?url=${encodeURIComponent(url)}&format=${format}`);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to start download');
            }
            
            const data = await response.json();
            
            if (data.downloadId) {
                // Save the download ID
                currentDownloadId = data.downloadId;
                
                // Check progress every 1 second
                progressInterval = setInterval(() => {
                    checkProgress(currentDownloadId);
                }, 1000);
            } else {
                throw new Error('No download ID received');
            }
            
        } catch (error) {
            console.error('Error during download:', error);
            showError(error.message || 'Failed to download the video. Please try again.');
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