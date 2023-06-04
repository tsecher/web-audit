/**
 * Ecoindex data structure.
 */
export class EcoindexStructure {
  constructor(
    public dom: number = 0,
    public request: number = 0,
    public size: number | undefined = undefined,
  ) {
  }

  /**
   * Check if ecoindex structure has been set.
   *
   * @returns {boolean}
   */
  public hasData(): boolean {
    return this.size !== undefined;
  }
}

/**
 * Handler options.
 *
 * @type {{wait: number}}
 */
export const ECOINDEX_HANDLER_OPTIONS = {
  wait: 3000,
  timeout: 3000,
};

/**
 * Object that will get the several data needed by the ecoindex computor.
 */
export class EcoindexDataHandler {

  protected page: any;
  protected options: any;
  protected rawResults: EcoindexStructure;
  private devTools: any;
  private onNetworkLoadingFinished: ((event: any, response: any) => void);

  /**
   * Constructor
   *
   * @param page Puppeteer page.
   * @param options Options.
   */
  constructor(page: any, options: any) {
    this.page = page;
    this.options = {
      ...ECOINDEX_HANDLER_OPTIONS,
      ...options,
    };

    this.rawResults = new EcoindexStructure();

    // Init networks callbacks.
    this.onNetworkLoadingFinished = (event: any) => {
      this.rawResults.request++;
      this.rawResults.size += event.encodedDataLength;
    };
  }

  /**
   * Init ecoindex puppeteer page configuration and listeners.
   *
   * @returns {Promise<void>}
   */
  async init() {
    this.clearResults();

    // disabling cache
    const client = await this.page.target()
      .createCDPSession();
    await client.send('Network.clearBrowserCache');

    // Init network events.
    await this._initNetworksEvents();
  }

  /**
   * Init networks events.
   *
   * @returns {Promise<void>}
   */
  async _initNetworksEvents() {
    this.rawResults.request = this.rawResults.request || 0;
    this.rawResults.size = this.rawResults.size || 0;

    const devToolsResponses = new Map();
    this.devTools = await this.page.target()
      .createCDPSession();
    await this.devTools.send('Network.enable');

    this.devTools.on('Network.loadingFinished', this.onNetworkLoadingFinished);
  }

  /**
   * Return the number of elements in dom.
   *
   * @returns {Promise<number>}
   */
  async getDOMElementCount() {
    this.rawResults.dom = await this.page.evaluate(() => document.querySelectorAll('*').length - document.querySelectorAll('svg *').length);
    return this.rawResults.dom;
  }

  /**
   * Return the number of request since initialization.
   *
   * @returns {Promise<unknown>}
   */
  async getRequestCount() {
    return new Promise((resolve) => {
      resolve(this.rawResults?.request);
    });
  }

  /**
   * Return the response size in (B).
   * @returns {Promise<void>}
   */
  async getSize() {
    return new Promise((resolve) => {
      resolve(this.rawResults?.size);
    });
  }

  /**
   * Return the result.
   *
   * @returns {Promise<EcoindexStructure>}
   */
  async getRawResult() {
    // Only dom elements are note dynamically populated. So we compute it.
    await this.getDOMElementCount();
    return this.rawResults;
  }

  /**
   * Clear raw results.
   */
  clearResults() {
    this.rawResults = new EcoindexStructure();
  }

  /**
   * Stop network listening.
   */
  stop() {
    this.devTools.off('Network.loadingFinished', this.onNetworkLoadingFinished);
  }
}
