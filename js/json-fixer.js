// JSON Fixer Script - Clean up empty episode entries
// This script can be run in the browser console to clean up JSON files

function cleanJsonFile(fileName) {
    fetch(`Data/${fileName}.json`)
        .then(response => response.json())
        .then(data => {
            // Filter out empty episodes
            const cleanedData = data.filter(episode => 
                episode && 
                episode.episode_name && 
                episode.episode_name.trim() !== '' &&
                episode.episode_description && 
                episode.episode_description.trim() !== ''
            );
            
            console.log(`Cleaned ${fileName}.json: ${data.length} -> ${cleanedData.length} episodes`);
            
            // Create download link for cleaned data
            const blob = new Blob([JSON.stringify(cleanedData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}_cleaned.json`;
            a.click();
            URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error(`Error cleaning ${fileName}.json:`, error);
        });
}

// Clean all JSON files
function cleanAllJsonFiles() {
    const files = ['Bereishis', 'Shemos', 'Vayikra', 'Bamidbar', 'Devarim', 'Chagim'];
    files.forEach(file => {
        setTimeout(() => cleanJsonFile(file), 1000); // Stagger downloads
    });
}

// Export for use in console
window.cleanJsonFile = cleanJsonFile;
window.cleanAllJsonFiles = cleanAllJsonFiles;

console.log('JSON Fixer loaded. Use cleanAllJsonFiles() to clean all files.'); 