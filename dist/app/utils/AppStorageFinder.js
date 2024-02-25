import fs from 'fs';
import path from 'path';
import { AppConfig } from '##/app/conf/AppConfig';
import CSVStorage from '##/storage/csv/CSVStorage';
/**
 * Find storage according to configuration file.
 */
class StorageFinderClass {
    storages;
    /**
     * Return the list of available storages.
     *
     * @returns {StorageInterface[]}
     */
    async getStorage(force = false) {
        if (force || !this.storages) {
            await this.initStorages();
        }
        return this.storages || [];
    }
    /**
     * Init storages.
     *
     * @protected
     */
    async initStorages() {
        const storages = {};
        const defaultStorage = new CSVStorage();
        storages[defaultStorage.id] = defaultStorage;
        (await this.getStorageFromConfig())
            .map((storage) => {
            storages[storage.id] = storage;
        });
        this.storages = Object.values(storages);
    }
    /**
     * BUild the crawler list from crawler path.
     *
     * @param {string[]} storageDataList
     * @returns {StorageInterface[]}
     * @protected
     */
    async getStorageFromConfig() {
        const storageDataList = AppConfig.getConfig()?.storages;
        const storagesList = [];
        if (storageDataList && storageDataList.length) {
            for (const crawlerData of storageDataList) {
                const crawlerPath = path.resolve(process.cwd(), crawlerData);
                if (fs.existsSync(crawlerPath)) {
                    const CrawlerClass = (await import(crawlerPath)).default;
                    storagesList.push(CrawlerClass);
                }
            }
        }
        return storagesList;
    }
}
export const StorageFinder = new StorageFinderClass();
