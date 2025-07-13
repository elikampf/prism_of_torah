// JSON Character Encoding Fixer
class JSONFixer {
    constructor() {
        this.encodingIssues = {
            '\u27EA': '"', // ⟪
            '\u27EB': '"', // ⟫
            '\u2026': '...', // …
            '\u2013': '-', // –
            '\u2014': '-', // —
            '\u2018': "'", // '
            '\u2019': "'", // '
            '\u201C': '"', // "
            '\u201D': '"', // "
            '\u00A0': ' ', // non-breaking space
            '\u200B': '', // zero-width space
            '\u200C': '', // zero-width non-joiner
            '\u200D': '', // zero-width joiner
            '\uFEFF': '' // byte order mark
        };
    }

    // Fix character encoding issues in text
    fixEncoding(text) {
        if (!text) return text;
        
        let fixedText = text;
        
        // Replace problematic characters
        Object.keys(this.encodingIssues).forEach(badChar => {
            const goodChar = this.encodingIssues[badChar];
            fixedText = fixedText.replace(new RegExp(badChar, 'g'), goodChar);
        });
        
        // Fix common encoding issues
        fixedText = fixedText
            .replace(/[\u2018\u2019]/g, "'") // Smart quotes to regular quotes
            .replace(/[\u201C\u201D]/g, '"') // Smart quotes to regular quotes
            .replace(/[\u2013\u2014]/g, '-') // Em dashes to regular dashes
            .replace(/[\u2026]/g, '...') // Ellipsis to three dots
            .replace(/[\u00A0]/g, ' ') // Non-breaking space to regular space
            .replace(/[\u200B]/g, '') // Zero-width space
            .replace(/[\u200C]/g, '') // Zero-width non-joiner
            .replace(/[\u200D]/g, '') // Zero-width joiner
            .replace(/[\uFEFF]/g, ''); // Byte order mark
        
        return fixedText;
    }

    // Fix a JSON object
    fixJSONObject(obj) {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.fixJSONObject(item));
        }

        const fixedObj = {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                fixedObj[key] = this.fixEncoding(value);
            } else if (typeof value === 'object' && value !== null) {
                fixedObj[key] = this.fixJSONObject(value);
            } else {
                fixedObj[key] = value;
            }
        }

        return fixedObj;
    }

    // Fix JSON string
    fixJSONString(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            const fixed = this.fixJSONObject(parsed);
            return JSON.stringify(fixed, null, 2);
        } catch (error) {
            console.error('Error fixing JSON:', error);
            return jsonString;
        }
    }

    // Process all JSON files
    async fixAllJSONFiles() {
        const dataFiles = ['Bamidbar.json', 'Bereishis.json', 'Chagim.json', 'Devarim.json', 'Shemos.json', 'Vayikra.json'];
        
        for (const file of dataFiles) {
            try {
                const response = await fetch(`Data/${file}`);
                if (!response.ok) {
                    console.warn(`Could not fetch ${file}`);
                    continue;
                }
                
                const jsonString = await response.text();
                const fixedJSON = this.fixJSONString(jsonString);
                
                // In a real implementation, you would save the fixed JSON back to the file
                // For now, we'll just log the fixed version
                console.log(`Fixed ${file}:`, fixedJSON.substring(0, 200) + '...');
                
            } catch (error) {
                console.error(`Error processing ${file}:`, error);
            }
        }
    }
}

// Initialize the JSON fixer
window.jsonFixer = new JSONFixer();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JSONFixer;
} 