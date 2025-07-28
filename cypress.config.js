import { defineConfig } from 'cypress';
import allureWriter from '@shelex/cypress-allure-plugin/writer.js'; // Menggunakan .js di akhir

export default defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            allureWriter(on, config);
            return config; // Pastikan ini ada, ini penting!
        },
        watchForFileChanges: false,
    },
});
