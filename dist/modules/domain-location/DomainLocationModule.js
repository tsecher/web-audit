"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainLocationModule = exports.DomainLocationModuleEvents = void 0;
const dns_1 = __importDefault(require("dns"));
const AbstractDomainModule_1 = require("../../domain/AbstractDomainModule");
const ModuleInterface_1 = require("../ModuleInterface");
/**
 * Domain Location Module events.
 */
exports.DomainLocationModuleEvents = {
    createDomainLocationModule: 'domain_location_module__createDomainLocationModule',
    onResult: 'domain_location_module__onResult',
};
/**
 * Domain Location Validator.
 */
class DomainLocationModule extends AbstractDomainModule_1.AbstractDomainModule {
    /**
     * {@inheritdoc}
     */
    get name() {
        return 'Domain Location';
    }
    /**
     * {@inheritdoc}
     */
    get id() {
        return `domain_location`;
    }
    /**
     * {@inheritdoc}
     */
    init(context) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.context = context;
            // Install store.
            (_a = this.context.config.storage) === null || _a === void 0 ? void 0 : _a.installStore('domain_location', this.context, {
                url: 'URL',
                ipVersion: 'The IP version (e.g., 4 for IPv4).',
                ipAddress: 'The IP address for which geolocation information is provided.',
                latitude: 'The latitude coordinate of the IP address location.',
                longitude: 'The longitude coordinate of the IP address location.',
                countryName: 'The name of the country where the IP address is located.',
                countryCode: 'The ISO 3166-1 alpha-2 country code of the IP address location.',
                timeZone: 'The time zone offset of the IP address location.',
                zipCode: 'The ZIP code or postal code of the IP address location.',
                cityName: 'The name of the city where the IP address is located.',
                regionName: 'The name of the region or state where the IP address is located.',
                continent: 'The name of the continent where the IP address is located.',
                continentCode: 'The ISO code of the continent where the IP address is located.',
            });
            // Emit.
            this.context.eventBus.emit(exports.DomainLocationModuleEvents.createDomainLocationModule, { module: this });
        });
    }
    /**
     * {@inheritdoc}
     */
    analyse(urlWrapper) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (_a = this.context) === null || _a === void 0 ? void 0 : _a.eventBus.emit(ModuleInterface_1.ModuleEvents.startsComputing, { module: this });
                const result = yield this.getBaseResult(urlWrapper.url.hostname);
                const summary = {
                    url: urlWrapper.url.hostname,
                    latitude: result.latitude,
                    longitude: result.longitude,
                    countryName: result.countryName,
                    zipCode: result.zipCode,
                    cityName: result.cityName,
                    regionName: result.regionName,
                };
                (_b = this.context) === null || _b === void 0 ? void 0 : _b.eventBus.emit(exports.DomainLocationModuleEvents.onResult, {
                    module: this,
                    url: urlWrapper,
                    result: result,
                });
                (_c = this.context) === null || _c === void 0 ? void 0 : _c.eventBus.emit(ModuleInterface_1.ModuleEvents.onAnalyseResult, { module: this, url: urlWrapper, result: result });
                (_e = (_d = this.context) === null || _d === void 0 ? void 0 : _d.config) === null || _e === void 0 ? void 0 : _e.logger.result(`Domain Location`, summary, urlWrapper.url.toString());
                // @ts-ignore
                (_h = (_g = (_f = this.context) === null || _f === void 0 ? void 0 : _f.config) === null || _g === void 0 ? void 0 : _g.storage) === null || _h === void 0 ? void 0 : _h.one('domain_location', this.context, result);
                (_j = this.context) === null || _j === void 0 ? void 0 : _j.eventBus.emit(ModuleInterface_1.ModuleEvents.endsComputing, { module: this });
                return true;
            }
            catch (err) {
                return false;
            }
        });
    }
    /**
     * Return base result.
     * @param domain
     * @returns {Promise<void>}
     */
    getBaseResult(domain) {
        return __awaiter(this, void 0, void 0, function* () {
            const ip = yield this.getIpFromDomain(domain);
            const endpoint = `https://freeipapi.com/api/json/${ip}`;
            const response = yield fetch(endpoint, { method: 'GET' });
            return response.json();
        });
    }
    /**
     * {@inheritdoc}
     */
    finish() {
    }
    /**
     * Return ip of domain.
     *
     * @param {string} domain
     * @returns {Promise<string>}
     * @private
     */
    getIpFromDomain(domain) {
        return new Promise((resolve, reject) => {
            dns_1.default.lookup(domain, (err, address, family) => {
                if (err) {
                    reject(err);
                }
                resolve(address);
            });
        });
    }
}
exports.DomainLocationModule = DomainLocationModule;
