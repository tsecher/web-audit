import {WebAuditConfigClass} from './WebAuditConfig';
import {WebAuditEventClass} from './WebAuditEvent';

/**
 * Context.
 */
export class WebAuditContextClass {

  private _id?: string;
  private _url?: URL;
  private _data?: any;
  private _version?: string;

  constructor(
    public config: WebAuditConfigClass,
    public eventBus: WebAuditEventClass,
  ) {
  }

  setId(id?: string): WebAuditContextClass {
    this._id = id;
    return this;
  }

  setUrl(url?: URL): WebAuditContextClass {
    this._url = url;
    return this;
  }

  setData(data?: any): WebAuditContextClass {
    this._data = data;
    return this;
  }

  setVersion(version: string): WebAuditContextClass {
    this._version = version;
    return this;
  }

  get id(): string | undefined {
    return this._id;
  }

  get url(): URL | undefined {
    return this._url;
  }

  get data(): any {
    return this._data;
  }

  get version(): string {
    return this._version || '0';
  }

  /**
   * Check if context is same.
   * @param context
   */
  isSame(context?: WebAuditContextClass) {
    return context?.id === this.id &&
      context?.url === this.url &&
      JSON.stringify(context?.data) === JSON.stringify(this.data);
  }

  /**
   * Readable context.
   */
  toString() {
    const tid = this.id || '';
    let tdata = '';
    if (this.data) {
      tdata += ` : ${typeof this.data === 'string' ? this.data : JSON.stringify(this.data)}`;
    }
    const turl = this.url ? `(${this.url})` : '';
    return `${tid} ${tdata} ${turl}`;
  }
}
