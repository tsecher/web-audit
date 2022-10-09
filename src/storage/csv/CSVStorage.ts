/**
 *
 */
import {StorageInterface} from "../Storage";

/**
 * store data in
 */
export default class CSVStorage implements StorageInterface {

    /**
     * Constructor.
     *
     * @param string dir
     *   Path of stored csv.
     */
    constructor(
        private dir: string
    ) {
    }

    installStore(id: string, context: any, data: any): void {
    }

    add(id: string, context: any, data: any): void {
    }
}