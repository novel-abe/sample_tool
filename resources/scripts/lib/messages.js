/* eslint no-else-return: "off" */

// Libraries
import LocalizedStrings from 'react-localization';
// Strings
import translations from 'scripts/messages';

/**
 * Singleton wrapper around LocalizedStrings
 */
class Messages {
    constructor(messages) {
        this.strings = new LocalizedStrings(messages);
        this.strings.setLanguage('ja');
    }

    get(key) {
        if (typeof key === 'string') {
            return this.strings[key];
        }

        const language = this.getLanguage();

        if (language === 'ja') {
            return (key.ja ? key.ja : key.en);
        } else {
            return (key.en ? key.en : key.ja);
        }
    }

    format(key, ...values) {
        return this.strings.formatString(this.get(key), ...values);
    }

    setLanguage(language) {
        this.strings.setLanguage(language);
    }

    getLanguage() {
        return this.strings.getLanguage();
    }
}

export {Messages};
export default new Messages(translations);
