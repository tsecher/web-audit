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
            for (const storageData of storageDataList) {
                const storagePath = path.resolve(process.cwd(), storageData);
                if (fs.existsSync(storagePath)) {
                    const StorageClass = (await import(storagePath)).default;
                    storagesList.push(StorageClass);
                }
            }
        }
        return storagesList;
    }
}
export const StorageFinder = new StorageFinderClass();
